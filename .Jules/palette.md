## 2024-05-22 - GlassTooltip Accessibility
**Learning:** Tooltips wrapping non-interactive elements (like badges) create accessibility traps. Using `tabindex="0"`, `role="button"`, and proper ARIA attributes (`aria-expanded`, `aria-controls` with `useId`) transforms them into accessible toggles.
**Action:** Always verify keyboard interaction for "hover-only" UI components and ensure they have a focusable trigger with proper semantics.

## 2025-10-18 - Accessible Form IDs
**Learning:** Form components like Select and TextArea often miss `for`/`id` associations, breaking screen reader support. Vue 3.5's `useId()` provides a robust, zero-config way to generate unique IDs for these associations.
**Action:** Always implement `useId()` in form primitives to ensure semantic `label-input` binding and `aria-describedby` support without requiring manual ID props.
