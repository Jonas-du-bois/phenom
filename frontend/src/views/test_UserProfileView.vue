<template>
  <div class="profile-view">
    <div v-if="loading" class="loading-container">
      <test-BaseLoading size="lg" text="Chargement du profil..." />
    </div>

  <PageContainer :maxWidth="1100">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="header-background"></div>
        <div class="header-content">
          <test-BaseAvatar
            :src="profileUser.avatar"
            :name="profileUser.name || 'Utilisateur'"
            size="xl"
            class="profile-avatar"
          />
          <h1 class="profile-name">{{ profileUser.name || "Utilisateur" }}</h1>
          <p v-if="profileUser.email" class="profile-email">
            {{ profileUser.email }}
          </p>

          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-value">{{ userStats.observationsCount }}</span>
              <span class="stat-label">Observations</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ userStats.commentsCount }}</span>
              <span class="stat-label">Commentaires</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ memberSince }}</span>
              <span class="stat-label">Membre depuis</span>
            </div>
          </div>

          <test-BaseButton
            v-if="isOwnProfile"
            variant="outline"
            @click="showSettings = true"
          >
            <template #icon-left>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </template>
            Paramètres
          </test-BaseButton>
        </div>
      </div>

      <!-- Tabs -->
      <div class="profile-tabs">
        <button
          :class="['tab-btn', { active: activeTab === 'observations' }]"
          @click="activeTab = 'observations'"
        >
          Observations
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Observations Tab -->
        <div v-show="activeTab === 'observations'" class="observations-grid">
          <div v-if="userObservations.length === 0" class="empty-state">
            <span class="empty-icon">🛸</span>
            <h3>Aucune observation</h3>
            <p v-if="isOwnProfile">Créez votre première observation !</p>
            <test-BaseButton
              v-if="isOwnProfile"
              @click="router.push('/create')"
            >
              Créer une observation
            </test-BaseButton>
          </div>

          <test-BaseCard
            v-for="obs in userObservations"
            :key="obs._id"
            :image="getFirstImage(obs)"
            :title="obs.title"
            :subtitle="getObservationTypeLabel(obs.type)"
            variant="elevated"
            clickable
            @click="router.push(`/observations/${obs._id}`)"
          >
            <p class="observation-description">
              {{ truncateText(obs.description, 100) }}
            </p>

            <template #footer>
              <div class="observation-footer">
                <span class="footer-date">{{ formatDate(obs.createdAt) }}</span>
                <div class="footer-stats">
                  <span class="stat">💬 {{ obs.comments?.length || 0 }}</span>
                </div>
              </div>
            </template>
          </test-BaseCard>
        </div>
      </div>
  </PageContainer>

    <!-- Settings Modal -->
    <test-BaseModal
      v-model="showSettings"
      title="Paramètres du compte"
      size="md"
    >
      <div class="settings-content">
        <div class="setting-section">
          <h3 class="section-title">Photo de profil</h3>
          
          <div class="avatar-upload-section">
            <test-BaseAvatar
              :src="profileUser.avatar"
              :name="profileUser.name || 'U'"
              size="xl"
            />
            <div class="avatar-actions">
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                hidden
                @change="handleAvatarChange"
              />
              <test-BaseButton
                variant="outline"
                size="sm"
                @click="$refs.avatarInput.click()"
                :loading="uploadingAvatar"
              >
                Changer la photo
              </test-BaseButton>
            </div>
          </div>
        </div>

        <div class="setting-section">
          <h3 class="section-title">Informations personnelles</h3>

          <test-BaseInput
            v-model="settingsForm.name"
            label="Nom"
            placeholder="Votre nom"
          />

          <test-BaseInput
            v-model="settingsForm.email"
            label="Email"
            type="email"
            placeholder="votre@email.com"
            disabled
            helper="L'email ne peut pas être modifié"
          />
        </div>

        <div class="setting-section">
          <h3 class="section-title">Sécurité</h3>

          <test-BaseButton
            variant="outline"
            fullWidth
            @click="showChangePassword = true"
          >
            Changer le mot de passe
          </test-BaseButton>
        </div>

        <div class="setting-section danger-zone">
          <h3 class="section-title">Zone de danger</h3>

          <test-BaseButton variant="danger" fullWidth @click="handleLogout">
            Se déconnecter
          </test-BaseButton>
        </div>
      </div>

      <template #footer>
        <div class="modal-actions">
          <test-BaseButton variant="outline" @click="showSettings = false">
            Annuler
          </test-BaseButton>
          <test-BaseButton :loading="savingSettings" @click="saveSettings">
            Enregistrer
          </test-BaseButton>
        </div>
      </template>
    </test-BaseModal>

    <!-- Change Password Modal -->
    <test-BaseModal
      v-model="showChangePassword"
      title="Changer le mot de passe"
      size="sm"
    >
      <test-BaseInput
        v-model="passwordForm.current"
        label="Mot de passe actuel"
        type="password"
        :error="passwordErrors.current"
      />

      <test-BaseInput
        v-model="passwordForm.new"
        label="Nouveau mot de passe"
        type="password"
        :error="passwordErrors.new"
      />

      <test-BaseInput
        v-model="passwordForm.confirm"
        label="Confirmer le mot de passe"
        type="password"
        :error="passwordErrors.confirm"
      />

      <template #footer>
        <div class="modal-actions">
          <test-BaseButton
            variant="outline"
            @click="showChangePassword = false"
          >
            Annuler
          </test-BaseButton>
          <test-BaseButton :loading="changingPassword" @click="changePassword">
            Changer
          </test-BaseButton>
        </div>
      </template>
    </test-BaseModal>
  </div>
</template>

<script setup>
import PageContainer from "../components/PageContainer.vue";
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { observationService } from "../services/observationService";
import { userService } from "../services/userService";
import { OBSERVATION_TYPES } from "../constants/observationTypes";
import TestBaseLoading from "../components/test_BaseLoading.vue";
import TestBaseButton from "../components/test_BaseButton.vue";
import TestBaseAvatar from "../components/test_BaseAvatar.vue";
import TestBaseCard from "../components/test_BaseCard.vue";
import TestBaseModal from "../components/test_BaseModal.vue";
import TestBaseInput from "../components/test_BaseInput.vue";

const router = useRouter();
const route = useRoute();
const { user: currentUser, logout } = useAuth();

const loading = ref(true);
const profileUser = ref({});
const userObservations = ref([]);
const activeTab = ref("observations");
const showSettings = ref(false);
const showChangePassword = ref(false);
const savingSettings = ref(false);
const changingPassword = ref(false);
const uploadingAvatar = ref(false);
const avatarInput = ref(null);

const settingsForm = ref({
  name: "",
  email: "",
});

const passwordForm = ref({
  current: "",
  new: "",
  confirm: "",
});

const passwordErrors = ref({});

const isOwnProfile = computed(() => {
  return !route.params.userId || route.params.userId === currentUser.value?._id;
});

// Statistiques de l'utilisateur
const userStats = ref({
  observationsCount: 0,
  commentsCount: 0
});

const memberSince = computed(() => {
  if (!profileUser.value.createdAt) return "N/A";
  const date = new Date(profileUser.value.createdAt);
  return date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
});

onMounted(async () => {
  await loadProfile();
});

const loadProfile = async () => {
  loading.value = true;

  try {
    // Load user profile
    if (isOwnProfile.value) {
      profileUser.value = currentUser.value;
      settingsForm.value.name = currentUser.value.name;
      settingsForm.value.email = currentUser.value.email;

      // Charger les statistiques de l'utilisateur connecté
      const statsResponse = await userService.getUserStats();
      userStats.value = statsResponse.data;
    } else {
      const userResponse = await userService.getById(route.params.userId);
      profileUser.value = userResponse.data;
    }

    // Load user observations
    const obsResponse = await observationService.getAll({
      userId: isOwnProfile.value ? currentUser.value._id : route.params.userId,
      limit: 100,
    });
    userObservations.value = obsResponse.data || [];

    // Pour les autres utilisateurs, compter manuellement
    if (!isOwnProfile.value) {
      userStats.value.observationsCount = userObservations.value.length;
      // Pour les commentaires, on n'a pas l'info pour les autres utilisateurs
      userStats.value.commentsCount = 0;
    }
  } catch (error) {
    console.error("Erreur chargement profil:", error);
  } finally {
    loading.value = false;
  }
};

const getFirstImage = (observation) => {
  return observation.images?.[0]?.url || null;
};

const getObservationTypeLabel = (type) => {
  const found = OBSERVATION_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
};

const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const saveSettings = async () => {
  savingSettings.value = true;

  try {
    await userService.updateMe({
      name: settingsForm.value.name,
    });

    // Update local user
    currentUser.value.name = settingsForm.value.name;
    profileUser.value.name = settingsForm.value.name;

    showSettings.value = false;
  } catch (error) {
    console.error("Erreur sauvegarde paramètres:", error);
  } finally {
    savingSettings.value = false;
  }
};

const changePassword = async () => {
  passwordErrors.value = {};

  if (!passwordForm.value.current) {
    passwordErrors.value.current = "Requis";
    return;
  }

  if (!passwordForm.value.new || passwordForm.value.new.length < 6) {
    passwordErrors.value.new = "Minimum 6 caractères";
    return;
  }

  if (passwordForm.value.new !== passwordForm.value.confirm) {
    passwordErrors.value.confirm = "Les mots de passe ne correspondent pas";
    return;
  }

  changingPassword.value = true;

  try {
    await userService.changePassword({
      currentPassword: passwordForm.value.current,
      newPassword: passwordForm.value.new,
    });

    passwordForm.value = { current: "", new: "", confirm: "" };
    showChangePassword.value = false;
    alert("Mot de passe changé avec succès");
  } catch (error) {
    console.error("Erreur changement mot de passe:", error);
    passwordErrors.value.current = "Mot de passe incorrect";
  } finally {
    changingPassword.value = false;
  }
};

const handleLogout = async () => {
  if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
    await logout();
    router.push("/auth");
  }
};

const handleAvatarChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Vérifier le type de fichier
  if (!file.type.startsWith('image/')) {
    alert('Veuillez sélectionner une image');
    return;
  }

  // Vérifier la taille (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('L\'image est trop volumineuse (max 5MB)');
    return;
  }

  uploadingAvatar.value = true;

  try {
    const response = await userService.updateAvatar(file);
    
    // Mettre à jour l'avatar localement
    if (response.data?.avatar) {
      currentUser.value.avatar = response.data.avatar;
      profileUser.value.avatar = response.data.avatar;
      
      // Mettre à jour dans localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.avatar = response.data.avatar;
      localStorage.setItem('user', JSON.stringify(storedUser));
    }
  } catch (error) {
    console.error('Erreur upload avatar:', error);
    alert('Erreur lors du changement de photo');
  } finally {
    uploadingAvatar.value = false;
    // Reset input
    if (avatarInput.value) {
      avatarInput.value.value = '';
    }
  }
};
</script>

<style scoped>
  .profile-view {
  min-height: 100vh;
  background: var(--phenom-bg-primary);
}

.loading-container {
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-container {
  position: relative;
  max-width: 1100px;
  margin: 2rem auto;
  padding: var(--phenom-space-4);
  background: var(--phenom-surface-glass-base);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--phenom-border-medium);
  border-radius: var(--phenom-radius-2xl);
  box-shadow: var(--phenom-shadow-lg);
}

.profile-header {
  position: relative;
  background: transparent;
  margin-bottom: 1rem;
  border-radius: calc(var(--phenom-radius-2xl) - 4px);
  overflow: hidden;
}

.header-background {
  height: 150px;
  background: linear-gradient(135deg, var(--phenom-primary) 0%, var(--phenom-primary-dark) 100%);
}

@media (min-width: 768px) {
  .header-background {
    height: 200px;
  }
}

.header-content {
  position: relative;
  text-align: center;
  padding: 0 var(--phenom-space-4) var(--phenom-space-6);
}

.profile-avatar {
  margin-top: -4rem;
  margin-bottom: 1rem;
  border: 4px solid var(--phenom-surface-glass-base);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.profile-name {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--phenom-text-primary);
  margin: 0 0 0.25rem;
}

.profile-email {
  color: var(--phenom-text-secondary);
  font-size: 0.9375rem;
  margin: 0 0 1.5rem;
}

.profile-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: var(--phenom-surface-glass-strong);
  border-radius: var(--phenom-radius-lg);
  border: 1px solid var(--phenom-border-medium);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: 0.8125rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.profile-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0 var(--phenom-space-4);
  background: var(--phenom-surface-glass-base);
  border-bottom: 1px solid var(--phenom-border-medium);
  overflow-x: auto;
}

.tab-btn {
  flex-shrink: 0;
  padding: 1rem 1.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #667eea;
}

.tab-btn.active {
  color: #667eea;
}

.tab-btn.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.tab-content {
  padding: var(--phenom-space-4);
}

.observations-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .observations-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .observations-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
}

.empty-icon {
  font-size: 5rem;
  display: block;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 1.5rem;
}

.observation-description {
  color: #6b7280;
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0;
}

.observation-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.footer-date {
  font-size: 0.8125rem;
  color: #9ca3af;
}

.footer-stats {
  display: flex;
  gap: 0.75rem;
}

.stat {
  font-size: 0.8125rem;
  color: #6b7280;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.avatar-upload-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  background: var(--phenom-bg-secondary);
  border-radius: var(--phenom-radius-lg);
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-section.danger-zone {
  padding-top: 2rem;
  border-top: 2px solid #fee2e2;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--phenom-text-primary);
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .profile-stats {
    gap: 1rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }
}
</style>
