import User from '../src/models/User.js';
import authService from '../src/services/auth.service.js';
import userService from '../src/services/user.service.js';

describe('Auth Service Direct Tests', () => {
  describe('getProfile', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        name: 'Test User',
        email: `profile${Date.now()}@example.com`,
        password: 'Password123'
      });
    });

    it('should get user profile by ID', async () => {
      const profile = await userService.getProfile(user._id);

      expect(profile).toBeDefined();
      expect(profile.email).toBe(user.email);
      expect(profile.name).toBe(user.name);
      expect(profile.password).toBeUndefined();
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        userService.getProfile('507f1f77bcf86cd799439011')
      ).rejects.toThrow('USER_NOT_FOUND');
    });
  });

  describe('signup', () => {
    it('should create new user with tokens', async () => {
      const userData = {
        name: 'New User',
        email: `newuser${Date.now()}@example.com`,
        password: 'Password123'
      };

      const result = await authService.signup(userData);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.user.password).toBeUndefined();
    });

    it('should throw error for duplicate email', async () => {
      const email = `duplicate${Date.now()}@example.com`;
      await User.create({
        name: 'Existing User',
        email,
        password: 'Password123'
      });

      await expect(
        authService.signup({
          name: 'Another User',
          email,
          password: 'Password123'
        })
      ).rejects.toThrow('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('login', () => {
    let user;
    const password = 'Password123';

    beforeEach(async () => {
      user = await User.create({
        name: 'Test User',
        email: `login${Date.now()}@example.com`,
        password
      });
    });

    it('should login with valid credentials', async () => {
      const result = await authService.login({
        email: user.email,
        password
      });

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error for non-existent email', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password
        })
      ).rejects.toThrow('INVALID_CREDENTIALS');
    });

    it('should throw error for wrong password', async () => {
      await expect(
        authService.login({
          email: user.email,
          password: 'WrongPassword'
        })
      ).rejects.toThrow('INVALID_CREDENTIALS');
    });
  });

  describe('refreshToken', () => {
    let user;
    let refreshToken;

    beforeEach(async () => {
      const userData = {
        name: 'Test User',
        email: `refresh${Date.now()}@example.com`,
        password: 'Password123'
      };

      const result = await authService.signup(userData);
      user = result.user;
      refreshToken = result.refreshToken;
    });

    it('should refresh tokens with valid refresh token', async () => {
      const result = await authService.refreshToken(refreshToken);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.accessToken).not.toBe(refreshToken);
    });

    it('should throw error for missing refresh token', async () => {
      await expect(
        authService.refreshToken()
      ).rejects.toThrow('REFRESH_TOKEN_REQUIRED');
    });

    it('should throw error for invalid refresh token', async () => {
      await expect(
        authService.refreshToken('invalid-token')
      ).rejects.toThrow('INVALID_REFRESH_TOKEN');
    });

    it('should throw error when user no longer exists', async () => {
      // Supprimer l'utilisateur
      await User.findByIdAndDelete(user._id);

      await expect(
        authService.refreshToken(refreshToken)
      ).rejects.toThrow('USER_NOT_FOUND');
    });
  });

  describe('forgotPassword', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        name: 'Test User',
        email: `forgot${Date.now()}@example.com`,
        password: 'Password123'
      });
    });

    it('should generate reset token for existing user', async () => {
      const result = await authService.forgotPassword(user.email);

      expect(result).toBeDefined();
      expect(result.message).toContain('réinitialisation');

      // En développement, le token devrait être retourné
      if (process.env.NODE_ENV === 'development') {
        expect(result.resetToken).toBeDefined();
      }
    });

    it('should return generic message for non-existent email', async () => {
      const result = await authService.forgotPassword('nonexistent@example.com');

      expect(result).toBeDefined();
      expect(result.message).toContain('réinitialisation');
      // Ne devrait pas révéler que l'email n'existe pas
      expect(result.resetToken).toBeUndefined();
    });
  });

  describe('resetPassword', () => {
    let user;
    let resetToken;

    beforeEach(async () => {
      user = await User.create({
        name: 'Test User',
        email: `reset${Date.now()}@example.com`,
        password: 'OldPassword123'
      });

      // Générer un token de réinitialisation
      const { generateAccessToken } = await import('../src/config/jwt.js');
      resetToken = generateAccessToken({
        userId: user._id.toString(),
        type: 'reset-password'
      });
    });

    it('should reset password with valid token', async () => {
      const newPassword = 'NewPassword123';
      const result = await authService.resetPassword(resetToken, newPassword);

      expect(result).toBe(true);

      // Vérifier que le mot de passe a changé
      const updatedUser = await User.findById(user._id).select('+password');
      const isValid = await updatedUser.comparePassword(newPassword);
      expect(isValid).toBe(true);
    });

    it('should throw error for invalid token', async () => {
      await expect(
        authService.resetPassword('invalid-token', 'NewPassword123')
      ).rejects.toThrow('INVALID_RESET_TOKEN');
    });

    it('should throw error for wrong token type', async () => {
      const { generateAccessToken } = await import('../src/config/jwt.js');
      const wrongToken = generateAccessToken({
        userId: user._id.toString(),
        type: 'access' // Mauvais type
      });

      await expect(
        authService.resetPassword(wrongToken, 'NewPassword123')
      ).rejects.toThrow('INVALID_RESET_TOKEN');
    });

    it('should throw error when user no longer exists', async () => {
      // Supprimer l'utilisateur
      await User.findByIdAndDelete(user._id);

      await expect(
        authService.resetPassword(resetToken, 'NewPassword123')
      ).rejects.toThrow('USER_NOT_FOUND');
    });
  });
});
