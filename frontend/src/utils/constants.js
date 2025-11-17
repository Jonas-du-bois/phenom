/**
 * Constantes de l'application
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
  TITLE_MIN_LENGTH: 5,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MIN_LENGTH: 20,
  DESCRIPTION_MAX_LENGTH: 2000,
  MAX_IMAGES: 5,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_TAGS: 10,
};
