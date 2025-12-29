// src/models/Audience.ts
import mongoose from "mongoose";

const AudienceSchema = new mongoose.Schema({
  email: { type: String, unique: true, index: true },
  name: String,
  age: Number,
  location: {
    country: String,
    state: String,
    city: String
  },
  tags: [String],
  attributes: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  createdAt: { type: Date, default: Date.now }
});

AudienceSchema.index({ age: 1 });
AudienceSchema.index({ "location.city": 1 });
AudienceSchema.index({ tags: 1 });
AudienceSchema.index({ "attributes.region": 1 });

export const Audience =
  mongoose.models.Audience ||
  mongoose.model("Audience", AudienceSchema);
export default Audience;