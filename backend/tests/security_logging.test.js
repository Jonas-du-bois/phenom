// Set environment variables BEFORE imports
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.NODE_ENV = 'test';

// Dynamic imports to ensure env vars are set before modules load
const { default: request } = await import('supertest');
const { default: app } = await import('../src/app.js');
const { default: User } = await import('../src/models/User.js');
const { default: Observation } = await import('../src/models/Observation.js');
const { default: Comment } = await import('../src/models/Comment.js');
const { generateAccessToken } = await import('../src/config/jwt.js');
import { jest } from '@jest/globals';

describe('Security Logging', () => {
  let user;
  let token;
  let consoleSpy;

  beforeEach(async () => {
    // Mock user data with methods
    const userSafe = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Security Test User',
      email: 'security.test@example.com',
      role: 'viewer'
    };

    user = {
      ...userSafe,
      toSafeObject: jest.fn().mockReturnValue(userSafe)
    };

    token = generateAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    // Mock console.log
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Mock User.findById to handle both await and chaining
    const mockQuery = {
      then: (resolve) => resolve(user),
      select: jest.fn().mockImplementation(() => ({
         then: (resolve) => resolve(user)
      }))
    };

    jest.spyOn(User, 'findById').mockReturnValue(mockQuery);

    // Also need to mock countDocuments for user service (stats)
    jest.spyOn(Observation, 'countDocuments').mockResolvedValue(0);
    jest.spyOn(Comment, 'countDocuments').mockResolvedValue(0);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('should not log sensitive token information during authentication', async () => {
    await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const logs = consoleSpy.mock.calls.flat().join(' ');

    // Check for token parts
    const tokenPart = token.substring(0, 20);
    expect(logs).not.toContain(tokenPart);
    expect(logs).not.toContain('🔑 Token received:');
  });

  it('should not log user email during authentication', async () => {
    await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const logs = consoleSpy.mock.calls.flat().join(' ');

    expect(logs).not.toContain(user.email);
  });
});
