import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import { CriteriaBlock } from "../src/models/criteriaBlock";
import { connectDB } from "./setup/db"; // ✅ shared DB connection

let blockId: string;
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

/*❌ Removed CriteriaBlock.deleteMany to retain test data
 beforeEach(async () => {
   await CriteriaBlock.deleteMany({});
 }); */

describe("🚀 CriteriaBlock APIs", () => {
  it("✅ Should create a new criteria block (valid string type)", async () => {
    const res = await request(app)
      .post("/api/criteria-blocks")
      // .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: `String Criteria ${Date.now()}`, // Ensure uniqueness
        type: "string",
        category: "filterComponent",
        operators: ["equals", "contains"]
      });
  
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("_id");
  
    blockId = res.body.data._id;
  });
  

  it("✅ Should fail creating with invalid type", async () => {
    const res = await request(app)
      .post("/api/criteria-blocks")
      // .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "InvalidType Block",
        type: "boolean",
        category: "filterComponent",
        operators: ["equals"]
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid type/);
  });

  it("✅ Should fail creating with invalid operators", async () => {
    const res = await request(app)
      .post("/api/criteria-blocks")
      // .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "BadOperators",
        type: "number",
        category: "filterComponent",
        operators: ["equals", "contains"] // contains is invalid for number
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Invalid operator/);
  });

  it("✅ Should get all criteria blocks", async () => {
    await CriteriaBlock.create({
      name: "Test Block",
      type: "string",
      category: "filterComponent",
      operators: ["equals"]
    });

    const res = await request(app).get("/api/criteria-blocks");
    // .set("Authorization", `Bearer ${authToken}`)

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("✅ Should get criteria blocks by category", async () => {
    await CriteriaBlock.create({
      name: "CategoryBlock",
      type: "string",
      category: "filterComponent",
      operators: ["equals"]
    });

    const res = await request(app)
      .get("/api/criteria-blocks")
      .query({ category: "TestCategory" });
    // .set("Authorization", `Bearer ${authToken}`)

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.every((block: any) => block.category === "TestCategory")).toBe(true);
  });

  it("✅ Should delete a criteria block by ID", async () => {
    const created = await CriteriaBlock.create({
      name: "Delete Me",
      type: "date",
      category: "filterComponent",
      operators: ["before"]
    });

    const res = await request(app).delete(`/api/criteria-blocks/${created._id}`);
    // .set("Authorization", `Bearer ${authToken}`)

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Criteria Block deleted.");
  });

  it("✅ Should return 200 even when deleting non-existent block", async () => {
    const res = await request(app).delete(`/api/criteria-blocks/660000000000000000000000`);
    // .set("Authorization", `Bearer ${authToken}`)

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
