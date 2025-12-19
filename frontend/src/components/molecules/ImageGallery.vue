<script setup>
/**
 * ImageGallery - Galerie d'images avec swipe
 * Design System: Phenom Search
 */
import { ref, computed, onUnmounted } from "vue";
import { getImageUrl } from "@/utils/imageHelpers";

defineOptions({ name: "ImageGallery" });

const props = defineProps({
  images: {
    type: Array,
    required: true,
    // Format: [{ url: 'string', alt?: 'string' }] ou ['url1', 'url2']
  },
  aspectRatio: {
    type: String,
    default: "4/3",
  },
});

const emit = defineEmits(["imageClick"]);

const currentIndex = ref(0);

// Keep track of any ObjectURLs we create so we can revoke them
const createdObjectUrls = [];

// Helper: resolve a usable URL from various image shapes
function resolveImageUrl(img) {
  if (!img && img !== 0) return null;
  if (typeof img === "string") return img;
  // File or Blob (local preview)
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

// Normaliser les images (gère File/Blob localement pour permettre la révocation)
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
    .filter((i) => i.url);
});

onUnmounted(() => {
  createdObjectUrls.forEach((u) => {
    try {
      URL.revokeObjectURL(u);
    } catch (e) {
      /* ignore */
    }
  });
});

// Navigation tactile
const touchStartX = ref(0);
const touchEndX = ref(0);

const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX;
};

const handleTouchMove = (e) => {
  touchEndX.value = e.touches[0].clientX;
};

const handleTouchEnd = () => {
  const diff = touchStartX.value - touchEndX.value;
  const threshold = 50;

  if (Math.abs(diff) > threshold) {
    if (diff > 0 && currentIndex.value < normalizedImages.value.length - 1) {
      // Swipe left -> next
      currentIndex.value++;
    } else if (diff < 0 && currentIndex.value > 0) {
      // Swipe right -> prev
      currentIndex.value--;
    }
  }
};

const goTo = (index) => {
  currentIndex.value = index;
};
</script>

<template>
  <div class="relative bg-[#12151C] overflow-hidden">
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
    </div>

    <!-- Indicators (dots) -->
    <div
      v-if="normalizedImages.length > 1"
      class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2"
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
      class="absolute top-3 right-3 px-2 py-1 bg-black/50 text-xs text-white/70"
    >
      {{ currentIndex + 1 }} / {{ normalizedImages.length }}
    </div>
  </div>
</template>
