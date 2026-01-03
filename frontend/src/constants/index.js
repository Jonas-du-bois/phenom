/**
 * Constants Index - Centralized Constants Export
 *
 * This file serves as a barrel export for all application constants.
 * Import constants from this file for cleaner imports.
 *
 * @module constants
 *
 * @example
 * // Instead of:
 * import { OBSERVATION_TYPES } from '@/constants/observationTypes';
 * // Use:
 * import { OBSERVATION_TYPES } from '@/constants';
 */

// ============================================================================
// OBSERVATION TYPES
// ============================================================================
// UFO/phenomenon observation type codes and utilities

export {
  OBSERVATION_TYPES,
  OBSERVATION_TYPE_OPTIONS,
  getObservationLabel,
  getObservationDescription,
  getObservationColor,
  isValidObservationType,
} from "./observationTypes";
