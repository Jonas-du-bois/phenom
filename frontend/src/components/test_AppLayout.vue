<template>
  <div class="app-layout">
    <!-- Header (mobile + desktop) -->
    <header class="app-header">
      <div class="header-content">
        <!-- Logo -->
        <router-link to="/feed" class="logo">
          <span class="logo-icon">🛸</span>
          <span class="logo-text">Phenom</span>
        </router-link>

        <!-- Search (desktop) -->
        <div class="header-search desktop-only">
          <input
            type="search"
            placeholder="Rechercher une observation..."
            class="search-input"
            v-model="searchQuery"
            @keyup.enter="handleSearch"
          />
          <svg
            class="search-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <!-- User menu -->
        <div class="header-actions">
          <button class="btn-icon" @click="showNotifications = true">
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span v-if="notificationCount" class="badge">{{
              notificationCount
            }}</span>
          </button>

          <test-BaseAvatar
            :src="user?.avatar"
            :name="user?.name"
            size="md"
            :status="user?.status"
            class="cursor-pointer"
            @click="navigateTo('/profile')"
          />
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="app-main">
      <!-- Sidebar (desktop only) -->
      <aside class="app-sidebar desktop-only">
        <nav class="sidebar-nav">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ 'nav-item-active': isActive(item.path) }"
          >
            <component :is="item.icon" class="nav-icon" />
            <span class="nav-label">{{ item.label }}</span>
          </router-link>
        </nav>

        <!-- Create button (sidebar) -->
        <button class="btn-create" @click="navigateTo('/create')">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Nouvelle observation</span>
        </button>
      </aside>

      <!-- Page content -->
      <div class="app-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- Bottom navigation (mobile only) -->
    <nav class="bottom-nav mobile-only">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="bottom-nav-item"
        :class="{ 'bottom-nav-item-active': isActive(item.path) }"
      >
        <component :is="item.icon" class="bottom-nav-icon" />
        <span class="bottom-nav-label">{{ item.label }}</span>
      </router-link>

      <!-- Floating create button (mobile) -->
      <button class="fab" @click="navigateTo('/create')">
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, h } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "../composables/useAuth";
import TestBaseAvatar from "./test_BaseAvatar.vue";

const router = useRouter();
const route = useRoute();
const { user } = useAuth();

const searchQuery = ref("");
const showNotifications = ref(false);
const notificationCount = ref(3);

// Navigation items
const navItems = [
  {
    path: "/feed",
    label: "Feed",
    icon: () =>
      h(
        "svg",
        {
          class: "w-6 h-6",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "stroke-width": "2",
            d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
          }),
        ],
      ),
  },
  {
    path: "/map",
    label: "Carte",
    icon: () =>
      h(
        "svg",
        {
          class: "w-6 h-6",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "stroke-width": "2",
            d: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
          }),
        ],
      ),
  },
  {
    path: "/profile",
    label: "Profil",
    icon: () =>
      h(
        "svg",
        {
          class: "w-6 h-6",
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "stroke-width": "2",
            d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
          }),
        ],
      ),
  },
];

const isActive = (path) => {
  return route.path.startsWith(path);
};

const navigateTo = (path) => {
  router.push(path);
};

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: "/feed", query: { q: searchQuery.value } });
  }
};
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
}

/* Header */
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(30, 38, 64, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.25rem;
  color: #667eea;
}

.logo-icon {
  font-size: 1.75rem;
}

.logo-text {
  display: none;
}

.header-search {
  flex: 1;
  max-width: 600px;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 9999px;
  font-size: 0.9375rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

.btn-icon {
  position: relative;
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f3f4f6;
  color: #111827;
}

.badge {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  font-weight: 600;
  min-width: 1.25rem;
  text-align: center;
}

/* Main */
.app-main {
  flex: 1;
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* Sidebar (desktop) */
.app-sidebar {
  width: 240px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(30, 38, 64, 0.5);
  backdrop-filter: blur(10px);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.nav-item-active {
  background: #7B3FF2;
  color: white;
  box-shadow: 0 4px 12px rgba(123, 63, 242, 0.4);
}

.nav-icon {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
}

.nav-label {
  font-size: 0.9375rem;
}

.btn-create {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  background: #7B3FF2;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 8px 24px rgba(123, 63, 242, 0.4);
}

.btn-create:hover {
  transform: translateY(-2px);
  background: #6B2FD1;
  box-shadow: 0 12px 32px rgba(123, 63, 242, 0.6);
}

/* Content */
.app-content {
  flex: 1;
  overflow-y: auto;
}

/* Bottom navigation (mobile) */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(30, 38, 64, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-around;
  padding: 0.5rem 0.5rem calc(0.5rem + env(safe-area-inset-bottom));
  z-index: 100;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.2);
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 60px;
}

.bottom-nav-item-active {
  color: #7B3FF2;
}

.bottom-nav-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.bottom-nav-label {
  font-size: 0.6875rem;
}

/* FAB (mobile) */
.fab {
  position: fixed;
  bottom: calc(4.5rem + env(safe-area-inset-bottom));
  right: 1rem;
  width: 3.5rem;
  height: 3.5rem;
  background: #7B3FF2;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(123, 63, 242, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 99;
}

.fab:hover {
  background: #6B2FD1;
  box-shadow: 0 12px 32px rgba(123, 63, 242, 0.7);
}

.fab:active {
  transform: scale(0.95);
}

/* Responsive */
.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

@media (min-width: 768px) {
  .logo-text {
    display: inline;
  }

  .header-content {
    padding: 1rem 1.5rem;
  }
}

@media (max-width: 1024px) {
  .app-sidebar {
    display: none;
  }

  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: flex;
  }

  .app-content {
    padding-bottom: calc(4rem + env(safe-area-inset-bottom));
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
