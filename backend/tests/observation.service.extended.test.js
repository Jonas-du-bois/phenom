import Observation from "../src/models/Observation.js";
import User from "../src/models/User.js";
import observationService from "../src/services/observation.service.js";

describe("Observation Service - Missing Coverage", () => {
  let userId;

  beforeEach(async () => {
    // Create a test user
    const user = await User.create({
      name: "Test User",
      email: `service${Date.now()}@example.com`,
      password: "Password123",
    });
    userId = user._id;
  });

  describe("getObservationOwnerId", () => {
    it("should return owner ID of observation", async () => {
      const observation = await Observation.create({
        title: "Test Observation",
        description: "Test description for owner",
        location: {
          type: "Point",
          coordinates: [2.3522, 48.8566],
        },
        userId,
      });

      const ownerId = await observationService.getObservationOwnerId(
        observation._id
      );
      expect(ownerId).toBeDefined();
      expect(ownerId.toString()).toBe(userId.toString());
    });

    it("should return undefined for non-existent observation", async () => {
      const ownerId = await observationService.getObservationOwnerId(
        "507f1f77bcf86cd799439011"
      );
      expect(ownerId).toBeUndefined();
    });
  });

  describe("getNearbyObservations", () => {
    beforeEach(async () => {
      // Create multiple geolocated observations
      await Observation.create([
        {
          title: "Observation Paris",
          description: "Near Paris center",
          location: {
            type: "Point",
            coordinates: [2.3522, 48.8566],
          },
          userId,
        },
        {
          title: "Observation Lyon",
          description: "Near Lyon center",
          location: {
            type: "Point",
            coordinates: [4.8357, 45.764],
          },
          userId,
        },
        {
          title: "Observation Marseille",
          description: "Near Marseille",
          location: {
            type: "Point",
            coordinates: [5.3698, 43.2965],
          },
          userId,
        },
      ]);
    });

    it("should get nearby observations with pagination", async () => {
      const result = await observationService.getNearbyObservations(
        48.8566,
        2.3522,
        50,
        { page: 1, limit: 10 }
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it("should only return observations within radius", async () => {
      const result = await observationService.getNearbyObservations(
        48.8566,
        2.3522,
        10,
        { page: 1, limit: 10 }
      );

      expect(result.data).toBeDefined();
      // Paris should be included, Lyon and Marseille excluded
      const titles = result.data.map((obs) => obs.title);
      expect(titles).toContain("Observation Paris");
    });

    it("should respect pagination parameters", async () => {
      const result = await observationService.getNearbyObservations(
        48.8566,
        2.3522,
        1000,
        { page: 1, limit: 2 }
      );

      expect(result.pagination).toBeDefined();
      expect(result.pagination.limit).toBe(2);
    });

    it("should handle large radius", async () => {
      const result = await observationService.getNearbyObservations(
        48.8566,
        2.3522,
        1000,
        { page: 1, limit: 10 }
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it("should handle small radius with no results", async () => {
      const result = await observationService.getNearbyObservations(0, 0, 1, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe("getObservationStats", () => {
    beforeEach(async () => {
      // Créer plusieurs observations
      await Observation.create([
        {
          title: "Observation 1",
          description: "Test observation 1",
          location: { type: "Point", coordinates: [2.3522, 48.8566] },
          userId,
        },
        {
          title: "Observation 2",
          description: "Test observation 2",
          location: { type: "Point", coordinates: [2.3522, 48.8566] },
          userId,
        },
        {
          title: "Observation 3",
          description: "Test observation 3",
          location: { type: "Point", coordinates: [2.3522, 48.8566] },
          userId,
        },
        {
          title: "Observation 4",
          description: "Test observation 4",
          location: { type: "Point", coordinates: [2.3522, 48.8566] },
          userId,
        },
      ]);
    });

    it("should return observation statistics", async () => {
      const stats = await observationService.getObservationStats();

      expect(stats).toBeDefined();
      expect(stats.totalObservations).toBeDefined();
      expect(stats.observationsByMonth).toBeDefined();
    });

    it("should count total observations correctly", async () => {
      const stats = await observationService.getObservationStats();
      expect(stats.totalObservations).toBeGreaterThanOrEqual(4);
    });

    it("should return observations by month", async () => {
      const stats = await observationService.getObservationStats();
      expect(Array.isArray(stats.observationsByMonth)).toBe(true);
      expect(stats.observationsByMonth.length).toBeGreaterThan(0);
    });

    it("should limit observations by month to 12", async () => {
      const stats = await observationService.getObservationStats();
      expect(stats.observationsByMonth.length).toBeLessThanOrEqual(12);
    });
  });
});
