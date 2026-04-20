## 2025-10-27 - [Nested Interactive Elements Accessibility]
**Learning:** When nesting interactive elements (like buttons) inside a clickable container (like a card with `@click` and `@keydown`), standard `click.stop` is insufficient for keyboard accessibility. The parent container's `@keydown.enter` listener will still catch the Enter key pressed on the child button unless `keydown.enter.stop` is also applied to the child. This causes duplicate actions or unexpected navigation.
**Action:** Always apply `@keydown.enter.stop` and `@keydown.space.stop` alongside `@click.stop` on interactive children within clickable parent containers.

## 2025-04-20 - [Focus Visible Styles for Keyboard Navigation]
**Learning:** Atomic custom UI components (`BaseButton`, `IconButton`, `BaseToggle`) overriding native styles lacked explicit focus styles (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent`), making them difficult to locate when using keyboard navigation.
**Action:** Consistently apply `focus-visible` styling using Tailwind on all interactive elements across the design system to ensure accessible keyboard navigation.
