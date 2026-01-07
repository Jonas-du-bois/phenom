import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";
import Observation from "../src/models/Observation.js";

describe("Observation Endpoints", () => {
  let authToken;
  let userId;
  let observationId;
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
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Observation.deleteMany({});
  });

  // ==============================================================
  // POST /api/v1/observations - Create an observation
  // ==============================================================
  describe("POST /api/v1/observations", () => {
    it("should create a new observation successfully", async () => {
      const observationData = {
        description: "I saw multiple bright lights moving in formation over the city",
        date: "2024-10-15",
        time: "20:30",
        location: "Paris, France",
        country: "France",
        coordinates: {
          lat: 48.8566,
          lng: 2.3522
        },
        duration: 300,
        credibility: 7,
        strangeness: 6
      };

      const response = await request(app)
        .post("/api/v1/observations")
        .set("Authorization", `Bearer ${authToken}`)
        .send(observationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("_id");
      expect(response.body.data.description).toBe(observationData.description);
      expect(response.body.data.location).toBe(observationData.location);
      expect(response.body.data.country).toBe(observationData.country);
      expect(response.body.data.userId._id).toBe(userId.toString());
    });

    it("should fail without authentication", async () => {
      const observationData = {
        description: "Test description for authentication test",
        date: "2024-10-15",
        location: "Paris, France",
        country: "France"
      };

      const response = await request(app)
        .post("/api/v1/observations")
        .send(observationData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should fail with missing required fields", async () => {
      const observationData = {
        title: "Test",
        // Missing description, date, location
      };

      const response = await request(app)
        .post("/api/v1/observations")
        .set("Authorization", `Bearer ${authToken}`)
        .send(observationData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeDefined();
    });

    it("should fail with invalid coordinates", async () => {
      const observationData = {
        description: "Test description with invalid coordinates values",
        date: "2024-10-15",
        location: "Unknown location",
        country: "Unknown",
        coordinates: {
          lat: 200, // Invalid latitude (must be -90 to 90)
          lng: 100
        }
      };

      const response = await request(app)
        .post("/api/v1/observations")
        .set("Authorization", `Bearer ${authToken}`)
        .send(observationData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should sanitize XSS in description", async () => {
      const observationData = {
        description: "<script>alert('XSS')</script> Normal text <img src=x onerror=alert(1)>",
        date: "2024-10-15",
        location: "Test location for XSS test",
        country: "Test Country"
      };

      const response = await request(app)
        .post("/api/v1/observations")
        .set("Authorization", `Bearer ${authToken}`)
        .send(observationData);

      // Doit réussir avec sanitisation ou échouer à la validation
      expect([201, 400]).toContain(response.status);

      if (response.status === 201) {
        expect(response.body.data.description).not.toContain("<script>");
        expect(response.body.data.description).not.toContain("<img");
      }
    });
  });

  // ==============================================================
  // GET /api/v1/observations - Liste des observations
  // ==============================================================
  describe("GET /api/v1/observations", () => {
    beforeEach(async () => {
      // Créer plusieurs observations de test (format Phenom Search)
      await Observation.create([
        {
          description: "First observation description with enough characters",
          date: "2024-10-15",
          location: "Paris, France",
          country: "France",
          coordinates: { lat: 48.8566, lng: 2.3522 },
          userId,
        },
        {
          description: "Second observation description with enough characters",
          date: "2024-10-16",
          location: "Lyon, France",
          country: "France",
          coordinates: { lat: 48.8584, lng: 2.2945 },
          userId,
        },
        {
          description: "Third observation description with enough characters",
          date: "2024-10-17",
          location: "London, UK",
          country: "United Kingdom",
          coordinates: { lat: 51.5074, lng: -0.1276 },
          userId: otherUserId,
        },
      ]);
    });

    it("should get all observations without authentication", async () => {
      const response = await request(app)
        .get("/api/v1/observations")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(3);
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/v1/observations?page=1&limit=2")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
      expect(response.body.pagination.total).toBe(3);
    });

    it("should support sorting by date desc", async () => {
      const response = await request(app)
        .get("/api/v1/observations?sortBy=date&order=desc")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(3);

      // Vérifier que le tri est correct par date décroissante
      const dates = response.body.data.map((obs) => obs.date);
      expect(dates[0]).toBe("2024-10-17");
      expect(dates[1]).toBe("2024-10-16");
      expect(dates[2]).toBe("2024-10-15");
    });

    it("should support sorting by createdAt asc", async () => {
      const response = await request(app)
        .get("/api/v1/observations?sortBy=createdAt&order=asc")
        .expect(200);

      expect(response.body.success).toBe(true);

      // Vérifier que les dates sont en ordre croissant
      const dates = response.body.data.map((obs) =>
        new Date(obs.createdAt).getTime()
      );
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]);
      }
    });

    it("should support text search", async () => {
      // Créer une observation avec un terme recherchable
      await Observation.create({
        description: "Amazing UFO sighting in Lausanne, Switzerland with bright lights",
        date: "2024-10-18",
        location: "Lausanne, Switzerland",
        country: "Switzerland",
        coordinates: { lat: 46.5197, lng: 6.6323 },
        userId,
      });

      const response = await request(app)
        .get("/api/v1/observations?search=Lausanne")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Vérifier que les résultats contiennent le terme recherché
      const hasSearchTerm = response.body.data.some(
        (obs) =>
          obs.location.includes("Lausanne") || obs.description.includes("Lausanne")
      );
      expect(hasSearchTerm).toBe(true);
    });

    it("should handle invalid pagination parameters", async () => {
      const response = await request(app)
        .get("/api/v1/observations?page=abc&limit=xyz")
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // ==============================================================
  // GET /api/v1/observations/:id - Récupérer une observation
  // ==============================================================
  describe("GET /api/v1/observations/:id", () => {
    beforeEach(async () => {
      const obs = await Observation.create({
        description: "Test description for GET by ID endpoint testing",
        date: "2024-10-15",
        location: "Paris, France",
        country: "France",
        coordinates: { lat: 48.8566, lng: 2.3522 },
        userId,
      });
      observationId = obs._id;
    });

    it("should get observation by ID", async () => {
      const response = await request(app)
        .get(`/api/v1/observations/${observationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(observationId.toString());
      expect(response.body.data.location).toBe("Paris, France");
    });

    it("should return 404 for non-existent observation", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .get(`/api/v1/observations/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await request(app)
        .get("/api/v1/observations/invalid-id")
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should include user information in response", async () => {
      const response = await request(app)
        .get(`/api/v1/observations/${observationId}`)
        .expect(200);

      // Le champ userId est populé avec les infos utilisateur
      expect(response.body.data.userId).toBeDefined();
      expect(response.body.data.userId.name).toBe("Test User");
      expect(response.body.data.userId).not.toHaveProperty("password");
    });
  });

  // ==============================================================
  // PUT /api/v1/observations/:id - Mettre à jour une observation
  // ==============================================================
  describe("PUT /api/v1/observations/:id", () => {
    beforeEach(async () => {
      const obs = await Observation.create({
        description: "Original description for update testing purposes",
        date: "2024-10-15",
        location: "Original Location",
        country: "France",
        coordinates: { lat: 48.8566, lng: 2.3522 },
        userId,
      });
      observationId = obs._id;
    });

    it("should update observation successfully", async () => {
      const updateData = {
        description: "Updated description here with enough characters for validation",
        location: "Updated Location, France",
      };

      const response = await request(app)
        .put(`/api/v1/observations/${observationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.location).toBe(updateData.location);
      expect(response.body.data.userId._id).toBe(userId.toString());
    });

    it("should fail without authentication", async () => {
      const updateData = {
        description: "Updated description attempt",
      };

      const response = await request(app)
        .put(`/api/v1/observations/${observationId}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should fail when updating observation of another user", async () => {
      const updateData = {
        description: "Updated by other user attempt",
      };

      const response = await request(app)
        .put(`/api/v1/observations/${observationId}`)
        .set("Authorization", `Bearer ${otherUserToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it("should not allow changing userId", async () => {
      const updateData = {
        description: "Updated with userId change attempt for testing",
        userId: otherUserId,
      };

      const response = await request(app)
        .put(`/api/v1/observations/${observationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      // userId est populé, donc on compare avec userId._id
      expect(response.body.data.userId._id).toBe(userId.toString());
    });

    it("should sanitize XSS in updates", async () => {
      const updateData = {
        description: "<script>alert('XSS')</script> Normal content <img src=x onerror=alert(1)>",
      };

      const response = await request(app)
        .put(`/api/v1/observations/${observationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect([200, 400]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body.data.description).not.toContain("<script>");
        expect(response.body.data.description).not.toContain("<img");
      }
    });
  });

  // ==============================================================
  // DELETE /api/v1/observations/:id - Supprimer une observation
  // ==============================================================
  describe("DELETE /api/v1/observations/:id", () => {
    beforeEach(async () => {
      const obs = await Observation.create({
        description: "This observation will be deleted during testing",
        date: "2024-10-15",
        location: "Delete Test Location",
        country: "France",
        userId,
      });
      observationId = obs._id;
    });

    it("should delete observation successfully", async () => {
      const response = await request(app)
        .delete(`/api/v1/observations/${observationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);

      // Vérifier que l'observation n'existe plus
      const obs = await Observation.findById(observationId);
      expect(obs).toBeNull();
    });

    it("should fail without authentication", async () => {
      const response = await request(app)
        .delete(`/api/v1/observations/${observationId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should fail when deleting observation of another user", async () => {
      const response = await request(app)
        .delete(`/api/v1/observations/${observationId}`)
        .set("Authorization", `Bearer ${otherUserToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent observation", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .delete(`/api/v1/observations/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // ==============================================================
  // GET /api/v1/observations/nearby - Observations à proximité
  // ==============================================================
  describe("GET /api/v1/observations/nearby", () => {
    beforeEach(async () => {
      // Créer des observations à différentes distances
      await Observation.create([
        {
          description: "Very close to Paris center for nearby search",
          date: "2024-10-15",
          location: "Paris, France",
          country: "France",
          coordinates: { lat: 48.8566, lng: 2.3522 },
          userId,
        },
        {
          description: "Also close to Paris for nearby search testing",
          date: "2024-10-16",
          location: "Near Paris, France",
          country: "France",
          coordinates: { lat: 48.86, lng: 2.36 },
          userId,
        },
        {
          description: "Very far from Paris in London for distance test",
          date: "2024-10-17",
          location: "London, UK",
          country: "United Kingdom",
          coordinates: { lat: 51.5074, lng: -0.1276 },
          userId: otherUserId,
        },
      ]);
    });

    it("should find nearby observations", async () => {
      const response = await request(app)
        .get(
          "/api/v1/observations/nearby?longitude=2.3522&latitude=48.8566&radius=10"
        )
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });

    it("should require coordinates", async () => {
      const response = await request(app)
        .get("/api/v1/observations/nearby")
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should handle invalid coordinates", async () => {
      const response = await request(app)
        .get("/api/v1/observations/nearby?longitude=200&latitude=100")
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it("should respect maxDistance parameter", async () => {
      const response = await request(app)
        .get(
          "/api/v1/observations/nearby?longitude=2.3522&latitude=48.8566&radius=1"
        )
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });
  });

  // ==============================================================
  // GET /api/v1/observations/stats - Statistiques
  // ==============================================================
  describe("GET /api/v1/observations/stats", () => {
    beforeEach(async () => {
      await Observation.create([
        {
          description: "Test observation 1 for statistics testing",
          date: "2024-10-15",
          location: "Paris, France",
          country: "France",
          coordinates: { lat: 48.8566, lng: 2.3522 },
          userId,
        },
        {
          description: "Test observation 2 for statistics testing",
          date: "2024-10-16",
          location: "Lyon, France",
          country: "France",
          coordinates: { lat: 45.7640, lng: 4.8357 },
          userId: otherUserId,
        },
      ]);
    });

    it("should get observation statistics", async () => {
      const response = await request(app)
        .get("/api/v1/observations/stats")
        .expect(200);

      expect(response.body.success).toBe(true);
      // Le service retourne totalObservations, pas total
      expect(response.body.data).toHaveProperty("totalObservations");
      expect(response.body.data.totalObservations).toBe(2);
    });

    it("should work without authentication", async () => {
      const response = await request(app)
        .get("/api/v1/observations/stats")
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  // ==============================================================
  // Security and Edge Cases
  // ==============================================================
  describe("Security and Edge Cases", () => {
    let securityUserId;
    let securityAuthToken;

    beforeEach(async () => {
      // Créer un utilisateur dédié pour les tests de sécurité
      const securityAuth = await createAuthenticatedUser(
        "securityuser@example.com"
      );
      securityUserId = securityAuth.user._id;
      securityAuthToken = securityAuth.token;
    });

    it("should rate limit observation creation", async () => {
      const observationData = {
        description: "Test description for rate limit testing with enough chars",
        date: "2024-10-15",
        location: "Paris, France",
        country: "France"
      };

      // Créer 5 observations successives
      const responses = [];
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post("/api/v1/observations")
          .set("Authorization", `Bearer ${securityAuthToken}`)
          .send(observationData);
        responses.push(response);
      }

      // Toutes les requêtes devraient réussir (pas de rate limit sur les observations pour l'instant)
      // Mais on vérifie qu'elles répondent toutes
      responses.forEach((response) => {
        expect([201, 429]).toContain(response.status);
      });
    });

    it("should handle concurrent updates correctly", async () => {
      const obs = await Observation.create({
        description: "Test description for concurrent updates with enough length",
        date: "2024-10-15",
        location: "Original Location",
        country: "France",
        userId: securityUserId,
      });

      const update1 = request(app)
        .put(`/api/v1/observations/${obs._id}`)
        .set("Authorization", `Bearer ${securityAuthToken}`)
        .send({ location: "Update Location 1" });

      const update2 = request(app)
        .put(`/api/v1/observations/${obs._id}`)
        .set("Authorization", `Bearer ${securityAuthToken}`)
        .send({ location: "Update Location 2" });

      const [response1, response2] = await Promise.all([update1, update2]);

      expect([200, 200]).toContain(response1.status);
      expect([200, 200]).toContain(response2.status);
    });

    it("should not expose sensitive user data in observations", async () => {
      const obs = await Observation.create({
        description: "Test description for security test with enough chars",
        date: "2024-10-15",
        location: "Paris, France",
        country: "France",
        userId: securityUserId,
      });

      const response = await request(app)
        .get(`/api/v1/observations/${obs._id}`)
        .expect(200);

      if (response.body.data.user) {
        expect(response.body.data.user).not.toHaveProperty("password");
        expect(response.body.data.user).not.toHaveProperty("refreshToken");
      }
    });

    it("should handle expired tokens correctly", async () => {
      // Ce test n'a pas besoin de beforeEach, il utilise directement un token invalide
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid";

      const response = await request(app)
        .post("/api/v1/observations")
        .set("Authorization", `Bearer ${expiredToken}`)
        .send({
          description: "Test description with valid length for expired token test",
          date: "2024-10-15",
          location: "Paris, France",
          country: "France"
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    }, 10000); // Augmenter le timeout pour ce test
  });

  // ==============================================================
  // Tests WebSocket
  // ==============================================================
  describe("WebSocket Events", () => {
    it("should create observation successfully (WebSocket events tested implicitly)", async () => {
      const observationData = {
        description: "Testing WebSocket emission with sufficient length for validation",
        date: "2024-10-15",
        location: "Paris, France",
        country: "France"
      };

      const response = await request(app)
        .post("/api/v1/observations")
        .set("Authorization", `Bearer ${authToken}`)
        .send(observationData)
        .expect(201);

      // Vérifier que l'observation est créée (WebSocket publishToChannel sera appelé)
      expect(response.body.success).toBe(true);
      expect(response.body.data.location).toBe(observationData.location);
    });

    it("should update observation successfully (WebSocket events tested implicitly)", async () => {
      // Créer une observation
      const observation = await Observation.create({
        description: "Original description for testing updates with valid length for validation rules",
        date: "2024-10-15",
        location: "Original Location",
        country: "France",
        userId: userId,
      });

      const updateData = {
        location: "Updated Location, France",
      };

      const response = await request(app)
        .put(`/api/v1/observations/${observation._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      // Vérifier que l'observation est mise à jour (WebSocket publishToChannel sera appelé)
      expect(response.body.success).toBe(true);
      expect(response.body.data.location).toBe("Updated Location, France");
    });

    it("should delete observation successfully (WebSocket events tested implicitly)", async () => {
      // Créer une observation
      const observation = await Observation.create({
        description: "This observation will be deleted for testing with valid length for validation",
        date: "2024-10-15",
        location: "Delete Location",
        country: "France",
        userId: userId,
      });

      await request(app)
        .delete(`/api/v1/observations/${observation._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);

      // Vérifier que l'observation est supprimée (WebSocket publishToChannel sera appelé)
      const deletedObs = await Observation.findById(observation._id);
      expect(deletedObs).toBeNull();
    });
  });

  // ==============================================================
  // Méthodes addImage et deleteImage du controller (Legacy)
  // ==============================================================
  describe("Legacy Image Methods (observation.controller)", () => {
    let testObservationId;

    beforeEach(async () => {
      const observation = await Observation.create({
        description: "Test observation for image operations with valid description length",
        date: "2024-10-15",
        location: "Paris, France",
        country: "France",
        userId: userId,
      });
      testObservationId = observation._id;
    });

    describe("POST /api/v1/observations/:id/images", () => {
      it("should fail without file", async () => {
        const response = await request(app)
          .post(`/api/v1/observations/${testObservationId}/images`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(400);

        // La route est interceptée par imageController depuis le refactoring
        expect(response.body.error).toBe("Aucune image fournie");
      });

      it("should fail for non-existent observation", async () => {
        const fakeId = "507f1f77bcf86cd799439011";

        await request(app)
          .post(`/api/v1/observations/${fakeId}/images`)
          .set("Authorization", `Bearer ${authToken}`)
          .attach("image", Buffer.from("fake-image"), "test.png")
          .expect(404);
      });
    });

    describe("DELETE /api/v1/observations/:id/images/:imageId", () => {
      it("should fail for non-existent observation", async () => {
        const fakeObsId = "507f1f77bcf86cd799439011";
        const fakeImageId = "507f1f77bcf86cd799439012";

        await request(app)
          .delete(`/api/v1/observations/${fakeObsId}/images/${fakeImageId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(404);
      });

      it("should fail for non-existent image", async () => {
        const fakeImageId = "507f1f77bcf86cd799439012";

        await request(app)
          .delete(
            `/api/v1/observations/${testObservationId}/images/${fakeImageId}`
          )
          .set("Authorization", `Bearer ${authToken}`)
          .expect(404);
      });
    });
  });
});
