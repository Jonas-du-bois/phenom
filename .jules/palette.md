## 2025-10-27 - [Nested Interactive Elements Accessibility]
**Learning:** When nesting interactive elements (like buttons) inside a clickable container (like a card with `@click` and `@keydown`), standard `click.stop` is insufficient for keyboard accessibility. The parent container's `@keydown.enter` listener will still catch the Enter key pressed on the child button unless `keydown.enter.stop` is also applied to the child. This causes duplicate actions or unexpected navigation.
**Action:** Always apply `@keydown.enter.stop` and `@keydown.space.stop` alongside `@click.stop` on interactive children within clickable parent containers.

## 2025-06-01 - [Atomic UI Component Keyboard Accessibility]
**Learning:** Atomic custom UI components (like BaseButton, IconButton, BaseToggle) that override native button styles or background colors often lose their default browser focus rings. Without explicit styles, users navigating via keyboard cannot see which element has focus.
**Action:** Always apply explicit `focus-visible` styling (e.g., `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent`) to interactive atomic components to ensure consistent keyboard navigation accessibility.
