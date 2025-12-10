import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";

let authToken: string;

beforeAll(async () => {
  // ✅ Connect to MongoDB before tests
  await mongoose.connect(process.env.MONGO_URI!);

  // ✅ Okta Login API — get auth token (if your auth route is working)
  // Uncomment this when your /api/auth/okta-login is available and returns token
  /*
  const loginRes = await request(app).post("/api/auth/okta-login").send({
    email: "testuser@example.com",
    password: "Test@123",
  });
  authToken = loginRes.body.token;
  */
});

afterAll(async () => {
  // ✅ Disconnect from MongoDB after tests
  await mongoose.connection.close();
});

describe("🚀 Dashboard API", () => {
  it("✅ Should fetch dashboard statistics", async () => {
    const res = await request(app)
      .get("/api/dashboard")
      // ✅ Send token for protected route (if auth is enabled)
      // .set("Authorization", `Bearer ${authToken}`);

    // ✅ Basic expectations
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("activeCampaigns");
    expect(res.body).toHaveProperty("scheduledCampaigns");
    expect(res.body).toHaveProperty("totalAudience");
    expect(res.body).toHaveProperty("emailsSent");
    expect(res.body).toHaveProperty("engagementMetrics");
    expect(res.body).toHaveProperty("recentActivity");
  });

  it("✅ Should gracefully handle DB errors (simulate failure)", async () => {
    // Forcefully disconnect DB to simulate an error
    await mongoose.connection.close();

    const res = await request(app)
      .get("/api/dashboard")
      // .set("Authorization", `Bearer ${authToken}`);

    expect(res.statusCode).toBeGreaterThanOrEqual(500);

    // ✅ Reconnect to continue other tests (if needed)
    await mongoose.connect(process.env.MONGO_URI!);
  });
});
