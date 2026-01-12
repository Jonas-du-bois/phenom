import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Observation from "../src/models/Observation.js";
import Notification, { NOTIFICATION_TYPES } from "../src/models/Notification.js";

/**
 * Notification endpoints tests
 * Covers fetching, marking as read, and deleting notifications
 */
describe("Notification Endpoints", () => {
  let authToken;
  let userId;
  let observationId;
  let observation2Id;
  let notificationId;

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

    // Create an observation (Phenom Search format)
    const observation = await Observation.create({
      description: "Test observation for notifications testing",
      date: "2024-10-15",
      location: "Paris, France",
      country: "France",
      userId,
    });
    observationId = observation._id;

    // Create a second observation for additional notifications
    const observation2 = await Observation.create({
      description: "Another test observation for pagination",
      date: "2024-10-16",
      location: "Lyon, France",
      country: "France",
      userId,
    });
    observation2Id = observation2._id;

    // Create some test notifications using valid NOTIFICATION_TYPES
    const notification = await Notification.create({
      userId,
      observationId,
      type: NOTIFICATION_TYPES.OBSERVATION_NEARBY,
      title: "Nouvelle observation à proximité",
      message: "Un phénomène a été signalé à 15 km de vous",
      distance: 15.2,
      observationSnapshot: {
        title: "Test Observation",
        location: "Paris, France",
      },
    });
    notificationId = notification._id;

    // Create additional notification for pagination tests (different observation to avoid duplicate)
    await Notification.create({
      userId,
      observationId: observation2Id,
      type: NOTIFICATION_TYPES.OBSERVATION_NEARBY,
      title: "Autre observation",
      message: "Un autre phénomène signalé",
      distance: 25.0,
      read: true, // Already read
    });
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Observation.deleteMany({});
    await Notification.deleteMany({});
  });

  // ==============================================================
  // GET /api/v1/notifications - Get user notifications
  // ==============================================================
  describe("GET /api/v1/notifications", () => {
    it("should get all notifications for the user", async () => {
      const response = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("notifications");
      expect(Array.isArray(response.body.data.notifications)).toBe(true);
      expect(response.body.data.notifications.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data).toHaveProperty("pagination");
      expect(response.body.data).toHaveProperty("unreadCount");
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/v1/notifications?page=1&limit=1")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.notifications.length).toBe(1);
      expect(response.body.data.pagination.limit).toBe(1);
    });

    it("should filter unread only", async () => {
      const response = await request(app)
        .get("/api/v1/notifications?unreadOnly=true")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      response.body.data.notifications.forEach((notification) => {
        expect(notification.read).toBe(false);
      });
    });

    it("should fail without authentication", async () => {
      await request(app).get("/api/v1/notifications").expect(401);
    });
  });

  // ==============================================================
  // GET /api/v1/notifications/unread-count - Get unread count
  // ==============================================================
  describe("GET /api/v1/notifications/unread-count", () => {
    it("should get unread notifications count", async () => {
      const response = await request(app)
        .get("/api/v1/notifications/unread-count")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("count");
      expect(typeof response.body.data.count).toBe("number");
      expect(response.body.data.count).toBeGreaterThanOrEqual(1);
    });

    it("should fail without authentication", async () => {
      await request(app).get("/api/v1/notifications/unread-count").expect(401);
    });
  });

  // ==============================================================
  // PATCH /api/v1/notifications/:id/read - Mark as read
  // ==============================================================
  describe("PATCH /api/v1/notifications/:id/read", () => {
    it("should mark notification as read", async () => {
      const response = await request(app)
        .patch(`/api/v1/notifications/${notificationId}/read`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.read).toBe(true);
      expect(response.body.data.viewedAt).toBeDefined();
    });

    it("should fail for non-existent notification", async () => {
      await request(app)
        .patch("/api/v1/notifications/507f1f77bcf86cd799439011/read")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });

    it("should fail for another user's notification", async () => {
      // Create another user
      const otherAuth = await createAuthenticatedUser("other@example.com");

      // Try to mark the first user's notification as read
      await request(app)
        .patch(`/api/v1/notifications/${notificationId}/read`)
        .set("Authorization", `Bearer ${otherAuth.token}`)
        .expect(404);
    });

    it("should fail without authentication", async () => {
      await request(app)
        .patch(`/api/v1/notifications/${notificationId}/read`)
        .expect(401);
    });
  });

  // ==============================================================
  // POST /api/v1/notifications/mark-all-read - Mark all as read
  // ==============================================================
  describe("POST /api/v1/notifications/mark-all-read", () => {
    it("should mark all notifications as read", async () => {
      const response = await request(app)
        .post("/api/v1/notifications/mark-all-read")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("modifiedCount");

      // Verify all are read
      const countResponse = await request(app)
        .get("/api/v1/notifications/unread-count")
        .set("Authorization", `Bearer ${authToken}`);

      expect(countResponse.body.data.count).toBe(0);
    });

    it("should fail without authentication", async () => {
      await request(app).post("/api/v1/notifications/mark-all-read").expect(401);
    });
  });

  // ==============================================================
  // DELETE /api/v1/notifications/:id - Delete notification
  // ==============================================================
  describe("DELETE /api/v1/notifications/:id", () => {
    it("should delete a notification", async () => {
      await request(app)
        .delete(`/api/v1/notifications/${notificationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      // Verify it's deleted
      const notification = await Notification.findById(notificationId);
      expect(notification).toBeNull();
    });

    it("should fail for non-existent notification", async () => {
      await request(app)
        .delete("/api/v1/notifications/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });

    it("should fail for another user's notification", async () => {
      // Create another user
      const otherAuth = await createAuthenticatedUser("other2@example.com");

      // Try to delete the first user's notification
      await request(app)
        .delete(`/api/v1/notifications/${notificationId}`)
        .set("Authorization", `Bearer ${otherAuth.token}`)
        .expect(404);
    });

    it("should fail without authentication", async () => {
      await request(app)
        .delete(`/api/v1/notifications/${notificationId}`)
        .expect(401);
    });
  });

  // ==============================================================
  // Notification Model Tests
  // ==============================================================
  describe("Notification Model", () => {
    it("should create notification with deduplication", async () => {
      // Try to create duplicate notification for the same observation
      const result = await Notification.createIfNotExists({
        userId,
        observationId,
        type: NOTIFICATION_TYPES.OBSERVATION_NEARBY,
        title: "Duplicate test",
        message: "Should not create duplicate",
        distance: 10,
      });

      // Should return existing notification (not create new)
      expect(result).toBeDefined();
      expect(result.isNew).toBe(false);
      expect(result.notification).toBeDefined();
    });

    it("should get unread count correctly", async () => {
      const count = await Notification.getUnreadCount(userId);
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(1);
    });

    it("should mark all as read", async () => {
      const result = await Notification.markAllAsRead(userId);
      expect(result).toHaveProperty("modifiedCount");

      // Verify
      const count = await Notification.getUnreadCount(userId);
      expect(count).toBe(0);
    });
  });
});
