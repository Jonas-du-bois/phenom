<script setup>
/**
 * ObservationCard - Carte d'observation pour le feed
 * Design System: Phenom Search
 */
import { computed, ref } from "vue";
import { getImageUrl } from "@/utils/imageHelpers";
import { useRouter } from "vue-router";
import BaseAvatar from "../atoms/BaseAvatar.vue";
import BaseBadge from "../atoms/BaseBadge.vue";
import CredibilityGauge from "../atoms/CredibilityGauge.vue";
import TextArea from "../atoms/TextArea.vue";
import BaseButton from "../atoms/BaseButton.vue";
import { useCommentStore } from "@/stores/comment";
import { useToast } from "@/composables/useToast";
import { formatRelativeTime } from "@/utils/formatters";

defineOptions({ name: "ObservationCard" });

const props = defineProps({
  observation: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["click", "comment", "share"]);

const router = useRouter();
const commentStore = useCommentStore();
const toast = useToast();

// État local
const showComments = ref(false);
const commentText = ref("");
const isSubmittingComment = ref(false);
const isLoadingComments = ref(false);
const comments = ref([]);
const localCommentCount = ref(0);

// Formater la date relative
const relativeDate = computed(() => {
  return formatRelativeTime(
    props.observation.createdAt || props.observation.date,
    true,
  );
});

// Extraire la ville depuis `observation.location` si `observation.city` absent
const city = computed(() => {
  // Priorité au champ `city` s'il existe
  if (props.observation.city) return props.observation.city;

  const loc = props.observation.location || '';
  if (!loc) return '';

  // Split par virgule et prendre la dernière partie non vide
  const parts = loc.split(',').map(p => p.trim()).filter(Boolean);
  let candidate = parts.length ? parts[parts.length - 1] : loc.trim();

  // Supprimer parenthèses éventuelles et trim
  candidate = candidate.replace(/\s*\(.*\)$/, '').trim();

  return candidate;
});

// Formater la durée
const formattedDuration = computed(() => {
  const seconds = props.observation.duration || 0;
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}min`;
});

// Image principale
const mainImage = computed(() => {
  const images = props.observation.images || [];
  if (images.length > 0) {
    const first = images[0];
    // Supporte string URL or object { url }
    return typeof first === "string" ? first : getImageUrl(first);
  }
  return null;
});

// Nom de l'utilisateur (API renvoie userId, pas user)
const userName = computed(() => {
  return (
    props.observation.userId?.name || props.observation.user?.name || "Anonyme"
  );
});

// Avatar de l'utilisateur (string URL)
const userAvatar = computed(() => {
  const a =
    props.observation.userId?.avatar || props.observation.user?.avatar || "";
  if (!a) return "";
  return typeof a === "string"
    ? a
    : getImageUrl(a, { width: 128, height: 128, crop: "fill" });
});

// Nombre de commentaires (API renvoie commentsCount ou comments array)
const commentCount = computed(() => {
  const base =
    props.observation.commentsCount ??
    props.observation.commentCount ??
    props.observation.comments?.length ??
    0;
  return base + localCommentCount.value;
});

// Gérer l'ouverture de la section commentaires
const toggleComments = async () => {
  showComments.value = !showComments.value;
  if (showComments.value && comments.value.length === 0) {
    await loadComments();
  }
};

const getUserAvatar = (user) => {
  const a = user?.avatar || "";
  if (!a) return "";
  return typeof a === "string"
    ? a
    : getImageUrl(a, { width: 64, height: 64, crop: "fill" });
};

// Charger les commentaires depuis l'API
const loadComments = async () => {
  isLoadingComments.value = true;
  try {
    await commentStore.fetchComments(props.observation._id);
    comments.value = commentStore.comments;
  } catch {
    toast.error("Erreur lors du chargement des commentaires");
  } finally {
    isLoadingComments.value = false;
  }
};

// Soumettre le commentaire
const submitComment = async () => {
  if (!commentText.value.trim() || isSubmittingComment.value) return;

  isSubmittingComment.value = true;
  try {
    const newComment = await commentStore.addComment(
      props.observation._id,
      commentText.value,
    );
    localCommentCount.value++;
    comments.value = commentStore.comments;
    /* if (newComment) {
      comments.value.unshift(newComment)
    } */
    commentText.value = "";
    toast.success("Commentaire envoyé");
  } catch {
    toast.error("Erreur lors de l'envoi");
  } finally {
    isSubmittingComment.value = false;
  }
};

// Gérer l'envoi avec Entrée
const handleCommentKeydown = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    submitComment();
  }
};

// Partager l'observation
const handleShare = async () => {
  const shareUrl = `${window.location.origin}/observation/${props.observation._id}`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: "Phenom Sight",
        text: props.observation.description,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Lien copié");
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      toast.error("Erreur lors du partage");
    }
  }
};

// Arrêter la propagation du clic
const stopPropagation = (e) => {
  e.stopPropagation();
};

// Rediriger vers la page de détail avec ancre commentaires
const goToComments = () => {
  router.push(`/observation/${props.observation._id}#comments`);
};
</script>

<template>
  <article
    class="bg-[#000000] border-b border-white/10 rounded-lg"
    @click="emit('click', observation)"
  >
    <!-- Header: Avatar + Nom + Localisation -->
    <div class="px-1 py-3">
  <div class="flex items-center gap-3">
    <!-- Avatar -->
    <BaseAvatar :src="userAvatar" :name="userName" size="sm" class="flex-shrink-0" />
    
    <!-- Info column -->
    <div class="flex-1 min-w-0">
      <!-- Name + verification badge (optionnel) -->
      <div class="flex items-center gap-1.5 mb-1">
        <h3 class="text-sm font-bold text-white truncate">
          {{ userName }}
        </h3>
      </div>
      
      <!-- Location + date en une ligne -->
      <p class="text-xs text-white/60 truncate leading-tight">
        <span class="text-white">{{ observation.country }}</span>
        <span class="text-white/30 mx-1.5">•</span>
        <span>{{ city }}</span>
        <span class="text-white/30 mx-1.5">•</span>
        <time>{{ relativeDate }}</time>
      </p>
    </div>
    
    <!-- Menu actions (optionnel) -->
    <!-- <button class="p-1.5 -mr-1.5 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0">
      <svg class="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
      </svg>
    </button> -->
  </div>
</div>


    <!-- Image -->
    <div
      v-if="mainImage"
      class="relative aspect-[4/3] bg-[#12151C] overflow-hidden rounded-lg"
    >
      <img
        :src="mainImage"
        :alt="observation.description"
        class="w-full h-full object-cover"
        loading="lazy"
      />

      <!-- Overlay gradient -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
      />

      <!-- Crédibilité en overlay -->
      <div class="absolute bottom-3 right-3">
        <CredibilityGauge
          :value="observation.credibility || 0"
          size="sm"
          :showLabel="false"
        />
      </div>
    </div>

    <!-- Placeholder si pas d'image -->
    <div
      v-else
      class="aspect-[4/3] bg-[#12151C] flex items-center justify-center"
    >
      <svg
        class="w-16 h-16 text-white/10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
      </svg>
    </div>

    <!-- Métadonnées -->
    <div class="px-4 py-3 space-y-3">
      <!-- Formes UFO (chips) -->
      <div v-if="observation.ufoShapes?.length" class="flex flex-wrap gap-2">
        <BaseBadge
          v-for="shape in observation.ufoShapes.slice(0, 3)"
          :key="shape"
          variant="cyan"
          size="sm"
        >
          {{ shape }}
        </BaseBadge>
        <BaseBadge
          v-if="observation.ufoShapes.length > 3"
          variant="default"
          size="sm"
        >
          +{{ observation.ufoShapes.length - 3 }}
        </BaseBadge>
      </div>

      <!-- Durée -->
      <div
        v-if="observation.duration"
        class="flex items-center gap-2 text-xs text-white/50"
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{{ formattedDuration }}</span>
      </div>

      <!-- Description (max 3 lignes) -->
      <p class="text-sm text-white/70 line-clamp-3">
        {{ observation.description }}
      </p>

      <!-- Compteur commentaires -->
      <button
        class="flex items-center gap-1 text-xs text-white/40 hover:text-[#00F0FF] transition-colors relative"
        @click.stop="toggleComments"
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        <span
          >{{ commentCount }} commentaire{{ commentCount > 1 ? "s" : "" }}</span
        >
        <svg
          class="w-3 h-3 transition-transform"
          :class="{ 'rotate-180': showComments }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Section commentaires -->
      <Transition name="slide">
        <div
          v-if="showComments"
          class="mt-3 space-y-3"
          @click="stopPropagation"
        >
          <!-- Loading -->
          <div v-if="isLoadingComments" class="flex justify-center py-4">
            <div
              class="w-5 h-5 border-2 border-[#00F0FF]/30 border-t-[#00F0FF] rounded-full animate-spin"
            ></div>
          </div>

          <!-- Liste des commentaires, max 7 -->
          <div
            v-else-if="comments.length > 0"
            class="space-y-3 max-h-60 overflow-y-auto"
          >
            <div
              v-for="comment in comments"
              :key="comment._id"
              class="flex gap-2 p-2 bg-white/5 rounded-lg"
            >
              <BaseAvatar
                :src="getUserAvatar(comment.userId)"
                :name="comment.userId?.name || 'Anonyme'"
                size="xs"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-medium text-white truncate">
                    {{ comment.userId?.name || "Anonyme" }}
                  </span>
                  <span class="text-xs text-white/40">{{
                    formatRelativeTime(comment.createdAt, true)
                  }}</span>
                </div>
                <p class="text-sm text-white/70 mt-1">{{ comment.text }}</p>
              </div>
            </div>
          </div>

          <!-- Aucun commentaire -->
          <p v-else class="text-center text-sm text-white/40 py-3">
            Aucun commentaire pour l'instant
          </p>

          <!-- Formulaire d'ajout -->
          <div class="pt-2 border-t border-white/10 space-y-2">
            <TextArea
              v-model="commentText"
              @keydown="handleCommentKeydown"
              @click="stopPropagation"
              placeholder="Ajouter un commentaire..."
              :rows="2"
            />
            <div class="flex gap-2 justify-end">
              <BaseButton
                variant="primary"
                size="sm"
                :disabled="!commentText.trim() || isSubmittingComment"
                :loading="isSubmittingComment"
                @click.stop="submitComment"
              >
                {{ isSubmittingComment ? "Envoi..." : "Envoyer" }}
              </BaseButton>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Actions Bar -->
    <div
      class="flex items-center justify-around px-4 py-3 border-t border-white/5"
    >
      <!-- Commenter -->
      <button
        class="flex items-center gap-2 px-4 py-2 text-white/50 hover:text-[#00F0FF] transition-colors touch-target"
        @click.stop="goToComments"
      >
        <svg
          class="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        <span class="text-xs uppercase tracking-wider">Commenter</span>
      </button>

      <!-- Partager -->
      <button
        class="flex items-center gap-2 px-4 py-2 text-white/50 hover:text-[#00F0FF] transition-colors touch-target relative group"
        @click.stop="handleShare"
      >
        <svg
          class="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        <span class="text-xs uppercase tracking-wider">Partager</span>
      </button>
    </div>
  </article>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>
