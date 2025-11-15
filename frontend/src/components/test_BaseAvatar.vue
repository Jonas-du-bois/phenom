<template>
  <div class="avatar" :class="avatarClasses" :style="avatarStyle">
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="avatar-image"
      @error="handleError"
    />
    <span v-else class="avatar-initials">{{ initials }}</span>

    <span
      v-if="status"
      class="avatar-status"
      :class="`status-${status}`"
    ></span>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  src: String,
  alt: {
    type: String,
    default: "Avatar",
  },
  name: String,
  size: {
    type: String,
    default: "md",
    validator: (value) => ["xs", "sm", "md", "lg", "xl"].includes(value),
  },
  status: {
    type: String,
    validator: (value) => ["online", "offline", "away", "busy"].includes(value),
  },
  rounded: {
    type: Boolean,
    default: true,
  },
});

const imageError = ref(false);

const avatarClasses = computed(() => {
  return [
    `avatar-${props.size}`,
    {
      "avatar-rounded": props.rounded,
      "avatar-square": !props.rounded,
    },
  ];
});

const avatarStyle = computed(() => {
  if (imageError.value || !props.src) {
    // Generate color from name
    const colors = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    ];
    const index = (props.name?.charCodeAt(0) || 0) % colors.length;
    return { background: colors[index] };
  }
  return {};
});

const initials = computed(() => {
  if (!props.name) return "?";

  const names = props.name.trim().split(" ");
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase();
  }
  return names[0].substring(0, 2).toUpperCase();
});

const handleError = () => {
  imageError.value = true;
};
</script>

<style scoped>
.avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  background: #e5e7eb;
}

.avatar-rounded {
  border-radius: 9999px;
}

.avatar-square {
  border-radius: 0.5rem;
}

/* Sizes */
.avatar-xs {
  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.625rem;
}

.avatar-sm {
  width: 2rem;
  height: 2rem;
  font-size: 0.75rem;
}

.avatar-md {
  width: 2.5rem;
  height: 2.5rem;
  font-size: 0.875rem;
}

.avatar-lg {
  width: 3.5rem;
  height: 3.5rem;
  font-size: 1.125rem;
}

.avatar-xl {
  width: 5rem;
  height: 5rem;
  font-size: 1.5rem;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  color: white;
  font-weight: 600;
  user-select: none;
}

/* Status indicator */
.avatar-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 25%;
  height: 25%;
  border-radius: 9999px;
  border: 2px solid white;
}

.status-online {
  background: #10b981;
}

.status-offline {
  background: #6b7280;
}

.status-away {
  background: #f59e0b;
}

.status-busy {
  background: #ef4444;
}
</style>
