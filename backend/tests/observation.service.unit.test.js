import { jest } from '@jest/globals';
import Observation from '../src/models/Observation.js';
import Comment from '../src/models/Comment.js';
import observationService from '../src/services/observation.service.js';

describe('ObservationService Unit Tests', () => {
  describe('getNearbyObservations', () => {
    it('should use aggregate pipeline with $geoNear for geospatial search', async () => {
      // Mock aggregate to return mock observations with distance
      const mockObservations = [
        {
          _id: '1',
          coordinates: { lat: 48.8566, lng: 2.3522 }, // Paris
          locationPoint: { type: 'Point', coordinates: [2.3522, 48.8566] },
          distance: 5 // km (as returned by aggregation with multiplier)
        }
      ];

      const aggregateSpy = jest.spyOn(Observation, 'aggregate').mockResolvedValue(mockObservations);
      const populateSpy = jest.spyOn(Observation, 'populate').mockResolvedValue(mockObservations);
      const commentAggregateSpy = jest.spyOn(Comment, 'aggregate').mockResolvedValue([
        { _id: '1', count: 2 }
      ]);

      const lat = 48.8566;
      const lng = 2.3522;
      const radius = 10;
      const limit = 20;

      const result = await observationService.getNearbyObservations(lat, lng, radius, limit);

      // Verify aggregate called with correct pipeline
      expect(aggregateSpy).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          $geoNear: expect.objectContaining({
            near: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            distanceField: 'distance',
            maxDistance: radius * 1000,
            spherical: true,
            distanceMultiplier: 0.001
          })
        }),
        expect.objectContaining({
            $limit: 20
        })
      ]));

      // Verify populate is called
      expect(populateSpy).toHaveBeenCalledWith(mockObservations, expect.any(Array));

      // Verify comment aggregation is called
      expect(commentAggregateSpy).toHaveBeenCalled();

      // Verify result
      expect(result).toBe(mockObservations);
      expect(result[0].distance).toBe(5);
      expect(result[0].commentsCount).toBe(2);
    });
  });
});
