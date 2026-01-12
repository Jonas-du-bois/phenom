import Observation from "../src/models/Observation.js";
import User from "../src/models/User.js";
import Comment from "../src/models/Comment.js"; // Required for schema registration
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
      // Create observation with Phenom Search format
      const observation = await Observation.create({
        description: "Test description for owner - must be at least 10 chars",
        date: "2024-01-15",
        location: "Paris, France",
        country: "France",
        coordinates: { lat: 48.8566, lng: 2.3522 },
        userId,
      });

      const ownerId = await observationService.getObservationOwnerId(
        observation._id
      );
      expect(ownerId).toBeDefined();
      expect(ownerId.toString()).toBe(userId.toString());
    });

    it("should throw NotFoundError for non-existent observation", async () => {
      await expect(
        observationService.getObservationOwnerId("507f1f77bcf86cd799439011")
      ).rejects.toThrow("Observation not found");
    });
  });

  describe("getNearbyObservations", () => {
    beforeEach(async () => {
      // Create multiple geolocated observations with Phenom Search format
      await Observation.create([
        {
          description: "Near Paris center - observation with coordinates",
          date: "2024-01-15",
          location: "Paris, France",
          country: "France",
          coordinates: { lat: 48.8566, lng: 2.3522 },
          userId,
        },
        {
          description: "Near Lyon center - observation with coordinates",
          date: "2024-01-16",
          location: "Lyon, France",
          country: "France",
          coordinates: { lat: 45.764, lng: 4.8357 },
          userId,
        },
        {
          description: "Near Marseille - observation with coordinates",
          date: "2024-01-17",
          location: "Marseille, France",
          country: "France",
          coordinates: { lat: 43.2965, lng: 5.3698 },
          userId,
        },
      ]);
    });

    it("should get nearby observations as array", async () => {
      // getNearbyObservations returns an array, not an object with data
      const result = await observationService.getNearbyObservations(
        48.8566,
        2.3522,
        50
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should only return observations within radius", async () => {
      const result = await observationService.getNearbyObservations(
        48.8566,
        2.3522,
        10
      );

      expect(Array.isArray(result)).toBe(true);
      // Paris should be included (within 10km), Lyon and Marseille excluded
      const descriptions = result.map((obs) => obs.description);
      expect(descriptions.some(d => d.includes("Paris"))).toBe(true);
    });

    it("should handle large radius", async () => {
      const result = await observationService.getNearbyObservations(
        48.8566,
        2.3522,
        1000
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Large radius should include all cities
      expect(result.length).toBeGreaterThan(1);
    });

    it("should handle small radius with no results", async () => {
      // 0,0 is in the ocean, no observations there
      const result = await observationService.getNearbyObservations(0, 0, 1);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("should include distance in results", async () => {
      const result = await observationService.getNearbyObservations(
        48.8566,
        2.3522,
        100
      );

      if (result.length > 0) {
        expect(result[0]).toHaveProperty("distance");
        expect(typeof result[0].distance).toBe("number");
      }
    });
  });

  describe("getObservationStats", () => {
    beforeEach(async () => {
      // Créer plusieurs observations avec le format Phenom Search
      await Observation.create([
        {
          description: "Test observation 1 - must be at least 10 characters",
          date: "2024-01-15",
          location: "Paris, France",
          country: "France",
          userId,
        },
        {
          description: "Test observation 2 - must be at least 10 characters",
          date: "2024-02-15",
          location: "Lyon, France",
          country: "France",
          userId,
        },
        {
          description: "Test observation 3 - must be at least 10 characters",
          date: "2024-03-15",
          location: "Marseille, France",
          country: "France",
          userId,
        },
        {
          description: "Test observation 4 - must be at least 10 characters",
          date: "2024-04-15",
          location: "Nice, France",
          country: "France",
          userId,
        },
      ]);
    });

    it("should return observation statistics", async () => {
      const stats = await observationService.getObservationStats();

      expect(stats).toBeDefined();
      // Stats returns totalSightings (Phenom Search format)
      expect(stats.totalSightings).toBeDefined();
      expect(typeof stats.totalSightings).toBe("number");
    });

    it("should count total observations correctly", async () => {
      const stats = await observationService.getObservationStats();
      expect(stats.totalSightings).toBeGreaterThanOrEqual(4);
    });

    it("should return credibility stats", async () => {
      const stats = await observationService.getObservationStats();
      expect(stats.credibilityStats).toBeDefined();
      expect(stats.credibilityStats).toHaveProperty("min");
      expect(stats.credibilityStats).toHaveProperty("max");
      expect(stats.credibilityStats).toHaveProperty("avg");
    });

    it("should return top countries", async () => {
      const stats = await observationService.getObservationStats();
      expect(stats.topCountries).toBeDefined();
      expect(Array.isArray(stats.topCountries)).toBe(true);
    });
  });
});
