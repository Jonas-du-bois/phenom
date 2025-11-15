<template>
  <div class="relative min-h-[60vh] flex flex-col items-center justify-center px-6 pt-20 pb-12">
    <!-- Gradient Background -->
    <div 
      class="absolute inset-0 -z-10 gradient-purple"
    />
    
    <!-- Floating UFO -->
    <div class="relative mb-8 animate-float">
      <div class="relative w-48 h-48 flex items-center justify-center">
        <!-- Glow effect -->
        <div class="absolute inset-0 bg-[#7B3FF2]/40 rounded-full blur-[80px]" />
        
        <!-- UFO Image with glassmorphic border -->
        <div class="relative z-10 w-32 h-32 rounded-full overflow-hidden border border-white/20 backdrop-blur-xl shadow-2xl shadow-[#7B3FF2]/30 bg-white/5">
          <div class="w-full h-full flex items-center justify-center text-6xl">
            🛸
          </div>
        </div>
        
        <!-- Light beam effect -->
        <div 
          class="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-24 opacity-40"
          style="
            background: linear-gradient(180deg, #7B3FF2 0%, transparent 100%);
            clip-path: polygon(40% 0, 60% 0, 100% 100%, 0% 100%);
          "
        />
      </div>
    </div>
    
    <!-- Hero Text -->
    <div class="text-center space-y-4 max-w-md">
      <h1 class="text-4xl font-bold text-white">
        {{ title }}
      </h1>
      <p class="text-lg text-white/80">
        {{ subtitle }}
      </p>
      
      <button 
        @click="$emit('create')"
        class="btn-primary mt-6"
      >
        {{ buttonText }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Track the Unknown'
  },
  subtitle: {
    type: String,
    default: 'Join the community documenting unexplained phenomena across the globe'
  },
  buttonText: {
    type: String,
    default: 'Report Sighting'
  }
})

defineEmits(['create'])
</script>
