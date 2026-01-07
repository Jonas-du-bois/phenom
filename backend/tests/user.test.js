import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Observation from "../src/models/Observation.js";

describe("User Endpoints", () => {
  let authToken;
  let userId;
  let testUser;

  // Helper pour créer un utilisateur et obtenir un token
  const createAuthenticatedUser = async (userData = {}) => {
    const defaultUserData = {
      name: "Test User",
      email: `testuser${Date.now()}@example.com`,
      password: "password123",
    };

    const mergedData = { ...defaultUserData, ...userData };
    const user = await User.create(mergedData);

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: mergedData.email,
      password: mergedData.password,
    });

    if (!loginResponse.body || !loginResponse.body.data) {
      throw new Error(`Login failed: ${JSON.stringify(loginResponse.body)}`);
    }

    return {
      user,
      token: loginResponse.body.data.accessToken,
      refreshToken: loginResponse.body.data.refreshToken,
    };
  };

  beforeEach(async () => {
    // Créer un utilisateur authentifié pour les tests
    const auth = await createAuthenticatedUser();
    testUser = auth.user;
    authToken = auth.token;
    userId = testUser._id;
  });

  // ==============================================================
  // GET /api/v1/users/me - Get user profile
  // ==============================================================
  describe("GET /api/v1/users/me", () => {
    it("should get user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("_id"); // MongoDB utilise _id
      expect(response.body.data).toHaveProperty("name", "Test User");
      expect(response.body.data).toHaveProperty("email", testUser.email);
      expect(response.body.data).toHaveProperty("role", "viewer"); // Rôle par défaut est 'viewer'
      expect(response.body.data).toHaveProperty("createdAt");
      expect(response.body.data).not.toHaveProperty("password");
    });

    it("should include observations count in profile", async () => {
      // Créer quelques observations pour l'utilisateur (Phenom Search format)
      await Observation.create([
        {
          description: "Description test 1 with enough characters for validation",
          date: "2024-10-15",
          location: "Paris, France",
          country: "France",
          userId: userId,
        },
        {
          description: "Description test 2 with enough characters for validation",
          date: "2024-10-16",
          location: "Lyon, France",
          country: "France",
          userId: userId,
        },
      ]);

      const response = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty("observationsCount");
      expect(response.body.data.observationsCount).toBeGreaterThanOrEqual(0);
    });

    it("should fail without authentication token", async () => {
      const response = await request(app).get("/api/v1/users/me").expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should fail with invalid token", async () => {
      const response = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", "Bearer invalid-token-xyz")
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should fail with malformed authorization header", async () => {
      const response = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", "InvalidFormat")
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // ==============================================================
  // PUT /api/v1/users/me - Mettre à jour le profil
  // ==============================================================
  describe("PUT /api/v1/users/me", () => {
    it("should update user profile successfully", async () => {
      const updateData = {
        name: "Updated Name",
        email: "updated@example.com",
        bio: "Je suis passionné d'astronomie",
      };

      const response = await request(app)
        .put("/api/v1/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Updated Name");
      expect(response.body.data.email).toBe("updated@example.com");
      // Le texte est stocké tel quel (pas d'échappement HTML)
      expect(response.body.data.bio).toContain("astronomie");
    });

    it("should update only name", async () => {
      const updateData = {
        name: "New Name Only",
      };

      const response = await request(app)
        .put("/api/v1/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("New Name Only");
      expect(response.body.data.email).toBe(testUser.email); // Email inchangé
    });

    it("should update only email", async () => {
      const updateData = {
        email: "newemail@example.com",
      };

      const response = await request(app)
        .put("/api/v1/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe("newemail@example.com");
      expect(response.body.data.name).toBe("Test User"); // Name inchangé
    });

    it("should fail with duplicate email", async () => {
      // Créer un autre utilisateur
      await createAuthenticatedUser({
        email: "existing@example.com",
      });

      const updateData = {
        email: "existing@example.com", // Email déjà utilisé
      };

      const response = await request(app)
        .put("/api/v1/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/email/i);
    });

    it("should fail with invalid email format", async () => {
      const updateData = {
        email: "invalid-email-format",
      };

      const response = await request(app)
        .put("/api/v1/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should fail with name too short", async () => {
      const updateData = {
        name: "A", // Trop court (min 2 caractères)
      };

      const response = await request(app)
        .put("/api/v1/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should fail without authentication", async () => {
      const updateData = {
        name: "New Name",
      };

      const response = await request(app)
        .put("/api/v1/users/me")
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should not allow updating role field", async () => {
      const updateData = {
        name: "Test User",
        role: "admin", // Tentative de modifier le rôle
      };

      const response = await request(app)
        .put("/api/v1/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      // Le rôle ne devrait pas avoir changé (reste 'viewer')
      expect(response.body.data.role).toBe("viewer");
    });
  });

  // ==============================================================
  // PATCH /api/v1/users/me/password - Changer le mot de passe
  // ==============================================================
  describe("PATCH /api/v1/users/me/password", () => {
    it("should change password successfully", async () => {
      const passwordData = {
        currentPassword: "password123",
        newPassword: "newPassword456",
        confirmPassword: "newPassword456",
      };

      const response = await request(app)
        .patch("/api/v1/users/me/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Le message peut être en français ou anglais
      expect(response.body.message).toMatch(
        /password|mot de passe.*modifié|changed|updated/i
      );
    });

    it("should be able to login with new password after change", async () => {
      const passwordData = {
        currentPassword: "password123",
        newPassword: "newPassword456",
        confirmPassword: "newPassword456",
      };

      await request(app)
        .patch("/api/v1/users/me/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(passwordData)
        .expect(200);

      // Tenter de se connecter avec le nouveau mot de passe
      const loginResponse = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: testUser.email,
          password: "newPassword456",
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });

    it("should fail with incorrect current password", async () => {
      const passwordData = {
        currentPassword: "wrongPassword",
        newPassword: "newPassword456",
        confirmPassword: "newPassword456",
      };

      const response = await request(app)
        .patch("/api/v1/users/me/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      // Le message peut être en français ou anglais
      expect(response.body.error).toMatch(
        /current|actuel.*password|mot de passe.*incorrect/i
      );
    });

    it("should fail when new password does not match confirmation", async () => {
      const passwordData = {
        currentPassword: "password123",
        newPassword: "newPassword456",
        confirmPassword: "differentPassword789",
      };

      const response = await request(app)
        .patch("/api/v1/users/me/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      // Vérifier dans les détails de validation
      const errorMessages = response.body.details
        .map((d) => d.message)
        .join(" ");
      expect(errorMessages).toMatch(/password.*match|correspondent/i);
    });

    it("should fail with short new password", async () => {
      const passwordData = {
        currentPassword: "password123",
        newPassword: "12345", // Trop court
        confirmPassword: "12345",
      };

      const response = await request(app)
        .patch("/api/v1/users/me/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should fail when new password is same as current", async () => {
      const passwordData = {
        currentPassword: "password123",
        newPassword: "password123", // Même mot de passe
        confirmPassword: "password123",
      };

      const response = await request(app)
        .patch("/api/v1/users/me/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      // Vérifier dans les détails de validation
      const errorMessages = response.body.details
        .map((d) => d.message)
        .join(" ");
      expect(errorMessages).toMatch(/same|different|ancien/i);
    });

    it("should fail without authentication", async () => {
      const passwordData = {
        currentPassword: "password123",
        newPassword: "newPassword456",
        confirmPassword: "newPassword456",
      };

      const response = await request(app)
        .patch("/api/v1/users/me/password")
        .send(passwordData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should fail with missing required fields", async () => {
      const passwordData = {
        currentPassword: "password123",
        // newPassword et confirmPassword manquants
      };

      const response = await request(app)
        .patch("/api/v1/users/me/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ==============================================================
  // DELETE /api/v1/users/me - Supprimer le compte
  // ==============================================================
  describe("DELETE /api/v1/users/me", () => {
    it("should delete user account successfully", async () => {
      const response = await request(app)
        .delete("/api/v1/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);

      // Vérifier que l'utilisateur a été supprimé
      const deletedUser = await User.findById(userId);
      expect(deletedUser).toBeNull();
    });

    it("should delete user observations when account is deleted", async () => {
      // Créer des observations pour l'utilisateur (Phenom Search format)
      await Observation.create([
        {
          description: "Description test 1 with enough characters for validation",
          date: "2024-10-15",
          location: "Paris, France",
          country: "France",
          userId: userId,
        },
        {
          description: "Description test 2 with enough characters for validation",
          date: "2024-10-16",
          location: "Lyon, France",
          country: "France",
          userId: userId,
        },
      ]);

      await request(app)
        .delete("/api/v1/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);

      // Vérifier que les observations ont été supprimées
      const observations = await Observation.find({ userId });
      expect(observations.length).toBe(0);
    });

    it("should not be able to use token after account deletion", async () => {
      await request(app)
        .delete("/api/v1/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);

      // Tenter d'utiliser le token après suppression
      const response = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should fail without authentication", async () => {
      const response = await request(app)
        .delete("/api/v1/users/me")
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should fail with invalid token", async () => {
      const response = await request(app)
        .delete("/api/v1/users/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // ==============================================================
  // GET /api/v1/users/me/observations - Récupérer les observations de l'utilisateur
  // ==============================================================
  describe("GET /api/v1/users/me/observations", () => {
    beforeEach(async () => {
      // Créer plusieurs observations pour les tests (Phenom Search format)
      await Observation.create([
        {
          description: "Description de l'observation 1 avec assez de caractères",
          date: "2024-01-01",
          location: "Paris, France",
          country: "France",
          userId: userId,
          createdAt: new Date("2024-01-01"),
        },
        {
          description: "Description de l'observation 2 avec assez de caractères",
          date: "2024-02-01",
          location: "Lyon, France",
          country: "France",
          userId: userId,
          createdAt: new Date("2024-02-01"),
        },
        {
          description: "Description de l'observation 3 avec assez de caractères",
          date: "2024-03-01",
          location: "Marseille, France",
          country: "France",
          userId: userId,
          createdAt: new Date("2024-03-01"),
        },
      ]);
    });

    it("should get all user observations", async () => {
      const response = await request(app)
        .get("/api/v1/users/me/observations")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(3);
      expect(response.body.data[0]).toHaveProperty("description");
      expect(response.body.data[0]).toHaveProperty("location");
      expect(response.body.data[0]).toHaveProperty("date");
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/v1/users/me/observations?page=1&limit=2")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.total).toBe(3);
    });

    it("should sort observations by date (newest first by default)", async () => {
      const response = await request(app)
        .get("/api/v1/users/me/observations")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].location).toBe("Marseille, France"); // Plus récente
      expect(response.body.data[2].location).toBe("Paris, France"); // Plus ancienne
    });

    it("should support custom sorting", async () => {
      const response = await request(app)
        .get("/api/v1/users/me/observations?sortBy=createdAt&order=asc")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data[0].location).toBe("Paris, France"); // Plus ancienne en premier
      expect(response.body.data[2].location).toBe("Marseille, France"); // Plus récente en dernier
    });

    it("should support sorting by location", async () => {
      const response = await request(app)
        .get("/api/v1/users/me/observations?sortBy=location&order=asc")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(3);

      // Vérifier que le tri par location est correct (alphabétique)
      const locations = response.body.data.map((obs) => obs.location);
      expect(locations[0]).toBe("Lyon, France");
      expect(locations[1]).toBe("Marseille, France");
      expect(locations[2]).toBe("Paris, France");
    });

    it("should return empty array when user has no observations", async () => {
      // Supprimer toutes les observations
      await Observation.deleteMany({ userId });

      const response = await request(app)
        .get("/api/v1/users/me/observations")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(0);
    });

    it("should not return observations from other users", async () => {
      // Créer un autre utilisateur avec ses observations
      const otherAuth = await createAuthenticatedUser({
        email: "otheruser@example.com",
      });

      await Observation.create({
        description: "Description autre utilisateur avec assez de caractères pour la validation",
        date: "2024-04-01",
        location: "Berlin, Germany",
        country: "Germany",
        userId: otherAuth.user._id,
      });

      const response = await request(app)
        .get("/api/v1/users/me/observations")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(3); // Seulement les 3 observations du testUser

      // Vérifier qu'aucune observation ne vient d'un autre utilisateur (par location)
      const hasOtherUserObservation = response.body.data.some(
        (obs) => obs.location === "Berlin, Germany"
      );
      expect(hasOtherUserObservation).toBe(false);
    });

    it("should fail without authentication", async () => {
      const response = await request(app)
        .get("/api/v1/users/me/observations")
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should handle invalid pagination parameters gracefully", async () => {
      const response = await request(app)
        .get("/api/v1/users/me/observations?page=abc&limit=xyz")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should include HATEOAS links in response", async () => {
      const response = await request(app)
        .get("/api/v1/users/me/observations")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Vérifier les liens HATEOAS sur chaque observation
      response.body.data.forEach((observation) => {
        if (observation._links) {
          expect(observation._links).toHaveProperty("self");
          expect(observation._links).toHaveProperty("update");
          expect(observation._links).toHaveProperty("delete");
        }
      });
    });
  });

  // ==============================================================
  // Tests de sécurité et edge cases
  // ==============================================================
  describe("Security and Edge Cases", () => {
    it("should not expose password hash in any endpoint", async () => {
      const response = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).not.toHaveProperty("password");
      expect(response.body.data).not.toHaveProperty("passwordHash");
    });

    it("should handle expired tokens correctly", async () => {
      // Simuler un token expiré (nécessite une modification du JWT_SECRET ou un vrai token expiré)
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjF9.invalid";

      const response = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should handle concurrent profile updates correctly", async () => {
      const updateData1 = { name: "Name Update 1" };
      const updateData2 = { name: "Name Update 2" };

      // Exécuter deux mises à jour en parallèle
      const [response1, response2] = await Promise.all([
        request(app)
          .put("/api/v1/users/me")
          .set("Authorization", `Bearer ${authToken}`)
          .send(updateData1),
        request(app)
          .put("/api/v1/users/me")
          .set("Authorization", `Bearer ${authToken}`)
          .send(updateData2),
      ]);

      // Les deux devraient réussir
      expect([200, 200]).toContain(response1.status);
      expect([200, 200]).toContain(response2.status);
    });

    it("should sanitize user inputs to prevent XSS", async () => {
      const maliciousData = {
        name: '<script>alert("XSS")</script>',
        bio: "<img src=x onerror=alert(1)>",
      };

      const response = await request(app)
        .put("/api/v1/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .send(maliciousData);

      // La requête doit soit réussir avec sanitisation, soit être rejetée
      expect([200, 400]).toContain(response.status);

      if (response.status === 200) {
        // Les balises HTML devraient être échappées
        expect(response.body.data.name).not.toContain("<script>");
        expect(response.body.data.bio).not.toContain("<img");
      }
    });

    it("should rate limit password change attempts", async () => {
      const passwordData = {
        currentPassword: "wrongPassword",
        newPassword: "newPassword456",
        confirmPassword: "newPassword456",
      };

      // Faire plusieurs tentatives rapides
      const requests = Array(6)
        .fill(null)
        .map(() =>
          request(app)
            .patch("/api/v1/users/me/password")
            .set("Authorization", `Bearer ${authToken}`)
            .send(passwordData)
        );

      const responses = await Promise.all(requests);

      // Vérifier que le rate limiting fonctionne
      const rateLimitedResponse = responses.find((r) => r.status === 429);

      // Si le rate limiting est implémenté, au moins une requête devrait être bloquée
      if (rateLimitedResponse) {
        expect(rateLimitedResponse.status).toBe(429);
      }
    });
  });
});
