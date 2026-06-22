## 2025-10-27 - [Nested Interactive Elements Accessibility]
**Learning:** When nesting interactive elements (like buttons) inside a clickable container (like a card with `@click` and `@keydown`), standard `click.stop` is insufficient for keyboard accessibility. The parent container's `@keydown.enter` listener will still catch the Enter key pressed on the child button unless `keydown.enter.stop` is also applied to the child. This causes duplicate actions or unexpected navigation.
**Action:** Always apply `@keydown.enter.stop` and `@keydown.space.stop` alongside `@click.stop` on interactive children within clickable parent containers.

## $(date +%Y-%m-%d) - Focus Visible Testing with Playwright
**Learning:** Programmatic `.focus()` calls in Playwright scripts do not trigger CSS `:focus-visible` pseudo-classes on buttons. This is a deliberate browser behavior to distinguish between script-triggered focus and natural keyboard navigation.
**Action:** When writing Playwright verification scripts specifically to test keyboard accessibility or `focus-visible` styles, simulate real user interaction by repeatedly using `page.keyboard.press("Tab")` to navigate through focusable elements.
