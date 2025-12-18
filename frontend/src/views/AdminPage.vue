<template>
  <AppLayout :show-tab-bar="false">
    <template #header>
      <PageHeader 
        title="Administration"
        show-back
        back-to="/settings"
      />
    </template>
    
    <div class="admin-page">
      <!-- Stats cards -->
      <div class="grid grid-cols-2 gap-3 p-4">
        <div class="bg-[#12151C] rounded-xl p-4">
          <div class="text-2xl font-bold text-[#00F0FF]">{{ stats.users }}</div>
          <div class="text-xs text-white/40 uppercase tracking-wider mt-1">Utilisateurs</div>
        </div>
        <div class="bg-[#12151C] rounded-xl p-4">
          <div class="text-2xl font-bold text-[#00F0FF]">{{ stats.observations }}</div>
          <div class="text-xs text-white/40 uppercase tracking-wider mt-1">Observations</div>
        </div>
        <div class="bg-[#12151C] rounded-xl p-4">
          <div class="text-2xl font-bold text-white">{{ stats.todayObservations }}</div>
          <div class="text-xs text-white/40 uppercase tracking-wider mt-1">Aujourd'hui</div>
        </div>
        <div class="bg-[#12151C] rounded-xl p-4">
          <div class="text-2xl font-bold text-white">{{ stats.pendingReports }}</div>
          <div class="text-xs text-white/40 uppercase tracking-wider mt-1">Signalements</div>
        </div>
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
      <div class="p-4">
        <!-- Users tab -->
        <template v-if="activeTab === 'users'">
          <SearchBar
            v-model="userSearch"
            placeholder="Rechercher un utilisateur..."
            class="mb-4"
            @search="searchUsers"
          />
          
          <div v-if="loadingUsers" class="flex justify-center py-8">
            <LoadingSpinner />
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="user in users"
              :key="user._id || user.id"
              class="bg-[#12151C] rounded-xl p-4 flex items-center gap-3"
            >
              <BaseAvatar 
                :src="user.avatar || user.profileImage"
                :name="user.username"
                size="md"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-white font-medium truncate">{{ user.username }}</span>
                  <BaseBadge v-if="user.role === 'admin'" variant="cyan" size="sm">
                    Admin
                  </BaseBadge>
                </div>
                <p class="text-white/40 text-sm truncate">{{ user.email }}</p>
              </div>
              <IconButton 
                variant="ghost" 
                size="sm"
                aria-label="Options utilisateur"
                @click="openUserMenu(user)"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </IconButton>
            </div>
          </div>
        </template>
        
        <!-- Observations tab -->
        <template v-else-if="activeTab === 'observations'">
          <div class="flex gap-2 mb-4">
            <FilterChip
              label="Tous"
              :selected="obsFilter === 'all'"
              @click="obsFilter = 'all'"
            />
            <FilterChip
              label="Non vérifiées"
              :selected="obsFilter === 'unverified'"
              @click="obsFilter = 'unverified'"
            />
            <FilterChip
              label="Signalées"
              :selected="obsFilter === 'reported'"
              @click="obsFilter = 'reported'"
            />
          </div>
          
          <div v-if="loadingObservations" class="flex justify-center py-8">
            <LoadingSpinner />
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="obs in adminObservations"
              :key="obs._id || obs.id"
              class="bg-[#12151C] rounded-xl overflow-hidden"
            >
              <div class="flex gap-3 p-3">
                <div class="w-16 h-16 rounded-lg overflow-hidden bg-white/5 shrink-0">
                  <img 
                    v-if="obs.imageUrl"
                    :src="obs.imageUrl"
                    alt=""
                    class="w-full h-full object-cover"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-white font-medium truncate">{{ obs.title }}</h3>
                  <p class="text-white/40 text-sm">{{ obs.user?.username }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <BaseBadge v-if="obs.verified" variant="success" size="sm">Vérifié</BaseBadge>
                    <BaseBadge v-else variant="warning" size="sm">En attente</BaseBadge>
                  </div>
                </div>
              </div>
              
              <div class="flex border-t border-white/5">
                <button 
                  @click="viewObservation(obs)"
                  class="flex-1 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5"
                >
                  Voir
                </button>
                <button 
                  v-if="!obs.verified"
                  @click="verifyObservation(obs)"
                  class="flex-1 py-2 text-sm text-[#00F0FF] hover:bg-[#00F0FF]/10"
                >
                  Vérifier
                </button>
                <button 
                  @click="deleteObservation(obs)"
                  class="flex-1 py-2 text-sm text-red-400 hover:bg-red-400/10"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </template>
        
        <!-- Reports tab -->
        <template v-else-if="activeTab === 'reports'">
          <div v-if="loadingReports" class="flex justify-center py-8">
            <LoadingSpinner />
          </div>
          
          <EmptyState
            v-else-if="!reports.length"
            icon="flag"
            title="Aucun signalement"
            description="Tous les signalements ont été traités."
          />
          
          <div v-else class="space-y-3">
            <div 
              v-for="report in reports"
              :key="report._id || report.id"
              class="bg-[#12151C] rounded-xl p-4"
            >
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-white">{{ report.reason }}</p>
                  <p class="text-white/40 text-sm mt-1">
                    Par {{ report.reporter?.username }} • {{ formatDate(report.createdAt) }}
                  </p>
                </div>
              </div>
              
              <div class="flex gap-2 mt-3">
                <BaseButton 
                  variant="secondary" 
                  size="sm"
                  class="flex-1"
                  @click="dismissReport(report)"
                >
                  Ignorer
                </BaseButton>
                <BaseButton 
                  variant="danger" 
                  size="sm"
                  class="flex-1"
                  @click="takeAction(report)"
                >
                  Agir
                </BaseButton>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { AppLayout } from '@/components/layout'
import { PageHeader, SearchBar } from '@/components/organisms'
import { IconButton, BaseButton, BaseBadge, BaseAvatar, LoadingSpinner, EmptyState } from '@/components/atoms'
import { FilterChip } from '@/components/molecules'
import { useAdminStore } from '@/stores/admin'
import { useObservationStore } from '@/stores/observation'
import { storeToRefs } from 'pinia'

defineOptions({ name: 'AdminPage' })

const router = useRouter()
const adminStore = useAdminStore()
const observationStore = useObservationStore()

const { stats, users, reports } = storeToRefs(adminStore)
const { observations: adminObservations } = storeToRefs(observationStore)

const activeTab = ref('users')
const tabs = [
  { id: 'users', label: 'Utilisateurs' },
  { id: 'observations', label: 'Observations' },
  { id: 'reports', label: 'Signalements' }
]

const userSearch = ref('')
const loadingUsers = ref(false)

const obsFilter = ref('all')
const loadingObservations = ref(false)

const loadingReports = ref(false)

onMounted(async () => {
  await adminStore.fetchStats()
  await fetchUsers()
})

watch(activeTab, (tab) => {
  if (tab === 'users' && !users.value.length) fetchUsers()
  if (tab === 'observations' && !adminObservations.value.length) fetchObservations()
  if (tab === 'reports' && !reports.value.length) fetchReports()
})

watch(obsFilter, () => {
  fetchObservations()
})

const fetchUsers = async () => {
  loadingUsers.value = true
  try {
    await adminStore.fetchUsers({ search: userSearch.value })
  } finally {
    loadingUsers.value = false
  }
}

const searchUsers = () => {
  fetchUsers()
}

const fetchObservations = async () => {
  loadingObservations.value = true
  try {
    const params = {}
    if (obsFilter.value === 'unverified') params.verified = false
    if (obsFilter.value === 'reported') params.reported = true
    
    await observationStore.fetchObservations(params)
  } finally {
    loadingObservations.value = false
  }
}

const fetchReports = async () => {
  loadingReports.value = true
  try {
    await adminStore.fetchReports()
  } finally {
    loadingReports.value = false
  }
}

const openUserMenu = (user) => {
  // TODO: Show user action menu
}

const viewObservation = (obs) => {
  router.push(`/observation/${obs._id || obs.id}`)
}

const verifyObservation = async (obs) => {
  try {
    await adminStore.verifyObservation(obs._id || obs.id)
    obs.verified = true
  } catch (error) {
    // Error handled by store
  }
}

const deleteObservation = async (obs) => {
  if (!confirm('Supprimer cette observation ?')) return
  
  try {
    await observationStore.deleteObservation(obs._id || obs.id)
  } catch (error) {
    // Error handled by store
  }
}

const dismissReport = async (report) => {
  try {
    await adminStore.dismissReport(report._id || report.id)
  } catch (error) {
    // Error handled by store
  }
}

const takeAction = (report) => {
  // TODO: Show action menu for report
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR')
}
</script>
