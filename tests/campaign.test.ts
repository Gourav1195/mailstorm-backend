import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import Campaign from "../src/models/Campaign";
import { connectDB } from "./setup/db";

let campaignId: string;
// let authToken: string;

beforeAll(async () => {
  await connectDB();

  // ✅ Okta Login (uncomment if needed)
  /*
  const loginRes = await request(app).post("/api/auth/okta-login").send({
    email: "testuser@example.com",
    password: "Test@123",
  });
  authToken = loginRes.body.token;
  */
});

describe("🚀 Campaign API", () => {
  it("✅ Should create, launch, pause, duplicate and delete a campaign", async () => {
    const createRes = await request(app)
      .post("/api/campaigns")
      // .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "Test Campaign",
        type: "Criteria Based",
        audience: new mongoose.Types.ObjectId(),
        template: new mongoose.Types.ObjectId(),
        status: "Draft",
        schedule: new Date().toISOString(),
      });

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body).toHaveProperty("message", "Campaign Saved Successfully");
    campaignId = createRes.body.campaign._id;

    const getRes = await request(app)
      .get(`/api/campaigns/${campaignId}`);
    // .set("Authorization", `Bearer ${authToken}`)
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(getRes.body.campaign._id).toBe(campaignId);

    const editRes = await request(app)
      .put(`/api/campaigns/${campaignId}/edit`)
      // .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Updated Campaign Name" });
    expect(editRes.statusCode).toBe(200);
    expect(editRes.body.campaign.name).toBe("Updated Campaign Name");

    const launchRes = await request(app)
      .put(`/api/campaigns/${campaignId}/launch`);
    // .set("Authorization", `Bearer ${authToken}`)
    expect(launchRes.statusCode).toBe(200);
    expect(launchRes.body.message).toBe("Campaign Launched Successfully");
    expect(launchRes.body.campaign.status).toBe("Active");

    const pauseRes = await request(app)
      .put(`/api/campaigns/${campaignId}/pause-resume`);
    // .set("Authorization", `Bearer ${authToken}`)
    expect(pauseRes.statusCode).toBe(200);
    expect(["On Going", "Paused"]).toContain(pauseRes.body.campaign.status);

    const duplicateRes = await request(app)
      .post(`/api/campaigns/${campaignId}/duplicate`);
    // .set("Authorization", `Bearer ${authToken}`)
    expect(duplicateRes.statusCode).toBe(201);
    expect(duplicateRes.body.message).toBe("Campaign Duplicated Successfully");
    expect(duplicateRes.body.campaign._id).not.toBe(campaignId);

    const deleteRes = await request(app)
      .delete(`/api/campaigns/${campaignId}`);
    // .set("Authorization", `Bearer ${authToken}`)
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toHaveProperty("message", "Campaign deleted successfully");

    const getDeleted = await request(app)
      .get(`/api/campaigns/${campaignId}`);
    // .set("Authorization", `Bearer ${authToken}`)
    expect(getDeleted.statusCode).toBe(404);
  });

  it("✅ Should fetch all campaigns", async () => {
    const res = await request(app)
      .get("/api/campaigns");
    // .set("Authorization", `Bearer ${authToken}`)
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
