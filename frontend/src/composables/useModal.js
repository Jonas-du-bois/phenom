/**
 * useModal Composable
 *
 * Simple modal open/close state management.
 *
 * @module composables/useModal
 */
import { ref } from "vue";

export function useModal() {
  const isOpen = ref(false);

  const open = () => {
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
  };

  const toggle = () => {
    isOpen.value = !isOpen.value;
  };

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
