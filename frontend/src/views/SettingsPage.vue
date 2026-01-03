<!--
  ============================================================================
  SettingsPage.vue - User Settings and Preferences Page
  ============================================================================
  
  PURPOSE:
  Allows users to manage their profile, preferences, and account settings.
  Includes avatar upload, notification settings, and admin access.

  FEATURES:
  - Profile editing (username, bio, location)
  - Avatar upload and cropping
  - Email and password change
  - Push notification settings
  - Location permission management
  - Cache management
  - Admin panel access (admin users only)
  - Account deletion
  - Logout functionality

  ROUTE: /settings (requires auth)
  ============================================================================
-->

<template>
  <AppLayout :show-tab-bar="true">
    <template #header>
      <PageHeader title="Paramètres" show-back />
    </template>

    <div class="settings-page">
      <!-- Profile section -->
      <div class="px-4 py-6 mt-16">
        <div class="flex items-center gap-4">
          <div class="relative">
            <BaseAvatar
              :src="user?.avatar?.url || user?.profileImage"
              :name="user?.username"
              size="lg"
            />
            <button
              @click="changeAvatar"
              class="absolute -bottom-1 -right-1 w-8 h-8 bg-[#00F0FF] rounded-full flex items-center justify-center"
            >
              <svg
                class="w-4 h-4 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-white">
              {{ user?.username }}
            </h2>
            <p class="text-white/60 text-sm">{{ user?.email }}</p>
          </div>
        </div>

        <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleAvatarChange"
        />
        <AvatarCropModal
          v-if="showAvatarModal"
          :file="selectedAvatarFile"
          @confirm="onAvatarConfirm"
          @cancel="onAvatarCancel"
        />
        <EditProfileModal
          v-if="showEditProfileModal"
          :name="user?.username"
          :bio="user?.bio"
          @confirm="onEditProfileConfirm"
          @cancel="onEditProfileCancel"
        />

        <ChangePasswordModal
          v-if="showChangePasswordModal"
          @confirm="onChangePasswordConfirm"
          @cancel="onChangePasswordCancel"
        />
        <AlertRadiusModal
          v-if="showAlertRadiusModal"
          :value="settings.alertRadius"
          :min="1"
          :max="200"
          @update:value="(v) => (settings.alertRadius = v)"
          @confirm="onAlertRadiusConfirm"
          @cancel="onAlertRadiusCancel"
        />
        <!-- Pending cropped preview -->
        <div v-if="pendingCropped" class="mt-4 flex items-center gap-4">
          <div
            class="w-20 h-20 rounded-full overflow-hidden border border-white/10"
          >
            <img
              :src="pendingCropped.previewUrl"
              alt="Aperçu avatar"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="flex gap-2">
            <BaseButton variant="primary" @click="uploadPendingAvatar"
              >Confirmer</BaseButton
            >
            <BaseButton variant="ghost" @click="cancelPendingAvatar"
              >Annuler</BaseButton
            >
          </div>
        </div>
      </div>

      <!-- Settings sections -->
      <div class="divide-y divide-white/10">
        <!-- installing button-->
        <!-- Bouton d'installation PWA (visible uniquement sur cette page) -->
        <div class="px-4 py-3">
          <button
            v-if="showInstallButton"
            type="button"
            class="w-full text-left text-white bg-gradient-to-r from-[#00F0FF] to-[#0066FF] rounded-md shadow-md px-4 py-3 flex items-center"
            @click="promptInstall"
            aria-label="Installer l'application"
          >
            <svg
              class="w-4 h-4 mr-3 text-white animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span class="font-medium">Installer l'application</span>
          </button>
        </div>
        <!-- Account -->
        <div class="px-4 py-3">
          <h3 class="text-xs text-white/40 uppercase tracking-wider mb-3">
            Compte
          </h3>

          <div class="space-y-1">
            <button
              @click="editUsername"
              class="w-full flex items-center justify-between py-3 text-white"
            >
              <span>Nom d'utilisateur</span>
              <div class="flex items-center gap-2 text-white/40">
                <span>{{ user?.username }}</span>
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>

            <span>Email</span>
            <div class="flex items-center gap-2 text-white/40">
              <span class="flex text">{{ user?.email }}</span>
            </div>

            <button
              @click="changePassword"
              class="w-full flex items-center justify-between py-3 text-white"
            >
              <span>Mot de passe</span>
              <svg
                class="w-5 h-5 text-white/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Notifications -->
        <div class="px-4 py-3">
          <h3 class="text-xs text-white/40 uppercase tracking-wider mb-3">
            Notifications
          </h3>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-white">Alertes à proximité</span>
              <BaseToggle
                v-model="settings.nearbyAlerts"
                @change="saveSettings"
              />
            </div>

            <div class="flex items-center justify-between">
              <span class="text-white">Commentaires</span>
              <BaseToggle
                v-model="settings.commentNotifications"
                @change="saveSettings"
              />
            </div>

            <div class="flex items-center justify-between">
              <span class="text-white">Nouvelles observations</span>
              <BaseToggle
                v-model="settings.newObservations"
                @change="saveSettings"
              />
            </div>
          </div>
        </div>

        <!-- Push status -->
        <div class="px-4 py-3">
          <h3 class="text-xs text-white/40 uppercase tracking-wider mb-3">
            Notifications Push
          </h3>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-white">Statut abonnement</div>
                <div class="text-xs text-white/40">
                  {{ pushSubscription ? "Abonné" : "Non abonné" }}
                </div>
              </div>
              <div class="flex gap-2">
                <BaseButton
                  v-if="!pushSubscription"
                  size="sm"
                  @click="handleSubscribe"
                  >S'abonner</BaseButton
                >
                <BaseButton
                  v-else
                  variant="ghost"
                  size="sm"
                  @click="handleUnsubscribe"
                  >Se désabonner</BaseButton
                >
              </div>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <div class="text-white">Dernier check position</div>
                <div class="text-xs text-white/40">
                  {{ lastLocationCheckDisplay }}
                </div>
              </div>
              <div>
                <BaseButton
                  size="sm"
                  variant="ghost"
                  @click="refreshLastLocationCheck"
                  >Actualiser</BaseButton
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Preferences -->
        <div class="px-4 py-3">
          <h3 class="text-xs text-white/40 uppercase tracking-wider mb-3">
            Préférences
          </h3>

          <div class="space-y-1">
            <button
              @click="setAlertRadius"
              class="w-full flex items-center justify-between py-3 text-white"
            >
              <span>Rayon d'alerte</span>
              <div class="flex items-center gap-2 text-white/40">
                <span>{{ settings.alertRadius }}km</span>
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>

            <button
              @click="setLanguage"
              class="w-full flex items-center justify-between py-3 text-white"
            >
              <span>Langue</span>
              <div class="flex items-center gap-2 text-white/40">
                <span>Français</span>
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>

        <!-- About -->
        <div class="px-4 py-3">
          <h3 class="text-xs text-white/40 uppercase tracking-wider mb-3">
            À propos
          </h3>

          <div class="space-y-1">
            <button
              class="w-full flex items-center justify-between py-3 text-white"
            >
              <span>Version</span>
              <span class="text-white/40">1.0.0</span>
            </button>

            <a
              href="/terms"
              class="w-full flex items-center justify-between py-3 text-white"
            >
              <span>Conditions d'utilisation</span>
              <svg
                class="w-5 h-5 text-white/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>

            <a
              href="/privacy"
              class="w-full flex items-center justify-between py-3 text-white"
            >
              <span>Politique de confidentialité</span>
              <svg
                class="w-5 h-5 text-white/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>

        <!-- Admin link -->
        <div v-if="isAdmin" class="px-4 py-3">
          <h3 class="text-xs text-white/40 uppercase tracking-wider mb-3">
            Administration
          </h3>

          <router-link
            to="/admin"
            class="w-full flex items-center justify-between py-3 text-[#00F0FF]"
          >
            <span>Panneau d'administration</span>
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </router-link>
        </div>

        <!-- Logout -->
        <div class="px-4 py-6">
          <BaseButton variant="danger" class="w-full" @click="handleLogout">
            Se déconnecter
          </BaseButton>

          <button
            @click="confirmDeleteAccount"
            class="w-full mt-4 text-center text-red-400 text-sm"
          >
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { AppLayout } from "@/components/layout";
import { PageHeader } from "@/components/organisms";
import { BaseAvatar, BaseToggle, BaseButton } from "@/components/atoms";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import AvatarCropModal from "@/components/molecules/AvatarCropModal.vue";
import EditProfileModal from "@/components/molecules/EditProfileModal.vue";
import ChangePasswordModal from "@/components/molecules/ChangePasswordModal.vue";
import AlertRadiusModal from "@/components/molecules/AlertRadiusModal.vue";
import { deleteCroppedImage } from "@/utils/avatarCache";

defineOptions({ name: "SettingsPage" });

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();

const { user } = storeToRefs(authStore);
const isAdmin = computed(() => user.value?.role === "admin");

const avatarInput = ref(null);
const selectedAvatarFile = ref(null);
const showAvatarModal = ref(false);
const pendingCropped = ref(null); // { file, cacheKey, previewUrl }
const showEditProfileModal = ref(false);
const showChangePasswordModal = ref(false);
const showAlertRadiusModal = ref(false);

const settings = reactive({
  nearbyAlerts: true,
  commentNotifications: true,
  newObservations: false,
  alertRadius: 50,
});

onMounted(() => {
  loadSettings();
});

// Gestion du prompt d'installation PWA
const deferredPrompt = ref(null);
const showInstallButton = ref(false);

// Gestion du prompt d'installation PWA — écouteurs ajoutés au montage
const handleBeforeInstallPrompt = (e) => {
  e.preventDefault();
  deferredPrompt.value = e;
  showInstallButton.value = true;
};

const handleAppInstalled = () => {
  deferredPrompt.value = null;
  showInstallButton.value = false;
};

onMounted(() => {
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);
});

onUnmounted(() => {
  window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.removeEventListener("appinstalled", handleAppInstalled);
  deferredPrompt.value = null;
  showInstallButton.value = false;
});

async function promptInstall() {
  if (!deferredPrompt.value) return;
  try {
    deferredPrompt.value.prompt();
    const choiceResult = await deferredPrompt.value.userChoice;
    // Masquer le bouton après réponse
    showInstallButton.value = false;
    deferredPrompt.value = null;
    // Vous pouvez enregistrer analytics ici selon choiceResult.outcome
  } catch (err) {
    console.warn("Erreur pendant le prompt d'installation PWA", err);
  }
}

const loadSettings = () => {
  const saved = localStorage.getItem("phenom_settings");
  if (saved) {
    try {
      Object.assign(settings, JSON.parse(saved));
    } catch {}
  }
};

const saveSettings = () => {
  localStorage.setItem("phenom_settings", JSON.stringify(settings));
};

// Web Push subscription
const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC || "";

function urlBase64ToUint8Array(base64String) {
  try {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  } catch (e) {
    console.error("Invalid VAPID public key format", e, base64String);
    throw new Error("Invalid VAPID public key");
  }
}

async function subscribeToPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    alert("Push not supported by this browser");
    return null;
  }
  let effectiveVapid = VAPID_PUBLIC;
  if (
    !effectiveVapid ||
    typeof effectiveVapid !== "string" ||
    effectiveVapid.trim() === ""
  ) {
    // Try to fetch public key from backend at runtime (useful when app is deployed without rebuild)
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ""}/api/v1/push/public-key`
      );
      if (resp && resp.ok) {
        const json = await resp.json();
        effectiveVapid = json?.data?.publicKey || json?.publicKey || "";
      }
    } catch (e) {
      console.warn("Failed to fetch VAPID public key from backend", e);
    }
  }

  if (!effectiveVapid || effectiveVapid.trim() === "") {
    alert(
      "Clé VAPID publique manquante : configurez VITE_VAPID_PUBLIC ou définissez VAPID_PUBLIC_KEY côté serveur"
    );
    console.error(
      "VAPID public key is missing (frontend env and backend fallback empty)"
    );
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      alert("Notification permission denied");
      return null;
    }

    const swReg = await navigator.serviceWorker.ready;
    const sub = await swReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(effectiveVapid),
    });

    // send to backend
    const token = authStore.token;
    await fetch(
      `${import.meta.env.VITE_API_BASE_URL || ""}/api/v1/push/subscribe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ subscription: sub }),
      }
    );

    return sub;
  } catch (err) {
    console.error("Push subscribe error", err);
    return null;
  }
}

async function unsubscribeFromPush(subscription) {
  try {
    if (!subscription) return;
    const endpoint = subscription.endpoint;
    const token = authStore.token;
    await fetch(
      `${import.meta.env.VITE_API_BASE_URL || ""}/api/v1/push/unsubscribe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ endpoint }),
      }
    );
    await subscription.unsubscribe();
  } catch (err) {
    console.warn("Unsubscribe error", err);
  }
}

// Auto-subscribe when any notification toggle is set to true
watch(
  () => [settings.commentNotifications, settings.newObservations],
  async (vals, oldVals) => {
    const [comments, newObs] = vals;
    const any = comments || newObs;
    if (any) {
      // ensure subscription
      try {
        const swReg = await navigator.serviceWorker.ready;
        const existing = await swReg.pushManager.getSubscription();
        if (!existing) await subscribeToPush();
      } catch (e) {}
    }
  }
);

// Push subscription state + last location check
const pushSubscription = ref(null);
const lastLocationCheck = ref(null);

const lastLocationCheckDisplay = computed(() => {
  if (!lastLocationCheck.value) return "Jamais";
  try {
    const d = new Date(lastLocationCheck.value);
    return d.toLocaleString("fr-FR");
  } catch (e) {
    return lastLocationCheck.value;
  }
});

async function checkSubscription() {
  try {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      pushSubscription.value = null;
      return;
    }
    const swReg = await navigator.serviceWorker.ready;
    const existing = await swReg.pushManager.getSubscription();
    pushSubscription.value = existing;
  } catch (e) {
    pushSubscription.value = null;
  }
  // load last location check from localStorage
  try {
    lastLocationCheck.value = localStorage.getItem(
      "phenom_last_location_check"
    );
  } catch (e) {
    lastLocationCheck.value = null;
  }
}

async function handleSubscribe() {
  const s = await subscribeToPush();
  if (s) pushSubscription.value = s;
}

async function handleUnsubscribe() {
  try {
    const swReg = await navigator.serviceWorker.ready;
    const existing = await swReg.pushManager.getSubscription();
    if (existing) await unsubscribeFromPush(existing);
    pushSubscription.value = null;
  } catch (e) {
    console.warn("unsubscribe failed", e);
  }
}

function refreshLastLocationCheck() {
  try {
    lastLocationCheck.value = localStorage.getItem(
      "phenom_last_location_check"
    );
  } catch (e) {
    lastLocationCheck.value = null;
  }
}

onMounted(() => {
  // check current subscription & last check
  checkSubscription();
});

const changeAvatar = () => {
  avatarInput.value?.click();
};

const handleAvatarChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  selectedAvatarFile.value = file;
  showAvatarModal.value = true;
};

const onAvatarCancel = () => {
  showAvatarModal.value = false;
  selectedAvatarFile.value = null;
  if (avatarInput.value) avatarInput.value.value = null;
};

const onAvatarConfirm = async (payload) => {
  // payload is { file, cacheKey }
  const file = payload?.file || payload;
  const cacheKey = payload?.cacheKey;
  // keep the cropped result in a pending state so user can verify before upload
  const previewUrl = URL.createObjectURL(file);
  pendingCropped.value = { file, cacheKey, previewUrl };
  showAvatarModal.value = false;
  selectedAvatarFile.value = null;
};

const cancelPendingAvatar = async () => {
  if (!pendingCropped.value) return;
  try {
    if (pendingCropped.value.cacheKey)
      await deleteCroppedImage(pendingCropped.value.cacheKey);
  } catch {}
  URL.revokeObjectURL(pendingCropped.value.previewUrl);
  pendingCropped.value = null;
};

const uploadPendingAvatar = async () => {
  if (!pendingCropped.value) return;
  try {
    await userStore.updateAvatar(pendingCropped.value.file);
    await authStore.fetchUser();
    if (pendingCropped.value.cacheKey) {
      try {
        await deleteCroppedImage(pendingCropped.value.cacheKey);
      } catch {}
    }
  } catch (err) {
    // keep cached file for retry
  } finally {
    URL.revokeObjectURL(pendingCropped.value.previewUrl);
    pendingCropped.value = null;
    if (avatarInput.value) avatarInput.value.value = null;
  }
};

const editUsername = () => {
  showEditProfileModal.value = true;
};

const editEmail = () => {
  showEditProfileModal.value = true;
};

const changePassword = () => {
  showChangePasswordModal.value = true;
};

const onEditProfileConfirm = async (payload) => {
  try {
    await userStore.updateProfile(payload);
    await authStore.fetchUser();
    showEditProfileModal.value = false;
    alert("Profil mis à jour");
  } catch (err) {
    alert(err?.response?.data?.message || err?.message || "Erreur mise à jour");
  }
};

const onEditProfileCancel = () => {
  showEditProfileModal.value = false;
};

const onChangePasswordConfirm = async (payload) => {
  const { currentPassword, newPassword, confirmPassword } = payload || {};
  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("Tous les champs sont requis");
    return;
  }
  if (newPassword !== confirmPassword) {
    alert("Les mots de passe ne correspondent pas");
    return;
  }
  try {
    await userStore.changePassword({ currentPassword, newPassword });
    showChangePasswordModal.value = false;
    alert("Mot de passe changé");
  } catch (err) {
    alert(
      err?.response?.data?.message ||
        err?.message ||
        "Erreur changement mot de passe"
    );
  }
};

const onChangePasswordCancel = () => {
  showChangePasswordModal.value = false;
};

const setAlertRadius = () => {
  showAlertRadiusModal.value = true;
};

const onAlertRadiusConfirm = (value) => {
  settings.alertRadius = Number(value);
  saveSettings();
  showAlertRadiusModal.value = false;
};

const onAlertRadiusCancel = () => {
  showAlertRadiusModal.value = false;
};

const setLanguage = () => {
  // TODO: Show language picker
};

const handleLogout = async () => {
  await authStore.logout();
  router.push("/login");
};

const confirmDeleteAccount = () => {
  if (
    confirm(
      "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
    )
  ) {
    // TODO: Delete account via API
  }
};
</script>
