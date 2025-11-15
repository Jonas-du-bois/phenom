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
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.3s;
}

/* Variants */
.card-default {
  border: 1px solid #e5e7eb;
}

.card-elevated {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-outlined {
  border: 2px solid #667eea;
}

/* Hover effect */
.card-hoverable:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.card-clickable {
  cursor: pointer;
}

/* Media */
.card-media {
  width: 100%;
  overflow: hidden;
  background: #f3f4f6;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}

.card-hoverable:hover .card-image {
  transform: scale(1.05);
}

/* Content */
.card-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-padding-none .card-content {
  padding: 0;
}

.card-padding-sm .card-content {
  padding: 0.75rem;
}

.card-padding-md .card-content {
  padding: 1.25rem;
}

.card-padding-lg .card-content {
  padding: 2rem;
}

/* Header */
.card-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  line-height: 1.4;
}

.card-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Body */
.card-body {
  font-size: 0.9375rem;
  color: #374151;
  line-height: 1.6;
}

/* Footer */
.card-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

/* Mobile optimization */
@media (max-width: 640px) {
  .card {
    border-radius: 0.5rem;
  }

  .card-title {
    font-size: 1rem;
  }

  .card-padding-md .card-content {
    padding: 1rem;
  }

  .card-padding-lg .card-content {
    padding: 1.5rem;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .card {
    background: #1f2937;
    border-color: #374151;
  }

  .card-title {
    color: #f3f4f6;
  }

  .card-subtitle {
    color: #9ca3af;
  }

  .card-body {
    color: #d1d5db;
  }

  .card-footer {
    border-top-color: #374151;
  }
}
</style>
