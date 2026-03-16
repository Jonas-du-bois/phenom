## 2025-10-27 - [Nested Interactive Elements Accessibility]
**Learning:** When nesting interactive elements (like buttons) inside a clickable container (like a card with `@click` and `@keydown`), standard `click.stop` is insufficient for keyboard accessibility. The parent container's `@keydown.enter` listener will still catch the Enter key pressed on the child button unless `keydown.enter.stop` is also applied to the child. This causes duplicate actions or unexpected navigation.
**Action:** Always apply `@keydown.enter.stop` and `@keydown.space.stop` alongside `@click.stop` on interactive children within clickable parent containers.

## 2026-02-12 - [Custom UI Component Focus States]
**Learning:** Atomic custom UI components (e.g., BaseButton, IconButton, BaseToggle) that override native button styles may lose default browser focus outlines. This makes them inaccessible to keyboard users unless explicitly handled. Hardcoding ring-offset colors can lead to issues against varying backgrounds.
**Action:** Include explicit `focus-visible` styling using Tailwind (e.g., `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent`) on interactive elements to ensure keyboard navigation accessibility without hardcoding ring-offset colors.
