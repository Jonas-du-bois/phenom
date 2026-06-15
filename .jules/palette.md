## 2025-10-27 - [Nested Interactive Elements Accessibility]
**Learning:** When nesting interactive elements (like buttons) inside a clickable container (like a card with `@click` and `@keydown`), standard `click.stop` is insufficient for keyboard accessibility. The parent container's `@keydown.enter` listener will still catch the Enter key pressed on the child button unless `keydown.enter.stop` is also applied to the child. This causes duplicate actions or unexpected navigation.
**Action:** Always apply `@keydown.enter.stop` and `@keydown.space.stop` alongside `@click.stop` on interactive children within clickable parent containers.

## 2026-06-15 - [Explicit Focus Ring on Custom Buttons]
**Learning:** When building atomic custom UI components (like BaseButton, IconButton, BaseToggle) that override native button styles using Tailwind CSS, the default browser focus ring is often lost or overridden. This breaks keyboard navigation accessibility.
**Action:** Always include explicit `focus-visible` styling using Tailwind (e.g., `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent`) on any element that acts as a button.
