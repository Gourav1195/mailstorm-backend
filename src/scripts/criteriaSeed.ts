import mongoose from "mongoose";
import dotenv from "dotenv";
import { CriteriaBlock } from "../models/criteriaBlock";

dotenv.config();

const criteriaBlocks = [
  {
    key: "age",
    label: "Age",
    type: "number",
    category: "filterComponent",
    operators: ["equals", "greaterThan", "lessThan", "between"],
  },
  {
    key: "location.city",
    label: "City",
    type: "string",
    category: "filterComponent",
    operators: ["equals", "startsWith", "contains"],
  },
  {
    key: "location.state",
    label: "State",
    type: "string",
    category: "filterComponent",
    operators: ["equals"],
  },
  {
    key: "location.country",
    label: "Country",
    type: "string",
    category: "filterComponent",
    operators: ["equals"],
  },
  {
    key: "tags",
    label: "Tags",
    type: "string",
    category: "filterComponent",
    operators: ["contains"],
  },
  {
    key: "attributes.region",
    label: "Region",
    type: "string",
    category: "filterComponent",
    operators: ["equals"],
  },
  {
    key: "attributes.plan",
    label: "Plan",
    type: "string",
    category: "filterComponent",
    operators: ["equals"],
  },
];

async function seedCriteria() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("[seed] Mongo connected");

    for (const block of criteriaBlocks) {
      const res = await CriteriaBlock.updateOne(
        { key: block.key },        // 👈 idempotency
        { $setOnInsert: block },   // 👈 insert only if missing
        { upsert: true }
      );

      if (res.upsertedCount > 0) {
        console.log(`[seed] inserted ${block.key}`);
      } else {
        console.log(`[seed] already exists ${block.key}`);
      }
    }

    console.log("[seed] criteria blocks ready");
    process.exit(0);
  } catch (err) {
    console.error("[seed] failed", err);
    process.exit(1);
  }
}

seedCriteria();
