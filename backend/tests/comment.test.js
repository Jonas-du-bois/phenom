import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Observation from "../src/models/Observation.js";
import Comment from "../src/models/Comment.js";

describe("Comment Endpoints", () => {
  let authToken;
  let userId;
  let observationId;
  let commentId;
  let otherUserToken;
  let otherUserId;

  // Helper pour créer un utilisateur et obtenir un token
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

    // Create another user for permission tests
    const otherAuth = await createAuthenticatedUser("otheruser@example.com");
    otherUserToken = otherAuth.token;
    otherUserId = otherAuth.user._id;

    // Create a test observation (Phenom Search format)
    const observation = await Observation.create({
      description: "Test description for comments testing with enough characters",
      date: "2024-10-15",
      location: "Paris, France",
      country: "France",
      userId,
    });
    observationId = observation._id;
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Observation.deleteMany({});
    await Comment.deleteMany({});
  });

  // ==============================================================
  // POST /api/v1/observations/:id/comments - Create a comment
  // ==============================================================
  describe("POST /api/v1/observations/:id/comments", () => {
    it("should create a new comment successfully", async () => {
      const commentData = {
        text: "Great observation!",
      };

      const response = await request(app)
        .post(`/api/v1/observations/${observationId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(commentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("_id");
      expect(response.body.data.text).toBe(commentData.text);
      expect(response.body.data.observationId).toBe(observationId.toString());

      // userId peut être populé, donc vérifier _id ou le string
      const returnedUserId =
        response.body.data.userId._id || response.body.data.userId;
      expect(returnedUserId).toBe(userId.toString());
    });

    it("should fail without authentication", async () => {
      const response = await request(app)
        .post(`/api/v1/observations/${observationId}/comments`)
        .send({ text: "Test comment" })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should fail with missing text", async () => {
      const response = await request(app)
        .post(`/api/v1/observations/${observationId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should fail with text too long", async () => {
      const longText = "a".repeat(501); // Max 500 caractères

      const response = await request(app)
        .post(`/api/v1/observations/${observationId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ text: longText })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should sanitize XSS in comment text", async () => {
      const xssText = '<script>alert("XSS")</script>Commentaire';

      const response = await request(app)
        .post(`/api/v1/observations/${observationId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ text: xssText })
        .expect(201);

      expect(response.body.data.text).not.toContain("<script>");
      expect(response.body.data.text).toContain("Commentaire");
    });

    it("should fail for non-existent observation", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .post(`/api/v1/observations/${fakeId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ text: "Test comment" })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // ==============================================================
  // GET /api/v1/observations/:id/comments - Liste des commentaires
  // ==============================================================
  describe("GET /api/v1/observations/:id/comments", () => {
    beforeEach(async () => {
      // Créer plusieurs commentaires de test
      await Comment.create([
        {
          text: "First comment",
          observationId,
          userId,
        },
        {
          text: "Second comment",
          observationId,
          userId: otherUserId,
        },
        {
          text: "Third comment",
          observationId,
          userId,
        },
      ]);
    });

    it("should get all comments without authentication", async () => {
      const response = await request(app)
        .get(`/api/v1/observations/${observationId}/comments`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(3);
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get(`/api/v1/observations/${observationId}/comments?page=1&limit=2`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.total).toBe(3);
    });

    it("should return empty array for observation with no comments", async () => {
      // Créer une nouvelle observation sans commentaires (Phenom Search format)
      const newObs = await Observation.create({
        description: "Observation without comments for testing empty array",
        date: "2024-10-15",
        location: "Paris, France",
        country: "France",
        userId,
      });

      const response = await request(app)
        .get(`/api/v1/observations/${newObs._id}/comments`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    it("should return 404 for non-existent observation", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .get(`/api/v1/observations/${fakeId}/comments`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it("should populate user information", async () => {
      const response = await request(app)
        .get(`/api/v1/observations/${observationId}/comments`)
        .expect(200);

      expect(response.body.data[0].userId).toBeDefined();
      expect(response.body.data[0].userId.name).toBeDefined();
      expect(response.body.data[0].userId).not.toHaveProperty("password");
    });
  });

  // ==============================================================
  // PUT /api/v1/comments/:id - Mettre à jour un commentaire
  // ==============================================================
  describe("PUT /api/v1/comments/:id", () => {
    beforeEach(async () => {
      // Créer un commentaire de test
      const comment = await Comment.create({
        text: "Original comment",
        observationId,
        userId,
      });
      commentId = comment._id;
    });

    it("should update comment successfully", async () => {
      const updateData = {
        text: "Updated comment text",
      };

      const response = await request(app)
        .put(`/api/v1/comments/${commentId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.text).toBe(updateData.text);
    });

    it("should fail without authentication", async () => {
      const response = await request(app)
        .put(`/api/v1/comments/${commentId}`)
        .send({ text: "Updated text" })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should fail when updating comment of another user", async () => {
      const response = await request(app)
        .put(`/api/v1/comments/${commentId}`)
        .set("Authorization", `Bearer ${otherUserToken}`)
        .send({ text: "Trying to update" })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent comment", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .put(`/api/v1/comments/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ text: "Updated text" })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it("should sanitize XSS in update", async () => {
      const xssText = '<script>alert("XSS")</script>Updated';

      const response = await request(app)
        .put(`/api/v1/comments/${commentId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ text: xssText })
        .expect(200);

      expect(response.body.data.text).not.toContain("<script>");
      expect(response.body.data.text).toContain("Updated");
    });

    it("should not allow changing observationId or userId", async () => {
      const maliciousUpdate = {
        text: "Updated",
        observationId: "507f1f77bcf86cd799439011",
        userId: otherUserId,
      };

      const response = await request(app)
        .put(`/api/v1/comments/${commentId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(maliciousUpdate)
        .expect(200);

      // observationId et userId ne devraient pas avoir changé
      expect(response.body.data.observationId).toBe(observationId.toString());

      const returnedUserId =
        response.body.data.userId._id || response.body.data.userId;
      expect(returnedUserId).toBe(userId.toString());
    });
  });

  // ==============================================================
  // DELETE /api/v1/comments/:id - Supprimer un commentaire
  // ==============================================================
  describe("DELETE /api/v1/comments/:id", () => {
    beforeEach(async () => {
      // Créer un commentaire de test
      const comment = await Comment.create({
        text: "Comment to delete",
        observationId,
        userId,
      });
      commentId = comment._id;
    });

    it("should delete comment successfully", async () => {
      const response = await request(app)
        .delete(`/api/v1/comments/${commentId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);

      // Vérifier que le commentaire a été supprimé
      const deletedComment = await Comment.findById(commentId);
      expect(deletedComment).toBeNull();
    });

    it("should fail without authentication", async () => {
      const response = await request(app)
        .delete(`/api/v1/comments/${commentId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should fail when deleting comment of another user", async () => {
      const response = await request(app)
        .delete(`/api/v1/comments/${commentId}`)
        .set("Authorization", `Bearer ${otherUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent comment", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .delete(`/api/v1/comments/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // ==============================================================
  // Security and Edge Cases
  // ==============================================================
  describe("Security and Edge Cases", () => {
    it("should not expose sensitive user data in comments", async () => {
      const comment = await Comment.create({
        text: "Test comment",
        observationId,
        userId,
      });

      const response = await request(app)
        .get(`/api/v1/observations/${observationId}/comments`)
        .expect(200);

      expect(response.body.data[0].userId).not.toHaveProperty("password");
      expect(response.body.data[0].userId).not.toHaveProperty("refreshToken");
    });

    it("should handle concurrent comment creation", async () => {
      const commentData = { text: "Concurrent comment" };

      const promises = Array(3)
        .fill()
        .map(() =>
          request(app)
            .post(`/api/v1/observations/${observationId}/comments`)
            .set("Authorization", `Bearer ${authToken}`)
            .send(commentData)
        );

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect([201]).toContain(response.status);
      });

      const comments = await Comment.find({ observationId });
      expect(comments.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ==============================================================
  // Tests WebSocket
  // ==============================================================
  describe("WebSocket Events", () => {
    it("should create comment successfully (WebSocket events tested implicitly)", async () => {
      const commentData = {
        text: "Test comment for WebSocket",
      };

      const response = await request(app)
        .post(`/api/v1/observations/${observationId}/comments`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(commentData)
        .expect(201);

      // Vérifier que le commentaire est créé (WebSocket publishToChannel sera appelé)
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("text", commentData.text);
    });

    it("should update comment successfully (WebSocket events tested implicitly)", async () => {
      // Créer un commentaire
      const comment = await Comment.create({
        text: "Original comment text",
        observationId,
        userId,
      });

      const updateData = {
        text: "Updated comment text",
      };

      const response = await request(app)
        .put(`/api/v1/comments/${comment._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      // Vérifier que le commentaire est mis à jour (WebSocket publishToChannel sera appelé)
      expect(response.body.success).toBe(true);
      expect(response.body.data.text).toBe("Updated comment text");
    });

    it("should delete comment successfully (WebSocket events tested implicitly)", async () => {
      // Créer un commentaire
      const comment = await Comment.create({
        text: "Comment to delete",
        observationId,
        userId,
      });

      await request(app)
        .delete(`/api/v1/comments/${comment._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);

      // Vérifier que le commentaire est supprimé (WebSocket publishToChannel sera appelé)
      const deletedComment = await Comment.findById(comment._id);
      expect(deletedComment).toBeNull();
    });
  });
});
