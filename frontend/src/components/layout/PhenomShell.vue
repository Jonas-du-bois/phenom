<template>
  <div class="phenom-shell">
    <header class="top-bar">
      <div class="top-bar__brand">
        <div class="brand-mark" aria-hidden="true"></div>
        <span class="brand-name">Phenom Sight</span>
      </div>
      <div class="top-bar__actions">
        <slot name="actions" />
      </div>
    </header>

    <main class="content">
      <section class="hero">
        <slot name="hero" />
      </section>

      <section class="body">
        <slot />
      </section>
    </main>
  </div>
</template>

<script setup>
// Layout wrapper matching the React prototype aesthetics. Slots give flexibility
// for hero and main content while keeping the base chrome consistent.
</script>

<style scoped>
.phenom-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at 20% 20%, rgba(3, 2, 19, 0.06), transparent 35%),
    radial-gradient(circle at 80% 0%, rgba(116, 125, 255, 0.08), transparent 30%),
    var(--background);
  color: var(--foreground);
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  backdrop-filter: blur(14px);
  background: color-mix(in srgb, var(--background) 80%, rgba(255, 255, 255, 0.08) 20%);
  border-bottom: 1px solid var(--border);
}

.top-bar__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.brand-mark {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 65%, #6ea8ff 35%));
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12), 0 0 32px rgba(110, 168, 255, 0.32);
}

.brand-name {
  font-size: 1.05rem;
}

.top-bar__actions {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}


.content {
  max-width: 720px;
  margin: 0 auto;
  padding: 1rem 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}


.hero {
  padding: 1rem;
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--card) 88%, rgba(255, 255, 255, 0.08) 12%);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
}

.body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
