// src/scripts/testSnapshot.ts
import mongoose from "mongoose";
import dotenv from "dotenv";
import Filter from "../models/Filter";
import { snapshotAudience } from "../services/snapshotAudience";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI!);

  const filter = await Filter.findOne({ isDraft: false });
  if (!filter) throw new Error("No filter found");

  const fakeCampaignId = new mongoose.Types.ObjectId().toString();

  const count = await snapshotAudience(fakeCampaignId, filter);
  console.log("Snapshot count:", count);

  process.exit(0);
}

run();
