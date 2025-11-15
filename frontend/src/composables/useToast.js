/**
 * Composable pour les notifications toast
 */
import { ref } from "vue";

export function useToast() {
  const toasts = ref([]);

  const show = (message, type = "info", duration = 3000) => {
    // Logique d'affichage toast
  };

  const success = (message) => show(message, "success");
  const error = (message) => show(message, "error");
  const warning = (message) => show(message, "warning");
  const info = (message) => show(message, "info");

  return {
    toasts,
    show,
    success,
    error,
    warning,
    info,
  };
}
