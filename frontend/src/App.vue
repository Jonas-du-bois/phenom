<template>
  <AppLayout :show-tab-bar="showTabBar">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
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


</script>

<style scoped>

</style>
