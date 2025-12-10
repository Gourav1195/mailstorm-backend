import mongoose from "mongoose";

const EmailLogSchema = new mongoose.Schema({
  emailName: { type: String, required: true },
  category: { type: String, required: true }, // E.g., "December News"
  dateSent: { type: Date, required: true },
  emailsSent: { type: Number, required: true },
  opens: { type: Number, required: true },
  clicks: { type: Number, required: true },
  unsubscribes: { type: Number, required: true },
  bounces: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model("EmailLog", EmailLogSchema);

