import authService from '../services/auth.service.js';
import userService from '../services/user.service.js';
import { successResponse, createdResponse, errorResponse, unauthorizedResponse } from '../utils/response.js';

// Configuration for refresh token cookies
const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: '/api/v1/auth'
};

/**
 * @file auth.controller.js
 * @description Authentication controller.
 * Handles HTTP requests for signup, login, logout, token refresh, and password management.
 */
class AuthController {
  /**
   * Registers a new user.
   * POST /auth/signup
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async signup(req, res, next) {
    try {
      const result = await authService.signup(req.body);

      // Set refresh token in HttpOnly cookie
      res.cookie('refreshToken', result.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

      // Do not include refreshToken in JSON response
      const { refreshToken: _refreshToken, ...responseData } = result;

      return createdResponse(res, responseData, 'Registration successful');
    } catch (error) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return errorResponse(res, 'This email is already in use', 400);
      }
      next(error);
    }
  }

  /**
   * Authenticates a user.
   * POST /auth/login
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);

      // Set refresh token in HttpOnly cookie
      res.cookie('refreshToken', result.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

      // Do not include refreshToken in JSON response
      const { refreshToken: _refreshToken, ...responseData } = result;

      return successResponse(res, responseData, 'Login successful');
    } catch (error) {
      if (error.message === 'INVALID_CREDENTIALS') {
        return unauthorizedResponse(res, 'Incorrect email or password');
      }
      next(error);
    }
  }

  /**
   * Retrieves the profile of the logged-in user.
   * GET /auth/me
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getProfile(req, res, next) {
    try {
      const user = await userService.getProfile(req.user._id);

      return successResponse(res, user);
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND') {
        return errorResponse(res, 'User not found', 404);
      }
      next(error);
    }
  }

  /**
   * Logs out a user (clears refresh token cookie).
   * POST /auth/logout
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/api/v1/auth'
    });

    return successResponse(res, null, 'Logout successful');
  }

  /**
   * Refreshes the JWT token.
   * POST /auth/refresh-token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async refreshToken(req, res, next) {
    try {
      // Read refresh token from HttpOnly cookie
      const refreshToken = req.cookies.refreshToken;
      const tokens = await authService.refreshToken(refreshToken);

      // Update cookie with new refresh token
      res.cookie('refreshToken', tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

      // Return only access token in response
      return successResponse(res, { accessToken: tokens.accessToken }, 'Token refreshed successfully');
    } catch (error) {
      if (error.message === 'REFRESH_TOKEN_REQUIRED') {
        return errorResponse(res, 'Refresh token required', 400);
      }
      if (error.message === 'INVALID_REFRESH_TOKEN') {
        // Clear invalid cookie
        res.clearCookie('refreshToken', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
          path: '/api/v1/auth'
        });
        return unauthorizedResponse(res, 'Invalid or expired refresh token');
      }
      if (error.message === 'USER_NOT_FOUND') {
        return unauthorizedResponse(res, 'User not found');
      }
      next(error);
    }
  }

  /**
   * Requests a password reset.
   * POST /auth/forgot-password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);

      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resets the password.
   * POST /auth/reset-password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);

      return successResponse(res, null, 'Password reset successfully');
    } catch (error) {
      if (error.message === 'INVALID_RESET_TOKEN') {
        return unauthorizedResponse(res, 'Invalid or expired reset token');
      }
      if (error.message === 'USER_NOT_FOUND') {
        return unauthorizedResponse(res, 'User not found');
      }
      next(error);
    }
  }
}

export default new AuthController();
