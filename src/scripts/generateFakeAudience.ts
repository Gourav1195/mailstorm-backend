// src/scripts/generateFakeAudience.ts
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import Audience from "../models/Audience";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("DB connected");

  const bulk = [];

  for (let i = 0; i < 10_000; i++) {
    bulk.push({
      email: faker.internet.email().toLowerCase(),
      name: faker.person.fullName(),
      age: faker.number.int({ min: 18, max: 65 }),
      location: {
        country: "US",
        state: faker.location.state({ abbreviated: true }),
        city: faker.location.city()
      },
      tags: faker.helpers.arrayElements(
        ["engineering", "startup", "marketing", "saas", "india", "us"],
        { min: 1, max: 3 }
      ),
      attributes: {
        region: faker.helpers.arrayElement(["North America", "Europe", "Asia"]),
        plan: faker.helpers.arrayElement(["free", "pro", "enterprise"])
      }
    });
  }

  await Audience.insertMany(bulk, { ordered: false });
  console.log("Inserted 10k fake audience");

  process.exit(0);
}

run();
