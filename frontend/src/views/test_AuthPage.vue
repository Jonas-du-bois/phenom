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
import TestBaseInput from "../components/test_BaseInput.vue";
import TestBaseButton from "../components/test_BaseButton.vue";

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
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-container {
  width: 100%;
  max-width: 440px;
  background: white;
  border-radius: 1.5rem;
  padding: 2.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-logo {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 0.5rem;
}

.auth-subtitle {
  color: #6b7280;
  font-size: 0.9375rem;
  margin: 0;
}

.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: #f3f4f6;
  padding: 0.25rem;
  border-radius: 0.75rem;
}

.tab {
  padding: 0.75rem;
  border: none;
  background: transparent;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.tab-active {
  background: white;
  color: #667eea;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
  margin: 0;
  padding: 0.75rem;
  background: #fee2e2;
  border-radius: 0.5rem;
}

@media (max-width: 640px) {
  .auth-container {
    padding: 2rem 1.5rem;
  }

  .auth-logo {
    font-size: 3rem;
  }

  .auth-title {
    font-size: 1.75rem;
  }
}
</style>
