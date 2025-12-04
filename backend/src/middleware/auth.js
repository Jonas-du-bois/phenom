import { verifyToken } from '../config/jwt.js';
import User from '../models/User.js';

/**
 * @file auth.js
 * @description JWT authentication middleware.
 * Verifies the token and attaches the user to the request object.
 */

/**
 * Middleware to authenticate requests using JWT.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    // Debug log
    console.log('🔐 Auth middleware:', {
      path: req.path,
      hasAuthHeader: !!authHeader,
      authHeaderStart: authHeader?.substring(0, 20)
    });

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Bearer token found');
      return res.status(401).json({
        success: false,
        error: 'Authentication token required'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "
    console.log('🔑 Token received:', token.substring(0, 30) + '...');

    // Verify and decode token
    const decoded = verifyToken(token);
    console.log('✅ Token decoded:', { userId: decoded.userId, email: decoded.email });

    // Get user from DB
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      console.log('❌ User not found in DB:', decoded.userId);
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    console.log('✅ User authenticated:', user.email);

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    console.log('❌ Auth error:', error.name, error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};
