<template>
  <div class="home-view min-h-screen p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold text-violet-mystique mb-4">
          🛸 Phenom API Testing Center
        </h1>
        <p class="text-xl text-gray-300 mb-2">
          Centre de test des endpoints API
        </p>
        <div class="flex justify-center gap-4 text-sm">
          <span class="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
            API: {{ apiUrl }}
          </span>
          <span 
            :class="[
              'px-3 py-1 rounded-full',
              healthStatus === 'ok' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            ]"
          >
            Status: {{ healthStatus || 'checking...' }}
          </span>
        </div>
      </div>

      <!-- Navigation rapide -->
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-8">
        <button
          v-for="section in sections"
          :key="section.id"
          @click="scrollToSection(section.id)"
          class="px-4 py-2 bg-violet-mystique/20 hover:bg-violet-mystique/40 text-violet-mystique rounded-lg transition-colors text-sm"
        >
          {{ section.icon }} {{ section.name }}
        </button>
      </div>

      <!-- Section: Santé & Stats -->
      <section id="health" class="api-section mb-8">
        <h2 class="section-title">🏥 Santé & Statistiques</h2>
        <div class="grid md:grid-cols-2 gap-4">
          <!-- Health Check -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Health Check</h3>
            <button @click="checkHealth" class="btn-primary mb-3">
              Vérifier la santé
            </button>
            <pre v-if="results.health" class="result-box">{{ JSON.stringify(results.health, null, 2) }}</pre>
          </div>

          <!-- Stats publiques -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Statistiques publiques</h3>
            <button @click="getPublicStats" class="btn-primary mb-3">
              Récupérer les stats
            </button>
            <pre v-if="results.publicStats" class="result-box">{{ JSON.stringify(results.publicStats, null, 2) }}</pre>
          </div>
        </div>
      </section>

      <!-- Section: Authentication -->
      <section id="auth" class="api-section mb-8">
        <h2 class="section-title">🔐 Authentication</h2>
        <div class="grid md:grid-cols-2 gap-4">
          <!-- Login -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Login</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model="authForms.login.email"
                type="email"
                placeholder="Email"
                class="input-field"
              />
              <input
                v-model="authForms.login.password"
                type="password"
                placeholder="Password"
                class="input-field"
              />
            </div>
            <button @click="testLogin" class="btn-primary mb-3">
              Se connecter
            </button>
            <pre v-if="results.login" class="result-box">{{ JSON.stringify(results.login, null, 2) }}</pre>
          </div>

          <!-- Register -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Register</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model="authForms.register.username"
                type="text"
                placeholder="Username"
                class="input-field"
              />
              <input
                v-model="authForms.register.email"
                type="email"
                placeholder="Email"
                class="input-field"
              />
              <input
                v-model="authForms.register.password"
                type="password"
                placeholder="Password"
                class="input-field"
              />
            </div>
            <button @click="testRegister" class="btn-primary mb-3">
              S'inscrire
            </button>
            <pre v-if="results.register" class="result-box">{{ JSON.stringify(results.register, null, 2) }}</pre>
          </div>

          <!-- Get Profile -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Profil utilisateur</h3>
            <button @click="getProfile" class="btn-primary mb-3">
              Récupérer le profil
            </button>
            <pre v-if="results.profile" class="result-box">{{ JSON.stringify(results.profile, null, 2) }}</pre>
          </div>

          <!-- Logout -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Logout</h3>
            <button @click="testLogout" class="btn-primary mb-3">
              Se déconnecter
            </button>
            <pre v-if="results.logout" class="result-box">{{ JSON.stringify(results.logout, null, 2) }}</pre>
          </div>
        </div>
      </section>

      <!-- Section: Users -->
      <section id="users" class="api-section mb-8">
        <h2 class="section-title">👤 Utilisateurs</h2>
        <div class="grid md:grid-cols-2 gap-4">
          <!-- Update Profile -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Mettre à jour le profil</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model="userForms.update.username"
                type="text"
                placeholder="Nouveau username"
                class="input-field"
              />
              <textarea
                v-model="userForms.update.bio"
                placeholder="Bio"
                class="input-field"
                rows="2"
              ></textarea>
            </div>
            <button @click="updateProfile" class="btn-primary mb-3">
              Mettre à jour
            </button>
            <pre v-if="results.updateProfile" class="result-box">{{ JSON.stringify(results.updateProfile, null, 2) }}</pre>
          </div>

          <!-- Change Password -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Changer le mot de passe</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model="userForms.password.currentPassword"
                type="password"
                placeholder="Ancien mot de passe"
                class="input-field"
              />
              <input
                v-model="userForms.password.newPassword"
                type="password"
                placeholder="Nouveau mot de passe"
                class="input-field"
              />
            </div>
            <button @click="changePassword" class="btn-primary mb-3">
              Changer le mot de passe
            </button>
            <pre v-if="results.changePassword" class="result-box">{{ JSON.stringify(results.changePassword, null, 2) }}</pre>
          </div>
        </div>
      </section>

      <!-- Section: Observations -->
      <section id="observations" class="api-section mb-8">
        <h2 class="section-title">🛸 Observations</h2>
        <div class="grid md:grid-cols-2 gap-4">
          <!-- Get All -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Lister les observations</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model.number="observationForms.list.limit"
                type="number"
                placeholder="Limit"
                class="input-field"
              />
              <input
                v-model.number="observationForms.list.page"
                type="number"
                placeholder="Page"
                class="input-field"
              />
            </div>
            <button @click="getObservations" class="btn-primary mb-3">
              Récupérer
            </button>
            <pre v-if="results.observations" class="result-box">{{ JSON.stringify(results.observations, null, 2) }}</pre>
          </div>

          <!-- Create Observation -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Créer une observation</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model="observationForms.create.title"
                type="text"
                placeholder="Titre"
                class="input-field"
              />
              <textarea
                v-model="observationForms.create.description"
                placeholder="Description"
                class="input-field"
                rows="2"
              ></textarea>
              <input
                v-model="observationForms.create.location"
                type="text"
                placeholder="Localisation"
                class="input-field"
              />
              <input
                v-model="observationForms.create.date"
                type="datetime-local"
                class="input-field"
              />
            </div>
            <button @click="createObservation" class="btn-primary mb-3">
              Créer
            </button>
            <pre v-if="results.createObservation" class="result-box">{{ JSON.stringify(results.createObservation, null, 2) }}</pre>
          </div>

          <!-- Get One -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Récupérer une observation</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model="observationForms.getOne.id"
                type="text"
                placeholder="ID de l'observation"
                class="input-field"
              />
            </div>
            <button @click="getOneObservation" class="btn-primary mb-3">
              Récupérer
            </button>
            <pre v-if="results.oneObservation" class="result-box">{{ JSON.stringify(results.oneObservation, null, 2) }}</pre>
          </div>

          <!-- Update Observation -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Modifier une observation</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model="observationForms.update.id"
                type="text"
                placeholder="ID de l'observation"
                class="input-field"
              />
              <input
                v-model="observationForms.update.title"
                type="text"
                placeholder="Nouveau titre"
                class="input-field"
              />
            </div>
            <button @click="updateObservation" class="btn-primary mb-3">
              Modifier
            </button>
            <pre v-if="results.updateObservation" class="result-box">{{ JSON.stringify(results.updateObservation, null, 2) }}</pre>
          </div>

          <!-- Delete Observation -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Supprimer une observation</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model="observationForms.delete.id"
                type="text"
                placeholder="ID de l'observation"
                class="input-field"
              />
            </div>
            <button @click="deleteObservation" class="btn-danger mb-3">
              Supprimer
            </button>
            <pre v-if="results.deleteObservation" class="result-box">{{ JSON.stringify(results.deleteObservation, null, 2) }}</pre>
          </div>
        </div>
      </section>

      <!-- Section: Comments -->
      <section id="comments" class="api-section mb-8">
        <h2 class="section-title">💬 Commentaires</h2>
        <div class="grid md:grid-cols-2 gap-4">
          <!-- Get Comments -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Lister les commentaires</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model="commentForms.list.observationId"
                type="text"
                placeholder="ID de l'observation"
                class="input-field"
              />
            </div>
            <button @click="getComments" class="btn-primary mb-3">
              Récupérer
            </button>
            <pre v-if="results.comments" class="result-box">{{ JSON.stringify(results.comments, null, 2) }}</pre>
          </div>

          <!-- Create Comment -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Créer un commentaire</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model="commentForms.create.observationId"
                type="text"
                placeholder="ID de l'observation"
                class="input-field"
              />
              <textarea
                v-model="commentForms.create.text"
                placeholder="Texte du commentaire"
                class="input-field"
                rows="3"
              ></textarea>
            </div>
            <button @click="createComment" class="btn-primary mb-3">
              Créer
            </button>
            <pre v-if="results.createComment" class="result-box">{{ JSON.stringify(results.createComment, null, 2) }}</pre>
          </div>

          <!-- Delete Comment -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Supprimer un commentaire</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model="commentForms.delete.id"
                type="text"
                placeholder="ID du commentaire"
                class="input-field"
              />
            </div>
            <button @click="deleteComment" class="btn-danger mb-3">
              Supprimer
            </button>
            <pre v-if="results.deleteComment" class="result-box">{{ JSON.stringify(results.deleteComment, null, 2) }}</pre>
          </div>
        </div>
      </section>

      <!-- Section: Images -->
      <section id="images" class="api-section mb-8">
        <h2 class="section-title">🖼️ Images</h2>
        <div class="grid md:grid-cols-2 gap-4">
          <!-- Upload Image -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Upload une image</h3>
            <div class="space-y-2 mb-3">
              <input
                type="file"
                @change="handleFileSelect"
                accept="image/*"
                class="input-field"
              />
            </div>
            <button @click="uploadImage" class="btn-primary mb-3" :disabled="!selectedFile">
              Upload
            </button>
            <pre v-if="results.uploadImage" class="result-box">{{ JSON.stringify(results.uploadImage, null, 2) }}</pre>
          </div>

          <!-- Get Image -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Récupérer une image</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model="imageForms.get.id"
                type="text"
                placeholder="ID de l'image"
                class="input-field"
              />
            </div>
            <button @click="getImage" class="btn-primary mb-3">
              Récupérer
            </button>
            <div v-if="results.imageUrl" class="mt-3">
              <img :src="results.imageUrl" alt="Image" class="max-w-full h-auto rounded" />
            </div>
          </div>

          <!-- Delete Image -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Supprimer une image</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model="imageForms.delete.id"
                type="text"
                placeholder="ID de l'image"
                class="input-field"
              />
            </div>
            <button @click="deleteImage" class="btn-danger mb-3">
              Supprimer
            </button>
            <pre v-if="results.deleteImage" class="result-box">{{ JSON.stringify(results.deleteImage, null, 2) }}</pre>
          </div>
        </div>
      </section>

      <!-- Section: Admin -->
      <section id="admin" class="api-section mb-8">
        <h2 class="section-title">👑 Administration</h2>
        <div class="grid md:grid-cols-2 gap-4">
          <!-- Admin Stats -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Statistiques admin</h3>
            <button @click="getAdminStats" class="btn-primary mb-3">
              Récupérer
            </button>
            <pre v-if="results.adminStats" class="result-box">{{ JSON.stringify(results.adminStats, null, 2) }}</pre>
          </div>

          <!-- Get All Users -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Liste des utilisateurs</h3>
            <button @click="getAllUsers" class="btn-primary mb-3">
              Récupérer
            </button>
            <pre v-if="results.allUsers" class="result-box">{{ JSON.stringify(results.allUsers, null, 2) }}</pre>
          </div>

          <!-- Get All Posts -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Liste des posts</h3>
            <div class="space-y-2 mb-3">
              <select v-model="adminForms.posts.status" class="input-field">
                <option value="">Tous</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvés</option>
                <option value="rejected">Rejetés</option>
              </select>
            </div>
            <button @click="getAllPosts" class="btn-primary mb-3">
              Récupérer
            </button>
            <pre v-if="results.allPosts" class="result-box">{{ JSON.stringify(results.allPosts, null, 2) }}</pre>
          </div>

          <!-- Approve Post -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Approuver un post</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model="adminForms.approve.id"
                type="text"
                placeholder="ID du post"
                class="input-field"
              />
            </div>
            <button @click="approvePost" class="btn-primary mb-3">
              Approuver
            </button>
            <pre v-if="results.approvePost" class="result-box">{{ JSON.stringify(results.approvePost, null, 2) }}</pre>
          </div>

          <!-- Reject Post -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Rejeter un post</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model="adminForms.reject.id"
                type="text"
                placeholder="ID du post"
                class="input-field"
              />
            </div>
            <button @click="rejectPost" class="btn-danger mb-3">
              Rejeter
            </button>
            <pre v-if="results.rejectPost" class="result-box">{{ JSON.stringify(results.rejectPost, null, 2) }}</pre>
          </div>
        </div>
      </section>

      <!-- Section: WebSocket -->
      <section id="websocket" class="api-section mb-8">
        <h2 class="section-title">🔌 WebSocket</h2>
        <div class="grid md:grid-cols-2 gap-4">
          <!-- Connect -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Connexion WebSocket</h3>
            <div class="flex gap-2 mb-3">
              <button 
                @click="connectWs" 
                class="btn-primary"
                :disabled="wsConnected"
              >
                Connecter
              </button>
              <button 
                @click="disconnectWs" 
                class="btn-danger"
                :disabled="!wsConnected"
              >
                Déconnecter
              </button>
            </div>
            <div class="mb-3">
              <span 
                :class="[
                  'px-3 py-1 rounded-full text-sm',
                  wsConnected 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                ]"
              >
                {{ wsConnected ? '🟢 Connecté' : '🔴 Déconnecté' }}
              </span>
            </div>
          </div>

          <!-- Messages -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Messages WebSocket ({{ wsMessages.length }})</h3>
            <button @click="clearWsMessages" class="btn-secondary mb-3">
              Effacer les messages
            </button>
            <div class="result-box max-h-96 overflow-y-auto">
              <div v-if="wsMessages.length === 0" class="text-gray-500">
                Aucun message reçu
              </div>
              <div v-for="(msg, index) in wsMessages" :key="index" class="mb-2 pb-2 border-b border-gray-700 last:border-0">
                <div class="text-xs text-gray-500 mb-1">{{ msg.timestamp }}</div>
                <pre class="text-sm">{{ JSON.stringify(msg, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: Documentation -->
      <section id="docs" class="api-section mb-8">
        <h2 class="section-title">📚 Documentation</h2>
        <div class="grid md:grid-cols-2 gap-4">
          <a
            href="/api-docs"
            target="_blank"
            class="api-card hover:bg-violet-mystique/10 transition-colors cursor-pointer"
          >
            <h3 class="text-lg font-semibold mb-2">📚 Documentation API</h3>
            <p class="text-gray-400">Page d'accueil de la documentation</p>
          </a>

          <a
            href="/api-docs/rest"
            target="_blank"
            class="api-card hover:bg-violet-mystique/10 transition-colors cursor-pointer"
          >
            <h3 class="text-lg font-semibold mb-2">🔗 Swagger REST API</h3>
            <p class="text-gray-400">Documentation interactive REST</p>
          </a>

          <a
            href="/api-docs/websocket"
            target="_blank"
            class="api-card hover:bg-violet-mystique/10 transition-colors cursor-pointer"
          >
            <h3 class="text-lg font-semibold mb-2">🔌 AsyncAPI WebSocket</h3>
            <p class="text-gray-400">Documentation WebSocket</p>
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { authService } from '../services/authService'
import { userService } from '../services/userService'
import { observationService } from '../services/observationService'
import { commentService } from '../services/commentService'
import { imageService } from '../services/imageService'
import { adminService } from '../services/adminService'
import { statsService } from '../services/statsService'
import { useWebSocket } from '../composables/useWebSocket'

// Configuration
const apiUrl = computed(() => import.meta.env.VITE_API_URL || 'http://localhost:3000/api')

// État
const healthStatus = ref(null)
const results = ref({})
const selectedFile = ref(null)

// WebSocket
const { connected: wsConnected, messages: wsMessages, connect, disconnect, clearMessages } = useWebSocket()

// Sections
const sections = [
  { id: 'health', name: 'Santé', icon: '🏥' },
  { id: 'auth', name: 'Auth', icon: '🔐' },
  { id: 'users', name: 'Users', icon: '👤' },
  { id: 'observations', name: 'Obs', icon: '🛸' },
  { id: 'comments', name: 'Comm', icon: '💬' },
  { id: 'images', name: 'Images', icon: '🖼️' },
  { id: 'admin', name: 'Admin', icon: '👑' },
  { id: 'websocket', name: 'WS', icon: '🔌' }
]

// Formulaires
const authForms = ref({
  login: { email: 'admin@phenom.app', password: 'Admin123!' },
  register: { username: '', email: '', password: '' }
})

const userForms = ref({
  update: { username: '', bio: '' },
  password: { currentPassword: '', newPassword: '' }
})

const observationForms = ref({
  list: { limit: 10, page: 1 },
  create: { title: '', description: '', location: '', date: '' },
  getOne: { id: '' },
  update: { id: '', title: '' },
  delete: { id: '' }
})

const commentForms = ref({
  list: { observationId: '' },
  create: { observationId: '', text: '' },
  delete: { id: '' }
})

const imageForms = ref({
  get: { id: '' },
  delete: { id: '' }
})

const adminForms = ref({
  posts: { status: '' },
  approve: { id: '' },
  reject: { id: '' }
})

// Méthodes - Santé & Stats
async function checkHealth() {
  try {
    const response = await statsService.health()
    results.value.health = response
    healthStatus.value = response.status
  } catch (error) {
    results.value.health = { error: error.message }
    healthStatus.value = 'error'
  }
}

async function getPublicStats() {
  try {
    const response = await statsService.getPublicStats()
    results.value.publicStats = response
  } catch (error) {
    results.value.publicStats = { error: error.message }
  }
}

// Méthodes - Auth
async function testLogin() {
  try {
    const response = await authService.login(authForms.value.login)
    results.value.login = response
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token)
    }
  } catch (error) {
    results.value.login = { error: error.response?.data || error.message }
  }
}

async function testRegister() {
  try {
    const response = await authService.register(authForms.value.register)
    results.value.register = response
  } catch (error) {
    results.value.register = { error: error.response?.data || error.message }
  }
}

async function getProfile() {
  try {
    const response = await authService.getProfile()
    results.value.profile = response
  } catch (error) {
    results.value.profile = { error: error.response?.data || error.message }
  }
}

async function testLogout() {
  try {
    const response = await authService.logout()
    results.value.logout = response
    localStorage.removeItem('token')
  } catch (error) {
    results.value.logout = { error: error.response?.data || error.message }
  }
}

// Méthodes - Users
async function updateProfile() {
  try {
    const response = await userService.updateMe(userForms.value.update)
    results.value.updateProfile = response
  } catch (error) {
    results.value.updateProfile = { error: error.response?.data || error.message }
  }
}

async function changePassword() {
  try {
    const response = await userService.changePassword(userForms.value.password)
    results.value.changePassword = response
  } catch (error) {
    results.value.changePassword = { error: error.response?.data || error.message }
  }
}

// Méthodes - Observations
async function getObservations() {
  try {
    const response = await observationService.getAll(observationForms.value.list)
    results.value.observations = response
  } catch (error) {
    results.value.observations = { error: error.response?.data || error.message }
  }
}

async function createObservation() {
  try {
    const response = await observationService.create(observationForms.value.create)
    results.value.createObservation = response
  } catch (error) {
    results.value.createObservation = { error: error.response?.data || error.message }
  }
}

async function getOneObservation() {
  try {
    const response = await observationService.getById(observationForms.value.getOne.id)
    results.value.oneObservation = response
  } catch (error) {
    results.value.oneObservation = { error: error.response?.data || error.message }
  }
}

async function updateObservation() {
  try {
    const { id, ...data } = observationForms.value.update
    const response = await observationService.update(id, data)
    results.value.updateObservation = response
  } catch (error) {
    results.value.updateObservation = { error: error.response?.data || error.message }
  }
}

async function deleteObservation() {
  try {
    const response = await observationService.delete(observationForms.value.delete.id)
    results.value.deleteObservation = response
  } catch (error) {
    results.value.deleteObservation = { error: error.response?.data || error.message }
  }
}

// Méthodes - Comments
async function getComments() {
  try {
    const response = await commentService.getByObservation(commentForms.value.list.observationId)
    results.value.comments = response
  } catch (error) {
    results.value.comments = { error: error.response?.data || error.message }
  }
}

async function createComment() {
  try {
    const { observationId, text } = commentForms.value.create
    const response = await commentService.create(observationId, text)
    results.value.createComment = response
  } catch (error) {
    results.value.createComment = { error: error.response?.data || error.message }
  }
}

async function deleteComment() {
  try {
    const response = await commentService.delete(commentForms.value.delete.id)
    results.value.deleteComment = response
  } catch (error) {
    results.value.deleteComment = { error: error.response?.data || error.message }
  }
}

// Méthodes - Images
function handleFileSelect(event) {
  selectedFile.value = event.target.files[0]
}

async function uploadImage() {
  if (!selectedFile.value) return
  try {
    const response = await imageService.upload(selectedFile.value)
    results.value.uploadImage = response
  } catch (error) {
    results.value.uploadImage = { error: error.response?.data || error.message }
  }
}

async function getImage() {
  try {
    const blob = await imageService.getById(imageForms.value.get.id)
    results.value.imageUrl = URL.createObjectURL(blob)
  } catch (error) {
    results.value.imageUrl = null
    console.error('Erreur:', error)
  }
}

async function deleteImage() {
  try {
    const response = await imageService.delete(imageForms.value.delete.id)
    results.value.deleteImage = response
  } catch (error) {
    results.value.deleteImage = { error: error.response?.data || error.message }
  }
}

// Méthodes - Admin
async function getAdminStats() {
  try {
    const response = await adminService.getStats()
    results.value.adminStats = response
  } catch (error) {
    results.value.adminStats = { error: error.response?.data || error.message }
  }
}

async function getAllUsers() {
  try {
    const response = await adminService.getUsers()
    results.value.allUsers = response
  } catch (error) {
    results.value.allUsers = { error: error.response?.data || error.message }
  }
}

async function getAllPosts() {
  try {
    const response = await adminService.getPosts(adminForms.value.posts.status || null)
    results.value.allPosts = response
  } catch (error) {
    results.value.allPosts = { error: error.response?.data || error.message }
  }
}

async function approvePost() {
  try {
    const response = await adminService.approvePost(adminForms.value.approve.id)
    results.value.approvePost = response
  } catch (error) {
    results.value.approvePost = { error: error.response?.data || error.message }
  }
}

async function rejectPost() {
  try {
    const response = await adminService.rejectPost(adminForms.value.reject.id)
    results.value.rejectPost = response
  } catch (error) {
    results.value.rejectPost = { error: error.response?.data || error.message }
  }
}

// Méthodes - WebSocket
function connectWs() {
  const token = localStorage.getItem('token')
  connect(token)
}

function disconnectWs() {
  disconnect()
}

function clearWsMessages() {
  clearMessages()
}

// Utilitaires
function scrollToSection(sectionId) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
}

// Lifecycle
onMounted(() => {
  checkHealth()
})
</script>

<style scoped>
.home-view {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e2e8f0;
}

.api-section {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 12px;
  padding: 24px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #a78bfa;
  margin-bottom: 16px;
  border-bottom: 2px solid #a78bfa;
  padding-bottom: 8px;
}

.api-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 8px;
  padding: 16px;
}

.input-field {
  width: 100%;
  padding: 8px 12px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 6px;
  color: #e2e8f0;
  font-size: 0.875rem;
}

.input-field:focus {
  outline: none;
  border-color: #a78bfa;
}

.btn-primary {
  padding: 8px 16px;
  background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(167, 139, 250, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 8px 16px;
  background: rgba(100, 116, 139, 0.3);
  color: #cbd5e1;
  border: 1px solid rgba(100, 116, 139, 0.5);
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgba(100, 116, 139, 0.5);
}

.btn-danger {
  padding: 8px 16px;
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.result-box {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 6px;
  padding: 12px;
  font-size: 0.75rem;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
}
</style>
