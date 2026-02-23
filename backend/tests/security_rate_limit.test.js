import { jest } from '@jest/globals';

// Mock the auth controller to avoid DB dependencies
jest.unstable_mockModule('../src/controllers/auth.controller.js', () => ({
  default: {
    signup: (req, res) => {
      // Simulate setting cookie
      res.cookie('refreshToken', 'mock-refresh-token', { httpOnly: true });
      return res.status(201).json({
        success: true,
        data: { accessToken: 'mock-access-token' }
      });
    },
    refreshToken: (req, res) => {
      return res.status(200).json({
        success: true,
        data: { accessToken: 'new-mock-access-token' }
      });
    },
    login: (req, res) => res.status(200).json({ success: true }),
    logout: (req, res) => res.status(200).json({ success: true }),
    getProfile: (req, res) => res.status(200).json({ success: true }),
    forgotPassword: (req, res) => res.status(200).json({ success: true }),
    resetPassword: (req, res) => res.status(200).json({ success: true })
  }
}));

// Import app after mocking
const { default: app } = await import('../src/app.js');
const { default: request } = await import('supertest');

describe('Security: Rate Limiting', () => {
  const originalEnableRateLimit = process.env.ENABLE_RATE_LIMIT_TEST;

  beforeAll(async () => {
    process.env.ENABLE_RATE_LIMIT_TEST = 'true';
  });

  afterAll(async () => {
    if (originalEnableRateLimit === undefined) {
      delete process.env.ENABLE_RATE_LIMIT_TEST;
    } else {
      process.env.ENABLE_RATE_LIMIT_TEST = originalEnableRateLimit;
    }
  });

  describe('POST /api/v1/auth/refresh-token', () => {
    it('should limit refresh token attempts', async () => {
      // Create a user (mocked) to get cookie
      const userData = {
        name: 'Rate Limit Test User',
        email: `ratelimit${Date.now()}@example.com`,
        password: 'password123'
      };

      const signupResponse = await request(app)
        .post('/api/v1/auth/signup')
        .send(userData);

      if (signupResponse.status !== 201) {
        console.error('Signup failed:', signupResponse.body);
      }
      expect(signupResponse.status).toBe(201);

      const cookies = signupResponse.headers['set-cookie'];
      expect(cookies).toBeDefined();

      // Make 20 successful requests (limit is 20)
      for (let i = 0; i < 20; i++) {
        await request(app)
          .post('/api/v1/auth/refresh-token')
          .set('Cookie', cookies)
          .expect(200);
      }

      // The 21st request should fail with 429
      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .set('Cookie', cookies)
        .expect(429);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Trop de tentatives');
    }, 30000);
  });
});
