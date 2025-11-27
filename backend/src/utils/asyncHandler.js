/**
 * @file asyncHandler.js
 * @description Higher-Order Function (HOF) to handle errors in asynchronous controllers.
 * Eliminates the need for try-catch blocks in every controller.
 */

/**
 * Wraps an async controller function to catch errors and pass them to the error handling middleware.
 * @param {Function} fn - The async controller function.
 * @returns {Function} A new function that executes the controller and catches any errors.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
