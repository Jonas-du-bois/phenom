<template>
  <AppLayout :show-tab-bar="false">
    <template #header>
      <PageHeader 
        title="Paramètres"
        show-back
      />
    </template>
    
    <div class="settings-page">
      <!-- Profile section -->
      <div class="px-4 py-6">
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
              <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-white">{{ user?.username }}</h2>
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
      </div>
      
      <!-- Settings sections -->
      <div class="divide-y divide-white/10">
        <!-- Account -->
        <div class="px-4 py-3">
          <h3 class="text-xs text-white/40 uppercase tracking-wider mb-3">Compte</h3>
          
          <div class="space-y-1">
            <button 
              @click="editUsername"
              class="w-full flex items-center justify-between py-3 text-white"
            >
              <span>Nom d'utilisateur</span>
              <div class="flex items-center gap-2 text-white/40">
                <span>{{ user?.username }}</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            
            <button 
              @click="editEmail"
              class="w-full flex items-center justify-between py-3 text-white"
            >
              <span>Email</span>
              <div class="flex items-center gap-2 text-white/40">
                <span>{{ user?.email }}</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            
            <button 
              @click="changePassword"
              class="w-full flex items-center justify-between py-3 text-white"
            >
              <span>Mot de passe</span>
              <svg class="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Notifications -->
        <div class="px-4 py-3">
          <h3 class="text-xs text-white/40 uppercase tracking-wider mb-3">Notifications</h3>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-white">Alertes à proximité</span>
              <BaseToggle v-model="settings.nearbyAlerts" @change="saveSettings" />
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-white">Commentaires</span>
              <BaseToggle v-model="settings.commentNotifications" @change="saveSettings" />
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-white">Nouvelles observations</span>
              <BaseToggle v-model="settings.newObservations" @change="saveSettings" />
            </div>
          </div>
        </div>
        
        <!-- Preferences -->
        <div class="px-4 py-3">
          <h3 class="text-xs text-white/40 uppercase tracking-wider mb-3">Préférences</h3>
          
          <div class="space-y-1">
            <button 
              @click="setAlertRadius"
              class="w-full flex items-center justify-between py-3 text-white"
            >
              <span>Rayon d'alerte</span>
              <div class="flex items-center gap-2 text-white/40">
                <span>{{ settings.alertRadius }}km</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
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
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>
        
        <!-- About -->
        <div class="px-4 py-3">
          <h3 class="text-xs text-white/40 uppercase tracking-wider mb-3">À propos</h3>
          
          <div class="space-y-1">
            <button class="w-full flex items-center justify-between py-3 text-white">
              <span>Version</span>
              <span class="text-white/40">1.0.0</span>
            </button>
            
            <a 
              href="/terms"
              class="w-full flex items-center justify-between py-3 text-white"
            >
              <span>Conditions d'utilisation</span>
              <svg class="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            
            <a 
              href="/privacy"
              class="w-full flex items-center justify-between py-3 text-white"
            >
              <span>Politique de confidentialité</span>
              <svg class="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
        
        <!-- Admin link -->
        <div v-if="isAdmin" class="px-4 py-3">
          <h3 class="text-xs text-white/40 uppercase tracking-wider mb-3">Administration</h3>
          
          <router-link 
            to="/admin"
            class="w-full flex items-center justify-between py-3 text-[#00F0FF]"
          >
            <span>Panneau d'administration</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>
        
        <!-- Logout -->
        <div class="px-4 py-6">
          <BaseButton 
            variant="danger"
            class="w-full"
            @click="handleLogout"
          >
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AppLayout } from '@/components/layout'
import { PageHeader } from '@/components/organisms'
import { BaseAvatar, BaseToggle, BaseButton } from '@/components/atoms'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

defineOptions({ name: 'SettingsPage' })

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

const { user } = storeToRefs(authStore)
const isAdmin = computed(() => user.value?.role === 'admin')

const avatarInput = ref(null)

const settings = reactive({
  nearbyAlerts: true,
  commentNotifications: true,
  newObservations: false,
  alertRadius: 50
})

onMounted(() => {
  loadSettings()
})

const loadSettings = () => {
  const saved = localStorage.getItem('phenom_settings')
  if (saved) {
    try {
      Object.assign(settings, JSON.parse(saved))
    } catch {}
  }
}

const saveSettings = () => {
  localStorage.setItem('phenom_settings', JSON.stringify(settings))
}

const changeAvatar = () => {
  avatarInput.value?.click()
}

const handleAvatarChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  
  try {
    await userStore.updateAvatar(file)
    // Refresh auth user data
    await authStore.fetchUser()
  } catch (error) {
    // Error handled by store
  }
}

const editUsername = () => {
  // TODO: Show edit username modal
}

const editEmail = () => {
  // TODO: Show edit email modal
}

const changePassword = () => {
  // TODO: Show change password modal
}

const setAlertRadius = () => {
  // TODO: Show radius picker modal
}

const setLanguage = () => {
  // TODO: Show language picker
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const confirmDeleteAccount = () => {
  if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
    // TODO: Delete account via API
  }
}
</script>
