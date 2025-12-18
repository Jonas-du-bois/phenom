<script setup>
/**
 * CommentForm - Formulaire de commentaire
 * Design System: Phenom Search
 */
import { ref } from 'vue'

defineOptions({ name: 'CommentForm' })

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: 'Écrire un commentaire...'
  }
})

const emit = defineEmits(['submit'])

const content = ref('')

const handleSubmit = () => {
  const trimmedContent = content.value.trim()
  if (trimmedContent && !props.loading) {
    emit('submit', trimmedContent)
    content.value = ''
  }
}
</script>

<template>
  <form 
    class="flex items-center gap-2 px-4 py-3 bg-[#12151C] border-t border-white/10"
    @submit.prevent="handleSubmit"
  >
    <!-- Input -->
    <input
      v-model="content"
      type="text"
      :placeholder="placeholder"
      :disabled="loading"
      class="flex-1 py-2 px-3 bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#00F0FF] transition-colors"
    />
    
    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="!content.trim() || loading"
      :class="[
        'p-2 transition-colors touch-target',
        content.trim() && !loading
          ? 'text-[#00F0FF] hover:bg-[#00F0FF]/10'
          : 'text-white/20 cursor-not-allowed'
      ]"
    >
      <svg v-if="loading" class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    </button>
  </form>
</template>
