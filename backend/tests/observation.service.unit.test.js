import { jest } from '@jest/globals';
import Observation from '../src/models/Observation.js';
import observationService from '../src/services/observation.service.js';

describe('ObservationService Unit Tests', () => {
  describe('getNearbyObservations', () => {
    it('should use $near query for geospatial search', async () => {
      // Mock the chain: find -> populate -> populate -> limit -> lean
      const mockLean = jest.fn().mockResolvedValue([
        {
          _id: '1',
          coordinates: { lat: 48.8566, lng: 2.3522 }, // Paris
          locationPoint: { type: 'Point', coordinates: [2.3522, 48.8566] }
        }
      ]);
      const mockLimit = jest.fn().mockReturnValue({ lean: mockLean });
      const mockPopulate2 = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });

      const findSpy = jest.spyOn(Observation, 'find').mockReturnValue({
        populate: mockPopulate1
      });

      const lat = 48.8566;
      const lng = 2.3522;
      const radius = 10;

      const result = await observationService.getNearbyObservations(lat, lng, radius);

      expect(findSpy).toHaveBeenCalledWith(expect.objectContaining({
        locationPoint: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $maxDistance: radius * 1000
          }
        }
      }));

      // Verify distance is added
      expect(result[0]).toHaveProperty('distance');
      expect(result[0].distance).toBeCloseTo(0, 1); // Distance to itself is 0
    });
  });
});
