import { jest } from '@jest/globals';

const mockFind = jest.fn().mockReturnValue({
  select: jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      }),
    }),
  }),
});
const mockCount = jest.fn().mockResolvedValue(0);

jest.unstable_mockModule('../src/models/User.js', () => ({
  default: {
    find: mockFind,
    countDocuments: mockCount
  }
}));

const adminServiceModule = await import('../src/services/admin.service.js');
const adminService = adminServiceModule.default;

describe('Admin Service Security', () => {
  it('should escape regex in search', async () => {
    await adminService.getUsers({ search: 'hello.*world' });

    expect(mockFind).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { name: { $regex: 'hello\\.\\*world', $options: 'i' } },
        { email: { $regex: 'hello\\.\\*world', $options: 'i' } },
      ],
    }));
  });
});
