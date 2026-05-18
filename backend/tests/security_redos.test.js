process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

const { default: adminService } = await import('../src/services/admin.service.js');
const { default: User } = await import('../src/models/User.js');
import { jest } from '@jest/globals';

describe('Admin Service ReDoS', () => {
  it('should not be vulnerable to ReDoS', async () => {
    const mockFind = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([])
            })
          })
        })
      })
    });
    jest.spyOn(User, 'find').mockImplementation(mockFind);
    jest.spyOn(User, 'countDocuments').mockResolvedValue(0);

    const maliciousSearch = '^.*.*.*.*.*.*.*.*.*.*.*.*a$';
    await adminService.getUsers({ search: maliciousSearch });

    // We expect the search to be escaped
    expect(mockFind).toHaveBeenCalledWith(expect.objectContaining({
      $or: [
        { name: { $regex: '\\^\\.\\*\\.\\*\\.\\*\\.\\*\\.\\*\\.\\*\\.\\*\\.\\*\\.\\*\\.\\*\\.\\*\\.\\*a\\$', $options: 'i' } },
        { email: { $regex: '\\^\\.\\*\\.\\*\\.\\*\\.\\*\\.\\*\\.\\*\\.\\*\\.\\*\\.\\*\\.\\*\\.\\*\\.\\*a\\$', $options: 'i' } }
      ]
    }));
  });
});
