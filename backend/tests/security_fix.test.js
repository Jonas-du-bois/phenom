import { jest } from '@jest/globals';

// Mocks
jest.unstable_mockModule('../src/services/observation.service.js', () => ({
  default: {
    updateObservation: jest.fn(),
    getObservationById: jest.fn(),
    createObservation: jest.fn(),
    getObservations: jest.fn(),
    deleteObservation: jest.fn(),
    getNearbyObservations: jest.fn(),
    getObservationStats: jest.fn(),
    getPopularObservationTypes: jest.fn(),
  }
}));

jest.unstable_mockModule('../src/services/image.service.js', () => ({
  default: {
    generateAiImage: jest.fn(),
  }
}));

// Import controller after mocks
const observationController = (await import('../src/controllers/observation.controller.js')).default;
const observationService = (await import('../src/services/observation.service.js')).default;

describe("Security Fix: Observation Controller Input Validation", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      params: { id: 'obs_123' },
      body: {},
      user: { _id: 'user_123' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should prevent arbitrary image updates via PUT: passing 'images' in body should be ignored", async () => {
    // Setup request with malicious images payload
    req.body = {
      description: "Updated description",
      images: [{
        publicId: "malicious_id",
        url: "http://malicious.site/hack.png",
        size: 12345,
        format: "png"
      }]
    };

    // Mock service response
    observationService.updateObservation.mockResolvedValue({
      _id: 'obs_123',
      description: "Updated description"
      // images are not updated
    });

    // Call the controller method
    await observationController.updateObservation(req, res, next);

    // Assert that the service was called
    expect(observationService.updateObservation).toHaveBeenCalledTimes(1);

    // Get the arguments passed to the service
    const [id, updateData] = observationService.updateObservation.mock.calls[0];

    // Assert correct ID
    expect(id).toBe('obs_123');

    // Assert that 'images' IS NOT present in updateData (FIXED)
    expect(updateData).not.toHaveProperty('images');
    expect(updateData.description).toBe("Updated description");
  });
});
