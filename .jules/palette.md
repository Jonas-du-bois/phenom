## 2025-10-27 - [Nested Interactive Elements Accessibility]
**Learning:** When nesting interactive elements (like buttons) inside a clickable container (like a card with `@click` and `@keydown`), standard `click.stop` is insufficient for keyboard accessibility. The parent container's `@keydown.enter` listener will still catch the Enter key pressed on the child button unless `keydown.enter.stop` is also applied to the child. This causes duplicate actions or unexpected navigation.
**Action:** Always apply `@keydown.enter.stop` and `@keydown.space.stop` alongside `@click.stop` on interactive children within clickable parent containers.

## 2024-05-24 - Missing Focus Outlines on Custom Buttons
**Learning:** Atomic custom UI components (e.g., BaseButton, IconButton, BaseToggle) that override native button styles completely lose their default browser focus rings. Without explicit styles, keyboard users have zero indication of which element has focus, breaking accessibility and navigation.
**Action:** Always include explicit `focus-visible` styling using Tailwind (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent`) for any custom button or interactive element to ensure keyboard navigation accessibility.
