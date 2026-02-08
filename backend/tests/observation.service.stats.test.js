import { jest } from '@jest/globals';
import Observation from '../src/models/Observation.js';
import observationService from '../src/services/observation.service.js';

describe('ObservationService Stats Optimization', () => {
  let aggregateSpy;
  let countSpy;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup spies
    aggregateSpy = jest.spyOn(Observation, 'aggregate');
    countSpy = jest.spyOn(Observation, 'countDocuments');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getStatistics', () => {
    it('should use a single $facet aggregation for all stats', async () => {
      // Mock result from $facet
      const mockFacetResult = [{
        totalSightings: [{ count: 100 }],
        credibilityStats: [{ min: 1, max: 10, avg: 5.5 }],
        strangenessStats: [{ min: 2, max: 9, avg: 6.2 }],
        durationStats: [{ min: 10, max: 300, avg: 120 }],
        topCountries: [{ country: 'USA', count: 50 }, { country: 'France', count: 30 }],
        observerTypeDistribution: [{ type: 'CIV', count: 60 }, { type: 'MIL', count: 40 }],
        ufoShapeDistribution: [{ shape: 'SCR', count: 70 }, { shape: 'CIG', count: 30 }],
        phenomenaDistribution: [{ phenomenon: 'LND', count: 10 }, { phenomenon: 'SND', count: 90 }],
        sightingsWithCoordinates: [{ count: 80 }],
        sightingsWithImages: [{ count: 20 }]
      }];

      aggregateSpy.mockResolvedValue(mockFacetResult);
      // countSpy should not be called, but we don't mock implementation since we expect 0 calls.
      // However, to be safe against actual DB calls if implementation is wrong:
      countSpy.mockResolvedValue(0);

      const stats = await observationService.getStatistics();

      // Verify aggregate called once
      expect(aggregateSpy).toHaveBeenCalledTimes(1);

      // Verify no countDocuments calls (all handled in aggregation)
      expect(countSpy).toHaveBeenCalledTimes(0);

      // Verify pipeline structure
      const pipeline = aggregateSpy.mock.calls[0][0];
      expect(pipeline).toHaveLength(1);
      expect(pipeline[0]).toHaveProperty('$facet');

      const facet = pipeline[0].$facet;
      expect(facet).toHaveProperty('totalSightings');
      expect(facet).toHaveProperty('credibilityStats');
      expect(facet).toHaveProperty('strangenessStats');
      expect(facet).toHaveProperty('durationStats');
      expect(facet).toHaveProperty('topCountries');
      expect(facet).toHaveProperty('observerTypeDistribution');
      expect(facet).toHaveProperty('ufoShapeDistribution');
      expect(facet).toHaveProperty('phenomenaDistribution');
      expect(facet).toHaveProperty('sightingsWithCoordinates');
      expect(facet).toHaveProperty('sightingsWithImages');

      // Verify returned stats structure and values
      expect(stats.totalSightings).toBe(100);
      expect(stats.credibilityStats.avg).toBe('5.50');
      expect(stats.strangenessStats.avg).toBe('6.20');
      expect(stats.durationStats.avg).toBe('120.00');
      expect(stats.topCountries).toHaveLength(2);
      expect(stats.topCountries[0]).toEqual({ country: 'USA', count: 50 });
      expect(stats.observerTypeDistribution).toEqual({ CIV: 60, MIL: 40 });
      expect(stats.sightingsWithCoordinates).toBe(80);
      expect(stats.sightingsWithImages).toBe(20);
    });

    it('should handle empty results gracefully', async () => {
      // Mock empty result (e.g. no observations)
      // Note: $facet always returns one document with arrays, even if empty
      const mockFacetResult = [{
        totalSightings: [],
        credibilityStats: [],
        strangenessStats: [],
        durationStats: [],
        topCountries: [],
        observerTypeDistribution: [],
        ufoShapeDistribution: [],
        phenomenaDistribution: [],
        sightingsWithCoordinates: [],
        sightingsWithImages: []
      }];

      aggregateSpy.mockResolvedValue(mockFacetResult);

      const stats = await observationService.getStatistics();

      expect(stats.totalSightings).toBe(0);
      expect(stats.credibilityStats.min).toBe(0);
      expect(stats.credibilityStats.avg).toBe('0.00');
      expect(stats.strangenessStats.avg).toBe('0.00');
      expect(stats.durationStats.avg).toBe('0.00');
      expect(stats.topCountries).toHaveLength(0);
      expect(stats.observerTypeDistribution).toEqual({});
      expect(stats.sightingsWithCoordinates).toBe(0);
      expect(stats.sightingsWithImages).toBe(0);
    });
  });
});
