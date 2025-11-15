<template>
  <div class="card" :class="cardClasses" @click="handleClick">
    <!-- Image / Media -->
    <div v-if="$slots.media || image" class="card-media">
      <slot name="media">
        <img v-if="image" :src="image" :alt="imageAlt" class="card-image" />
      </slot>
    </div>

    <!-- Content -->
    <div class="card-content">
      <!-- Header -->
      <div v-if="$slots.header || title" class="card-header">
        <slot name="header">
          <h3 class="card-title">{{ title }}</h3>
          <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
        </slot>
      </div>

      <!-- Body -->
      <div v-if="$slots.default" class="card-body">
        <slot></slot>
      </div>

      <!-- Footer -->
      <div v-if="$slots.footer" class="card-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  title: String,
  subtitle: String,
  image: String,
  imageAlt: {
    type: String,
    default: "",
  },
  variant: {
    type: String,
    default: "default",
    validator: (value) => ["default", "elevated", "outlined"].includes(value),
  },
  clickable: Boolean,
  hoverable: {
    type: Boolean,
    default: true,
  },
  padding: {
    type: String,
    default: "md",
    validator: (value) => ["none", "sm", "md", "lg"].includes(value),
  },
});

const emit = defineEmits(["click"]);

const cardClasses = computed(() => {
  return [
    `card-${props.variant}`,
    `card-padding-${props.padding}`,
    {
      "card-clickable": props.clickable,
      "card-hoverable": props.hoverable,
    },
  ];
});

const handleClick = (event) => {
  if (props.clickable) {
    emit("click", event);
  }
};
</script>

<style scoped>
.card {
  background: var(--phenom-surface-glass-base);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--phenom-radius-2xl);
  overflow: hidden;
  transition: var(--phenom-transition-base);
}

/* Variants */
.card-default {
  border: 1px solid var(--phenom-border-soft);
  box-shadow: var(--phenom-shadow-md);
}

.card-elevated {
  box-shadow: var(--phenom-shadow-xl);
  border: 1px solid var(--phenom-border-soft);
}

.card-outlined {
  border: 2px solid var(--phenom-primary);
  box-shadow: var(--phenom-glow-primary-soft);
}

/* Hover effect */
.card-hoverable:hover {
  transform: translateY(-4px);
  background: var(--phenom-surface-glass-soft);
  border-color: var(--phenom-border-medium);
  box-shadow: var(--phenom-shadow-xl), var(--phenom-glow-primary-soft);
}

.card-clickable {
  cursor: pointer;
}

/* Media */
.card-media {
  width: 100%;
  overflow: hidden;
  background: var(--phenom-surface-glass-subtle);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: var(--phenom-transition-base);
}

.card-hoverable:hover .card-image {
  transform: scale(1.05);
}

/* Content */
.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--phenom-space-4);
}

.card-padding-none .card-content {
  padding: 0;
}

.card-padding-sm .card-content {
  padding: var(--phenom-space-3);
}

.card-padding-md .card-content {
  padding: var(--phenom-space-4);
}

.card-padding-lg .card-content {
  padding: var(--phenom-space-6);
}

/* Header */
.card-header {
  display: flex;
  flex-direction: column;
  gap: var(--phenom-space-1);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--phenom-text-primary);
  margin: 0;
  line-height: 1.4;
}

.card-subtitle {
  font-size: 0.875rem;
  color: var(--phenom-text-secondary);
  margin: 0;
}

/* Body */
.card-body {
  font-size: 0.9375rem;
  color: var(--phenom-text-secondary);
  line-height: 1.6;
}

/* Footer */
.card-footer {
  display: flex;
  align-items: center;
  gap: var(--phenom-space-3);
  padding-top: var(--phenom-space-3);
  border-top: 1px solid var(--phenom-border-soft);
}

/* Mobile optimization */
@media (max-width: 640px) {
  .card {
    border-radius: var(--phenom-radius-xl);
  }

  .card-padding-md .card-content {
    padding: var(--phenom-space-3);
  }

  .card-padding-lg .card-content {
    padding: var(--phenom-space-4);
  }
  
  .card-title {
    font-size: 1rem;
  }
}
</style>
