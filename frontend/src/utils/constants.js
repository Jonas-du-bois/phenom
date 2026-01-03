/**
 * Application Constants
 *
 * Centralized constant definitions for the Phenom application.
 * Compatible with Phenom Search API format.
 */

// ============================================================================
// ADMIN STATUS VALUES
// ============================================================================

export const ADMIN_STATUS = {
  PENDING: "pending", // Awaiting review
  APPROVED: "approved", // Approved by admin
  REJECTED: "rejected", // Rejected by admin
};

// ============================================================================
// USER ROLES
// ============================================================================

export const USER_ROLES = {
  USER: "user", // Standard user
  ADMIN: "admin", // Administrator
};

// ============================================================================
// VALIDATION LIMITS
// ============================================================================

export const LIMITS = {
  DESCRIPTION_MIN_LENGTH: 20, // Minimum description characters
  DESCRIPTION_MAX_LENGTH: 5000, // Maximum description characters
  MAX_IMAGES: 5, // Max images per observation
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB max file size
  MAX_TAGS: 10, // Max tags per observation
  LOCATION_MAX_LENGTH: 200, // Location field max length
  COUNTRY_MAX_LENGTH: 100, // Country field max length
  STATE_MAX_LENGTH: 100, // State/region field max length
};

// ============================================================================
// CREDIBILITY SCALE (0-15)
// Measures the reliability of the observation report
// ============================================================================

export const CREDIBILITY_SCALE = {
  MIN: 0,
  MAX: 15,
  LEVELS: {
    NONE: { min: 0, max: 0, label: "Non évalué", color: "gray" },
    VERY_LOW: { min: 1, max: 3, label: "Très faible", color: "red" },
    LOW: { min: 4, max: 6, label: "Faible", color: "orange" },
    MEDIUM: { min: 7, max: 9, label: "Moyen", color: "yellow" },
    HIGH: { min: 10, max: 12, label: "Élevé", color: "green" },
    VERY_HIGH: { min: 13, max: 15, label: "Très élevé", color: "emerald" },
  },
};

// ============================================================================
// STRANGENESS SCALE (0-10)
// Measures how unusual/unexplainable the phenomenon was
// ============================================================================

export const STRANGENESS_SCALE = {
  MIN: 0,
  MAX: 10,
  LEVELS: {
    ORDINARY: { min: 0, max: 2, label: "Ordinaire", color: "blue" },
    UNUSUAL: { min: 3, max: 4, label: "Inhabituel", color: "indigo" },
    STRANGE: { min: 5, max: 6, label: "Étrange", color: "purple" },
    VERY_STRANGE: { min: 7, max: 8, label: "Très étrange", color: "pink" },
    EXTRAORDINARY: {
      min: 9,
      max: 10,
      label: "Extraordinaire",
      color: "fuchsia",
    },
  },
};

// ============================================================================
// DATA SOURCES
// ============================================================================

export const DATA_SOURCES = {
  USER: "user", // User-submitted observation
  HATCH: "hatch", // Imported from Hatch UFO database
};
