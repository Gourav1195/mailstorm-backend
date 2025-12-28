///src/services/enqueueCampaignExecution.ts
import Campaign  from "../models/Campaign";
import Template from "../models/Template";
import CampaignRecipient from "../models/CampaignRecipient";
import { emailQueue } from "../queues/emailQueue";
import { renderToStaticMarkup } from '@usewaypoint/email-builder';
// import { renderTemplate } from "../utils/renderTemplate.js";


export async function enqueueCampaignExecution(campaignId: string) {
  const campaign = await Campaign.findOneAndUpdate(
    { _id: campaignId, executionEnqueued: { $ne: true } },
    { $set: { executionEnqueued: true } },
    { new: true }
  );
  
  if (!campaign) throw new Error("Campaign not found");

  if (campaign.executionEnqueued) return; // 🧠 safety

  const startAt = campaign.schedule?.startDate;
  if (!startAt) throw new Error("schedule.startDate missing");

  const delayMs = new Date(startAt).getTime() - Date.now();
  if (delayMs < 0) throw new Error("schedule time must be in future");

  // load template
  const template = await Template.findById(campaign.template);
  if (!template) throw new Error("Template not found");

  // render html ONCE (important)
  // const html = renderTemplate(template.content); // your email builder output
  const html = renderToStaticMarkup(template.content, { rootBlockId: 'root' });
  const subject = template.subject;

  const recipients = await CampaignRecipient.find({
    campaignId,
    status: "PENDING"
  }).lean();

  for (const r of recipients) {
    await emailQueue.add(
      "send-email",
      {
        campaignId,
        recipientId: r._id,
        to: r.email,
        subject,
        html,
        idempotencyKey: `${campaignId}:${r.email}`
      },
      { delay: delayMs }
    );
  }

  await Campaign.updateOne(
    { _id: campaignId },
    {
      $set: {
        // executionEnqueued: true,
        status: "Scheduled"
      }
    }
  );
}
