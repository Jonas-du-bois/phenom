<!-- Vue du feed social -->
<template>
  <div class="feed-view">
    <PageContainer>
      <div class="feed-posts">
        <FeedPost v-for="obs in observations" :key="obs.id" />
      </div>
    </PageContainer>
    <BottomNav />
  </div>
</template>

<script setup>
// Chargement des observations avec commentaires
// Infinite scroll
</script>

<style scoped>
/* Feed layout */
</style>
