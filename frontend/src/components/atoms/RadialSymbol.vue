<script setup>
/**
 * RadialSymbol - Symbole décoratif radial
 * Design System: Phenom Search
 */

defineOptions({ name: "RadialSymbol" });

const props = defineProps({
  size: {
    type: Number,
    default: 200,
  },
  rays: {
    type: Number,
    default: 24,
  },
  color: {
    type: String,
    default: "#00F0FF",
  },
  opacity: {
    type: Number,
    default: 0.2,
  },
});

// Générer les rayons
const rayPaths = computed(() => {
  const paths = [];
  const centerX = props.size / 2;
  const centerY = props.size / 2;
  const innerRadius = props.size * 0.15;
  const outerRadius = props.size * 0.45;

  for (let i = 0; i < props.rays; i++) {
    const angle = (i * 2 * Math.PI) / props.rays - Math.PI / 2;
    const x1 = centerX + innerRadius * Math.cos(angle);
    const y1 = centerY + innerRadius * Math.sin(angle);
    const x2 = centerX + outerRadius * Math.cos(angle);
    const y2 = centerY + outerRadius * Math.sin(angle);

    paths.push(`M ${x1} ${y1} L ${x2} ${y2}`);
  }

  return paths;
});
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
    fill="none"
    :style="{ opacity }"
  >
    <!-- Center circle -->
    <circle
      :cx="size / 2"
      :cy="size / 2"
      :r="size * 0.1"
      :stroke="color"
      stroke-width="1"
      fill="none"
    />

    <!-- Rays -->
    <path
      v-for="(path, index) in rayPaths"
      :key="index"
      :d="path"
      :stroke="color"
      stroke-width="1"
      stroke-linecap="round"
    />

    <!-- Outer circle -->
    <circle
      :cx="size / 2"
      :cy="size / 2"
      :r="size * 0.48"
      :stroke="color"
      stroke-width="0.5"
      fill="none"
    />
  </svg>
</template>
