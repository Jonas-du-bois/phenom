<!--
  ============================================================================
  BaseAvatar.vue - User Avatar Component
  ============================================================================
  
  PURPOSE:
  This is a reusable avatar component that displays a user's profile picture.
  If no image is available or if the image fails to load, it gracefully falls
  back to displaying the user's initials (first letters of their name).

  FEATURES:
  - Displays user profile image when available
  - Automatic fallback to initials if image is missing or fails to load
  - Multiple size options (xs, sm, md, lg, xl)
  - Rounded/circular design with subtle border styling
  - Error handling for broken image URLs

  USAGE EXAMPLES:
  <BaseAvatar src="/path/to/photo.jpg" name="John Doe" size="md" />
  <BaseAvatar name="Jane Smith" size="lg" />  (will show "JS" initials)

  PROPS:
  - src: URL of the user's profile image (optional)
  - name: User's full name, used to generate initials as fallback
  - size: Avatar size - 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
  ============================================================================
-->

<script setup>
import { computed, ref } from "vue";

/**
 * BaseAvatar - User Avatar Component
 * Design System: Phenom Search
 *
 * An atomic component that displays either a user's profile picture
 * or their initials as a fallback in a circular container.
 */

defineOptions({ name: "BaseAvatar" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
const props = defineProps({
  // URL of the user's profile image
  src: {
    type: String,
    default: "",
  },
  // User's full name (used to generate initials fallback)
  name: {
    type: String,
    default: "",
  },
  // Size variant of the avatar
  // Controls both dimensions and font size for initials
  size: {
    type: String,
    default: "md",
    validator: (v) => ["xs", "sm", "md", "lg", "xl"].includes(v),
  },
});

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

/**
 * Generate initials from the user's name
 * Example: "John Doe" => "JD", "Alice" => "A"
 * Returns "?" if no name is provided
 */
const initials = computed(() => {
  if (!props.name) return "?";
  return props.name
    .split(" ")              // Split name into words
    .filter((word) => word)  // Remove empty strings (handles double spaces)
    .map((word) => word[0])  // Take first letter of each word
    .join("")                // Join letters together
    .toUpperCase()           // Convert to uppercase
    .slice(0, 2);            // Limit to 2 characters max
});

// =============================================================================
// REACTIVE STATE
// =============================================================================

// Tracks if the image failed to load (triggers fallback to initials)
const imageError = ref(false);

// =============================================================================
// SIZE CONFIGURATION
// =============================================================================

/**
 * Tailwind CSS classes for each size variant
 * - w-X h-X: Controls avatar dimensions
 * - text-X: Controls font size for initials
 */
const sizeClasses = {
  xs: "w-6 h-6 text-[0.5rem]",   // 24px - Extra small
  sm: "w-8 h-8 text-xs",         // 32px - Small
  md: "w-10 h-10 text-sm",       // 40px - Medium (default)
  lg: "w-14 h-14 text-base",     // 56px - Large
  xl: "w-20 h-20 text-xl",       // 80px - Extra large
};
</script>

<template>
  <!-- 
    Avatar Container
    - Circular shape with semi-transparent background
    - Subtle white border for visibility on dark backgrounds
  -->
  <div
    :class="[
      'relative flex items-center justify-center',
      'bg-white/10 border border-white/20 rounded-full',
      'overflow-hidden',
      sizeClasses[size],
    ]"
  >
    <!-- 
      Profile Image
      - Only rendered if src is provided AND no loading error occurred
      - On error, sets imageError to true which triggers the fallback
    -->
    <img
      v-if="src && !imageError"
      :src="src"
      :alt="name"
      class="w-full h-full object-cover"
      @error="imageError = true"
    />

    <!-- 
      Fallback: User Initials
      - Displayed when no image src OR when image fails to load
      - Shows up to 2 letters extracted from user's name
    -->
    <span v-else class="font-medium text-white/60 uppercase">
      {{ initials }}
    </span>
  </div>
</template>
