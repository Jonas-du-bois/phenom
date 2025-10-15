/**
 * Constantes de l'application
 */

// Types d'observations
export const OBSERVATION_TYPES = [
  'Formation',
  'Disc',
  'Sphere',
  'Triangle',
  'Cigar',
  'Light',
  'Unknown'
]

// Statuts admin
export const ADMIN_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

// Rôles utilisateurs
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
}

// Couleurs des badges selon type
export const TYPE_COLORS = {
  Formation: '#7B3FF2',
  Disc: '#3B82F6',
  Sphere: '#8B5CF6',
  Triangle: '#EC4899',
  Cigar: '#F59E0B',
  Light: '#10B981',
  Unknown: '#6B7280'
}

// Limites
export const LIMITS = {
  TITLE_MIN_LENGTH: 5,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MIN_LENGTH: 20,
  DESCRIPTION_MAX_LENGTH: 2000,
  MAX_IMAGES: 5,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_TAGS: 10
}
