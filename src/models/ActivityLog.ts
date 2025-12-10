/*import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  status: { type: String, enum: ["success", "warning", "error"], required: true },
  message: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
export default ActivityLog;*/

import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  actionType: { type: String, required: true }, // Example: "Created Campaign", "Updated Filter"
  description: { type: String, required: true }, // Example: "Spring Sale Campaign Created"
  createdAt: { type: Date, default: Date.now },
});

const ActivityLog = mongoose.model("ActivityLog", ActivityLogSchema);
export default ActivityLog;

