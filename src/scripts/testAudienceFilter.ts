// src/scripts/testAudienceFilter.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import Filter from "../models/Filter";
import { getAudienceByFilter } from "../services/audienceService";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI!);

  const filter = await Filter.findOne({ isDraft: false });
  if (!filter) throw new Error("No filter found");

  const audience = await getAudienceByFilter(filter);
  console.log("Audience count:", audience.length);

  process.exit(0);
}

run();
