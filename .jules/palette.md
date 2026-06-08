## 2025-10-27 - [Nested Interactive Elements Accessibility]
**Learning:** When nesting interactive elements (like buttons) inside a clickable container (like a card with `@click` and `@keydown`), standard `click.stop` is insufficient for keyboard accessibility. The parent container's `@keydown.enter` listener will still catch the Enter key pressed on the child button unless `keydown.enter.stop` is also applied to the child. This causes duplicate actions or unexpected navigation.
**Action:** Always apply `@keydown.enter.stop` and `@keydown.space.stop` alongside `@click.stop` on interactive children within clickable parent containers.

## 2025-10-27 - [Custom Button Components Focus Indicators]
**Learning:** When creating custom atomic UI components (e.g., BaseButton, IconButton, BaseToggle) that override native button styles or act as custom controls, relying on browser default focus indicators is insufficient because the custom styling often obscures them. Explicit `focus-visible` styling is required to ensure keyboard navigation accessibility.
**Action:** Always include explicit `focus-visible` utility classes (e.g., `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent`) on custom button and interactive components.
