<!--
  ============================================================================
  ImageGallery.vue - Swipeable image gallery/carousel
  ============================================================================
  
  PURPOSE:
  A touch-enabled image gallery that displays multiple images with swipe
  navigation. Shows dot indicators and a counter. Handles various image
  formats including File/Blob objects for local previews.
  
  FEATURES:
  - Touch/swipe navigation (left/right)
  - Dot indicators for current position
  - Image counter (e.g., "1 / 5")
  - Lazy loading for images
  - Handles multiple image formats:
    - String URLs
    - File/Blob objects (creates object URLs)
    - Objects with url/secure_url/path/src properties
  - Auto cleanup of object URLs on unmount
  - Configurable aspect ratio
  
  USAGE EXAMPLES:
  <ImageGallery
    :images="['url1.jpg', 'url2.jpg']"
    aspect-ratio="16/9"
    @image-click="openLightbox"
  />
  
  <ImageGallery
    :images="observation.images"
    @image-click="handleClick"
  />
  
  PROPS:
  - images: Array (required) - Array of images (URLs or objects with url)
  - aspectRatio: String (default: "4/3") - CSS aspect ratio for container
  
  EVENTS:
  - @imageClick(index) - Emitted when an image is clicked with its index
  ============================================================================
-->

<script setup>
/**
 * ImageGallery - Swipeable image gallery component
 * Design System: Phenom Search
 */
import { ref, computed, onUnmounted } from "vue";
import { getImageUrl } from "@/utils/imageHelpers";

defineOptions({ name: "ImageGallery" });

// ============================================================================
// PROPS DEFINITION
// ============================================================================
const props = defineProps({
  // Array of images - can be URLs, objects with url, or File/Blob
  images: {
    type: Array,
    required: true,
    // Format: [{ url: 'string', alt?: 'string' }] or ['url1', 'url2']
  },
  // CSS aspect ratio for the image container
  aspectRatio: {
    type: String,
    default: "4/3",
  },
});

// ============================================================================
// EVENTS
// ============================================================================
const emit = defineEmits(["imageClick"]);

// ============================================================================
// LOCAL STATE
// ============================================================================
const currentIndex = ref(0); // Currently displayed image index

// Track ObjectURLs we create so we can revoke them on cleanup
const createdObjectUrls = [];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Resolve a usable URL from various image shapes
 * Handles: strings, File/Blob, objects with various URL properties
 * @param {*} img - Image in any supported format
 * @returns {string|null} - Resolved URL or null
 */
function resolveImageUrl(img) {
  if (!img && img !== 0) return null;
  if (typeof img === "string") return img;

  // File or Blob (local preview) - create object URL
  if (typeof File !== "undefined" && img instanceof File) {
    const url = URL.createObjectURL(img);
    createdObjectUrls.push(url);
    return url;
  }
  if (typeof Blob !== "undefined" && img instanceof Blob) {
    const url = URL.createObjectURL(img);
    createdObjectUrls.push(url);
    return url;
  }

  // Common API shapes
  if (img.url && typeof img.url === "string") return img.url;
  if (img.secure_url && typeof img.secure_url === "string")
    return img.secure_url;
  if (img.path && typeof img.path === "string") return img.path;
  if (img.src && typeof img.src === "string") return img.src;
  if (img.publicUrl && typeof img.publicUrl === "string") return img.publicUrl;
  if (img.imageUrl && typeof img.imageUrl === "string") return img.imageUrl;
  if (img.link && typeof img.link === "string") return img.link;

  // Nested shapes (e.g., { url: { secure_url: '...' } })
  if (img.url && typeof img.url === "object") {
    if (typeof img.url.secure_url === "string") return img.url.secure_url;
    if (typeof img.url.path === "string") return img.url.path;
  }
  if (
    img.asset &&
    typeof img.asset === "object" &&
    typeof img.asset.url === "string"
  )
    return img.asset.url;

  // Fallback: try to find any string property that looks like a URL
  for (const key of Object.keys(img || {})) {
    if (typeof img[key] === "string" && img[key].startsWith("http"))
      return img[key];
  }

  return null;
}

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================
/**
 * Normalize all images to a consistent format with url and alt
 * Handles File/Blob by creating object URLs (tracked for cleanup)
 */
const normalizedImages = computed(() => {
  return props.images
    .map((img, index) => {
      // File or Blob -> create object URL and track it
      if (typeof File !== "undefined" && img instanceof File) {
        const url = URL.createObjectURL(img);
        createdObjectUrls.push(url);
        return { url, alt: img.name || `Image ${index + 1}` };
      }
      if (typeof Blob !== "undefined" && img instanceof Blob) {
        const url = URL.createObjectURL(img);
        createdObjectUrls.push(url);
        return { url, alt: `Image ${index + 1}` };
      }

      // Strings -> pass through
      if (typeof img === "string") {
        return { url: img, alt: `Image ${index + 1}` };
      }

      // Use shared util for API shapes
      const url = getImageUrl(img);
      const alt = (img && (img.alt || img.caption)) || `Image ${index + 1}`;
      return { url, alt };
    })
    .filter((i) => i.url); // Filter out any without valid URLs
});

// ============================================================================
// LIFECYCLE
// ============================================================================
/**
 * Cleanup: revoke all object URLs we created to prevent memory leaks
 */
onUnmounted(() => {
  createdObjectUrls.forEach((u) => {
    try {
      URL.revokeObjectURL(u);
    } catch (e) {
      /* ignore */
    }
  });
});

// ============================================================================
// TOUCH NAVIGATION
// ============================================================================
const touchStartX = ref(0);
const touchEndX = ref(0);

/**
 * Record touch start position
 */
const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX;
};

/**
 * Track touch movement
 */
const handleTouchMove = (e) => {
  touchEndX.value = e.touches[0].clientX;
};

/**
 * Handle touch end - determine swipe direction and navigate
 */
const handleTouchEnd = () => {
  const diff = touchStartX.value - touchEndX.value;
  const threshold = 50; // Minimum swipe distance

  if (Math.abs(diff) > threshold) {
    if (diff > 0 && currentIndex.value < normalizedImages.value.length - 1) {
      // Swipe left -> next image
      currentIndex.value++;
    } else if (diff < 0 && currentIndex.value > 0) {
      // Swipe right -> previous image
      currentIndex.value--;
    }
  }
};

/**
 * Navigate directly to a specific image by index (dot click)
 */
const goTo = (index) => {
  currentIndex.value = index;
};
</script>

<template>
  <div class="relative bg-[#000000] overflow-hidden">
    <!-- Images Container -->
    <div
      class="relative w-full"
      :style="{ aspectRatio }"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Current Image -->
      <img
        :src="normalizedImages[currentIndex]?.url"
        :alt="normalizedImages[currentIndex]?.alt"
        class="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        @click="emit('imageClick', currentIndex)"
      />

      <!-- Top gradient overlay for smooth blend with header -->
      <div class="gallery-gradient-top"></div>

      <!-- Bottom gradient overlay for smooth blend with content -->
      <div class="gallery-gradient-bottom"></div>
    </div>

    <!-- Indicators (dots) -->
    <div
      v-if="normalizedImages.length > 1"
      class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10"
    >
      <button
        v-for="(_, index) in normalizedImages"
        :key="index"
        :class="[
          'w-2 h-2 rounded-full transition-all',
          currentIndex === index
            ? 'bg-[#00F0FF] w-4'
            : 'bg-white/30 hover:bg-white/50',
        ]"
        :aria-label="`Voir image ${index + 1}`"
        @click="goTo(index)"
      />
    </div>

    <!-- Counter -->
    <div
      v-if="normalizedImages.length > 1"
      class="absolute top-3 right-3 px-2 py-1 bg-black/50 rounded-lg text-xs text-white/70 z-10"
    >
      {{ currentIndex + 1 }} / {{ normalizedImages.length }}
    </div>
  </div>
</template>

<style scoped>
/* Top gradient - smooth blend with header/navbar */
.gallery-gradient-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.4) 40%,
    rgba(0, 0, 0, 0) 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* Bottom gradient - smooth blend with content below */
.gallery-gradient-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    rgba(0, 0, 0, 0) 100%
  );
  pointer-events: none;
  z-index: 1;
}
</style>
