<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" :class="`modal-${size}`" @click.stop>
          <!-- Close button -->
          <button
            v-if="closable"
            class="modal-close"
            @click="close"
            aria-label="Fermer"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Header -->
          <div v-if="$slots.header || title" class="modal-header">
            <slot name="header">
              <h2 class="modal-title">{{ title }}</h2>
            </slot>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot></slot>
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value)
  },
  closable: {
    type: Boolean,
    default: true
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const close = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    close()
  }
}

// Prevent body scroll when modal is open
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Sizes */
.modal-sm {
  max-width: 400px;
}

.modal-md {
  max-width: 600px;
}

.modal-lg {
  max-width: 800px;
}

.modal-xl {
  max-width: 1200px;
}

.modal-full {
  max-width: 100%;
  max-height: 100%;
  border-radius: 0;
  margin: 0;
}

/* Close button */
.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
  color: #6b7280;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #111827;
}

/* Header */
.modal-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  padding-right: 2rem; /* Space for close button */
}

/* Body */
.modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

/* Footer */
.modal-footer {
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s, opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
  opacity: 0;
}

/* Mobile optimization */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
  }
  
  .modal-container {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 1rem 1rem 0 0;
    margin: 0;
  }
  
  .modal-full {
    max-height: 100vh;
    border-radius: 0;
  }
  
  .modal-header {
    padding: 1.25rem 1.25rem 0.75rem;
  }
  
  .modal-body {
    padding: 1.25rem;
  }
  
  .modal-footer {
    padding: 0.75rem 1.25rem 1.25rem;
    flex-direction: column-reverse;
  }
  
  .modal-footer > * {
    width: 100%;
  }
  
  /* Slide up animation on mobile */
  .modal-enter-from .modal-container,
  .modal-leave-to .modal-container {
    transform: translateY(100%);
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .modal-container {
    background: #1f2937;
  }
  
  .modal-header,
  .modal-footer {
    border-color: #374151;
  }
  
  .modal-title {
    color: #f3f4f6;
  }
  
  .modal-close {
    background: rgba(255, 255, 255, 0.05);
    color: #9ca3af;
  }
  
  .modal-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #f3f4f6;
  }
}
</style>
