/**
 * @file authorize.js
 * @description Role-based and ownership-based authorization middleware.
 */

/**
 * Middleware for role-based authorization.
 * Verifies that the authenticated user has one of the allowed roles.
 * @param {...string} roles - Allowed roles (e.g., 'admin', 'user').
 * @returns {Function} Express middleware function.
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access forbidden: Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Middleware to check if the user is the owner of the resource or an admin.
 * @param {Function} getResourceOwnerId - Function that returns a Promise resolving to the owner's ID from the request.
 * @returns {Function} Express middleware function.
 */
export const isOwnerOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Admins have access to everything
      if (req.user.role === 'admin') {
        return next();
      }

      // Get resource owner ID
      const ownerId = await getResourceOwnerId(req);

      if (!ownerId) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found'
        });
      }

      // Check if user is the owner
      if (ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access forbidden: You are not the owner of this resource'
        });
      }

      next();
    } catch (error) {
      // Handle NotFoundError specifically
      if (error.statusCode === 404 || error.name === 'NotFoundError') {
        return res.status(404).json({
          success: false,
          error: error.message || 'Resource not found'
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Error checking permissions'
      });
    }
  };
};
