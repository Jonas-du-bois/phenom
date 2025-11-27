/**
 * @file errors.js
 * @description Custom error classes for handling HTTP errors appropriately.
 */

/**
 * Base class for custom errors.
 */
export class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error for not found resources (404).
 */
export class NotFoundError extends CustomError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Error for bad requests (400).
 */
export class BadRequestError extends CustomError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

/**
 * Error for authentication failures (401).
 */
export class UnauthorizedError extends CustomError {
  constructor(message = 'Not authenticated') {
    super(message, 401);
  }
}

/**
 * Error for authorization failures (403).
 */
export class ForbiddenError extends CustomError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
  }
}
