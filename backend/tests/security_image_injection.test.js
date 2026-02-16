import { jest } from '@jest/globals';

// Mocks
const mockObservationService = {
  createObservation: jest.fn(),
  getObservations: jest.fn(),
  getObservationById: jest.fn(),
  updateObservation: jest.fn(),
  deleteObservation: jest.fn(),
  getNearbyObservations: jest.fn(),
  getObservationStats: jest.fn(),
  getPopularObservationTypes: jest.fn()
};

const mockImageService = {
  generateAiImage: jest.fn()
};

// Use unstable_mockModule for ES modules
await jest.unstable_mockModule('../src/services/observation.service.js', () => ({
  default: mockObservationService
}));

await jest.unstable_mockModule('../src/services/image.service.js', () => ({
  default: mockImageService
}));

// Import controller after mocks
const observationController = (await import('../src/controllers/observation.controller.js')).default;

describe('Security: Image Injection Vulnerability', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {
        title: 'Test Observation',
        description: 'Testing injection',
        // Malicious payload:
        images: [
          {
            publicId: 'other_user_image_id',
            url: 'http://malicious.url/image.jpg'
          }
        ]
      },
      user: {
        _id: 'user123'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    // Reset mocks
    mockObservationService.createObservation.mockReset();
    mockObservationService.createObservation.mockResolvedValue({
      _id: 'obs123',
      title: 'Test Observation',
      images: [] // Expect empty images in result if sanitized
    });
  });

  it('should prevent injecting images via createObservation', async () => {
    await observationController.createObservation(req, res, next);

    // Get the arguments passed to createObservation service
    const createArgs = mockObservationService.createObservation.mock.calls[0];
    const observationData = createArgs[0];

    // Verify that images field was STRIPPED from observationData
    expect(observationData).not.toHaveProperty('images');

    // Verify other fields are present
    expect(observationData).toHaveProperty('title', 'Test Observation');
  });
});
