<template>
  <div
    class="login-page min-h-screen bg-[#080A0E] flex items-center justify-center p-4"
  >
    <div class="w-full max-w-sm">
      <LoginForm :loading="loading" :error="error" @submit="handleLogin" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { LoginForm } from "@/components/organisms";
import { useAuthStore } from "@/stores/auth";

defineOptions({ name: "LoginPage" });

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref("");

const handleLogin = async (credentials) => {
  loading.value = true;
  error.value = "";

  try {
    await authStore.login(credentials);

    // Redirect to intended page or feed
    const redirect = route.query.redirect || "/feed";
    router.push(redirect);
  } catch (err) {
    console.error("Login error:", err);
    error.value =
      err.response?.data?.message || "Email ou mot de passe incorrect";
  } finally {
    loading.value = false;
  }
};
</script>
