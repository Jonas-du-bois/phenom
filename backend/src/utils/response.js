/**
 * Utilities for formatting HTTP responses consistently
 */

/**
 * Standard success response
 * @param {Object} res - Express response object
 * @param {*} data - Data to return
 * @param {string} message - Optional message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const successResponse = (
  res,
  data,
  message = null,
  statusCode = 200
) => {
  const response = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

/**
 * Successful creation response
 * @param {Object} res - Express response object
 * @param {*} data - Created data
 * @param {string} message - Optional message
 */
export const createdResponse = (
  res,
  data,
  message = "Ressource créée avec succès"
) => {
  return successResponse(res, data, message, 201);
};

/**
 * Standard error response
 * @param {Object} res - Express response object
 * @param {string} error - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {*} details - Additional details
 */
export const errorResponse = (res, error, statusCode = 400, details = null) => {
  const response = {
    success: false,
    error,
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const unauthorizedResponse = (res, message = "Non autorisé") => {
  return errorResponse(res, message, 401);
};

/**
 * Not found response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const notFoundResponse = (res, message = "Ressource non trouvée") => {
  return errorResponse(res, message, 404);
};
