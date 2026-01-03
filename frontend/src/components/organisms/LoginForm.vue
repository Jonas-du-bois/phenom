<!-- ========================================================================
     LOGIN FORM - User authentication form with validation
     
     Features:
     - Email/password input fields with validation
     - Password visibility toggle
     - Remember me checkbox
     - Forgot password link
     - Server-side error handling and field mapping
     - Social login slot for OAuth providers
     - Signup redirect link
     
     Events:
     - submit: Emits validated form data { email, password, remember }
     ======================================================================== -->
<template>
  <form @submit.prevent="handleSubmit" class="login-form space-y-6">
    <!-- Logo and branding section -->
    <div class="text-center mb-8">
      <div class="flex items-center gap-2 justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="80"
          height="80"
          viewBox="0 0 174 174"
          fill="none"
          class="flex-shrink-0"
        >
          <path
            d="M115.576 86.6817H173.363"
            stroke="#00F0FF"
            stroke-width="1.4447"
          />
          <path
            d="M111.704 101.129L161.749 130.022"
            stroke="#00F0FF"
            stroke-width="1.4447"
          />
          <path
            d="M101.128 111.705L130.021 161.75"
            stroke="#00F0FF"
            stroke-width="1.4447"
          />
          <path
            d="M86.6816 115.576V173.362"
            stroke="#00F0FF"
            stroke-width="1.4447"
          />
          <path
            d="M72.2343 111.705L43.3408 161.75"
            stroke="#00F0FF"
            stroke-width="1.4447"
          />
          <path
            d="M61.6582 101.129L11.6133 130.022"
            stroke="#00F0FF"
            stroke-width="1.4447"
          />
          <path d="M57.7869 86.6817H0" stroke="#00F0FF" stroke-width="1.4447" />
          <path
            d="M61.6582 72.2343L11.6133 43.3408"
            stroke="#00F0FF"
            stroke-width="1.4447"
          />
          <path
            d="M72.2343 61.6582L43.3408 11.6132"
            stroke="#00F0FF"
            stroke-width="1.4447"
          />
          <path
            d="M86.6816 57.7869L86.6816 0"
            stroke="#00F0FF"
            stroke-width="1.4447"
          />
          <path
            d="M101.128 61.6583L130.021 11.6133"
            stroke="#00F0FF"
            stroke-width="1.4447"
          />
          <path
            d="M111.704 72.2344L161.749 43.3409"
            stroke="#00F0FF"
            stroke-width="1.4447"
          />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-white">Phenom Sight</h1>
      <p class="text-white/60 mt-2">Connectez vous pour continuer</p>
    </div>

    <!-- Error message -->
    <div
      v-if="error"
      class="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
    >
      {{ error }}
    </div>

    <!-- Email -->
    <TextInput
      v-model="form.email"
      type="email"
      label="Email"
      placeholder="votre@email.com"
      autocomplete="email"
      :error="errors.email"
      required
    >
      <template #leftIcon>
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </template>
    </TextInput>

    <!-- Password -->
    <TextInput
      v-model="form.password"
      :type="showPassword ? 'text' : 'password'"
      label="Mot de passe"
      placeholder="••••••••"
      autocomplete="current-password"
      :error="errors.password"
      required
    >
      <template #leftIcon>
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </template>
      <template #rightIcon>
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="text-white/40 hover:text-white/60"
        >
          <svg
            v-if="showPassword"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </svg>
          <svg
            v-else
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
      </template>
    </TextInput>

    <!-- Remember & Forgot -->
    <div class="flex items-center justify-between text-sm">
      <label class="flex items-center gap-2 cursor-pointer">
        <input
          v-model="form.remember"
          type="checkbox"
          class="w-4 h-4 rounded border-white/20 bg-transparent text-[#00F0FF] focus:ring-[#00F0FF]/30"
        />
        <span class="text-white/60">Se souvenir</span>
      </label>

      <router-link to="/forgot-password" class="text-[#00F0FF] hover:underline">
        Mot de passe oublié ?
      </router-link>
    </div>

    <!-- Submit -->
    <BaseButton
      type="submit"
      variant="primary"
      class="w-full"
      :loading="loading"
    >
      Se connecter
    </BaseButton>

    <!-- Divider -->
    <div class="relative py-4">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-white/10" />
      </div>
      <div class="relative flex justify-center">
        <span class="px-4 bg-[#080A0E] text-white/40 text-sm">ou</span>
      </div>
    </div>

    <!-- Social login (optional) -->
    <slot name="social" />

    <!-- Sign up link -->
    <p class="text-center text-white/60">
      Pas encore de compte ?
      <router-link
        to="/signup"
        class="text-[#00F0FF] font-medium hover:underline"
      >
        S'inscrire
      </router-link>
    </p>
  </form>
</template>

<script setup>
import { ref, reactive, watch, toRef } from "vue";
import { TextInput, BaseButton } from "@/components/atoms";

defineOptions({ name: "LoginForm" });

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  // Accept string or object (field errors)
  error: {
    type: [String, Object],
    default: "",
  },
});

// Expose a reactive `error` ref for template compatibility
const error = toRef(props, "error");

const emit = defineEmits(["submit"]);

const form = reactive({
  email: "",
  password: "",
  remember: false,
});

const errors = reactive({
  email: "",
  password: "",
});

const showPassword = ref(false);

const validate = () => {
  let isValid = true;
  errors.email = "";
  errors.password = "";

  if (!form.email) {
    errors.email = "L'email est requis";
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Email invalide";
    isValid = false;
  }

  if (!form.password) {
    errors.password = "Le mot de passe est requis";
    isValid = false;
  }

  return isValid;
};

// Map server-side error objects to field errors when provided via prop
watch(
  () => props.error,
  (newVal) => {
    if (!newVal) return;
    if (typeof newVal === "object") {
      if (newVal.email) errors.email = newVal.email;
      if (newVal.password) errors.password = newVal.password;
    }
  },
  { immediate: true }
);

const handleSubmit = () => {
  if (!validate()) return;
  emit("submit", { ...form });
};

defineExpose({ form, validate });
</script>
