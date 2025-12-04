/**
 * Export centralisé de tous les composables
 * Permet d'importer facilement: import { useSightings, useFilters } from '@/composables'
 */

export { useCamera } from "./useCamera";
export { useComments } from "./useComments";
export { useErrorHandler } from "./useErrorHandler";
export { useFilters } from "./useFilters";
export { useGeolocation } from "./useGeolocation";
export { useImageUpload } from "./useImageUpload";
export { useModal } from "./useModal";
export { useObservations } from "./useObservations"; // Legacy - use useSightings instead
export { useScrollDirection } from "./useScrollDirection";
export { useSightings } from "./useSightings";
export { useTags } from "./useTags";
export { useToast } from "./useToast";
export { useWebSocket } from "./useWebSocket";
