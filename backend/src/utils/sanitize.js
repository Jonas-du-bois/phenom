/**
 * @file sanitize.js
 * @description Utility functions for sanitizing user input.
 */

/**
 * Escapes special characters for use in a regular expression.
 * Prevents Regex Injection and ReDoS attacks.
 * @param {string} string - The string to escape.
 * @returns {string} The escaped string.
 */
export const escapeRegex = (string) => {
  if (typeof string !== 'string') {
    return '';
  }
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
