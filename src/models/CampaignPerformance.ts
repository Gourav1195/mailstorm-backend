import mongoose from "mongoose";

const campaignPerformanceSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
  emailsSent: { type: Number, default: 0 },
  openRate: { type: Number, default: 0 },      // In percentage (0-100)
  clickRate: { type: Number, default: 0 },     // In percentage (0-100)
  conversionRate: { type: Number, default: 0 },// In percentage (0-100)
  timestamp: { type: Date, default: Date.now }
});

const CampaignPerformance = mongoose.model("CampaignPerformance", campaignPerformanceSchema);
export default CampaignPerformance;
