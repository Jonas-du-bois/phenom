import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, createTokenPayload } from '../config/jwt.js';

/**
 * @file auth.service.js
 * @description Authentication service handling signup, login, token refresh, and password reset.
 */
class AuthService {
  /**
   * Registers a new user.
   * @param {Object} userData - User data (name, email, password).
   * @returns {Object} Created user and tokens.
   */
  async signup(userData) {
    const { name, email, password } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate tokens
    const payload = createTokenPayload(user);
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: user.toSafeObject(),
      accessToken,
      refreshToken
    };
  }

  /**
   * Authenticates a user.
   * @param {Object} credentials - Email and password.
   * @returns {Object} User and tokens.
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Find user with password included
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Generate tokens
    const payload = createTokenPayload(user);
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: user.toSafeObject(),
      accessToken,
      refreshToken
    };
  }

  /**
   * Refreshes access token using a refresh token.
   * @param {string} refreshToken - The refresh token.
   * @returns {Object} New access and refresh tokens.
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error('REFRESH_TOKEN_REQUIRED');
    }

    // Verify refresh token
    const { verifyToken } = await import('../config/jwt.js');
    let decoded;
    try {
      decoded = verifyToken(refreshToken, true);
    } catch (error) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    // Verify user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Generate new tokens
    const payload = createTokenPayload(user);
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  /**
   * Initiates password reset process.
   * @param {string} email - User email.
   * @returns {Object} Success message.
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      // Do not reveal if email exists for security reasons
      return { message: 'If this email exists, a reset link has been sent' };
    }

    // Generate reset token (valid 1h)
    const resetToken = generateAccessToken({
      userId: user._id.toString(),
      type: 'reset-password'
    });

    // TODO: Send email with token
    // For now, return token in response (development only)

    return {
      message: 'If this email exists, a reset link has been sent',
      // Development/test only
      ...((process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') && { resetToken })
    };
  }

  /**
   * Resets password using a token.
   * @param {string} token - Reset token.
   * @param {string} newPassword - New password.
   * @returns {boolean} True if successful.
   */
  async resetPassword(token, newPassword) {
    const { verifyToken } = await import('../config/jwt.js');
    let decoded;

    try {
      decoded = verifyToken(token, false);
    } catch (error) {
      throw new Error('INVALID_RESET_TOKEN');
    }

    // Ensure it is a reset token
    if (decoded.type !== 'reset-password') {
      throw new Error('INVALID_RESET_TOKEN');
    }

    // Get user
    const user = await User.findById(decoded.userId).select('+password');
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return true;
  }
}

export default new AuthService();
