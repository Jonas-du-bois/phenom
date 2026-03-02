## 2024-05-22 - GlassTooltip Accessibility
**Learning:** Tooltips wrapping non-interactive elements (like badges) create accessibility traps. Using `tabindex="0"`, `role="button"`, and proper ARIA attributes (`aria-expanded`, `aria-controls` with `useId`) transforms them into accessible toggles.
**Action:** Always verify keyboard interaction for "hover-only" UI components and ensure they have a focusable trigger with proper semantics.

## 2024-05-23 - Atomic Interactive Elements Missing Focus Indicators
**Learning:** Atomic custom components like generic buttons (`BaseButton`, `IconButton`), badges with removal (`BaseBadge`), and toggles (`BaseToggle`) often forget to define clear keyboard focus states (`focus-visible`) when overriding native button appearances, leading to poor keyboard navigation accessibility.
**Action:** Always add explicit `focus-visible` styling (e.g. `focus-visible:ring-2`) to any element with `role="button"` or `type="button"` to ensure visual feedback during keyboard navigation.
