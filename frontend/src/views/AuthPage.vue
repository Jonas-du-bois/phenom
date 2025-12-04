<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-violet-900 to-gray-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo / Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">
          🛸 Phenom
        </h1>
        <p class="text-gray-400">
          Observatoire de phénomènes inexpliqués
        </p>
      </div>

      <!-- Auth Card -->
      <div class="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
        <!-- Tabs -->
        <div class="flex mb-6 bg-gray-700/30 rounded-lg p-1">
          <button
            @click="activeTab = 'login'"
            :class="[
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
              activeTab === 'login'
                ? 'bg-violet-600 text-white'
                : 'text-gray-400 hover:text-white'
            ]"
          >
            Connexion
          </button>
          <button
            @click="activeTab = 'register'"
            :class="[
              'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all',
              activeTab === 'register'
                ? 'bg-violet-600 text-white'
                : 'text-gray-400 hover:text-white'
            ]"
          >
            Inscription
          </button>
        </div>

        <!-- Error Message -->
        <div
          v-if="error"
          class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
        >
          {{ error }}
        </div>

        <!-- Success Message -->
        <div
          v-if="success"
          class="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm"
        >
          {{ success }}
        </div>

        <!-- Login Form -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm text-gray-400 mb-1">Email</label>
            <input
              v-model="loginForm.email"
              type="email"
              required
              placeholder="votre@email.com"
              class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Mot de passe</label>
            <input
              v-model="loginForm.password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            <span v-if="loading">Connexion en cours...</span>
            <span v-else>Se connecter</span>
          </button>
        </form>

        <!-- Register Form -->
        <form v-if="activeTab === 'register'" @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm text-gray-400 mb-1">Nom d'utilisateur</label>
            <input
              v-model="registerForm.username"
              type="text"
              required
              minlength="3"
              maxlength="30"
              placeholder="votre_pseudo"
              class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Email</label>
            <input
              v-model="registerForm.email"
              type="email"
              required
              placeholder="votre@email.com"
              class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Mot de passe</label>
            <input
              v-model="registerForm.password"
              type="password"
              required
              minlength="8"
              placeholder="Min. 8 caractères"
              class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
            />
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Confirmer le mot de passe</label>
            <input
              v-model="registerForm.confirmPassword"
              type="password"
              required
              placeholder="Répétez le mot de passe"
              class="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            <span v-if="loading">Inscription en cours...</span>
            <span v-else>S'inscrire</span>
          </button>
        </form>

        <!-- Skip to Old Home (for testing) -->
        <div class="mt-6 pt-6 border-t border-gray-700">
          <router-link
            to="/old-home"
            class="block w-full py-2 text-center text-gray-400 hover:text-white text-sm transition-colors"
          >
            🔧 Accéder à la page de test API →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { authService } from "../services/authService";

const router = useRouter();

const activeTab = ref("login");
const loading = ref(false);
const error = ref("");
const success = ref("");

const loginForm = ref({
  email: "",
  password: "",
});

const registerForm = ref({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});

async function handleLogin() {
  error.value = "";
  loading.value = true;

  try {
    await authService.login({ email: loginForm.value.email, password: loginForm.value.password });
    router.push("/");
  } catch (err) {
    error.value = err.response?.data?.message || err.message || "Erreur de connexion";
  } finally {
    loading.value = false;
  }
}

async function handleRegister() {
  error.value = "";
  success.value = "";
  loading.value = true;

  // Validate passwords match
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    error.value = "Les mots de passe ne correspondent pas";
    loading.value = false;
    return;
  }

  try {
    await authService.register({
      username: registerForm.value.username,
      email: registerForm.value.email,
      password: registerForm.value.password
    });
    success.value = "Inscription réussie ! Vous pouvez maintenant vous connecter.";
    activeTab.value = "login";
    loginForm.value.email = registerForm.value.email;
    registerForm.value = { username: "", email: "", password: "", confirmPassword: "" };
  } catch (err) {
    error.value = err.response?.data?.message || err.message || "Erreur d'inscription";
  } finally {
    loading.value = false;
  }
}
</script>
