<template>
  <AppLayout :show-tab-bar="showTabBar">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- Bouton d'installation PWA -->
    <button
      v-if="showInstallButton"
      class="pwa-install-btn"
      @click="promptInstall"
      aria-label="Installer l'application"
    >
      Installer
    </button>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { AppLayout } from "./components/layout";
import { useAuthStore } from "./stores/auth";

const router = useRouter();
const authStore = useAuthStore();

// Masquer la navbar sur certaines routes
const showTabBar = computed(() => {
  const routePath = router.currentRoute.value.path;
  const hiddenRoutes = ["/login", "/signup", "/auth", "/camera", "/old-home"];
  return !hiddenRoutes.includes(routePath);
});

// Installer l'authentification au démarrage
onMounted(async () => {
  await authStore.initialize();
});

// Gestion du prompt d'installation PWA
const deferredPrompt = ref(null);
const showInstallButton = ref(false);

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
    showInstallButton.value = true;
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt.value = null;
    showInstallButton.value = false;
  });
});

async function promptInstall() {
  if (!deferredPrompt.value) return;
  try {
    deferredPrompt.value.prompt();
    const choiceResult = await deferredPrompt.value.userChoice;
    // Masquer le bouton après réponse
    showInstallButton.value = false;
    deferredPrompt.value = null;
    // Vous pouvez enregistrer analytics ici selon choiceResult.outcome
  } catch (err) {
    console.warn('Erreur pendant le prompt d\'installation PWA', err);
  }
}
</script>

<style scoped>
.pwa-install-btn {
  position: fixed;
  right: 16px;
  bottom: 88px;
  background: #ffffff;
  color: #000000;
  border: none;
  padding: 10px 14px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.2);
  font-weight: 600;
  cursor: pointer;
  z-index: 1200;
}
</style>
