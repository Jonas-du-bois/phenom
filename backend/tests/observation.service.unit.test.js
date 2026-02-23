import { jest } from '@jest/globals';
import Observation from '../src/models/Observation.js';
import Comment from '../src/models/Comment.js';
import observationService from '../src/services/observation.service.js';

describe('ObservationService Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

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

  describe('getSightingsWithFilters (Performance Optimization)', () => {
    it('should use estimatedDocumentCount when no filters are provided (empty query)', async () => {
      // Mock find chain
      const mockFind = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };
      const findSpy = jest.spyOn(Observation, 'find').mockReturnValue(mockFind);

      // Mock counts
      const estimatedCountSpy = jest.spyOn(Observation, 'estimatedDocumentCount').mockResolvedValue(100);
      const countDocumentsSpy = jest.spyOn(Observation, 'countDocuments').mockResolvedValue(100);

      // Mock comments aggregation
      jest.spyOn(Comment, 'aggregate').mockResolvedValue([]);

      // Call with no filters
      await observationService.getSightingsWithFilters({});

      // Verify estimatedDocumentCount was called
      expect(estimatedCountSpy).toHaveBeenCalled();
      // Verify countDocuments was NOT called
      expect(countDocumentsSpy).not.toHaveBeenCalled();
    });

    it('should use countDocuments when filters are provided', async () => {
      // Mock find chain
      const mockFind = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };
      const findSpy = jest.spyOn(Observation, 'find').mockReturnValue(mockFind);

      // Mock counts
      const estimatedCountSpy = jest.spyOn(Observation, 'estimatedDocumentCount').mockResolvedValue(100);
      const countDocumentsSpy = jest.spyOn(Observation, 'countDocuments').mockResolvedValue(50);

      // Mock comments aggregation
      jest.spyOn(Comment, 'aggregate').mockResolvedValue([]);

      // Call with filters
      await observationService.getSightingsWithFilters({ country: 'France' });

      // Verify countDocuments was called
      expect(countDocumentsSpy).toHaveBeenCalled();
      // Verify estimatedDocumentCount was NOT called
      expect(estimatedCountSpy).not.toHaveBeenCalled();
    });
  });

  describe('getSightingsPaginated (Performance Optimization)', () => {
    it('should use estimatedDocumentCount for total count', async () => {
      // Mock find chain
      const mockFind = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };
      const findSpy = jest.spyOn(Observation, 'find').mockReturnValue(mockFind);

      // Mock counts
      const estimatedCountSpy = jest.spyOn(Observation, 'estimatedDocumentCount').mockResolvedValue(100);
      const countDocumentsSpy = jest.spyOn(Observation, 'countDocuments').mockResolvedValue(100);

      // Mock comments aggregation
      jest.spyOn(Comment, 'aggregate').mockResolvedValue([]);

      // Call
      await observationService.getSightingsPaginated(1, 10);

      // Verify estimatedDocumentCount was called
      expect(estimatedCountSpy).toHaveBeenCalled();
      // Verify countDocuments was NOT called
      expect(countDocumentsSpy).not.toHaveBeenCalled();
    });
  });
});
