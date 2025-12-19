/**
 * Composable pour les notifications toast
 * Système de notifications globales avec animations
 */
import { ref, readonly } from "vue";

// État global partagé entre toutes les instances
const toasts = ref([]);
let toastId = 0;

export function useToast() {
  /**
   * Affiche un toast
   * @param {string} message - Message à afficher
   * @param {string} type - Type: success, error, warning, info
   * @param {number} duration - Durée en ms (0 = permanent)
   */
  const show = (message, type = "info", duration = 4000) => {
    const id = ++toastId;

    const toast = {
      id,
      message,
      type,
      visible: true,
      createdAt: Date.now(),
    };

    toasts.value.push(toast);

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }

    return id;
  };

  /**
   * Ferme un toast
   */
  const dismiss = (id) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value[index].visible = false;
      // Retirer après l'animation
      setTimeout(() => {
        toasts.value = toasts.value.filter((t) => t.id !== id);
      }, 300);
    }
  };

  /**
   * Ferme tous les toasts
   */
  const dismissAll = () => {
    toasts.value.forEach((t) => (t.visible = false));
    setTimeout(() => {
      toasts.value = [];
    }, 300);
  };

  // Raccourcis par type
  const success = (message, duration) => show(message, "success", duration);
  const error = (message, duration) => show(message, "error", duration ?? 6000);
  const warning = (message, duration) => show(message, "warning", duration);
  const info = (message, duration) => show(message, "info", duration);

  /**
   * Toast de promesse (loading → success/error)
   */
  const promise = async (promiseFn, messages = {}) => {
    const {
      loading = "Chargement...",
      success: successMsg = "Succès !",
      error: errorMsg = "Erreur",
    } = messages;

    const id = show(loading, "info", 0);

    try {
      const result = await promiseFn();
      dismiss(id);
      success(successMsg);
      return result;
    } catch (err) {
      dismiss(id);
      error(typeof errorMsg === "function" ? errorMsg(err) : errorMsg);
      throw err;
    }
  };

  return {
    toasts: readonly(toasts),
    show,
    dismiss,
    dismissAll,
    success,
    error,
    warning,
    info,
    promise,
  };
}
