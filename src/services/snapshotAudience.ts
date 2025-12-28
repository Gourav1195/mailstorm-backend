// src/services/snapshotAudience.ts
import Audience from "../models/Audience";
import CampaignRecipient from "../models/CampaignRecipient";
import { buildAudienceQuery } from "../utils/buildAudienceQuery";

export async function snapshotAudience(
  campaignId: string,
  filter: any
) {
  const query = buildAudienceQuery(filter);

  const audience = await Audience.find(query, { email: 1 }).lean();
  console.log(`[snapshot] matched ${audience.length} users`);

  if (audience.length === 0) return 0;

  const docs = audience.map(a => ({
    campaignId,
    email: a.email,
  }));

  const res = await CampaignRecipient.insertMany(docs, {
    ordered: false, // skip duplicates safely
  });

  console.log(`[snapshot] stored ${res.length} recipients`);
  return res.length;
}
