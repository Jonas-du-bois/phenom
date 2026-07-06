## 2024-05-22 - GlassTooltip Accessibility
**Learning:** Tooltips wrapping non-interactive elements (like badges) create accessibility traps. Using `tabindex="0"`, `role="button"`, and proper ARIA attributes (`aria-expanded`, `aria-controls` with `useId`) transforms them into accessible toggles.
**Action:** Always verify keyboard interaction for "hover-only" UI components and ensure they have a focusable trigger with proper semantics.

## 2024-05-24 - Interactive Atoms Missing Keyboard Focus Indicators
**Learning:** Atomic custom UI components overriding native button styles (like BaseButton, IconButton, and BaseToggle) often lose native focus indicators, making keyboard navigation difficult. Standard `focus:` classes trigger on mouse clicks too, which looks messy.
**Action:** Use `focus-visible:` Tailwind prefix explicitly on these interactive elements. Specifically apply `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent` to ensure clear, brand-aligned keyboard accessibility without compromising mouse interaction.
