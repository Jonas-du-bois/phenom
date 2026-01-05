import request from "supertest";
//import { jest } from '@jest/globals';
import app from "../src/app.js";
import User from "../src/models/User.js";
import Observation from "../src/models/Observation.js";
import Comment from "../src/models/Comment.js";

/**
 * Admin endpoints tests
 * Covers user management, observations, comments and statistics
 */
describe("Admin Endpoints", () => {
  let adminToken;
  let regularUserId;
  let regularUserToken;
  let observationId;
  let commentId;
  let _adminId;

  // Helper to create and authenticate a user
  const createAuthenticatedUser = async (role = "viewer") => {
    const userData = {
      name: `Test ${role}`,
      email: `test-${role}-${Date.now()}@example.com`,
      password: "Password123!",
      role: role,
    };

    const user = await User.create(userData);

    const loginResponse = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: userData.email, password: userData.password });

    if (!loginResponse.body || !loginResponse.body.data) {
      throw new Error(`Login failed: ${JSON.stringify(loginResponse.body)}`);
    }

    return {
      userId: user._id,
      token: loginResponse.body.data.accessToken,
      user,
    };
  };

  beforeEach(async () => {
    // Create admin and regular user
    const admin = await createAuthenticatedUser("admin");
    adminToken = admin.token;
    _adminId = admin.userId;

    const regular = await createAuthenticatedUser("viewer");
    regularUserToken = regular.token;
    regularUserId = regular.userId;

    // Create an observation
    const observation = await Observation.create({
      title: "Test Observation",
      description: "Description for testing",
      date: new Date(),
      location: {
        type: "Point",
        coordinates: [2.3522, 48.8566],
      },
      type: "Lumière",
      userId: regularUserId,
    });
    observationId = observation._id;

    // Create a comment
    const comment = await Comment.create({
      text: "Test comment",
      observationId,
      userId: regularUserId,
    });
    commentId = comment._id;
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Observation.deleteMany({});
    await Comment.deleteMany({});
  });

  describe("GET /api/v1/admin/users", () => {
    it("should get all users as admin", async () => {
      const response = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/v1/admin/users?page=1&limit=1")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.limit).toBe(1);
    });

    it("should filter users by role", async () => {
      // Test filtre admin
      const adminResponse = await request(app)
        .get("/api/v1/admin/users?role=admin")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(adminResponse.body.success).toBe(true);
      expect(Array.isArray(adminResponse.body.data)).toBe(true);
      // Tous les utilisateurs retournés doivent être admin
      adminResponse.body.data.forEach((user) => {
        expect(user.role).toBe("admin");
      });

      // Test filtre viewer
      const viewerResponse = await request(app)
        .get("/api/v1/admin/users?role=viewer")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(viewerResponse.body.success).toBe(true);
      expect(Array.isArray(viewerResponse.body.data)).toBe(true);
      // Tous les utilisateurs retournés doivent être viewer
      viewerResponse.body.data.forEach((user) => {
        expect(user.role).toBe("viewer");
      });
    });

    it("should fail without admin role", async () => {
      await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it("should fail without authentication", async () => {
      await request(app).get("/api/v1/admin/users").expect(401);
    });
  });

  describe("GET /api/v1/admin/users/:id", () => {
    it("should get user details as admin", async () => {
      const response = await request(app)
        .get(`/api/v1/admin/users/${regularUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(regularUserId.toString());
    });

    it("should return 404 for non-existent user", async () => {
      await request(app)
        .get("/api/v1/admin/users/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);
    });

    it("should fail without admin role", async () => {
      await request(app)
        .get(`/api/v1/admin/users/${regularUserId}`)
        .set("Authorization", `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe("PUT /api/v1/admin/users/:id/role", () => {
    it("should update user role as admin", async () => {
      const response = await request(app)
        .put(`/api/v1/admin/users/${regularUserId}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "admin" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe("admin");
    });

    it("should fail with invalid role", async () => {
      await request(app)
        .put(`/api/v1/admin/users/${regularUserId}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "invalid-role" })
        .expect(400);
    });

    it("should fail without admin role", async () => {
      await request(app)
        .put(`/api/v1/admin/users/${regularUserId}/role`)
        .set("Authorization", `Bearer ${regularUserToken}`)
        .send({ role: "admin" })
        .expect(403);
    });

    it("should return 404 for non-existent user", async () => {
      await request(app)
        .put("/api/v1/admin/users/507f1f77bcf86cd799439011/role")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "admin" })
        .expect(404);
    });
  });

  describe("GET /api/v1/admin/observations", () => {
    it("should get all observations as admin", async () => {
      const response = await request(app)
        .get("/api/v1/admin/observations")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("should support sorting by title desc", async () => {
      // Créer plusieurs observations pour tester le tri
      await Observation.create({
        title: "Observation A",
        description: "Description A",
        date: new Date(),
        location: {
          type: "Point",
          coordinates: [2.3522, 48.8566],
        },
        type: "Lumière",
        userId: regularUserId,
      });

      await Observation.create({
        title: "Observation Z",
        description: "Description Z",
        date: new Date(),
        location: {
          type: "Point",
          coordinates: [2.3522, 48.8566],
        },
        type: "Lumière",
        userId: regularUserId,
      });

      const response = await request(app)
        .get("/api/v1/admin/observations?sortBy=title&order=desc")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // Vérifier que le tri est correct (Z avant A en ordre desc)
      if (response.body.data.length >= 2) {
        const titles = response.body.data.map((obs) => obs.title);
        const sortedTitles = [...titles].sort().reverse();
        expect(titles).toEqual(sortedTitles);
      }
    });

    it("should support sorting by createdAt asc", async () => {
      const response = await request(app)
        .get("/api/v1/admin/observations?sortBy=createdAt&order=asc")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // Vérifier que les dates sont en ordre croissant
      if (response.body.data.length >= 2) {
        const dates = response.body.data.map((obs) =>
          new Date(obs.createdAt).getTime()
        );
        for (let i = 1; i < dates.length; i++) {
          expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]);
        }
      }
    });

    it("should fail without admin role", async () => {
      await request(app)
        .get("/api/v1/admin/observations")
        .set("Authorization", `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe("DELETE /api/v1/admin/observations/:id", () => {
    it("should delete observation as admin", async () => {
      await request(app)
        .delete(`/api/v1/admin/observations/${observationId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(204);

      // Vérifier que l'observation est supprimée
      const observation = await Observation.findById(observationId);
      expect(observation).toBeNull();
    });

    it("should fail without admin role", async () => {
      await request(app)
        .delete(`/api/v1/admin/observations/${observationId}`)
        .set("Authorization", `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it("should return 404 for non-existent observation", async () => {
      await request(app)
        .delete("/api/v1/admin/observations/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe("GET /api/v1/admin/comments", () => {
    it("should get all comments as admin", async () => {
      const response = await request(app)
        .get("/api/v1/admin/comments")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("should fail without admin role", async () => {
      await request(app)
        .get("/api/v1/admin/comments")
        .set("Authorization", `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe("DELETE /api/v1/admin/comments/:id", () => {
    it("should delete comment as admin", async () => {
      await request(app)
        .delete(`/api/v1/admin/comments/${commentId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(204);

      // Vérifier que le commentaire est supprimé
      const comment = await Comment.findById(commentId);
      expect(comment).toBeNull();
    });

    it("should fail without admin role", async () => {
      await request(app)
        .delete(`/api/v1/admin/comments/${commentId}`)
        .set("Authorization", `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it("should return 404 for non-existent comment", async () => {
      await request(app)
        .delete("/api/v1/admin/comments/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe("GET /api/v1/admin/stats", () => {
    it("should get global statistics as admin", async () => {
      const response = await request(app)
        .get("/api/v1/admin/stats")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      // Vérifier la structure des stats
      const stats = response.body.data;
      expect(stats).toHaveProperty("totalUsers");
      expect(stats).toHaveProperty("totalObservations");
      expect(stats).toHaveProperty("totalComments");
      expect(stats).toHaveProperty("recentObservations");
      expect(stats).toHaveProperty("topContributors");
    });

    it("should fail without admin role", async () => {
      await request(app)
        .get("/api/v1/admin/stats")
        .set("Authorization", `Bearer ${regularUserToken}`)
        .expect(403);
    });
  });

  describe("Security and Edge Cases", () => {
    it("should not expose sensitive user data", async () => {
      const response = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      const users = response.body.data;
      users.forEach((user) => {
        expect(user).not.toHaveProperty("password");
      });
    });
  });
});
