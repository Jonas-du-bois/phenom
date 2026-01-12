import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";

describe("Authentication Endpoints", () => {
  describe("POST /api/v1/auth/signup", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/v1/auth/signup")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data).toHaveProperty("accessToken");
      // refreshToken is set as HttpOnly cookie, not in JSON response
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user).not.toHaveProperty("password");
    });

    it("should fail with duplicate email", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      // Create the first user
      await request(app).post("/api/v1/auth/signup").send(userData);

      // Attempt to create a duplicate
      const response = await request(app)
        .post("/api/v1/auth/signup")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("email");
    });

    it("should fail with invalid email", async () => {
      const userData = {
        name: "Test User",
        email: "invalid-email",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/v1/auth/signup")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should fail with short password", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "123",
      };

      const response = await request(app)
        .post("/api/v1/auth/signup")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      // Create a user for login tests
      await User.create({
        name: "Test User",
        email: "login@example.com",
        password: "password123",
      });
    });

    it("should login successfully with correct credentials", async () => {
      const credentials = {
        email: "login@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data).toHaveProperty("accessToken");
      // refreshToken is set as HttpOnly cookie, not in JSON response
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it("should fail with incorrect password", async () => {
      const credentials = {
        email: "login@example.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should fail with non-existent email", async () => {
      const credentials = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/v1/auth/me", () => {
    let authToken;

    beforeEach(async () => {
      // Créer et connecter un utilisateur
      const userData = {
        name: "Test User",
        email: "me@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/v1/auth/signup")
        .send(userData);

      authToken = response.body.data.accessToken;
    });

    it("should get user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("email", "me@example.com");
    });

    it("should fail without token", async () => {
      const response = await request(app).get("/api/v1/auth/me").expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should fail with invalid token", async () => {
      const response = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/refresh-token", () => {
    let cookies;

    beforeEach(async () => {
      // Créer un utilisateur et obtenir les cookies
      const userData = {
        name: "Test User",
        email: `refresh${Date.now()}@example.com`,
        password: "password123",
      };

      const response = await request(app)
        .post("/api/v1/auth/signup")
        .send(userData);

      // Get cookies from response
      cookies = response.headers['set-cookie'];
    });

    it("should refresh token successfully", async () => {
      const response = await request(app)
        .post("/api/v1/auth/refresh-token")
        .set('Cookie', cookies)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
    });

    it("should fail without refresh token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/refresh-token")
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should fail with invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/refresh-token")
        .set('Cookie', ['refreshToken=invalid-token'])
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/forgot-password", () => {
    beforeEach(async () => {
      // Créer un utilisateur
      await User.create({
        name: "Test User",
        email: "forgot@example.com",
        password: "password123",
      });
    });

    it("should send reset password email for existing user", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "forgot@example.com" })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Message is generic for security (doesn't reveal if email exists)
      expect(response.body.data.message).toBeDefined();
    });

    it("should return generic message for non-existent email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "nonexistent@example.com" })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Message is generic for security
      expect(response.body.data.message).toBeDefined();
    });
  });

  describe("POST /api/v1/auth/reset-password", () => {
    let resetToken;
    let userId;

    beforeEach(async () => {
      // Créer un utilisateur
      const user = await User.create({
        name: "Test User",
        email: `reset${Date.now()}@example.com`,
        password: "password123",
      });
      userId = user._id;

      // Générer un token de réinitialisation
      const { generateAccessToken } = await import("../src/config/jwt.js");
      resetToken = generateAccessToken({
        userId: userId.toString(),
        type: "reset-password",
      });
    });

    it("should reset password with valid token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/reset-password")
        .send({
          token: resetToken,
          newPassword: "newpassword123",
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Vérifier que le nouveau mot de passe fonctionne
      const user = await User.findById(userId).select("+password");
      const isValid = await user.comparePassword("newpassword123");
      expect(isValid).toBe(true);
    });

    it("should fail with invalid token", async () => {
      const response = await request(app)
        .post("/api/v1/auth/reset-password")
        .send({
          token: "invalid-token",
          newPassword: "newpassword123",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should fail with wrong token type", async () => {
      const { generateAccessToken } = await import("../src/config/jwt.js");
      const wrongToken = generateAccessToken({
        userId: userId.toString(),
        type: "access",
      });

      const response = await request(app)
        .post("/api/v1/auth/reset-password")
        .send({
          token: wrongToken,
          newPassword: "newpassword123",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/logout", () => {
    let authToken;

    beforeEach(async () => {
      const userData = {
        name: "Test User",
        email: `logout${Date.now()}@example.com`,
        password: "password123",
      };

      const response = await request(app)
        .post("/api/v1/auth/signup")
        .send(userData);

      authToken = response.body.data.accessToken;
    });

    it("should logout successfully", async () => {
      const response = await request(app)
        .post("/api/v1/auth/logout")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
