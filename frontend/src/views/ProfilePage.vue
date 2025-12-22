<template>
  <AppLayout :show-tab-bar="isOwnProfile">
    <template #header>
      <PageHeader
        :title="isOwnProfile ? 'Mon profil' : ''"
        :show-back="!isOwnProfile"
      >
        <template #right>
          <IconButton
            v-if="isOwnProfile"
            variant="ghost"
            size="sm"
            ariaLabel="Ouvrir les réglages"
            @click="$router.push('/settings')"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </IconButton>
        </template>
      </PageHeader>
    </template>

    <div class="profile-page">
      <!-- Loading -->
      <template v-if="loading">
        <div class="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </template>

      <!-- Error -->
      <template v-else-if="error">
        <div class="flex items-center justify-center py-12 px-4">
          <ErrorState
            :title="error"
            description="Impossible de charger le profil."
          />
        </div>
      </template>

      <!-- Profile content -->
      <template v-else-if="user">
        <!-- Profile header -->
        <div class="px-4 py-6 space-y-6">
          <!-- Avatar & Username -->
          <div class="flex flex-col items-center text-center">
            <BaseAvatar
              :src="user.avatar?.url || user.profileImage"
              :name="user.username"
              size="xl"
              class="mb-4"
            />
            <h1 class="text-xl font-bold text-white">{{ user.name }}</h1>
            <p v-if="user.bio" class="text-white/60 text-sm mt-2 max-w-sm">
              {{ user.bio }}
            </p>
            <p
              v-if="user.location"
              class="text-white/40 text-sm mt-2 flex items-center gap-1"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              {{ user.location }}
            </p>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4 py-4 border-y border-white/10">
            <div class="text-center">
              <div class="text-2xl font-bold text-white">
                {{ stats.observations }}
              </div>
              <div class="text-xs text-white/40 uppercase tracking-wider mt-1">
                Observations
              </div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-white">
                {{ stats.comments }}
              </div>
              <div class="text-xs text-white/40 uppercase tracking-wider mt-1">
                Commentaires
              </div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-[#00F0FF]">
                {{ averageCredibility }}
              </div>
              <div class="text-xs text-white/40 uppercase tracking-wider mt-1">
                Créd. moy.
              </div>
            </div>
          </div>

          <!-- Member since -->
          <div class="text-center text-xs text-white/30">
            Membre depuis {{ formatDate(user.createdAt) }}
          </div>

          <!-- Edit profile button (own profile only) -->
          <BaseButton
            v-if="isOwnProfile"
            variant="secondary"
            size="md"
            class="w-full"
            @click="$router.push('/settings')"
          >
            Modifier le profil
          </BaseButton>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-white/10">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="flex-1 py-3 text-sm font-medium transition-colors relative"
            :class="activeTab === tab.id ? 'text-[#00F0FF]' : 'text-white/40'"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
            <div
              v-if="activeTab === tab.id"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00F0FF]"
            />
          </button>
        </div>

        <!-- Tab content -->
        <div class="px-4 py-4">
          <!-- Observations grid -->
          <template v-if="activeTab === 'observations'">
            <div
              v-if="userObservationsList.length === 0"
              class="text-center py-8"
            >
              <EmptyState
                icon="camera"
                title="Aucune observation"
                :description="
                  isOwnProfile
                    ? 'Créez votre première observation !'
                    : 'Cet utilisateur n\'a pas encore d\'observations.'
                "
              >
                <template v-if="isOwnProfile" #action>
                  <BaseButton
                    variant="primary"
                    @click="$router.push('/camera')"
                  >
                    Créer une observation
                  </BaseButton>
                </template>
              </EmptyState>
            </div>

            <div v-else class="grid grid-cols-3 gap-1">
              <router-link
                v-for="obs in userObservationsList"
                :key="obs._id || obs.id"
                :to="`/observation/${obs._id || obs.id}`"
                class="aspect-square bg-[#12151C] overflow-hidden"
              >
                <img
                  v-if="obs?.images?.length || obs.image || obs.imageUrl"
                  :src="getObsImageUrl(obs)"
                  alt=""
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                >
                  <svg
                    class="w-8 h-8 text-white/10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </router-link>
            </div>
          </template>

          <!-- Map -->
          <template v-else-if="activeTab === 'map'">
            <div
              class="h-64 rounded-xl overflow-hidden relative z-0"
              :style="{
                marginBottom: 'calc(-4rem - env(safe-area-inset-bottom, 0px))',
                paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))',
              }"
            >
              <ObservationMap :observations="userObservationsList" :zoom="6" />
            </div>
          </template>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { AppLayout } from "@/components/layout";
import { PageHeader, ObservationMap } from "@/components/organisms";
import {
  IconButton,
  BaseButton,
  BaseAvatar,
  LoadingSpinner,
  ErrorState,
  EmptyState,
} from "@/components/atoms";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import { useObservationStore } from "@/stores/observation";
import { userService } from "@/services/userService";
import { getImageUrl } from "@/utils/imageHelpers";
import { storeToRefs } from "pinia";

defineOptions({ name: "ProfilePage" });

const route = useRoute();
const authStore = useAuthStore();
const userStore = useUserStore();
const observationStore = useObservationStore();

const { user: authUser } = storeToRefs(authStore);

// Liste locale d'observations pour la page profil (évite d'utiliser la liste globale)
const userObservationsList = ref([]);

const user = ref(null);
const stats = ref({ observations: 0, comments: 0 });
const loading = ref(true);
const error = ref("");
const activeTab = ref("observations");

const tabs = [
  { id: "observations", label: "Observations" },
  { id: "map", label: "Carte" },
];

const isOwnProfile = computed(() => {
  return !route.params.userId || route.params.userId === authUser.value?._id;
});

const averageCredibility = computed(() => {
  if (!userObservationsList.value.length) return "0";
  const sum = userObservationsList.value.reduce(
    (acc, o) => acc + (o.credibility || o.credibilityScore || 0),
    0,
  );
  return (sum / userObservationsList.value.length).toFixed(1);
});

const getObsImageUrl = (obs) => {
  // Try first image object, then fallbacks
  const imgObj = obs?.images?.[0] || obs?.image || obs?.imageUrl;
  return getImageUrl(imgObj);
};

onMounted(() => {
  fetchProfile();
});

watch(
  () => route.params.userId,
  () => {
    fetchProfile();
  },
);

const fetchProfile = async () => {
  loading.value = true;
  error.value = "";

  try {
    const userId = route.params.userId || authUser.value?._id;

    if (!userId) {
      error.value = "Utilisateur non trouvé";
      return;
    }

    // Fetch user profile
    if (isOwnProfile.value) {
      user.value = authUser.value;
    } else {
      const response = await userService.getById(userId);
      user.value = response.data || response;
    }

    // Fetch user observations via userService if it's the connected user
    if (isOwnProfile.value) {
      try {
        // Stats
        const statRes = await userService.getUserStats();
        const statData = statRes.data || statRes;
        stats.value.observations = statData.observationsCount || 0;
        stats.value.comments = statData.commentsCount || 0;

        // Observations (paginated)
        const res = await userService.getUserObservations({
          page: 1,
          limit: 50,
        });
        const obsData = res.data || res;
        userObservationsList.value = obsData.observations || obsData || [];
        // Fallback: if API returned array directly
        if (!userObservationsList.value.length && Array.isArray(res))
          userObservationsList.value = res;
      } catch (e) {
        userObservationsList.value = [];
        stats.value.observations = 0;
        stats.value.comments = 0;
      }
    } else {
      // For other users there is no public /users/:id/observations endpoint.
      // We attempt to fetch via the observation store if backend supports filtering by userId.
      try {
        await observationStore.fetchObservations({ limit: 50 });
        const id = userId;
        userObservationsList.value = observationStore.observations.filter(
          (o) => (o.user?._id || o.user?.id || o.user) === id,
        );
        stats.value.observations = userObservationsList.value.length;
      } catch (e) {
        userObservationsList.value = [];
        stats.value.observations = 0;
      }
    }
  } catch (err) {
    error.value = "Profil introuvable";
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
};
</script>
