/**
 * Composable pour détecter la direction du scroll
 * Utilisé pour hide/show la bottom nav
 */
import { ref, onMounted, onUnmounted } from "vue";

export function useScrollDirection() {
  const scrollDirection = ref("up");
  const lastScrollY = ref(0);

  // Logique de détection du scroll

  return {
    scrollDirection,
  };
}
