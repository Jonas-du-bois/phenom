## 2024-05-22 - GlassTooltip Accessibility
**Learning:** Tooltips wrapping non-interactive elements (like badges) create accessibility traps. Using `tabindex="0"`, `role="button"`, and proper ARIA attributes (`aria-expanded`, `aria-controls` with `useId`) transforms them into accessible toggles.
**Action:** Always verify keyboard interaction for "hover-only" UI components and ensure they have a focusable trigger with proper semantics.
