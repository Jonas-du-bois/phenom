import { jest } from '@jest/globals';
import observationController from '../src/controllers/observation.controller.js';
import observationService from '../src/services/observation.service.js';

describe('ObservationController Unit Tests', () => {
  describe('getNearbyObservations', () => {
    let req, res, serviceSpy;

    beforeEach(() => {
      req = {
        query: {
            latitude: '48.8566',
            longitude: '2.3522',
            radius: '10',
            limit: '20'
        }
      };
      res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };
      serviceSpy = jest.spyOn(observationService, 'getNearbyObservations').mockResolvedValue([]);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should pass extracted limit to service', async () => {
      await observationController.getNearbyObservations(req, res);

      expect(serviceSpy).toHaveBeenCalledWith(
        '48.8566',
        '2.3522',
        '10',
        '20' // Should be the extracted limit, not the whole query object
      );
    });

    it('should handle missing limit', async () => {
      req.query.limit = undefined;
      await observationController.getNearbyObservations(req, res);

      expect(serviceSpy).toHaveBeenCalledWith(
        '48.8566',
        '2.3522',
        '10',
        undefined
      );
    });
  });
});
