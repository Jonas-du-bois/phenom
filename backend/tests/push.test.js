import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import PushSubscription from "../src/models/PushSubscription.js";

/**
 * Push Notification endpoints tests
 * Covers subscription management and VAPID key retrieval
 */
describe("Push Notification Endpoints", () => {
  let authToken;
  let userId;

  // Mock Web Push subscription object
  const mockSubscription = {
    endpoint: "https://fcm.googleapis.com/fcm/send/test-endpoint-123",
    keys: {
      p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
      auth: "tBHItJI5svbpez7KI4CCXg"
    }
  };

  // Helper to create and authenticate a user
  const createAuthenticatedUser = async (
    email = `testuser${Date.now()}@example.com`
  ) => {
    const user = await User.create({
      name: "Test User",
      email,
      password: "Password123",
    });

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email,
      password: "Password123",
    });

    if (!loginResponse.body || !loginResponse.body.data) {
      throw new Error(`Login failed: ${JSON.stringify(loginResponse.body)}`);
    }

    return {
      user,
      token: loginResponse.body.data.accessToken,
    };
  };

  beforeEach(async () => {
    // Create the main user
    const auth = await createAuthenticatedUser();
    authToken = auth.token;
    userId = auth.user._id;
  });

  afterEach(async () => {
    await User.deleteMany({});
    await PushSubscription.deleteMany({});
  });

  // ==============================================================
  // POST /api/v1/push/subscribe - Subscribe to push notifications
  // ==============================================================
  describe("POST /api/v1/push/subscribe", () => {
    it("should create a new subscription", async () => {
      const response = await request(app)
        .post("/api/v1/push/subscribe")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ subscription: mockSubscription })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
    });

    it("should update existing subscription", async () => {
      // Create first subscription
      await request(app)
        .post("/api/v1/push/subscribe")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ subscription: mockSubscription });

      // Update with same endpoint
      const response = await request(app)
        .post("/api/v1/push/subscribe")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ subscription: mockSubscription })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify only one subscription exists
      const count = await PushSubscription.countDocuments({ userId });
      expect(count).toBe(1);
    });

    it("should fail without subscription object", async () => {
      const response = await request(app)
        .post("/api/v1/push/subscribe")
        .set("Authorization", `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should fail without authentication", async () => {
      await request(app)
        .post("/api/v1/push/subscribe")
        .send({ subscription: mockSubscription })
        .expect(401);
    });
  });

  // ==============================================================
  // POST /api/v1/push/unsubscribe - Unsubscribe from push notifications
  // ==============================================================
  describe("POST /api/v1/push/unsubscribe", () => {
    beforeEach(async () => {
      // Create a subscription first
      await PushSubscription.create({
        userId,
        subscription: mockSubscription,
      });
    });

    it("should unsubscribe successfully", async () => {
      const response = await request(app)
        .post("/api/v1/push/unsubscribe")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ endpoint: mockSubscription.endpoint })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify subscription is deleted
      const sub = await PushSubscription.findOne({ userId });
      expect(sub).toBeNull();
    });

    it("should fail without endpoint", async () => {
      await request(app)
        .post("/api/v1/push/unsubscribe")
        .set("Authorization", `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });

    it("should fail without authentication", async () => {
      await request(app)
        .post("/api/v1/push/unsubscribe")
        .send({ endpoint: mockSubscription.endpoint })
        .expect(401);
    });
  });

  // ==============================================================
  // GET /api/v1/push/public-key - Get VAPID public key
  // ==============================================================
  describe("GET /api/v1/push/public-key", () => {
    it("should return VAPID public key", async () => {
      const response = await request(app)
        .get("/api/v1/push/public-key")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("publicKey");
    });
  });

  // ==============================================================
  // PUT /api/v1/push/location - Update location
  // ==============================================================
  describe("PUT /api/v1/push/location", () => {
    beforeEach(async () => {
      // Create a subscription first
      await PushSubscription.create({
        userId,
        subscription: mockSubscription,
      });
    });

    it("should update location successfully", async () => {
      const response = await request(app)
        .put("/api/v1/push/location")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          latitude: 46.5197,
          longitude: 6.6323,
          alertRadiusKm: 100
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify location is updated (using lastLocation format)
      const sub = await PushSubscription.findOne({ userId });
      expect(sub.lastLocation.lng).toBe(6.6323);
      expect(sub.lastLocation.lat).toBe(46.5197);
      expect(sub.alertRadiusKm).toBe(100);
    });

    it("should fail without coordinates", async () => {
      await request(app)
        .put("/api/v1/push/location")
        .set("Authorization", `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });

    it("should fail without authentication", async () => {
      await request(app)
        .put("/api/v1/push/location")
        .send({ latitude: 46.5197, longitude: 6.6323 })
        .expect(401);
    });
  });

  // ==============================================================
  // PushSubscription Model Tests
  // ==============================================================
  describe("PushSubscription Model", () => {
    it("should create subscription with default alertRadiusKm", async () => {
      const sub = await PushSubscription.create({
        userId,
        subscription: mockSubscription,
      });

      expect(sub.alertRadiusKm).toBe(50); // Default value
    });

    it("should validate alertRadiusKm range", async () => {
      // Test min value
      await expect(
        PushSubscription.create({
          userId,
          subscription: mockSubscription,
          alertRadiusKm: 0,
        })
      ).rejects.toThrow();

      // Test max value
      await expect(
        PushSubscription.create({
          userId,
          subscription: mockSubscription,
          alertRadiusKm: 501,
        })
      ).rejects.toThrow();
    });

    it("should store lastLocation correctly", async () => {
      const sub = await PushSubscription.create({
        userId,
        subscription: mockSubscription,
        lastLocation: {
          lat: 46.5197,
          lng: 6.6323,
          updatedAt: new Date()
        },
      });

      expect(sub.lastLocation.lat).toBe(46.5197);
      expect(sub.lastLocation.lng).toBe(6.6323);
    });
  });
});
