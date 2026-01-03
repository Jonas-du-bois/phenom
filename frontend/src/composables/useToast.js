/**
 * useToast Composable
 *
 * Global toast notification system with animations.
 * Supports success, error, warning, and info types.
 *
 * @module composables/useToast
 */
import { ref, readonly } from "vue";

// Global state shared between all instances
const toasts = ref([]);
let toastId = 0;

export function useToast() {
  /**
   * Display a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type: success, error, warning, info
   * @param {number} duration - Duration in ms (0 = permanent)
   * @returns {number} Toast ID
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
   * Dismiss a toast by ID
   * @param {number} id - Toast ID to dismiss
   */
  const dismiss = (id) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      toasts.value[index].visible = false;
      // Remove after animation completes
      setTimeout(() => {
        toasts.value = toasts.value.filter((t) => t.id !== id);
      }, 300);
    }
  };

  /**
   * Dismiss all toasts
   */
  const dismissAll = () => {
    toasts.value.forEach((t) => (t.visible = false));
    setTimeout(() => {
      toasts.value = [];
    }, 300);
  };

  // Type shortcuts
  const success = (message, duration) => show(message, "success", duration);
  const error = (message, duration) => show(message, "error", duration ?? 6000);
  const warning = (message, duration) => show(message, "warning", duration);
  const info = (message, duration) => show(message, "info", duration);

  /**
   * Promise-based toast (loading → success/error)
   * @param {Function} promiseFn - Async function to execute
   * @param {Object} messages - { loading, success, error } messages (French defaults)
   * @returns {Promise} Result of promiseFn
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
