/**
 * UFO Shapes - Compatible with Phenom Search API
 *
 * Defines the visual shapes/forms of unidentified flying objects.
 * Each shape has a 3-letter code, French label, emoji icon, and associated color.
 *
 * @module constants/ufoShapes
 *
 * Shape Categories:
 * - SCR: Saucer/disc - Classic flying saucer shape
 * - CIG: Cigar/cylinder - Elongated cylindrical shape
 * - DLT: Delta/triangle - Triangular craft
 * - NLT: Night lights - Lights seen at night (no clear shape)
 * - FBL: Fireball - Ball of fire or plasma
 * - FIG: Figure/entity - Humanoid or entity sighting
 * - PRB: Probe - Small unmanned probe/drone
 * - NFO: No craft - Phenomenon without visible craft
 */

// ============================================================================
// UFO SHAPES DEFINITION
// ============================================================================

export const UFO_SHAPES = [
  { code: "SCR", label: "Soucoupe/Disque", icon: "🛸", color: "#7B3FF2" }, // Saucer/Disc (purple)
  { code: "CIG", label: "Cigare/Cylindre", icon: "🚀", color: "#3B82F6" }, // Cigar/Cylinder (blue)
  { code: "DLT", label: "Delta/Triangle", icon: "🔺", color: "#10B981" }, // Delta/Triangle (green)
  { code: "NLT", label: "Lumières nocturnes", icon: "✨", color: "#FBBF24" }, // Night lights (yellow)
  { code: "FBL", label: "Boule de feu", icon: "🔥", color: "#EF4444" }, // Fireball (red)
  { code: "FIG", label: "Figure/Entité", icon: "👽", color: "#8B5CF6" }, // Figure/Entity (violet)
  { code: "PRB", label: "Sonde", icon: "📡", color: "#06B6D4" }, // Probe (cyan)
  { code: "NFO", label: "Aucun engin", icon: "❓", color: "#6B7280" }, // No craft visible (gray)
];

// ============================================================================
// LOOKUP MAP AND UTILITIES
// ============================================================================

// Hash map for O(1) lookup by code
const UFO_SHAPES_MAP = Object.fromEntries(UFO_SHAPES.map((s) => [s.code, s]));

// Default color for unknown shapes
const DEFAULT_COLOR = "#6B7280";

/** Array of all UFO shape codes */
export const UFO_SHAPE_CODES = UFO_SHAPES.map((s) => s.code);

/**
 * Get full UFO shape object by code
 * @param {string} code - 3-letter shape code
 * @returns {Object|null} Shape object or null if not found
 */
export const getUfoShapeByCode = (code) => UFO_SHAPES_MAP[code] || null;

/**
 * Get UFO shape label by code
 * @param {string} code - 3-letter shape code
 * @returns {string} French label or the code itself if not found
 */
export const getUfoShapeLabel = (code) => UFO_SHAPES_MAP[code]?.label || code;

/**
 * Get UFO shape color by code
 * @param {string} code - 3-letter shape code
 * @returns {string} Hex color code (defaults to gray)
 */
export const getUfoShapeColor = (code) =>
  UFO_SHAPES_MAP[code]?.color || DEFAULT_COLOR;

export default UFO_SHAPES;
