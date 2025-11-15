<template>
  <nav class="fixed left-0 right-0 bottom-0 z-50 px-6 pb-6 pt-2">
    <div class="max-w-md mx-auto">
      <!-- Glassmorphic bottom bar -->
      <div class="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/20">
        <div class="flex items-center justify-around px-4 py-3">
          <!-- Home -->
          <router-link 
            to="/home"
            class="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-all group"
            :class="{ 'is-active': $route.path === '/home' }"
          >
            <svg class="w-6 h-6 transition-colors group-[.is-active]:text-[#7B3FF2]" :class="$route.path === '/home' ? 'text-[#7B3FF2]' : 'text-white/60 group-hover:text-[#7B3FF2]'" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span class="text-xs transition-colors group-[.is-active]:text-white" :class="$route.path === '/home' ? 'text-white' : 'text-white/60 group-hover:text-white'">Home</span>
          </router-link>
          
          <!-- Map -->
          <router-link 
            to="/map"
            class="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-all group"
            :class="{ 'is-active': $route.path === '/map' }"
          >
            <svg class="w-6 h-6 transition-colors group-[.is-active]:text-[#7B3FF2]" :class="$route.path === '/map' ? 'text-[#7B3FF2]' : 'text-white/60 group-hover:text-[#7B3FF2]'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
            <span class="text-xs transition-colors group-[.is-active]:text-white" :class="$route.path === '/map' ? 'text-white' : 'text-white/60 group-hover:text-white'">Map</span>
          </router-link>
          
          <!-- Center action button - Report -->
          <button 
            @click="$emit('create')"
            class="relative -mt-8 flex flex-col items-center gap-1 group"
          >
            <div class="relative">
              <!-- Outer glow ring -->
              <div class="absolute inset-0 bg-[#7B3FF2]/40 rounded-full blur-xl scale-110" />
              
              <!-- Main button -->
              <div class="relative w-14 h-14 bg-gradient-to-br from-[#7B3FF2] to-[#6B2FD1] rounded-full shadow-2xl shadow-[#7B3FF2]/50 border-2 border-white/20 backdrop-blur-xl hover:scale-110 transition-all flex items-center justify-center group-hover:shadow-[#7B3FF2]/70">
                <!-- Inner glassmorphic layer -->
                <div class="absolute inset-1 bg-white/10 rounded-full" />
                
                <!-- Icon -->
                <svg class="w-6 h-6 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </div>
            </div>
            <span class="text-xs text-white/80 mt-1">Report</span>
          </button>
          
          <!-- Feed -->
          <router-link 
            to="/feed"
            class="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-all group"
            :class="{ 'is-active': $route.path === '/feed' }"
          >
            <svg class="w-6 h-6 transition-colors group-[.is-active]:text-[#7B3FF2]" :class="$route.path === '/feed' ? 'text-[#7B3FF2]' : 'text-white/60 group-hover:text-[#7B3FF2]'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
            </svg>
            <span class="text-xs transition-colors group-[.is-active]:text-white" :class="$route.path === '/feed' ? 'text-white' : 'text-white/60 group-hover:text-white'">Feed</span>
          </router-link>
          
          <!-- Profile -->
          <router-link 
            to="/profile"
            class="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-all group"
            :class="{ 'is-active': $route.path.startsWith('/profile') }"
          >
            <svg class="w-6 h-6 transition-colors group-[.is-active]:text-[#7B3FF2]" :class="$route.path.startsWith('/profile') ? 'text-[#7B3FF2]' : 'text-white/60 group-hover:text-[#7B3FF2]'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span class="text-xs transition-colors group-[.is-active]:text-white" :class="$route.path.startsWith('/profile') ? 'text-white' : 'text-white/60 group-hover:text-white'">Profile</span>
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
defineEmits(['create'])
</script>
