import Observation from '../src/models/Observation.js';
import User from '../src/models/User.js';
import observationService from '../src/services/observation.service.js';

describe('Observation Service - Missing Coverage', () => {
  let userId;

  beforeEach(async () => {
    // Créer un utilisateur de test
    const user = await User.create({
      name: 'Test User',
      email: `service${Date.now()}@example.com`,
      password: 'Password123'
    });
    userId = user._id;
  });

  describe('getObservationOwnerId', () => {
    it('should return owner ID of observation', async () => {
      const observation = await Observation.create({
        title: 'Test Observation',
        description: 'Test description for owner',
        location: {
          type: 'Point',
          coordinates: [2.3522, 48.8566]
        },
        userId
      });

      const ownerId = await observationService.getObservationOwnerId(observation._id);
      expect(ownerId).toBeDefined();
      expect(ownerId.toString()).toBe(userId.toString());
    });

    it('should return undefined for non-existent observation', async () => {
      const ownerId = await observationService.getObservationOwnerId('507f1f77bcf86cd799439011');
      expect(ownerId).toBeUndefined();
    });
  });

  describe('addImage', () => {
    let observationId;

    beforeEach(async () => {
      const observation = await Observation.create({
        title: 'Test Observation',
        description: 'Test description for images',
        location: {
          type: 'Point',
          coordinates: [2.3522, 48.8566]
        },
        userId
      });
      observationId = observation._id;
    });

    it('should add image to observation', async () => {
      const mockFile = {
        filename: 'test-image.jpg',
        size: 12345,
        mimetype: 'image/jpeg'
      };

      const imageData = await observationService.addImage(observationId, mockFile);

      expect(imageData).toBeDefined();
      expect(imageData.imageId).toBeDefined();
      expect(imageData.imageUrl).toContain('test-image.jpg');
      expect(imageData.size).toBe(12345);
      expect(imageData.format).toBe('jpeg');
      expect(imageData.uploadedAt).toBeDefined();

      // Vérifier que l'image est bien dans la base
      const observation = await Observation.findById(observationId);
      expect(observation.images.length).toBe(1);
      expect(observation.images[0].imageId).toBe(imageData.imageId);
    });

    it('should add multiple images to observation', async () => {
      const mockFile1 = {
        filename: 'test-image1.jpg',
        size: 12345,
        mimetype: 'image/jpeg'
      };
      const mockFile2 = {
        filename: 'test-image2.png',
        size: 54321,
        mimetype: 'image/png'
      };

      await observationService.addImage(observationId, mockFile1);
      await observationService.addImage(observationId, mockFile2);

      const observation = await Observation.findById(observationId);
      expect(observation.images.length).toBe(2);
      expect(observation.images[0].format).toBe('jpeg');
      expect(observation.images[1].format).toBe('png');
    });

    it('should throw error for non-existent observation', async () => {
      const mockFile = {
        filename: 'test-image.jpg',
        size: 12345,
        mimetype: 'image/jpeg'
      };

      await expect(
        observationService.addImage('507f1f77bcf86cd799439011', mockFile)
      ).rejects.toThrow('OBSERVATION_NOT_FOUND');
    });
  });

  describe('deleteImage', () => {
    let observationId;
    let imageId;

    beforeEach(async () => {
      const observation = await Observation.create({
        title: 'Test Observation',
        description: 'Test description for image deletion',
        location: {
          type: 'Point',
          coordinates: [2.3522, 48.8566]
        },
        userId
      });
      observationId = observation._id;

      // Ajouter une image
      const mockFile = {
        filename: 'test-image.jpg',
        size: 12345,
        mimetype: 'image/jpeg'
      };
      const imageData = await observationService.addImage(observationId, mockFile);
      imageId = imageData.imageId;
    });

    it('should delete image from observation', async () => {
      const result = await observationService.deleteImage(observationId, imageId);
      expect(result).toBe(true);

      // Vérifier que l'image a été supprimée
      const observation = await Observation.findById(observationId);
      expect(observation.images.length).toBe(0);
    });

    it('should throw error when deleting non-existent image', async () => {
      await expect(
        observationService.deleteImage(observationId, 'img_nonexistent')
      ).rejects.toThrow('IMAGE_NOT_FOUND');
    });

    it('should throw error when observation does not exist', async () => {
      await expect(
        observationService.deleteImage('507f1f77bcf86cd799439011', imageId)
      ).rejects.toThrow('OBSERVATION_NOT_FOUND');
    });

    it('should delete specific image when multiple images exist', async () => {
      // Ajouter une deuxième image
      const mockFile2 = {
        filename: 'test-image2.jpg',
        size: 54321,
        mimetype: 'image/jpeg'
      };
      const imageData2 = await observationService.addImage(observationId, mockFile2);

      // Supprimer la première image
      await observationService.deleteImage(observationId, imageId);

      // Vérifier qu'il reste une image
      const observation = await Observation.findById(observationId);
      expect(observation.images.length).toBe(1);
      expect(observation.images[0].imageId).toBe(imageData2.imageId);
    });
  });

  describe('getNearbyObservations', () => {
    beforeEach(async () => {
      // Créer plusieurs observations avec le statut approved
      await Observation.create([
        {
          title: 'Observation Paris',
          description: 'Near Paris center',
          location: {
            type: 'Point',
            coordinates: [2.3522, 48.8566]
          },
          userId,
          status: 'approved'
        },
        {
          title: 'Observation Lyon',
          description: 'Near Lyon center',
          location: {
            type: 'Point',
            coordinates: [4.8357, 45.7640]
          },
          userId,
          status: 'approved'
        },
        {
          title: 'Observation Pending',
          description: 'Pending observation',
          location: {
            type: 'Point',
            coordinates: [2.3522, 48.8566]
          },
          userId,
          status: 'pending'
        }
      ]);
    });

    it('should get nearby observations with pagination', async () => {
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

    it('should only return approved observations', async () => {
      const result = await observationService.getNearbyObservations(
        48.8566,
        2.3522,
        100,
        { page: 1, limit: 10 }
      );

      // Toutes les observations retournées doivent être approved
      result.data.forEach(obs => {
        expect(obs.status).toBe('approved');
      });
    });

    it('should respect pagination parameters', async () => {
      const result = await observationService.getNearbyObservations(
        48.8566,
        2.3522,
        100,
        { page: 1, limit: 1 }
      );

      expect(result.data.length).toBeLessThanOrEqual(1);
      expect(result.pagination.limit).toBe(1);
    });

    it('should handle large radius', async () => {
      const result = await observationService.getNearbyObservations(
        48.8566,
        2.3522,
        1000,
        { page: 1, limit: 10 }
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should handle small radius with no results', async () => {
      const result = await observationService.getNearbyObservations(
        0,
        0,
        1,
        { page: 1, limit: 10 }
      );

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('getObservationStats', () => {
    beforeEach(async () => {
      // Créer des observations avec différents statuts
      await Observation.create([
        {
          title: 'Approved 1',
          description: 'Approved observation 1',
          location: { type: 'Point', coordinates: [2.3522, 48.8566] },
          userId,
          status: 'approved'
        },
        {
          title: 'Approved 2',
          description: 'Approved observation 2',
          location: { type: 'Point', coordinates: [2.3522, 48.8566] },
          userId,
          status: 'approved'
        },
        {
          title: 'Pending 1',
          description: 'Pending observation 1',
          location: { type: 'Point', coordinates: [2.3522, 48.8566] },
          userId,
          status: 'pending'
        },
        {
          title: 'Rejected 1',
          description: 'Rejected observation 1',
          location: { type: 'Point', coordinates: [2.3522, 48.8566] },
          userId,
          status: 'rejected'
        }
      ]);
    });

    it('should return observation statistics', async () => {
      const stats = await observationService.getObservationStats();

      expect(stats).toBeDefined();
      expect(stats.totalObservations).toBeDefined();
      expect(stats.totalApproved).toBeDefined();
      expect(stats.totalPending).toBeDefined();
      expect(stats.totalRejected).toBeDefined();
      expect(stats.observationsByMonth).toBeDefined();
    });

    it('should count total observations correctly', async () => {
      const stats = await observationService.getObservationStats();
      expect(stats.totalObservations).toBeGreaterThanOrEqual(4);
    });

    it('should count approved observations correctly', async () => {
      const stats = await observationService.getObservationStats();
      expect(stats.totalApproved).toBeGreaterThanOrEqual(2);
    });

    it('should count pending observations correctly', async () => {
      const stats = await observationService.getObservationStats();
      expect(stats.totalPending).toBeGreaterThanOrEqual(1);
    });

    it('should count rejected observations correctly', async () => {
      const stats = await observationService.getObservationStats();
      expect(stats.totalRejected).toBeGreaterThanOrEqual(1);
    });

    it('should return observations by month', async () => {
      const stats = await observationService.getObservationStats();
      expect(Array.isArray(stats.observationsByMonth)).toBe(true);
      expect(stats.observationsByMonth.length).toBeGreaterThan(0);
    });

    it('should limit observations by month to 12', async () => {
      const stats = await observationService.getObservationStats();
      expect(stats.observationsByMonth.length).toBeLessThanOrEqual(12);
    });
  });
});
