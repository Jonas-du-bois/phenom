import { jest } from '@jest/globals';

// Mock Observation model
const mockObservationInstance = {
  userId: 'user123',
  images: [],
  save: jest.fn().mockResolvedValue(true)
};

const mockObservationModel = {
  findById: jest.fn()
};

// Use unstable_mockModule for ES modules
await jest.unstable_mockModule('../src/models/Observation.js', () => ({
  default: mockObservationModel
}));

// Mock ImageService
const mockImageService = {
  deleteImage: jest.fn().mockResolvedValue({})
};

await jest.unstable_mockModule('../src/services/image.service.js', () => ({
  default: mockImageService
}));

// Mock WebSocket config to avoid errors
await jest.unstable_mockModule('../src/config/websocket.js', () => ({
  publishObservationEvent: jest.fn()
}));

// Import controller after mocks
const imageController = (await import('../src/controllers/image.controller.js')).default;

describe('Security: Image Deletion Vulnerability', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {
        observationId: 'obs123',
        publicId: 'target_image_id'
      },
      user: {
        _id: 'user123',
        role: 'user'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    // Reset mocks
    mockObservationModel.findById.mockReset();
    mockImageService.deleteImage.mockClear();
    mockObservationInstance.images = [{ publicId: 'owned_image_id', url: 'http://url' }];
    mockObservationInstance.save.mockClear();
  });

  it('should prevent deleting an image not associated with the observation', async () => {
    // Setup: Observation exists and belongs to user
    mockObservationModel.findById.mockResolvedValue(mockObservationInstance);

    // Target image ID passed in URL is 'target_image_id'
    // But observation only contains 'owned_image_id'

    await imageController.deleteImage(req, res, next);

    // Expect notFoundResponse (which typically sends 404)
    // Assuming notFoundResponse calls res.status(404)
    // But since I mocked res.status, I can check that.

    // In backend/src/utils/response.js, notFoundResponse calls res.status(404).json(...)

    // Check if deleteImage was NOT called
    expect(mockImageService.deleteImage).not.toHaveBeenCalled();
  });

  it('should allow deleting an image that IS associated with the observation', async () => {
    // Setup: Target image ID IS in the observation
    req.params.publicId = 'owned_image_id';

    mockObservationModel.findById.mockResolvedValue(mockObservationInstance);

    await imageController.deleteImage(req, res, next);

    // Expect deleteImage TO BE called
    expect(mockImageService.deleteImage).toHaveBeenCalledWith('owned_image_id');

    // Expect save to be called
    expect(mockObservationInstance.save).toHaveBeenCalled();
  });
});
