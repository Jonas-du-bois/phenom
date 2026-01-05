import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import { generateAccessToken } from "../src/config/jwt.js";

describe("Authentication Middleware", () => {
  let user;
  let validToken;

  beforeEach(async () => {
    // Create a test user
    user = await User.create({
      name: "Test User",
      email: `middleware${Date.now()}@example.com`,
      password: "password123",
    });

    validToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
  });

  describe("authenticate middleware", () => {
    it("should authenticate with valid token", async () => {
      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(user.email);
    });

    it("should fail without Authorization header", async () => {
      const response = await request(app).get("/api/v1/auth/me").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Token");
    });

    it("should fail with malformed Authorization header", async () => {
      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "InvalidFormat")
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should fail with invalid token", async () => {
      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer invalid.token.here")
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Token invalide");
    });

    it("should fail with expired token", async () => {
      // Créer un token avec une durée très courte et attendre qu'il expire
      const jwt = await import("jsonwebtoken");
      const expiredToken = jwt.default.sign(
        {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1ms" } // Expire immédiatement
      );

      // Attendre 10ms pour s'assurer que le token est expiré
      await new Promise((resolve) => setTimeout(resolve, 10));

      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Token expiré");
    });

    it("should fail when user no longer exists", async () => {
      // Delete the user
      await User.findByIdAndDelete(user._id);

      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Utilisateur non trouvé");
    });
  });

  describe("optionalAuth middleware", () => {
    it("should add user when valid token provided", async () => {
      // Tester sur une route qui utilise optionalAuth (observations publiques)
      const response = await request(app)
        .get("/api/v1/observations")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("should continue without user when no token provided", async () => {
      const response = await request(app)
        .get("/api/v1/observations")
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("should continue without user when invalid token provided", async () => {
      const response = await request(app)
        .get("/api/v1/observations")
        .set("Authorization", "Bearer invalid-token")
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it("should continue without user when malformed header", async () => {
      const response = await request(app)
        .get("/api/v1/observations")
        .set("Authorization", "InvalidFormat")
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
