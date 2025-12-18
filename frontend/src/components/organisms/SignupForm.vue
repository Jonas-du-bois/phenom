<template>
  <form @submit.prevent="handleSubmit" class="signup-form space-y-6">
    <!-- Logo -->
    <div class="text-center mb-8">
      <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#00F0FF] to-[#0066CC] flex items-center justify-center mb-4">
        <svg class="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-white">Créer un compte</h1>
      <p class="text-white/60 mt-2">Rejoignez la communauté Phenom</p>
    </div>
    
    <!-- Error message -->
    <div 
      v-if="error"
      class="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm"
    >
      {{ error }}
    </div>
    
    <!-- Username -->
    <TextInput
      v-model="form.username"
      label="Nom d'utilisateur"
      placeholder="votre_pseudo"
      autocomplete="username"
      :error="errors.username"
      required
    >
      <template #leftIcon>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </template>
        <template #rightIcon>
          <button 
            type="button" 
            @click="showPassword = !showPassword"
            class="text-white/40 hover:text-white/60"
          >
            <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
            :class="passwordStrength >= n ? strengthColors[passwordStrength] : 'bg-white/10'"
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
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
        <router-link to="/terms" class="text-[#00F0FF] hover:underline">conditions d'utilisation</router-link>
        et la 
        <router-link to="/privacy" class="text-[#00F0FF] hover:underline">politique de confidentialité</router-link>
      </span>
    </label>
    <p v-if="errors.acceptTerms" class="text-red-400 text-xs -mt-4">{{ errors.acceptTerms }}</p>
    
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
      <router-link to="/login" class="text-[#00F0FF] font-medium hover:underline">
        Se connecter
      </router-link>
    </p>
  </form>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { TextInput, BaseButton } from '@/components/atoms'

defineOptions({ name: 'SignupForm' })

defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['submit'])

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: ''
})

const showPassword = ref(false)

const strengthColors = {
  0: 'bg-white/10',
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-green-500'
}

const strengthTextColors = {
  0: 'text-white/40',
  1: 'text-red-400',
  2: 'text-orange-400',
  3: 'text-yellow-400',
  4: 'text-green-400'
}

const strengthLabels = {
  0: 'Entrez un mot de passe',
  1: 'Faible',
  2: 'Moyen',
  3: 'Bon',
  4: 'Excellent'
}

const passwordStrength = computed(() => {
  const password = form.password
  if (!password) return 0
  
  let strength = 0
  if (password.length >= 8) strength++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++
  
  return strength
})

const validate = () => {
  let isValid = true
  Object.keys(errors).forEach(key => errors[key] = '')
  
  if (!form.username || form.username.length < 3) {
    errors.username = 'Le pseudo doit contenir au moins 3 caractères'
    isValid = false
  } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
    errors.username = 'Caractères autorisés : lettres, chiffres, underscore'
    isValid = false
  }
  
  if (!form.email) {
    errors.email = 'L\'email est requis'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Email invalide'
    isValid = false
  }
  
  if (!form.password) {
    errors.password = 'Le mot de passe est requis'
    isValid = false
  } else if (form.password.length < 8) {
    errors.password = 'Au moins 8 caractères requis'
    isValid = false
  }
  
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    isValid = false
  }
  
  if (!form.acceptTerms) {
    errors.acceptTerms = 'Vous devez accepter les conditions'
    isValid = false
  }
  
  return isValid
}

const handleSubmit = () => {
  if (!validate()) return
  emit('submit', { 
    username: form.username,
    email: form.email,
    password: form.password
  })
}

defineExpose({ form, validate })
</script>
