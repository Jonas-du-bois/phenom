<template>
  <div class="app-shell">
    <header class="top-bar">
      <div class="brand" @click="$router.push('/home')">
        <span class="brand-dot" aria-hidden="true"></span>
        <span class="brand-name">Phenom Sight</span>
      </div>
      <div class="tag">PWA mobile-first</div>
    </header>

    <main class="app-shell__content">
      <RouterView />
    </main>

    <MobileNav />
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
import MobileNav from "../components/layout/MobileNav.vue";
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: var(--background);
  color: var(--foreground);
  padding-bottom: calc(76px + env(safe-area-inset-bottom));
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--border);
  background: color-mix(in srgb, var(--background) 80%, rgba(255, 255, 255, 0.16) 20%);
  backdrop-filter: blur(16px);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.brand-dot {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 50%, #6ea8ff 50%));
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12), 0 0 26px rgba(110, 168, 255, 0.28);
}

.tag {
  padding: 0.35rem 0.65rem;
  border-radius: var(--phenom-radius-full);
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--accent) 85%, rgba(0, 0, 0, 0.04) 15%);
  font-size: 0.85rem;
  color: var(--muted-foreground);
}

.app-shell__content {
  padding: 1rem 1rem 0.5rem;
  max-width: 720px;
  margin: 0 auto;
}
</style>
