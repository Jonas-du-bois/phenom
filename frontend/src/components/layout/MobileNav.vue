<template>
  <nav class="mobile-nav" aria-label="Navigation principale">
    <RouterLink to="/home" class="nav-item" active-class="active">
      <span aria-hidden="true">🏠</span>
      <span class="label">Home</span>
    </RouterLink>
    <RouterLink to="/feed" class="nav-item" active-class="active">
      <span aria-hidden="true">📰</span>
      <span class="label">Flux</span>
    </RouterLink>
    <RouterLink to="/map" class="nav-item" active-class="active">
      <span aria-hidden="true">🗺️</span>
      <span class="label">Carte</span>
    </RouterLink>
    <RouterLink to="/create" class="nav-item" active-class="active">
      <span aria-hidden="true">➕</span>
      <span class="label">Créer</span>
    </RouterLink>
    <RouterLink to="/profile" class="nav-item" active-class="active">
      <span aria-hidden="true">👤</span>
      <span class="label">Profil</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { RouterLink } from "vue-router";
</script>

<style scoped>
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.25rem;
  padding: 0.5rem 0.65rem calc(0.5rem + env(safe-area-inset-bottom));
  background: color-mix(in srgb, var(--card) 72%, rgba(255, 255, 255, 0.2) 28%);
  backdrop-filter: blur(18px);
  border-top: 1px solid var(--border);
  box-shadow: 0 -10px 28px rgba(0, 0, 0, 0.08);
  z-index: 20;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.4rem 0.25rem;
  border-radius: var(--phenom-radius-md);
  color: var(--muted-foreground);
  font-size: 0.85rem;
  border: 1px solid transparent;
  transition: border-color 120ms ease, background 120ms ease, color 120ms ease;
}

.nav-item.active {
  color: var(--foreground);
  border-color: var(--border);
  background: color-mix(in srgb, var(--accent) 80%, rgba(0, 0, 0, 0.04) 20%);
}

.label {
  font-size: 0.72rem;
}
</style>
