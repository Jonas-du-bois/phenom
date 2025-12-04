/**
 * Constantes de l'application
 * Compatible avec le format Phenom Search API
 */

// Statuts admin
export const ADMIN_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

// Rôles utilisateurs
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
};

// Limites de validation
export const LIMITS = {
  DESCRIPTION_MIN_LENGTH: 20,
  DESCRIPTION_MAX_LENGTH: 5000,
  MAX_IMAGES: 5,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_TAGS: 10,
  LOCATION_MAX_LENGTH: 200,
  COUNTRY_MAX_LENGTH: 100,
  STATE_MAX_LENGTH: 100,
};

// Échelle de crédibilité (0-15)
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

// Échelle d'étrangeté (0-10)
export const STRANGENESS_SCALE = {
  MIN: 0,
  MAX: 10,
  LEVELS: {
    ORDINARY: { min: 0, max: 2, label: "Ordinaire", color: "blue" },
    UNUSUAL: { min: 3, max: 4, label: "Inhabituel", color: "indigo" },
    STRANGE: { min: 5, max: 6, label: "Étrange", color: "purple" },
    VERY_STRANGE: { min: 7, max: 8, label: "Très étrange", color: "pink" },
    EXTRAORDINARY: { min: 9, max: 10, label: "Extraordinaire", color: "fuchsia" },
  },
};

// Sources de données
export const DATA_SOURCES = {
  USER: "user",
  HATCH: "hatch",
};
