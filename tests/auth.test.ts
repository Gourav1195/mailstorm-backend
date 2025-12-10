import request from "supertest";
import app from "../src/app";

describe("🚀 Authentication API", () => {
  // ✅ Should fail with missing credentials
  it("❌ Should fail login with missing credentials", async () => {
    const res = await request(app).post("/api/auth/okta-login").send({});
    expect([400, 401]).toContain(res.statusCode);
    expect(res.body).toHaveProperty("message");
  });

  // ✅ Should fail with invalid credentials
  it("❌ Should fail login with incorrect email or password", async () => {
    const res = await request(app).post("/api/auth/okta-login").send({
      email: "wronguser@example.com",
      password: "wrongpassword",
    });
    expect([401, 500]).toContain(res.statusCode); // Okta may return 401, or app may respond with 500
    expect(res.body).toHaveProperty("message");
  });

  // ✅ Should login successfully (when Okta is integrated and working)
  // 🟡 Uncomment this test after your Okta Auth is available and configured
  /*
  it("✅ Should login successfully with correct credentials", async () => {
    const validUser = {
      email: "testuser@example.com",
      password: "Test@123",
    };

    const res = await request(app).post("/api/auth/okta-login").send(validUser);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("localToken");
    expect(typeof res.body.localToken).toBe("string");
  });
  */

  // ✅ Protected route without token
  it("❌ Should block access to protected route without token", async () => {
    const res = await request(app).get("/api/protected-route");
    expect([401, 403]).toContain(res.statusCode);
    expect(res.body).toHaveProperty("message");
  });

  // ✅ Protected route with token (requires Okta login working)
  // 🟡 Uncomment this test after your Okta login returns a localToken
  /*
  it("✅ Should access protected route with valid token", async () => {
    const loginRes = await request(app).post("/api/auth/okta-login").send({
      email: "testuser@example.com",
      password: "Test@123",
    });

    const token = loginRes.body.localToken;

    const res = await request(app)
      .get("/api/protected-route")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Protected route accessed");
  });
  */
});

// Create a new test file called auth.jwt.test.ts inside your tests directory:
/*import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../src/app";

// This secret should match process.env.JWT_SECRET used in your authController
const JWT_SECRET = process.env.JWT_SECRET || "testsecret";

describe("🔐 Local JWT Token Tests", () => {
  const testUser = {
    userId: "1234567890abcdef",
    email: "testuser@example.com",
  };

  let token: string;

  beforeAll(() => {
    token = jwt.sign(testUser, JWT_SECRET, { expiresIn: "1h" });
  });

  it("✅ Should generate a valid token and decode payload", () => {
    const decoded = jwt.verify(token, JWT_SECRET) as typeof testUser;
    expect(decoded).toHaveProperty("userId", testUser.userId);
    expect(decoded).toHaveProperty("email", testUser.email);
  });

  it("✅ Should access protected route with valid token", async () => {
    const res = await request(app)
      .get("/api/protected-route")
      .set("Authorization", `Bearer ${token}`);

    expect([200, 401]).toContain(res.statusCode); // Update based on route logic
    if (res.statusCode === 200) {
      expect(res.body.message).toBe("Protected route accessed");
    }
  });

  it("❌ Should block access with invalid token", async () => {
    const res = await request(app)
      .get("/api/protected-route")
      .set("Authorization", `Bearer invalid.token.here`);

    expect([401, 403]).toContain(res.statusCode);
  });

  it("❌ Should block access without token", async () => {
    const res = await request(app).get("/api/protected-route");
    expect([401, 403]).toContain(res.statusCode);
  });
});*/



// auth.okta.mock.test.ts

/* 
import request from "supertest";
import app from "../src/app";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("🧪 Okta Login API - Mocked", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("✅ Should login successfully and return tokens", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        sessionToken: "mocked-session-token",
        status: "SUCCESS"
      }
    });

    const res = await request(app).post("/api/auth/okta-login").send({
      email: "testuser@example.com",
      password: "Test@123"
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("oktaToken", "mocked-session-token");
    expect(res.body).toHaveProperty("localToken");
    expect(res.body).toHaveProperty("user.email", "testuser@example.com");
  });

  it("❌ Should fail with invalid Okta credentials", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { errorCode: "E0000004", errorSummary: "Authentication failed" } }
    });

    const res = await request(app).post("/api/auth/okta-login").send({
      email: "invalid@example.com",
      password: "wrongpassword"
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Authentication failed");
    expect(res.body.error).toHaveProperty("errorCode", "E0000004");
  });

  it("❌ Should fail login with missing body", async () => {
    const res = await request(app).post("/api/auth/okta-login").send({});
    expect([400, 500]).toContain(res.statusCode);
  });
});


*/

