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
        <div class="flex justify-center gap-4 text-sm flex-wrap">
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
          <!-- Utilisateur connecté -->
          <span 
            v-if="currentUser"
            class="px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full"
          >
            👤 {{ currentUser.username || currentUser.email }}
            <span v-if="currentUser.role === 'admin'" class="ml-1">👑</span>
          </span>
          <span 
            v-else
            class="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full"
          >
            🔒 Non connecté
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

          <!-- Debug LocalStorage -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">🔍 Debug</h3>
            <button @click="debugLocalStorage" class="btn-primary mb-3">
              Afficher localStorage
            </button>
            <pre v-if="results.debug" class="result-box">{{ JSON.stringify(results.debug, null, 2) }}</pre>
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
            <p v-if="!currentUser" class="text-yellow-400 text-sm mb-3">
              ⚠️ Vous devez être connecté pour changer votre mot de passe
            </p>
            <div class="space-y-2 mb-3">
              <input
                v-model="userForms.password.currentPassword"
                type="password"
                placeholder="Ancien mot de passe (Admin123!)"
                class="input-field"
              />
              <input
                v-model="userForms.password.newPassword"
                type="password"
                placeholder="Nouveau mot de passe (min 6 caractères)"
                class="input-field"
              />
              <input
                v-model="userForms.password.confirmPassword"
                type="password"
                placeholder="Confirmer le nouveau mot de passe"
                class="input-field"
              />
            </div>
            <button 
              @click="changePassword" 
              class="btn-primary mb-3"
              :disabled="!currentUser"
              :class="{ 'opacity-50 cursor-not-allowed': !currentUser }"
            >
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
              <div class="grid grid-cols-2 gap-2">
                <input
                  v-model.number="observationForms.list.page"
                  type="number"
                  placeholder="Page (défaut: 1)"
                  class="input-field"
                />
                <input
                  v-model.number="observationForms.list.limit"
                  type="number"
                  placeholder="Limit (défaut: 10)"
                  class="input-field"
                />
              </div>
              <input
                v-model="observationForms.list.search"
                type="text"
                placeholder="Recherche (titre, description)"
                class="input-field"
              />
              <div class="grid grid-cols-2 gap-2">
                <select v-model="observationForms.list.sortBy" class="input-field">
                  <option value="">Trier par...</option>
                  <option value="createdAt">Date de création</option>
                  <option value="updatedAt">Date de modification</option>
                  <option value="title">Titre</option>
                </select>
                <select v-model="observationForms.list.order" class="input-field">
                  <option value="desc">Décroissant</option>
                  <option value="asc">Croissant</option>
                </select>
              </div>
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
                placeholder="Titre (ex: OVNI triangulaire)"
                class="input-field"
              />
              <textarea
                v-model="observationForms.create.description"
                placeholder="Description détaillée (min 10 caractères)"
                class="input-field"
                rows="3"
              ></textarea>
              
              <!-- Localisation GPS -->
              <div class="space-y-2">
                <label class="text-sm text-gray-400">📍 Localisation GPS</label>
                <div class="flex gap-2">
                  <input
                    v-model="observationForms.create.longitude"
                    type="number"
                    step="0.000001"
                    placeholder="Longitude (ex: 6.6323)"
                    class="input-field flex-1"
                  />
                  <input
                    v-model="observationForms.create.latitude"
                    type="number"
                    step="0.000001"
                    placeholder="Latitude (ex: 46.5197)"
                    class="input-field flex-1"
                  />
                </div>
                <button 
                  @click="getGeolocation" 
                  class="btn-secondary w-full text-sm"
                  type="button"
                >
                  📍 Utiliser ma position actuelle
                </button>
                <p v-if="observationForms.create.locationError" class="text-red-400 text-xs">
                  {{ observationForms.create.locationError }}
                </p>
              </div>

              <!-- Upload d'image -->
              <div class="space-y-2">
                <label class="text-sm text-gray-400">📷 Photo (requise)</label>
                <input
                  ref="observationImageInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  @change="handleObservationImageSelect"
                  class="input-field"
                />
                <p class="text-xs text-gray-500">
                  Formats acceptés: JPEG, PNG, WebP. Max: 10 MB
                </p>
                <div v-if="observationForms.create.imagePreview" class="mt-2">
                  <img 
                    :src="observationForms.create.imagePreview" 
                    alt="Preview" 
                    class="w-full h-40 object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
            <button 
              @click="createObservation" 
              class="btn-primary mb-3 w-full"
              :disabled="!observationForms.create.imageFile || !currentUser"
              :class="{ 'opacity-50 cursor-not-allowed': !observationForms.create.imageFile || !currentUser }"
            >
              {{ observationForms.create.imageFile ? 'Créer l\'observation' : 'Sélectionnez une photo d\'abord' }}
            </button>
            <p v-if="!currentUser" class="text-yellow-400 text-sm mb-3">
              ⚠️ Vous devez être connecté pour créer une observation
            </p>
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
                placeholder="ID de l'observation (requis)"
                class="input-field"
              />
              <div class="grid grid-cols-2 gap-2">
                <input
                  v-model.number="commentForms.list.page"
                  type="number"
                  placeholder="Page (défaut: 1)"
                  class="input-field"
                />
                <input
                  v-model.number="commentForms.list.limit"
                  type="number"
                  placeholder="Limit (défaut: 10)"
                  class="input-field"
                />
              </div>
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
            <div class="space-y-2 mb-3">
              <div class="grid grid-cols-2 gap-2">
                <input
                  v-model.number="adminForms.users.page"
                  type="number"
                  placeholder="Page (défaut: 1)"
                  class="input-field"
                />
                <input
                  v-model.number="adminForms.users.limit"
                  type="number"
                  placeholder="Limit (défaut: 10)"
                  class="input-field"
                />
              </div>
              <input
                v-model="adminForms.users.search"
                type="text"
                placeholder="Recherche (nom, email)"
                class="input-field"
              />
              <select v-model="adminForms.users.role" class="input-field">
                <option value="">Tous les rôles</option>
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button @click="getAllUsers" class="btn-primary mb-3">
              Récupérer
            </button>
            <pre v-if="results.allUsers" class="result-box">{{ JSON.stringify(results.allUsers, null, 2) }}</pre>
          </div>

          <!-- Update User Role -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Modifier le rôle d'un utilisateur</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model="adminForms.updateRole.userId"
                type="text"
                placeholder="ID de l'utilisateur"
                class="input-field"
              />
              <select v-model="adminForms.updateRole.role" class="input-field">
                <option value="">Sélectionner un rôle</option>
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button @click="updateUserRole" class="btn-primary mb-3">
              Modifier le rôle
            </button>
            <pre v-if="results.updateUserRole" class="result-box">{{ JSON.stringify(results.updateUserRole, null, 2) }}</pre>
          </div>

          <!-- Delete Observation (Admin) -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Supprimer une observation (Admin)</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model="adminForms.deleteObservation.id"
                type="text"
                placeholder="ID de l'observation"
                class="input-field"
              />
            </div>
            <button @click="deleteObservationAdmin" class="btn-danger mb-3">
              Supprimer
            </button>
            <pre v-if="results.deleteObservationAdmin" class="result-box">{{ JSON.stringify(results.deleteObservationAdmin, null, 2) }}</pre>
          </div>

          <!-- Delete Comment (Admin) -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Supprimer un commentaire (Admin)</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model="adminForms.deleteComment.id"
                type="text"
                placeholder="ID du commentaire"
                class="input-field"
              />
            </div>
            <button @click="deleteCommentAdmin" class="btn-danger mb-3">
              Supprimer
            </button>
            <pre v-if="results.deleteCommentAdmin" class="result-box">{{ JSON.stringify(results.deleteCommentAdmin, null, 2) }}</pre>
          </div>

          <!-- Get User Details -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Détails d'un utilisateur</h3>
            <div class="space-y-2 mb-3">
              <input
                v-model="adminForms.userDetails.id"
                type="text"
                placeholder="ID de l'utilisateur"
                class="input-field"
              />
            </div>
            <button @click="getUserDetails" class="btn-primary mb-3">
              Récupérer
            </button>
            <pre v-if="results.userDetails" class="result-box">{{ JSON.stringify(results.userDetails, null, 2) }}</pre>
          </div>
        </div>
      </section>

      <!-- Section: WebSocket -->
      <section id="websocket" class="api-section mb-8">
        <h2 class="section-title">🔌 WebSocket (WsMini PubSub)</h2>
        <div class="grid md:grid-cols-2 gap-4">
          <!-- Connect -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Connexion WebSocket</h3>
            <div class="space-y-3">
              <div class="flex gap-2">
                <button 
                  @click="connectWs" 
                  class="btn-primary flex-1"
                  :disabled="wsConnected"
                >
                  🔌 Connecter
                </button>
                <button 
                  @click="disconnectWs" 
                  class="btn-danger flex-1"
                  :disabled="!wsConnected"
                >
                  🔴 Déconnecter
                </button>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <span class="text-sm text-gray-400">Statut:</span>
                <span 
                  :class="[
                    'px-3 py-1 rounded-full text-sm font-semibold',
                    wsConnected 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  ]"
                >
                  {{ wsConnected ? '🟢 Connecté' : '🔴 Déconnecté' }}
                </span>
              </div>

              <div class="text-xs text-gray-500">
                URL: {{ wsUrl }}
              </div>

              <!-- Erreur de connexion -->
              <div v-if="wsError && !wsConnected" class="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p class="text-sm text-red-400">⚠️ {{ wsError }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  💡 Assurez-vous que le backend est démarré
                </p>
              </div>
            </div>
          </div>

          <!-- Channels -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Canaux (Channels)</h3>
            <div class="space-y-2">
              <div class="flex items-center justify-between p-2 bg-black/30 rounded">
                <div>
                  <span class="font-mono text-violet-mystique">observations</span>
                  <p class="text-xs text-gray-500">Créations/Modifs/Suppressions d'observations</p>
                </div>
                <span class="text-xs text-green-400">📡 Auto</span>
              </div>
              <div class="flex items-center justify-between p-2 bg-black/30 rounded">
                <div>
                  <span class="font-mono text-violet-mystique">comments</span>
                  <p class="text-xs text-gray-500">Créations/Modifs/Suppressions de commentaires</p>
                </div>
                <span class="text-xs text-green-400">📡 Auto</span>
              </div>
              <p class="text-xs text-gray-500 mt-2">
                ℹ️ Souscription automatique à la connexion
              </p>
            </div>
          </div>

          <!-- Messages -->
          <div class="api-card md:col-span-2">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-lg font-semibold">Messages en temps réel ({{ wsMessages.length }})</h3>
              <button @click="clearWsMessages" class="btn-secondary">
                🗑️ Effacer
              </button>
            </div>
            
            <div class="result-box max-h-96 overflow-y-auto">
              <div v-if="wsMessages.length === 0" class="text-center text-gray-500 py-8">
                <p class="text-2xl mb-2">📭</p>
                <p>Aucun message reçu</p>
                <p class="text-xs mt-2">Créez une observation ou un commentaire pour voir les événements en temps réel</p>
              </div>
              <div v-for="(msg, index) in wsMessages" :key="index" class="mb-3 pb-3 border-b border-gray-700 last:border-0">
                <div class="flex items-center justify-between mb-2">
                  <span 
                    :class="[
                      'px-2 py-1 rounded text-xs font-mono',
                      msg.type?.includes('created') ? 'bg-green-500/20 text-green-400' :
                      msg.type?.includes('updated') ? 'bg-blue-500/20 text-blue-400' :
                      msg.type?.includes('deleted') ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    ]"
                  >
                    {{ msg.type }}
                  </span>
                  <span class="text-xs text-gray-500">{{ msg.timestamp || msg.receivedAt }}</span>
                </div>
                <pre class="text-sm bg-black/30 p-2 rounded overflow-x-auto">{{ JSON.stringify(msg.data, null, 2) }}</pre>
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
const wsUrl = computed(() => import.meta.env.VITE_WS_URL || 'ws://localhost:3000')

// État
const healthStatus = ref(null)
const results = ref({})
const selectedFile = ref(null)
const observationImageInput = ref(null)
const currentUser = ref(null) // Utilisateur connecté
const currentToken = ref(localStorage.getItem('token') || null) // Token JWT

// WebSocket
const { connected: wsConnected, messages: wsMessages, error: wsError, connect, disconnect, clearMessages } = useWebSocket()

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
  password: { currentPassword: '', newPassword: '', confirmPassword: '' }
})

const observationForms = ref({
  list: { 
    page: 1, 
    limit: 10, 
    search: '', 
    sortBy: 'createdAt', 
    order: 'desc' 
  },
  create: { 
    title: '', 
    description: '', 
    longitude: null, 
    latitude: null,
    imageFile: null,
    imagePreview: null,
    locationError: ''
  },
  getOne: { id: '' },
  update: { id: '', title: '' },
  delete: { id: '' }
})

const commentForms = ref({
  list: { 
    observationId: '', 
    page: 1, 
    limit: 10 
  },
  create: { observationId: '', text: '' },
  delete: { id: '' }
})

const imageForms = ref({
  get: { id: '' },
  delete: { id: '' }
})

const adminForms = ref({
  users: { 
    page: 1, 
    limit: 10, 
    search: '', 
    role: '' 
  },
  updateRole: { userId: '', role: '' },
  deleteObservation: { id: '' },
  deleteComment: { id: '' },
  userDetails: { id: '' }
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
    
    console.log('📦 Réponse login complète:', response)
    
    // Stocker le token et l'utilisateur
    // La structure est: { success: true, data: { user, accessToken, refreshToken } }
    const token = response.data?.accessToken || response.data?.token
    const user = response.data?.user
    
    if (token) {
      currentToken.value = token
      localStorage.setItem('token', token)
      console.log('✅ Token stocké:', token.substring(0, 20) + '...')
      
      // Stocker aussi le refreshToken
      if (response.data?.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken)
      }
    } else {
      console.error('❌ Aucun token trouvé dans la réponse')
    }
    
    // Récupérer et stocker les infos utilisateur
    if (user) {
      currentUser.value = user
      localStorage.setItem('user', JSON.stringify(user))
      console.log('✅ Utilisateur stocké:', user.username || user.email)
    } else {
      console.error('❌ Aucun utilisateur trouvé dans la réponse')
    }
    
    console.log('✅ Connecté avec succès')
  } catch (error) {
    console.error('❌ Erreur login:', error)
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

function debugLocalStorage() {
  const token = localStorage.getItem('token')
  const refreshToken = localStorage.getItem('refreshToken')
  const user = localStorage.getItem('user')
  
  results.value.debug = {
    token: token ? token.substring(0, 30) + '... (' + token.length + ' chars)' : 'null',
    refreshToken: refreshToken ? refreshToken.substring(0, 30) + '... (' + refreshToken.length + ' chars)' : 'null',
    user: user ? JSON.parse(user) : 'null',
    currentUser: currentUser.value,
    currentToken: currentToken.value ? currentToken.value.substring(0, 30) + '...' : 'null'
  }
  
  console.log('🔍 Debug localStorage:', results.value.debug)
}

async function testLogout() {
  try {
    const response = await authService.logout()
    results.value.logout = response
    
    // Nettoyer les données locales
    currentToken.value = null
    currentUser.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    console.log('👋 Déconnecté avec succès')
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
    // Validation côté client
    const { currentPassword, newPassword, confirmPassword } = userForms.value.password
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      results.value.changePassword = {
        error: {
          success: false,
          error: 'Tous les champs sont requis'
        }
      }
      return
    }
    
    if (newPassword !== confirmPassword) {
      results.value.changePassword = {
        error: {
          success: false,
          error: 'Les mots de passe ne correspondent pas'
        }
      }
      return
    }
    
    if (newPassword.length < 6) {
      results.value.changePassword = {
        error: {
          success: false,
          error: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
        }
      }
      return
    }
    
    // Debug: vérifier le token
    const token = localStorage.getItem('token')
    console.log('🔑 Token présent:', !!token)
    console.log('📝 Données envoyées:', { currentPassword: '***', newPassword: '***', confirmPassword: '***' })
    
    const response = await userService.changePassword(userForms.value.password)
    results.value.changePassword = response
    
    // Réinitialiser le formulaire en cas de succès
    if (response.success) {
      userForms.value.password = { currentPassword: '', newPassword: '', confirmPassword: '' }
      console.log('✅ Mot de passe changé avec succès')
    }
  } catch (error) {
    console.error('❌ Erreur changement mot de passe:', error)
    results.value.changePassword = { error: error.response?.data || error.message }
  }
}

// Méthodes - Géolocalisation et upload
function getGeolocation() {
  observationForms.value.create.locationError = ''
  
  if (!navigator.geolocation) {
    observationForms.value.create.locationError = '❌ Géolocalisation non supportée par ce navigateur'
    return
  }

  observationForms.value.create.locationError = '🔄 Détection en cours...'
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      observationForms.value.create.longitude = position.coords.longitude
      observationForms.value.create.latitude = position.coords.latitude
      observationForms.value.create.locationError = `✅ Position détectée: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
    },
    (error) => {
      let errorMsg = '❌ '
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg += 'Permission refusée. Autorisez la géolocalisation dans les paramètres.'
          break
        case error.POSITION_UNAVAILABLE:
          errorMsg += 'Position non disponible.'
          break
        case error.TIMEOUT:
          errorMsg += 'Délai de détection dépassé.'
          break
        default:
          errorMsg += 'Erreur inconnue.'
      }
      observationForms.value.create.locationError = errorMsg
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}

function handleObservationImageSelect(event) {
  const file = event.target.files[0]
  if (!file) return

  // Validation du fichier
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10 MB

  if (!validTypes.includes(file.type)) {
    results.value.createObservation = { error: 'Format non valide. Utilisez JPEG, PNG ou WebP.' }
    event.target.value = ''
    return
  }

  if (file.size > maxSize) {
    results.value.createObservation = { error: 'Fichier trop volumineux. Max: 10 MB.' }
    event.target.value = ''
    return
  }

  // Stocker le fichier
  observationForms.value.create.imageFile = file

  // Créer un aperçu
  const reader = new FileReader()
  reader.onload = (e) => {
    observationForms.value.create.imagePreview = e.target.result
  }
  reader.readAsDataURL(file)
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
    // Validation
    if (!observationForms.value.create.imageFile) {
      results.value.createObservation = { error: 'Une photo est requise' }
      return
    }
    
    if (!observationForms.value.create.longitude || !observationForms.value.create.latitude) {
      results.value.createObservation = { error: 'La localisation GPS est requise' }
      return
    }

    // Étape 1: Créer l'observation SANS image
    results.value.createObservation = { status: 'Création de l\'observation...' }
    
    const observationData = {
      title: observationForms.value.create.title,
      description: observationForms.value.create.description,
      location: {
        type: 'Point',
        coordinates: [
          observationForms.value.create.longitude,
          observationForms.value.create.latitude
        ]
      }
    }
    
    const observationResponse = await observationService.create(observationData)
    const observationId = observationResponse.data?.id || observationResponse.data?._id
    
    // Étape 2: Uploader l'image pour cette observation
    results.value.createObservation = { status: 'Upload de l\'image...' }
    
    await imageService.uploadToObservation(observationId, observationForms.value.create.imageFile)
    
    // Récupérer l'observation complète avec l'image
    const finalObservation = await observationService.getById(observationId)
    results.value.createObservation = finalObservation
    
    // Reset du formulaire
    observationForms.value.create = {
      title: '',
      description: '',
      longitude: null,
      latitude: null,
      imageFile: null,
      imagePreview: null,
      locationError: ''
    }
    
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
    const { observationId, page, limit } = commentForms.value.list
    const params = { page, limit }
    const response = await commentService.getByObservation(observationId, params)
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
    const params = adminForms.value.users
    const response = await adminService.getUsers(params)
    results.value.allUsers = response
  } catch (error) {
    results.value.allUsers = { error: error.response?.data || error.message }
  }
}

async function updateUserRole() {
  try {
    const { userId, role } = adminForms.value.updateRole
    const response = await adminService.updateUserRole(userId, role)
    results.value.updateUserRole = response
  } catch (error) {
    results.value.updateUserRole = { error: error.response?.data || error.message }
  }
}

async function deleteObservationAdmin() {
  try {
    const response = await adminService.deleteObservation(adminForms.value.deleteObservation.id)
    results.value.deleteObservationAdmin = response
  } catch (error) {
    results.value.deleteObservationAdmin = { error: error.response?.data || error.message }
  }
}

async function deleteCommentAdmin() {
  try {
    const response = await adminService.deleteComment(adminForms.value.deleteComment.id)
    results.value.deleteCommentAdmin = response
  } catch (error) {
    results.value.deleteCommentAdmin = { error: error.response?.data || error.message }
  }
}

async function getUserDetails() {
  try {
    const response = await adminService.getUserDetails(adminForms.value.userDetails.id)
    results.value.userDetails = response
  } catch (error) {
    results.value.userDetails = { error: error.response?.data || error.message }
  }
}

// Méthodes - WebSocket
function connectWs() {
  // Pas besoin de token pour WsMini PubSub (canaux en lecture seule)
  connect()
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
  
  // Charger l'utilisateur depuis localStorage au démarrage
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    try {
      currentUser.value = JSON.parse(savedUser)
      console.log('👤 Utilisateur chargé:', currentUser.value)
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error)
      localStorage.removeItem('user')
    }
  }
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
