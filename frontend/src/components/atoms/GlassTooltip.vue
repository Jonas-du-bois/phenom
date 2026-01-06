<!--
  ============================================================================
  GlassTooltip.vue - Liquid Glass Tooltip/Popup Component
  ============================================================================
  
  PURPOSE:
  A beautiful liquid glass styled tooltip/popup that appears on click or hover.
  Designed to show additional information like acronym expansions, definitions,
  or any contextual help text.

  FEATURES:
  - Liquid glass (glassmorphism) visual style
  - Click-triggered popup (mobile-friendly)
  - Auto-positioning to stay within viewport
  - Smooth enter/leave animations
  - Optional icon support
  - Backdrop overlay on mobile for easy dismissal

  USAGE EXAMPLES:
  <GlassTooltip content="Objet Volant Non Identifié">
    <BaseBadge variant="cyan">UFO</BaseBadge>
  </GlassTooltip>

  <GlassTooltip 
    content="Phénomène Aérien Non Identifié" 
    icon="🛸"
    position="top"
  >
    <span>PAN</span>
  </GlassTooltip>

  PROPS:
  - content: String (required) - The tooltip text to display
  - icon: String - Optional emoji/icon to show before content
  - position: 'top' | 'bottom' | 'auto' - Preferred position (default: 'auto')
  - showOnHover: Boolean - Also show on hover (default: false, click only)

  ============================================================================
-->

<script setup>
/**
 * GlassTooltip - Liquid Glass Tooltip Component
 * Design System: Phenom Search - Liquid Glass Style
 */
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";

defineOptions({ name: "GlassTooltip" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
const props = defineProps({
  // The tooltip content text
  content: {
    type: String,
    required: true,
  },
  // Optional emoji/icon to display before content
  icon: {
    type: String,
    default: "",
  },
  // Preferred position ('top', 'bottom', 'auto')
  position: {
    type: String,
    default: "auto",
    validator: (v) => ["top", "bottom", "auto"].includes(v),
  },
  // Whether to also show on hover (in addition to click)
  showOnHover: {
    type: Boolean,
    default: false,
  },
});

// =============================================================================
// LOCAL STATE
// =============================================================================
const isVisible = ref(false);
const triggerRef = ref(null);
const tooltipRef = ref(null);
const computedPosition = ref("bottom");
const tooltipStyle = ref({});

// =============================================================================
// METHODS
// =============================================================================

/**
 * Toggle tooltip visibility
 */
const toggle = async () => {
  isVisible.value = !isVisible.value;
  
  if (isVisible.value) {
    await nextTick();
    calculatePosition();
  }
};

/**
 * Close the tooltip
 */
const close = () => {
  isVisible.value = false;
};

/**
 * Calculate optimal position and offset for the tooltip
 */
const calculatePosition = () => {
  if (!triggerRef.value || !tooltipRef.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const tooltipRect = tooltipRef.value.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  // Determine vertical position
  if (props.position === "auto") {
    const spaceAbove = triggerRect.top;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    computedPosition.value = spaceBelow >= tooltipRect.height + 12 || spaceBelow > spaceAbove 
      ? "bottom" 
      : "top";
  } else {
    computedPosition.value = props.position;
  }

  // Calculate horizontal centering with viewport bounds
  let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
  
  // Keep tooltip within viewport horizontally
  const padding = 12;
  if (left < padding) {
    left = padding;
  } else if (left + tooltipRect.width > viewportWidth - padding) {
    left = viewportWidth - tooltipRect.width - padding;
  }

  // Calculate vertical position
  let top;
  if (computedPosition.value === "bottom") {
    top = triggerRect.bottom + 8;
  } else {
    top = triggerRect.top - tooltipRect.height - 8;
  }

  tooltipStyle.value = {
    position: "fixed",
    top: `${top}px`,
    left: `${left}px`,
    zIndex: 9999,
  };
};

/**
 * Handle click outside to close tooltip
 */
const handleClickOutside = (event) => {
  if (
    isVisible.value &&
    triggerRef.value &&
    !triggerRef.value.contains(event.target) &&
    tooltipRef.value &&
    !tooltipRef.value.contains(event.target)
  ) {
    close();
  }
};

/**
 * Handle escape key to close tooltip
 */
const handleEscape = (event) => {
  if (event.key === "Escape" && isVisible.value) {
    close();
  }
};

// =============================================================================
// LIFECYCLE
// =============================================================================
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleEscape);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleEscape);
});

// =============================================================================
// COMPUTED
// =============================================================================
const arrowPositionClass = computed(() => {
  return computedPosition.value === "bottom" ? "arrow-top" : "arrow-bottom";
});
</script>

<template>
  <div class="glass-tooltip-wrapper inline-block">
    <!-- Trigger element (slot) -->
    <div
      ref="triggerRef"
      class="glass-tooltip-trigger cursor-pointer"
      @click.stop="toggle"
      @mouseenter="showOnHover && (isVisible = true)"
      @mouseleave="showOnHover && (isVisible = false)"
    >
      <slot />
    </div>

    <!-- Tooltip popup (teleported to body) -->
    <Teleport to="body">
      <Transition name="glass-tooltip">
        <div
          v-if="isVisible"
          ref="tooltipRef"
          class="glass-tooltip"
          :class="arrowPositionClass"
          :style="tooltipStyle"
          @click.stop
        >
          <!-- Tooltip content -->
          <div class="glass-tooltip-content">
            <span v-if="icon" class="glass-tooltip-icon">{{ icon }}</span>
            <span class="glass-tooltip-text">{{ content }}</span>
          </div>

          <!-- Arrow indicator -->
          <div class="glass-tooltip-arrow" :class="arrowPositionClass" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* ============================================================================
   GLASS TOOLTIP - Liquid Glass Style (same as navbar/tabbar)
   ============================================================================ */

.glass-tooltip-wrapper {
  position: relative;
}

.glass-tooltip-trigger {
  display: inline-flex;
}

/* Main tooltip container - EXACT liquid glass style */
.glass-tooltip {
  position: fixed;
  max-width: 280px;
  min-width: 120px;
  padding: 12px 16px;
  border-radius: 1rem;
  
  /* Liquid glass effect - EXACT same values as navbar */
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.01)
  );
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.6);
  overflow: hidden;
}

/* Light reflection overlay - EXACT same as navbar */
.glass-tooltip::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06),
    rgba(255, 255, 255, 0)
  );
  mix-blend-mode: overlay;
}

/* Content styling */
.glass-tooltip-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.glass-tooltip-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  filter: drop-shadow(0 0 4px rgba(0, 240, 255, 0.3));
}

.glass-tooltip-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  letter-spacing: 0.01em;
}

/* Arrow styling - matching liquid glass */
.glass-tooltip-arrow {
  position: absolute;
  width: 12px;
  height: 12px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  
  /* Match tooltip background exactly */
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.01)
  );
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Arrow position: pointing up (tooltip is below trigger) */
.glass-tooltip-arrow.arrow-top {
  top: -6px;
  border-right: none;
  border-bottom: none;
  box-shadow: -2px -2px 6px rgba(2, 6, 23, 0.3);
}

/* Arrow position: pointing down (tooltip is above trigger) */
.glass-tooltip-arrow.arrow-bottom {
  bottom: -6px;
  border-left: none;
  border-top: none;
  box-shadow: 2px 2px 6px rgba(2, 6, 23, 0.3);
}

/* ============================================================================
   TRANSITIONS - Smooth liquid feel
   ============================================================================ */

.glass-tooltip-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.glass-tooltip-leave-active {
  transition: all 0.15s ease-out;
}

.glass-tooltip-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.glass-tooltip-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Direction-specific enter animations */
.glass-tooltip.arrow-top.glass-tooltip-enter-from {
  transform: translateY(-8px) scale(0.9);
}

.glass-tooltip.arrow-bottom.glass-tooltip-enter-from {
  transform: translateY(8px) scale(0.9);
}
</style>
