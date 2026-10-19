import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/models/User.js', () => ({
  default: {
    estimatedDocumentCount: jest.fn(),
    countDocuments: jest.fn(),
    find: jest.fn(),
  }
}));

jest.unstable_mockModule('../src/models/Observation.js', () => ({
  default: {
    estimatedDocumentCount: jest.fn(),
    countDocuments: jest.fn(),
    find: jest.fn(),
    aggregate: jest.fn()
  }
}));

jest.unstable_mockModule('../src/models/Comment.js', () => ({
  default: {
    estimatedDocumentCount: jest.fn(),
    countDocuments: jest.fn(),
  }
}));

describe('Admin Service Unit', () => {
  let adminService;
  let User, Observation, Comment;

  beforeEach(async () => {
    User = (await import('../src/models/User.js')).default;
    Observation = (await import('../src/models/Observation.js')).default;
    Comment = (await import('../src/models/Comment.js')).default;

    adminService = (await import('../src/services/admin.service.js')).default;

    User.estimatedDocumentCount.mockResolvedValue(10);
    Observation.estimatedDocumentCount.mockResolvedValue(20);
    Comment.estimatedDocumentCount.mockResolvedValue(30);

    Observation.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ id: 1 }])
    });

    Observation.aggregate.mockResolvedValue([{ _id: 'u1', count: 5 }]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('getStats should use estimatedDocumentCount', async () => {
    const stats = await adminService.getStats();

    expect(User.estimatedDocumentCount).toHaveBeenCalled();
    expect(Observation.estimatedDocumentCount).toHaveBeenCalled();
    expect(Comment.estimatedDocumentCount).toHaveBeenCalled();

    expect(stats.totalUsers).toBe(10);
    expect(stats.totalObservations).toBe(20);
    expect(stats.totalComments).toBe(30);
  });
});
