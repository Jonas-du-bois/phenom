<!-- ========================================================================
     SIGNUP FORM - User registration form with validation
     
     Features:
     - Username, email, password fields with validation
     - Password strength indicator (4 levels)
     - Password confirmation field
     - Password visibility toggle
     - Terms and conditions acceptance
     - Social signup slot for OAuth providers
     - Login redirect link
     
     Events:
     - submit: Emits validated form data { username, email, password }
     ======================================================================== -->
<template>
  <form @submit.prevent="handleSubmit" class="signup-form space-y-6">
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
      <p class="text-white/60 mt-2">Créer un compte</p>
    </div>

    <!-- Error message -->
    <div
      v-if="error"
      class="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
    >
      {{ error }}
    </div>

    <!-- Name -->
    <TextInput
      v-model="form.name"
      label="Nom"
      placeholder="Votre nom"
      autocomplete="name"
      :error="errors.name"
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </template>
    </TextInput>

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
    <div class="space-y-2">
      <TextInput
        v-model="form.password"
        :type="showPassword ? 'text' : 'password'"
        label="Mot de passe"
        placeholder="••••••••"
        autocomplete="new-password"
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
            :aria-label="
              showPassword
                ? 'Masquer le mot de passe'
                : 'Afficher le mot de passe'
            "
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

      <!-- Password strength indicator -->
      <div class="space-y-2">
        <div class="flex gap-1">
          <div
            v-for="n in 4"
            :key="n"
            class="flex-1 h-1 rounded-full transition-colors"
            :class="
              passwordStrength >= n
                ? strengthColors[passwordStrength]
                : 'bg-white/10'
            "
          />
        </div>
        <p class="text-xs" :class="strengthTextColors[passwordStrength]">
          {{ strengthLabels[passwordStrength] }}
        </p>
      </div>
    </div>

    <!-- Confirm Password -->
    <TextInput
      v-model="form.confirmPassword"
      :type="showPassword ? 'text' : 'password'"
      label="Confirmer le mot de passe"
      placeholder="••••••••"
      autocomplete="new-password"
      :error="errors.confirmPassword"
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      </template>
    </TextInput>

    <!-- Terms -->
    <label class="flex items-start gap-3 cursor-pointer">
      <input
        v-model="form.acceptTerms"
        type="checkbox"
        class="mt-1 w-4 h-4 rounded border-white/20 bg-transparent text-[#00F0FF] focus:ring-[#00F0FF]/30"
      />
      <span class="text-sm text-white/60">
        J'accepte les
        <router-link to="/terms" class="text-[#00F0FF] hover:underline"
          >conditions d'utilisation</router-link
        >
        et la
        <router-link to="/privacy" class="text-[#00F0FF] hover:underline"
          >politique de confidentialité</router-link
        >
      </span>
    </label>
    <p v-if="errors.acceptTerms" class="text-red-400 text-xs -mt-4">
      {{ errors.acceptTerms }}
    </p>

    <!-- Submit -->
    <BaseButton
      type="submit"
      variant="primary"
      class="w-full"
      :loading="loading"
    >
      Créer mon compte
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

    <!-- Social signup -->
    <slot name="social" />

    <!-- Login link -->
    <p class="text-center text-white/60">
      Déjà un compte ?
      <router-link
        to="/login"
        class="text-[#00F0FF] font-medium hover:underline"
      >
        Se connecter
      </router-link>
    </p>
  </form>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { TextInput, BaseButton } from "@/components/atoms";

defineOptions({ name: "SignupForm" });

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["submit"]);

const form = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
});

const errors = reactive({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: "",
});

const showPassword = ref(false);

const strengthColors = {
  0: "bg-white/10",
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-green-500",
};

const strengthTextColors = {
  0: "text-white/40",
  1: "text-red-400",
  2: "text-orange-400",
  3: "text-yellow-400",
  4: "text-green-400",
};

const strengthLabels = {
  0: "Entrez un mot de passe",
  1: "Faible",
  2: "Moyen",
  3: "Bon",
  4: "Excellent",
};

const passwordStrength = computed(() => {
  const password = form.password;
  if (!password) return 0;

  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  return strength;
});

const validate = () => {
  let isValid = true;
  Object.keys(errors).forEach((key) => (errors[key] = ""));

  if (!form.name || form.name.length < 2) {
    errors.name = "Le nom doit contenir au moins 2 caractères";
    isValid = false;
  } else if (form.name.length > 50) {
    errors.name = "Le nom ne peut pas dépasser 50 caractères";
    isValid = false;
  }

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
  } else if (form.password.length < 6) {
    errors.password = "Au moins 6 caractères requis";
    isValid = false;
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas";
    isValid = false;
  }

  if (!form.acceptTerms) {
    errors.acceptTerms = "Vous devez accepter les conditions";
    isValid = false;
  }

  return isValid;
};

const handleSubmit = () => {
  if (!validate()) return;
  emit("submit", {
    name: form.name,
    email: form.email,
    password: form.password,
  });
};

defineExpose({ form, validate });
</script>
