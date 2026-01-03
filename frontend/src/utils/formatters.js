/**
 * Data Formatting Utilities
 *
 * Provides functions for formatting dates, numbers, and text for display.
 * All date formatting uses French locale (fr-FR) for consistency with the UI.
 *
 * @module utils/formatters
 *
 * Functions:
 * - formatDate: Full date with time
 * - formatDateShort: Short date only
 * - formatRelativeTime: Relative time (e.g., "5 minutes ago")
 * - getInitials: User initials from name
 * - formatNumber: Number with locale formatting
 * - formatFileSize: Human-readable file size
 * - truncate: Text truncation with ellipsis
 */

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format a date in French readable format with time
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date (e.g., "13 novembre 2025 à 14:30")
 */
export const formatDate = (date) => {
  if (!date) return "Date inconnue";
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format a date in short format (date only, no time)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date (e.g., "13/11/2025")
 */
export const formatDateShort = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("fr-FR");
};

// ============================================================================
// RELATIVE TIME
// ============================================================================

/**
 * Format a date as relative time (e.g., "5 minutes ago")
 * Falls back to short date format after 7 days
 * @param {string|Date} date - Date to format
 * @param {boolean} short - Short format (5min) vs long format (5 minutes)
 * @returns {string} Relative time in French (e.g., "Il y a 5 minutes")
 */
export const formatRelativeTime = (date, short = false) => {
  if (!date) return "Inconnu";

  const now = new Date();
  const target = new Date(date);
  const diffMs = now - target;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "À l'instant";

  if (short) {
    if (diffMin < 60) return `Il y a ${diffMin}min`;
    if (diffHour < 24) return `Il y a ${diffHour}h`;
    if (diffDay < 7) return `Il y a ${diffDay}j`;
  } else {
    if (diffMin < 60)
      return `Il y a ${diffMin} minute${diffMin > 1 ? "s" : ""}`;
    if (diffHour < 24)
      return `Il y a ${diffHour} heure${diffHour > 1 ? "s" : ""}`;
    if (diffDay < 7) return `Il y a ${diffDay} jour${diffDay > 1 ? "s" : ""}`;
  }

  return formatDateShort(date);
};

// ============================================================================
// USER FORMATTING
// ============================================================================

/**
 * Get user initials from user object
 * Handles various user object structures (comment author, user, etc.)
 * @param {Object} user - User object (may have nested userId or author)
 * @returns {string} Initials (e.g., "JD" for "John Doe")
 */
export const getInitials = (user) => {
  // Essayer d'obtenir le nom depuis différents champs
  const name =
    user?.userId?.name ||
    user?.author?.name ||
    user?.userId?.username ||
    user?.author?.username ||
    user?.name;
  if (!name) return "?";

  // Prendre les initiales (première lettre de chaque mot)
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Format a number with locale-specific thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number (e.g., "1 234" in French)
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  return num.toLocaleString("fr-FR");
};

/**
 * Format a file size in human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size (e.g., "1.50 MB")
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";

  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(2);

  return `${size} ${sizes[i]}`;
};

// ============================================================================
// TEXT FORMATTING
// ============================================================================

/**
 * Truncate text with ellipsis if it exceeds max length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation (default: 100)
 * @returns {string} Truncated text with "..." or original if shorter
 */
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};
