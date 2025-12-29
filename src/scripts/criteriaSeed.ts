import mongoose from "mongoose";
import dotenv from "dotenv";
import { CriteriaBlock } from "../models/criteriaBlock";

dotenv.config();

export const CRITERIA_BLOCKS = [
  // ─── User Profile ──────────────────────────────
  {
    key: "age",
    label: "Age",
    type: "number",
    category: "filterComponent",
    operators: [
      "equals",
      "greaterThan",
      "greaterThanOrEqual",
      "lessThan",
      "lessThanOrEqual",
      "between"
    ]
  },

  {
    key: "email",
    label: "Email",
    type: "string",
    category: "filterComponent",
    operators: [
      "equals",
      "contains",
      "endsWith",
      "isEmpty",
      "isNotEmpty"
    ]
  },

  // ─── Location ──────────────────────────────────
  {
    key: "location.city",
    label: "City",
    type: "string",
    category: "filterComponent",
    operators: [
      "equals",
      "contains",
      "startsWith"
    ]
  },
  {
    key: "location.state",
    label: "State",
    type: "string",
    category: "filterComponent",
    operators: ["equals"]
  },
  {
    key: "location.country",
    label: "Country",
    type: "string",
    category: "filterComponent",
    operators: ["equals"]
  },

  // ─── Tags / Attributes ─────────────────────────
  {
    key: "tags",
    label: "Tags",
    type: "string",
    category: "filterComponent",
    operators: [
      "contains",
      "notContains",
      "isEmpty",
      "isNotEmpty"
    ]
  },

  {
    key: "attributes.plan",
    label: "Plan",
    type: "string",
    category: "filterComponent",
    operators: ["equals"]
  },

  {
    key: "attributes.region",
    label: "Region",
    type: "string",
    category: "filterComponent",
    operators: ["equals"]
  },

  // ─── Dates ─────────────────────────────────────
  {
    key: "createdAt",
    label: "Signup Date",
    type: "date",
    category: "filterComponent",
    operators: [
      "before",
      "after",
      "between",
      "on",
      "onOrBefore",
      "onOrAfter"
    ]
  },

  {
    key: "lastLoginAt",
    label: "Last Login Date",
    type: "date",
    category: "filterComponent",
    operators: [
      "before",
      "after",
      "between",
      "on"
    ]
  }
];

async function seedCriteria() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("[seed] Mongo connected");

    for (const block of CRITERIA_BLOCKS) {
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
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("[seed] failed", err);
    process.exit(1);
  }
}

seedCriteria();
