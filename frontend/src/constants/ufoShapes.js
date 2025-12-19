/**
 * Formes d'OVNI - Compatible Phenom Search API
 */
export const UFO_SHAPES = [
  { code: "SCR", label: "Soucoupe/Disque", icon: "🛸", color: "#7B3FF2" },
  { code: "CIG", label: "Cigare/Cylindre", icon: "🚀", color: "#3B82F6" },
  { code: "DLT", label: "Delta/Triangle", icon: "🔺", color: "#10B981" },
  { code: "NLT", label: "Lumières nocturnes", icon: "✨", color: "#FBBF24" },
  { code: "FBL", label: "Boule de feu", icon: "🔥", color: "#EF4444" },
  { code: "FIG", label: "Figure/Entité", icon: "👽", color: "#8B5CF6" },
  { code: "PRB", label: "Sonde", icon: "📡", color: "#06B6D4" },
  { code: "NFO", label: "Aucun engin", icon: "❓", color: "#6B7280" },
];

const UFO_SHAPES_MAP = Object.fromEntries(UFO_SHAPES.map((s) => [s.code, s]));
const DEFAULT_COLOR = "#6B7280";

export const UFO_SHAPE_CODES = UFO_SHAPES.map((s) => s.code);
export const getUfoShapeByCode = (code) => UFO_SHAPES_MAP[code] || null;
export const getUfoShapeLabel = (code) => UFO_SHAPES_MAP[code]?.label || code;
export const getUfoShapeColor = (code) =>
  UFO_SHAPES_MAP[code]?.color || DEFAULT_COLOR;

export default UFO_SHAPES;
