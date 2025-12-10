import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import Campaign from "../src/models/Campaign";
import Filter from "../src/models/Filter";
import { connectDB } from "./setup/db"; // ✅ Shared DB connection

let createdCampaignId: string;
let createdFilterId: string;
// let authToken: string;
const testUserId = "67daedeaff85ef645f71206f";

beforeAll(async () => {
  await connectDB();

  // ✅ Okta login (optional)
  /*
  const loginRes = await request(app).post("/api/auth/okta-login").send({
    email: "testuser@example.com",
    password: "Test@123",
  });
  authToken = loginRes.body.localToken;
  */

  // Create campaign only once
  const existing = await Campaign.findOne({ name: "Test Campaign" });
  if (!existing) {
    const campaignRes = await Campaign.create({
      name: "Test Campaign",
      type: "Criteria Based",
      audience: new mongoose.Types.ObjectId(),
      template: new mongoose.Types.ObjectId(),
      userId: testUserId,
      status: "Draft",
    });
    createdCampaignId = campaignRes._id.toString();
  } else {
    createdCampaignId = existing._id.toString();
  }
});

// ✅ Do NOT delete all data, just clean up your own test-created filters (by name or tag if needed)
// This is skipped now to avoid deleting real data
// beforeEach(async () => {
//   await Filter.deleteMany({});
// });

describe("🚀 Filter Builder APIs", () => {
  it("✅ Should create a new filter", async () => {
    const res = await request(app)
      .post("/api/filters")
      // .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "VIP Customers",
        description: "Customers aged above 25",
        tags: ["VIP", "priority"],
        userId: testUserId,
        campaignId: createdCampaignId,
        conditions: [
          {
            groupId: "Group_1",
            groupOperator: "AND",
            criteria: [{ field: "age", operator: ">", value: "25" }],
          },
        ],
        logicalOperator: "OR",
        customFields: { note: "Test filter" },
        isDraft: false,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("filter");
    expect(res.body.filter.name).toBe("VIP Customers");

    createdFilterId = res.body.filter._id;
  });

  it("✅ Should edit an existing filter", async () => {
    const created = await Filter.create({
      name: "Initial Filter",
      userId: testUserId,
      campaignId: createdCampaignId,
      conditions: [],
      logicalOperator: "AND",
    });
    createdFilterId = created._id.toString();

    const res = await request(app)
      .put(`/api/filters/${createdFilterId}`)
      // .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Updated VIP Customers",
        description: "Updated description",
        tags: ["Updated"],
        userId: testUserId,
        campaignId: createdCampaignId,
        conditions: [
          {
            groupId: "Group_1",
            groupOperator: "AND",
            criteria: [{ field: "age", operator: ">", value: "30" }],
          },
        ],
        logicalOperator: "OR",
        customFields: { note: "Updated filter" },
        isDraft: false,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.filter.name).toBe("Updated VIP Customers");
  });

  it("✅ Should duplicate a filter", async () => {
    const original = await Filter.create({
      name: "Original Filter",
      campaignId: createdCampaignId,
      userId: testUserId,
      conditions: [],
      logicalOperator: "AND",
    });

    const res = await request(app).post(`/api/filters/${original._id}/duplicate`);
    // .set("Authorization", `Bearer ${authToken}`)

    expect(res.statusCode).toBe(201);
    expect(res.body.filter.name).toContain("Copy of");
  });

  it("✅ Should fetch all filters", async () => {
    await Filter.create({
      name: "Another Filter",
      campaignId: createdCampaignId,
      userId: testUserId,
      conditions: [],
      logicalOperator: "AND",
    });

    const res = await request(app).get("/api/filters");
    // .set("Authorization", `Bearer ${authToken}`)

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.filters)).toBe(true);
  });

  it("✅ Should get an estimated audience preview", async () => {
    const res = await request(app)
      .post("/api/filters/preview")
      // .set("Authorization", `Bearer ${authToken}`)
      .send({
        conditions: [{ field: "location", operator: "==", value: "USA" }],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("estimatedAudience");
  });

  it("✅ Should delete a filter", async () => {
    const filter = await Filter.create({
      name: "Delete Me",
      campaignId: createdCampaignId,
      userId: testUserId,
      conditions: [],
      logicalOperator: "AND",
    });

    const res = await request(app).delete(`/api/filters/${filter._id}`);
    // .set("Authorization", `Bearer ${authToken}`)

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Filter deleted successfully");
  });
});
