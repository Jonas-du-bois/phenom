<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Logo & Title -->
      <div class="auth-header">
        <span class="auth-logo">🛸</span>
        <h1 class="auth-title">Phenom</h1>
        <p class="auth-subtitle">
          Partagez vos observations de phénomènes inexpliqués
        </p>
      </div>

      <!-- Tabs -->
      <div class="auth-tabs">
        <button
          :class="['tab', { 'tab-active': mode === 'login' }]"
          @click="mode = 'login'"
        >
          Connexion
        </button>
        <button
          :class="['tab', { 'tab-active': mode === 'register' }]"
          @click="mode = 'register'"
        >
          Inscription
        </button>
      </div>

      <!-- Login Form -->
      <form
        v-if="mode === 'login'"
        @submit.prevent="handleLogin"
        class="auth-form"
      >
        <test-BaseInput
          v-model="loginForm.email"
          type="email"
          label="Email"
          placeholder="votre@email.com"
          required
          autocomplete="email"
          :error="errors.email"
        >
          <template #icon>
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          </template>
        </test-BaseInput>

        <test-BaseInput
          v-model="loginForm.password"
          type="password"
          label="Mot de passe"
          placeholder="••••••••"
          required
          autocomplete="current-password"
          :error="errors.password"
        >
          <template #icon>
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </template>
        </test-BaseInput>

        <test-BaseButton type="submit" :loading="loading" full-width>
          Se connecter
        </test-BaseButton>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>

      <!-- Register Form -->
      <form v-else @submit.prevent="handleRegister" class="auth-form">
        <test-BaseInput
          v-model="registerForm.name"
          type="text"
          label="Nom complet"
          placeholder="John Doe"
          required
          autocomplete="name"
          :error="errors.name"
        >
          <template #icon>
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </template>
        </test-BaseInput>

        <test-BaseInput
          v-model="registerForm.email"
          type="email"
          label="Email"
          placeholder="votre@email.com"
          required
          autocomplete="email"
          :error="errors.email"
        >
          <template #icon>
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          </template>
        </test-BaseInput>

        <test-BaseInput
          v-model="registerForm.password"
          type="password"
          label="Mot de passe"
          placeholder="••••••••"
          required
          autocomplete="new-password"
          helper="Minimum 6 caractères"
          :error="errors.password"
        >
          <template #icon>
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </template>
        </test-BaseInput>

        <test-BaseButton type="submit" :loading="loading" full-width>
          S'inscrire
        </test-BaseButton>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";
import BaseInput from "../components/BaseInput.vue";
import BaseButton from "../components/BaseButton.vue";

const router = useRouter();
const { login, register, loading, error: authError } = useAuth();

const mode = ref("login");
const error = ref(null);
const errors = reactive({});

const loginForm = reactive({
  email: "",
  password: "",
});

const registerForm = reactive({
  name: "",
  email: "",
  password: "",
});

const handleLogin = async () => {
  errors.value = {};
  error.value = null;

  const success = await login(loginForm.email, loginForm.password);
  if (success) {
    router.push("/feed");
  } else {
    error.value = authError.value;
  }
};

const handleRegister = async () => {
  errors.value = {};
  error.value = null;

  if (registerForm.password.length < 6) {
    errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    return;
  }

  const success = await register(
    registerForm.name,
    registerForm.email,
    registerForm.password,
  );
  if (success) {
    router.push("/feed");
  } else {
    error.value = authError.value;
  }
};
</script>

<style scoped>

</style>
