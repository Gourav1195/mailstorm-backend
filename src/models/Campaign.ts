/*import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["Criteria Based", "real-time", "scheduled"], required: true },
  audienceFilter: { type: Object },  
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: "Template" },
  schedule: {
    frequency: { type: String, enum: ["daily", "weekly", "monthly"], default: "daily" },
    time: { type: String },
  },
  status: { type: String, enum: ["active", "paused", "completed"], default: "active" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const Campaign = mongoose.model("Campaign", campaignSchema);
export default Campaign; */

/*import mongoose from "mongoose";

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },  
  type: { type: String, enum: ["Criteria Based", "Real Time", "Scheduled"], required: true },  
  audience: { type: mongoose.Schema.Types.ObjectId, ref: "Filter", required: true },  
  template: { type: mongoose.Schema.Types.ObjectId, ref: "Template", required: true },  
  schedule: {
    frequency: { type: String, enum: ["Daily", "Weekly", "Monthly"], required: true },  
    time: { type: String, required: true },  
    startDate: { type: Date, required: true },  
    endDate: { type: Date },
  },
  status: { type: String, enum: ["Draft", "Scheduled", "Active", "Completed", "On Going", "Completed", "Expired", "Paused"], default: "Draft" },  
  openRate: { type: Number, default: 0 },  
  ctr: { type: Number, default: 0 },  
  delivered: { type: Number, default: 0 },  
  publishedDate: { type: Date, required: true },  
  createdAt: { type: Date, default: Date.now },  
}); 

const Campaign = mongoose.model("Campaign", CampaignSchema);
export default Campaign;*/

import mongoose, { Schema, Document } from "mongoose";

export interface ICampaign extends Document {
  name: string;
  type: "Criteria Based" | "Real Time" | "Scheduled"; // ✅ Correct Enum Values
  audience: mongoose.Types.ObjectId;
  template: mongoose.Types.ObjectId;
  status: "Scheduled" | "Draft" | "Active" | "Completed" | "On Going" | "Expired" | "Paused";
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  publishedDate?: Date; // ✅ Ensure publishedDate is optional
  openRate: Number; 
  ctr: Number;
  delivered: Number;
  schedule?: {
    frequency?: "Once" |"Daily" | "Weekly" | "Monthly"; // ✅ Ensure these values match the request payload
    time?: string;
    startDate: Date;
    endDate?: Date;
  };
}

const CampaignSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["Criteria Based", "Real Time", "Scheduled"], required: true },
  audience: { type: mongoose.Schema.Types.ObjectId, ref: "Filter", required: true },
  template: { type: mongoose.Schema.Types.ObjectId, ref: "Template", required: true },
  status: { type: String, enum: ["Scheduled", "Draft", "Active", "Completed", "On Going", "Expired", "Paused", "Not Yet Started"], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedDate: { type: Date, default: null }, // ✅ Ensure `publishedDate` is optional & defaults to null
  openRate: { type: Number, default: 0 },  
  ctr: { type: Number, default: 0 },  
  delivered: { type: Number, default: 0 },  
  // ✅ Make schedule optional
  schedule: {
    frequency: { type: String, enum: ["Once", "Daily", "Weekly", "Monthly"], required: false  }, // ✅ Make optional
    time: { type: String, required: false  }, // ✅ Make optional
    startDate: { type: Date, required: false  }, // ✅ Allow missing startDate for drafts
    endDate: { type: Date, required: false  },
  },
});

const Campaign = mongoose.model<ICampaign>("Campaign", CampaignSchema);
export default Campaign;




