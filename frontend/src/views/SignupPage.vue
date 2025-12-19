<template>
  <div
    class="signup-page min-h-screen bg-[#080A0E] flex items-center justify-center p-4"
  >
    <div class="w-full max-w-sm">
      <SignupForm :loading="loading" :error="error" @submit="handleSignup" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { SignupForm } from "@/components/organisms";
import { useAuthStore } from "@/stores/auth";

defineOptions({ name: "SignupPage" });

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref("");

const handleSignup = async (data) => {
  loading.value = true;
  error.value = "";

  try {
    await authStore.register(data);

    // Auto-login after registration or redirect to login
    router.push("/feed");
  } catch (err) {
    console.error("Signup error:", err);
    error.value = err.response?.data?.message || "Erreur lors de l'inscription";
  } finally {
    loading.value = false;
  }
};
</script>
