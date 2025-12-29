import mongoose, { Schema, Document } from "mongoose";
export interface ICampaignRecipient extends Document {
  campaignId: mongoose.Types.ObjectId;
  email: string;
  status: "PENDING" | "SENT" | "FAILED" | "BOUNCED";
  providerMessageId?: string;
  error?: string;
  sentAt?: Date;
}
const CampaignRecipientSchema: Schema = new Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true, index: true },  
    email: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "SENT", "FAILED", "BOUNCED"], default: "PENDING", index: true },
    providerMessageId: { type: String },
    error: { type: String },
    sentAt: { type: Date },
    },
    { timestamps: true }
);

CampaignRecipientSchema.index(
  { campaignId: 1, email: 1 },
  { unique: true } // snapshot-level dedupe
);

const CampaignRecipient = mongoose.model<ICampaignRecipient>(
    "CampaignRecipient",
    CampaignRecipientSchema
);

export default CampaignRecipient;