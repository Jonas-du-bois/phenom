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
                : 'bg-red-500/20 text-red-400',
            ]"
          >
            Status: {{ healthStatus || "checking..." }}
          </span>
          <!-- Utilisateur connecté -->
          <span
            v-if="currentUser"
            class="px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full"
          >
            👤 {{ currentUser.name || currentUser.email }}
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
            <pre v-if="results.health" class="result-box">{{
              JSON.stringify(results.health, null, 2)
            }}</pre>
          </div>

          <!-- Stats publiques -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Statistiques publiques</h3>
            <button @click="getPublicStats" class="btn-primary mb-3">
              Récupérer les stats
            </button>
            <pre v-if="results.publicStats" class="result-box">{{
              JSON.stringify(results.publicStats, null, 2)
            }}</pre>
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
            <form @submit.prevent="testLogin" class="space-y-2 mb-3">
              <input
                v-model="authForms.login.email"
                type="email"
                placeholder="Email"
                class="input-field"
                autocomplete="email"
              />
              <input
                v-model="authForms.login.password"
                type="password"
                placeholder="Password"
                class="input-field"
                autocomplete="current-password"
              />
              <button type="submit" class="btn-primary w-full">
                Se connecter
              </button>
            </form>
            <pre v-if="results.login" class="result-box">{{
              JSON.stringify(results.login, null, 2)
            }}</pre>
          </div>

          <!-- Register -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Register</h3>
            <form @submit.prevent="testRegister" class="space-y-2 mb-3">
              <input
                v-model="authForms.register.name"
                type="text"
                placeholder="Nom"
                class="input-field"
                autocomplete="name"
              />
              <input
                v-model="authForms.register.email"
                type="email"
                placeholder="Email"
                class="input-field"
                autocomplete="email"
              />
              <input
                v-model="authForms.register.password"
                type="password"
                placeholder="Password"
                class="input-field"
                autocomplete="new-password"
              />
              <button type="submit" class="btn-primary w-full">
                S'inscrire
              </button>
            </form>
            <pre v-if="results.register" class="result-box">{{
              JSON.stringify(results.register, null, 2)
            }}</pre>
          </div>

          <!-- Get Profile -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Profil utilisateur</h3>
            <button @click="getProfile" class="btn-primary mb-3">
              Récupérer le profil
            </button>
            <pre v-if="results.profile" class="result-box">{{
              JSON.stringify(results.profile, null, 2)
            }}</pre>
          </div>

          <!-- Logout -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Logout</h3>
            <button @click="testLogout" class="btn-primary mb-3">
              Se déconnecter
            </button>
            <pre v-if="results.logout" class="result-box">{{
              JSON.stringify(results.logout, null, 2)
            }}</pre>
          </div>

          <!-- Debug LocalStorage -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">🔍 Debug</h3>
            <button @click="debugLocalStorage" class="btn-primary mb-3">
              Afficher localStorage
            </button>
            <pre v-if="results.debug" class="result-box">{{
              JSON.stringify(results.debug, null, 2)
            }}</pre>
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
                v-model="userForms.update.name"
                type="text"
                placeholder="Nouveau nom"
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
            <pre v-if="results.updateProfile" class="result-box">{{
              JSON.stringify(results.updateProfile, null, 2)
            }}</pre>
          </div>

          <!-- Change Password -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Changer le mot de passe</h3>
            <p v-if="!currentUser" class="text-yellow-400 text-sm mb-3">
              ⚠️ Vous devez être connecté pour changer votre mot de passe
            </p>
            <form @submit.prevent="changePassword" class="space-y-2 mb-3">
              <input
                v-model="userForms.password.currentPassword"
                type="password"
                placeholder="Ancien mot de passe (Admin123!)"
                class="input-field"
                autocomplete="current-password"
              />
              <input
                v-model="userForms.password.newPassword"
                type="password"
                placeholder="Nouveau mot de passe (min 6 caractères)"
                class="input-field"
                autocomplete="new-password"
              />
              <input
                v-model="userForms.password.confirmPassword"
                type="password"
                placeholder="Confirmer le nouveau mot de passe"
                class="input-field"
                autocomplete="new-password"
              />
              <button
                type="submit"
                class="btn-primary w-full"
                :disabled="!currentUser"
                :class="{ 'opacity-50 cursor-not-allowed': !currentUser }"
              >
                Changer le mot de passe
              </button>
            </form>
            <pre v-if="results.changePassword" class="result-box">{{
              JSON.stringify(results.changePassword, null, 2)
            }}</pre>
          </div>
        </div>
      </section>

      <!-- Section: Observations -->
      <section id="observations" class="api-section mb-8">
        <h2 class="section-title">🛸 Observations</h2>
        <div class="grid md:grid-cols-2 gap-4">
          <!-- Get All - Format Phenom Search -->
          <div class="api-card md:col-span-2">
            <h3 class="text-lg font-semibold mb-3">🔍 Lister les observations (Phenom Search)</h3>
            <div class="space-y-3 mb-3">
              <!-- Pagination & Recherche -->
              <div class="grid grid-cols-3 gap-2">
                <input
                  v-model.number="observationForms.list.page"
                  type="number"
                  placeholder="Page (défaut: 1)"
                  class="input-field"
                />
                <input
                  v-model.number="observationForms.list.limit"
                  type="number"
                  placeholder="Limit (défaut: 50)"
                  class="input-field"
                />
                <input
                  v-model="observationForms.list.search"
                  type="text"
                  placeholder="🔍 Recherche texte"
                  class="input-field"
                />
              </div>

              <!-- Tri -->
              <div class="grid grid-cols-2 gap-2">
                <select v-model="observationForms.list.sortBy" class="input-field">
                  <option value="createdAt">Trier par: Date création</option>
                  <option value="date">Date observation</option>
                  <option value="credibility">Crédibilité</option>
                  <option value="strangeness">Étrangeté</option>
                </select>
                <select v-model="observationForms.list.order" class="input-field">
                  <option value="desc">⬇️ Décroissant</option>
                  <option value="asc">⬆️ Croissant</option>
                </select>
              </div>

              <!-- Filtres géographiques -->
              <div class="p-2 bg-blue-900/20 rounded-lg">
                <p class="text-xs text-blue-400 mb-2">🌍 Filtres géographiques</p>
                <div class="grid grid-cols-2 gap-2">
                  <input
                    v-model="observationForms.list.country"
                    type="text"
                    placeholder="Pays (ex: France, Suisse)"
                    class="input-field"
                  />
                  <select v-model="observationForms.list.locale" class="input-field">
                    <option value="">Toutes localités</option>
                    <option v-for="loc in LOCALE_TYPES" :key="loc.code" :value="loc.code">
                      {{ loc.icon }} {{ loc.label }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Filtres temporels -->
              <div class="p-2 bg-purple-900/20 rounded-lg">
                <p class="text-xs text-purple-400 mb-2">📅 Filtres temporels</p>
                <div class="grid grid-cols-2 gap-2">
                  <input
                    v-model.number="observationForms.list.startYear"
                    type="number"
                    placeholder="Année min (ex: 1950)"
                    class="input-field"
                  />
                  <input
                    v-model.number="observationForms.list.endYear"
                    type="number"
                    placeholder="Année max (ex: 2024)"
                    class="input-field"
                  />
                </div>
              </div>

              <!-- Filtres scores -->
              <div class="p-2 bg-green-900/20 rounded-lg">
                <p class="text-xs text-green-400 mb-2">📊 Scores (0-15 crédibilité, 0-10 étrangeté)</p>
                <div class="grid grid-cols-4 gap-2">
                  <input
                    v-model.number="observationForms.list.minCredibility"
                    type="number"
                    min="0"
                    max="15"
                    placeholder="Créd. min"
                    class="input-field"
                  />
                  <input
                    v-model.number="observationForms.list.maxCredibility"
                    type="number"
                    min="0"
                    max="15"
                    placeholder="Créd. max"
                    class="input-field"
                  />
                  <input
                    v-model.number="observationForms.list.minStrangeness"
                    type="number"
                    min="0"
                    max="10"
                    placeholder="Étr. min"
                    class="input-field"
                  />
                  <input
                    v-model.number="observationForms.list.maxStrangeness"
                    type="number"
                    min="0"
                    max="10"
                    placeholder="Étr. max"
                    class="input-field"
                  />
                </div>
              </div>

              <!-- Filtres types -->
              <div class="p-2 bg-orange-900/20 rounded-lg">
                <p class="text-xs text-orange-400 mb-2">🏷️ Types (codes séparés par virgule)</p>
                <div class="grid grid-cols-3 gap-2">
                  <select v-model="observationForms.list.observerType" class="input-field">
                    <option value="">Observateur...</option>
                    <option v-for="obs in OBSERVER_TYPES" :key="obs.code" :value="obs.code">
                      {{ obs.icon }} {{ obs.code }} - {{ obs.label }}
                    </option>
                  </select>
                  <select v-model="observationForms.list.ufoShape" class="input-field">
                    <option value="">Forme OVNI...</option>
                    <option v-for="shape in UFO_SHAPES" :key="shape.code" :value="shape.code">
                      {{ shape.icon }} {{ shape.code }} - {{ shape.label }}
                    </option>
                  </select>
                  <select v-model="observationForms.list.phenomenon" class="input-field">
                    <option value="">Phénomène...</option>
                    <option v-for="pheno in PHENOMENA" :key="pheno.code" :value="pheno.code">
                      {{ pheno.icon }} {{ pheno.code }} - {{ pheno.label }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Filtres booléens -->
              <div class="grid grid-cols-2 gap-2">
                <select v-model="observationForms.list.hasCoordinates" class="input-field">
                  <option :value="null">Coordonnées GPS...</option>
                  <option :value="true">✅ Avec coordonnées</option>
                  <option :value="false">❌ Sans coordonnées</option>
                </select>
                <select v-model="observationForms.list.hasImages" class="input-field">
                  <option :value="null">Images...</option>
                  <option :value="true">📷 Avec images</option>
                  <option :value="false">🚫 Sans images</option>
                </select>
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="getObservations" class="btn-primary flex-1">
                🔍 Rechercher
              </button>
              <button @click="resetObservationFilters" class="btn-secondary">
                🗑️ Reset
              </button>
            </div>
            <pre v-if="results.observations" class="result-box mt-3">{{
              JSON.stringify(results.observations, null, 2)
            }}</pre>
          </div>

          <!-- Create Observation -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Créer une observation</h3>
            <p class="text-xs text-gray-400 mb-3">Format Phenom Search compatible</p>
            <div class="space-y-3 mb-3">
              <!-- Date et Heure -->
              <div class="p-2 bg-blue-900/20 rounded-lg">
                <p class="text-xs text-blue-400 mb-2">📅 Date & Heure</p>
                <div class="grid grid-cols-2 gap-2">
                  <input
                    v-model="observationForms.create.date"
                    type="date"
                    class="input-field"
                    placeholder="Date"
                  />
                  <input
                    v-model="observationForms.create.time"
                    type="time"
                    class="input-field"
                    placeholder="Heure"
                  />
                </div>
              </div>

              <!-- Localisation -->
              <div class="p-2 bg-green-900/20 rounded-lg">
                <p class="text-xs text-green-400 mb-2">📍 Localisation</p>
                <div class="space-y-2">
                  <input
                    v-model="observationForms.create.location"
                    type="text"
                    placeholder="Lieu (ex: Lausanne, près du lac)"
                    class="input-field"
                  />
                  <div class="grid grid-cols-2 gap-2">
                    <input
                      v-model="observationForms.create.country"
                      type="text"
                      placeholder="Pays"
                      class="input-field"
                    />
                    <select v-model="observationForms.create.locale" class="input-field">
                      <option value="">Type de lieu...</option>
                      <option v-for="locale in LOCALE_TYPES" :key="locale.code" :value="locale.code">
                        {{ locale.icon }} {{ locale.label }}
                      </option>
                    </select>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <input
                      v-model.number="observationForms.create.latitude"
                      type="number"
                      step="0.000001"
                      placeholder="Latitude (ex: 46.5197)"
                      class="input-field"
                    />
                    <input
                      v-model.number="observationForms.create.longitude"
                      type="number"
                      step="0.000001"
                      placeholder="Longitude (ex: 6.6323)"
                      class="input-field"
                    />
                  </div>
                  <button
                    @click="getGeolocation"
                    class="btn-secondary w-full text-sm"
                    type="button"
                  >
                    📍 Utiliser ma position actuelle
                  </button>
                  <p
                    v-if="observationForms.create.locationError"
                    class="text-red-400 text-xs"
                  >
                    {{ observationForms.create.locationError }}
                  </p>
                </div>
              </div>

              <!-- Description -->
              <textarea
                v-model="observationForms.create.description"
                placeholder="Description détaillée (min 10 caractères)"
                class="input-field"
                rows="3"
              ></textarea>

              <!-- Évaluation -->
              <div class="p-2 bg-purple-900/20 rounded-lg">
                <p class="text-xs text-purple-400 mb-2">📊 Évaluation</p>
                <div class="grid grid-cols-3 gap-2">
                  <div>
                    <label class="text-xs text-gray-400">Crédibilité (0-15)</label>
                    <input
                      v-model.number="observationForms.create.credibility"
                      type="number"
                      min="0"
                      max="15"
                      class="input-field"
                    />
                  </div>
                  <div>
                    <label class="text-xs text-gray-400">Étrangeté (0-10)</label>
                    <input
                      v-model.number="observationForms.create.strangeness"
                      type="number"
                      min="0"
                      max="10"
                      class="input-field"
                    />
                  </div>
                  <div>
                    <label class="text-xs text-gray-400">Durée (sec)</label>
                    <input
                      v-model.number="observationForms.create.duration"
                      type="number"
                      min="0"
                      placeholder="Secondes"
                      class="input-field"
                    />
                  </div>
                </div>
              </div>

              <!-- Classifications Phenom -->
              <div class="p-2 bg-orange-900/20 rounded-lg">
                <p class="text-xs text-orange-400 mb-2">🏷️ Classifications</p>
                <div class="space-y-2">
                  <div>
                    <label class="text-xs text-gray-400">Types d'observateurs</label>
                    <select
                      v-model="observationForms.create.observerTypes"
                      multiple
                      class="input-field"
                      style="height: 80px"
                    >
                      <option v-for="obs in OBSERVER_TYPES" :key="obs.code" :value="obs.code">
                        {{ obs.icon }} {{ obs.code }} - {{ obs.label }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="text-xs text-gray-400">Formes OVNI</label>
                    <select
                      v-model="observationForms.create.ufoShapes"
                      multiple
                      class="input-field"
                      style="height: 80px"
                    >
                      <option v-for="shape in UFO_SHAPES" :key="shape.code" :value="shape.code">
                        {{ shape.icon }} {{ shape.code }} - {{ shape.label }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="text-xs text-gray-400">Phénomènes</label>
                    <select
                      v-model="observationForms.create.phenomena"
                      multiple
                      class="input-field"
                      style="height: 100px"
                    >
                      <option v-for="pheno in PHENOMENA" :key="pheno.code" :value="pheno.code">
                        {{ pheno.icon }} {{ pheno.code }} - {{ pheno.label }}
                      </option>
                    </select>
                  </div>
                  <p class="text-xs text-gray-500">💡 Ctrl+clic pour sélectionner plusieurs</p>
                </div>
              </div>

              <!-- Upload d'image OU génération IA -->
              <div class="space-y-2">
                <label class="text-sm text-gray-400">📷 Image</label>
                
                <!-- Toggle entre upload et IA -->
                <div class="flex gap-2 mb-2">
                  <button
                    type="button"
                    @click="observationForms.create.generateAiImage = false"
                    :class="[
                      'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      !observationForms.create.generateAiImage
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    ]"
                  >
                    📷 Upload photo
                  </button>
                  <button
                    type="button"
                    @click="observationForms.create.generateAiImage = true; observationForms.create.imageFile = null; observationForms.create.imagePreview = null;"
                    :class="[
                      'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      observationForms.create.generateAiImage
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    ]"
                  >
                    🤖 Générer par IA
                  </button>
                </div>

                <!-- Upload classique -->
                <div v-if="!observationForms.create.generateAiImage">
                  <input
                    ref="observationImageInput"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    @change="handleObservationImageSelect"
                    class="input-field"
                  />
                  <p class="text-xs text-gray-500 mt-1">
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

                <!-- Info génération IA -->
                <div v-else class="p-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg">
                  <p class="text-purple-200 text-sm">
                    ✨ <strong>Génération IA avec Gemini</strong><br/>
                    <span class="text-xs text-purple-300">
                      Une illustration sera automatiquement générée à partir de la description et des phénomènes sélectionnés.
                      L'image sera marquée avec <code class="bg-black/30 px-1 rounded">source: 'ai'</code>.
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <button
              @click="createObservation"
              class="btn-primary mb-3 w-full"
              :disabled="(!observationForms.create.imageFile && !observationForms.create.generateAiImage) || !currentUser"
              :class="{
                'opacity-50 cursor-not-allowed':
                  (!observationForms.create.imageFile && !observationForms.create.generateAiImage) || !currentUser,
              }"
            >
              <span v-if="observationForms.create.generateAiImage">
                🤖 Créer avec image IA
              </span>
              <span v-else-if="observationForms.create.imageFile">
                Créer l'observation
              </span>
              <span v-else>
                Sélectionnez une photo ou activez l'IA
              </span>
            </button>
            <p v-if="!currentUser" class="text-yellow-400 text-sm mb-3">
              ⚠️ Vous devez être connecté pour créer une observation
            </p>
            <pre v-if="results.createObservation" class="result-box">{{
              JSON.stringify(results.createObservation, null, 2)
            }}</pre>
          </div>

          <!-- Get One -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">
              Récupérer une observation
            </h3>
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
            <pre v-if="results.oneObservation" class="result-box">{{
              JSON.stringify(results.oneObservation, null, 2)
            }}</pre>
          </div>

          <!-- Update Observation -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">Modifier une observation</h3>
            <p class="text-xs text-gray-400 mb-3">Format Phenom Search compatible</p>
            <div class="space-y-3 mb-3">
              <input
                v-model="observationForms.update.id"
                type="text"
                placeholder="ID de l'observation"
                class="input-field"
              />

              <!-- Date et Heure -->
              <div class="p-2 bg-blue-900/20 rounded-lg">
                <p class="text-xs text-blue-400 mb-2">📅 Date & Heure</p>
                <div class="grid grid-cols-2 gap-2">
                  <input
                    v-model="observationForms.update.date"
                    type="date"
                    class="input-field"
                    placeholder="Date"
                  />
                  <input
                    v-model="observationForms.update.time"
                    type="time"
                    class="input-field"
                    placeholder="Heure"
                  />
                </div>
              </div>

              <!-- Localisation -->
              <div class="p-2 bg-green-900/20 rounded-lg">
                <p class="text-xs text-green-400 mb-2">📍 Localisation</p>
                <div class="space-y-2">
                  <input
                    v-model="observationForms.update.location"
                    type="text"
                    placeholder="Lieu (ex: Lausanne, près du lac)"
                    class="input-field"
                  />
                  <div class="grid grid-cols-2 gap-2">
                    <input
                      v-model="observationForms.update.country"
                      type="text"
                      placeholder="Pays"
                      class="input-field"
                    />
                    <select v-model="observationForms.update.locale" class="input-field">
                      <option value="">Type de lieu...</option>
                      <option v-for="locale in LOCALE_TYPES" :key="locale.code" :value="locale.code">
                        {{ locale.icon }} {{ locale.label }}
                      </option>
                    </select>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <input
                      v-model.number="observationForms.update.latitude"
                      type="number"
                      step="0.000001"
                      placeholder="Latitude"
                      class="input-field"
                    />
                    <input
                      v-model.number="observationForms.update.longitude"
                      type="number"
                      step="0.000001"
                      placeholder="Longitude"
                      class="input-field"
                    />
                  </div>
                </div>
              </div>

              <!-- Description -->
              <textarea
                v-model="observationForms.update.description"
                placeholder="Description (min 10 caractères)"
                class="input-field"
                rows="3"
              ></textarea>

              <!-- Évaluation -->
              <div class="p-2 bg-purple-900/20 rounded-lg">
                <p class="text-xs text-purple-400 mb-2">📊 Évaluation</p>
                <div class="grid grid-cols-3 gap-2">
                  <div>
                    <label class="text-xs text-gray-400">Crédibilité (0-15)</label>
                    <input
                      v-model.number="observationForms.update.credibility"
                      type="number"
                      min="0"
                      max="15"
                      class="input-field"
                    />
                  </div>
                  <div>
                    <label class="text-xs text-gray-400">Étrangeté (0-10)</label>
                    <input
                      v-model.number="observationForms.update.strangeness"
                      type="number"
                      min="0"
                      max="10"
                      class="input-field"
                    />
                  </div>
                  <div>
                    <label class="text-xs text-gray-400">Durée (sec)</label>
                    <input
                      v-model.number="observationForms.update.duration"
                      type="number"
                      min="0"
                      placeholder="Secondes"
                      class="input-field"
                    />
                  </div>
                </div>
              </div>

              <!-- Classifications Phenom -->
              <div class="p-2 bg-orange-900/20 rounded-lg">
                <p class="text-xs text-orange-400 mb-2">🏷️ Classifications</p>
                <div class="space-y-2">
                  <div>
                    <label class="text-xs text-gray-400">Types d'observateurs</label>
                    <select
                      v-model="observationForms.update.observerTypes"
                      multiple
                      class="input-field"
                      style="height: 80px"
                    >
                      <option v-for="obs in OBSERVER_TYPES" :key="obs.code" :value="obs.code">
                        {{ obs.icon }} {{ obs.code }} - {{ obs.label }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="text-xs text-gray-400">Formes OVNI</label>
                    <select
                      v-model="observationForms.update.ufoShapes"
                      multiple
                      class="input-field"
                      style="height: 80px"
                    >
                      <option v-for="shape in UFO_SHAPES" :key="shape.code" :value="shape.code">
                        {{ shape.icon }} {{ shape.code }} - {{ shape.label }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="text-xs text-gray-400">Phénomènes</label>
                    <select
                      v-model="observationForms.update.phenomena"
                      multiple
                      class="input-field"
                      style="height: 100px"
                    >
                      <option v-for="pheno in PHENOMENA" :key="pheno.code" :value="pheno.code">
                        {{ pheno.icon }} {{ pheno.code }} - {{ pheno.label }}
                      </option>
                    </select>
                  </div>
                  <p class="text-xs text-gray-500">💡 Ctrl+clic pour sélectionner plusieurs</p>
                </div>
              </div>
            </div>
            <button @click="updateObservation" class="btn-primary mb-3">
              Modifier
            </button>
            <pre v-if="results.updateObservation" class="result-box">{{
              JSON.stringify(results.updateObservation, null, 2)
            }}</pre>
          </div>

          <!-- Delete Observation -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">
              Supprimer une observation
            </h3>
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
            <pre v-if="results.deleteObservation" class="result-box">{{
              JSON.stringify(results.deleteObservation, null, 2)
            }}</pre>
          </div>

          <!-- Generate AI Image -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">
              🤖 Générer une image IA
            </h3>
            <p class="text-sm text-gray-400 mb-3">
              Génère une image IA pour une observation existante sans image, basée sur son titre, description et type.
            </p>
            <div class="space-y-2 mb-3">
              <input
                v-model="observationForms.generateAi.id"
                type="text"
                placeholder="ID de l'observation"
                class="input-field"
              />
            </div>
            <button 
              @click="generateAiImageForObservation" 
              class="btn-primary mb-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
              :disabled="aiImageLoading"
            >
              <span v-if="aiImageLoading">⏳ Génération en cours...</span>
              <span v-else>🤖 Générer l'image</span>
            </button>
            <pre v-if="results.generateAiImage" class="result-box">{{
              JSON.stringify(results.generateAiImage, null, 2)
            }}</pre>
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
            <pre v-if="results.comments" class="result-box">{{
              JSON.stringify(results.comments, null, 2)
            }}</pre>
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
            <pre v-if="results.createComment" class="result-box">{{
              JSON.stringify(results.createComment, null, 2)
            }}</pre>
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
            <pre v-if="results.deleteComment" class="result-box">{{
              JSON.stringify(results.deleteComment, null, 2)
            }}</pre>
          </div>
        </div>
      </section>

      <!-- Section: Images (Migration vers Cloudinary) -->
      <section id="images" class="api-section mb-8">
        <h2 class="section-title">🖼️ Images (Cloudinary)</h2>
        <div class="api-card">
          <div class="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
            <p class="text-blue-200 text-sm">
              ✨ <strong>Migration vers Cloudinary !</strong><br />
              Les images sont maintenant stockées sur Cloudinary avec des URLs
              publiques directes.<br />
              <br />
              📸 Les images sont gérées directement via les observations :<br />
              • <strong>Upload</strong> : Lors de la création d'une
              observation<br />
              • <strong>Affichage</strong> : URLs directes HTTPS (pas besoin
              d'authentification)<br />
              • <strong>Suppression</strong> : Via l'observation<br />
              <br />
              🔗 Consultez la section "Observations" pour gérer les images.
            </p>
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
            <pre v-if="results.adminStats" class="result-box">{{
              JSON.stringify(results.adminStats, null, 2)
            }}</pre>
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
            <pre v-if="results.allUsers" class="result-box">{{
              JSON.stringify(results.allUsers, null, 2)
            }}</pre>
          </div>

          <!-- Update User Role -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">
              Modifier le rôle d'un utilisateur
            </h3>
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
            <pre v-if="results.updateUserRole" class="result-box">{{
              JSON.stringify(results.updateUserRole, null, 2)
            }}</pre>
          </div>

          <!-- Delete Observation (Admin) -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">
              Supprimer une observation (Admin)
            </h3>
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
            <pre v-if="results.deleteObservationAdmin" class="result-box">{{
              JSON.stringify(results.deleteObservationAdmin, null, 2)
            }}</pre>
          </div>

          <!-- Delete Comment (Admin) -->
          <div class="api-card">
            <h3 class="text-lg font-semibold mb-3">
              Supprimer un commentaire (Admin)
            </h3>
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
            <pre v-if="results.deleteCommentAdmin" class="result-box">{{
              JSON.stringify(results.deleteCommentAdmin, null, 2)
            }}</pre>
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
            <pre v-if="results.userDetails" class="result-box">{{
              JSON.stringify(results.userDetails, null, 2)
            }}</pre>
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

              <div
                class="flex items-center justify-between p-3 bg-black/30 rounded-lg"
              >
                <span class="text-sm text-gray-400">Statut:</span>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-sm font-semibold',
                    wsConnected
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400',
                  ]"
                >
                  {{ wsConnected ? "🟢 Connecté" : "🔴 Déconnecté" }}
                </span>
              </div>

              <div class="text-xs text-gray-500">URL: {{ wsUrl }}</div>

              <!-- Erreur de connexion -->
              <div
                v-if="wsError && !wsConnected"
                class="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
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
              <div
                class="flex items-center justify-between p-2 bg-black/30 rounded"
              >
                <div>
                  <span class="font-mono text-violet-mystique"
                    >observations</span
                  >
                  <p class="text-xs text-gray-500">
                    Créations/Modifs/Suppressions d'observations
                  </p>
                </div>
                <span class="text-xs text-green-400">📡 Auto</span>
              </div>
              <div
                class="flex items-center justify-between p-2 bg-black/30 rounded"
              >
                <div>
                  <span class="font-mono text-violet-mystique">comments</span>
                  <p class="text-xs text-gray-500">
                    Créations/Modifs/Suppressions de commentaires
                  </p>
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
              <h3 class="text-lg font-semibold">
                Messages en temps réel ({{ wsMessages.length }})
              </h3>
              <button @click="clearWsMessages" class="btn-secondary">
                🗑️ Effacer
              </button>
            </div>

            <div class="result-box max-h-96 overflow-y-auto">
              <div
                v-if="wsMessages.length === 0"
                class="text-center text-gray-500 py-8"
              >
                <p class="text-2xl mb-2">📭</p>
                <p>Aucun message reçu</p>
                <p class="text-xs mt-2">
                  Créez une observation ou un commentaire pour voir les
                  événements en temps réel
                </p>
              </div>
              <div
                v-for="(msg, index) in wsMessages"
                :key="index"
                class="mb-3 pb-3 border-b border-gray-700 last:border-0"
              >
                <div class="flex items-center justify-between mb-2">
                  <span
                    :class="[
                      'px-2 py-1 rounded text-xs font-mono',
                      msg.type?.includes('created')
                        ? 'bg-green-500/20 text-green-400'
                        : msg.type?.includes('updated')
                          ? 'bg-blue-500/20 text-blue-400'
                          : msg.type?.includes('deleted')
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-500/20 text-gray-400',
                    ]"
                  >
                    {{ msg.type }}
                  </span>
                  <span class="text-xs text-gray-500">{{
                    msg.timestamp || msg.receivedAt
                  }}</span>
                </div>
                <pre class="text-sm bg-black/30 p-2 rounded overflow-x-auto">{{
                  JSON.stringify(msg.data, null, 2)
                }}</pre>
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
import { ref, computed, onMounted } from "vue";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import { observationService } from "../services/observationService";
import { commentService } from "../services/commentService";
import { imageService } from "../services/imageService";
import { adminService } from "../services/adminService";
import { statsService } from "../services/statsService";
import { useWebSocket } from "../composables/useWebSocket";

// Import des utilitaires
import {
  getAuthToken,
  saveAuthToken,
  removeAuthToken,
  getUserData,
  saveUserData,
  removeUserData,
  clearAuthData,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateUserData,
  sanitizeUserData,
  formatUserForDisplay,
  isAdmin,
  canAccessAdminPanel,
  formatDate,
  formatRelativeTime,
} from "../utils";

import OBSERVER_TYPES from "../constants/observerTypes";
import UFO_SHAPES from "../constants/ufoShapes";
import LOCALE_TYPES from "../constants/localeTypes";
import PHENOMENA from "../constants/phenomena";

// Configuration
const apiUrl = computed(() => import.meta.env.VITE_API_BASE_URL);
const wsUrl = computed(() => import.meta.env.VITE_WS_URL);

// État
const healthStatus = ref(null);
const results = ref({});
const observationImageInput = ref(null);
const aiImageLoading = ref(false);

// Récupérer l'utilisateur depuis le localStorage avec les utilitaires
const currentUser = ref(getUserData());
const currentToken = ref(getAuthToken());

// WebSocket
const {
  connected: wsConnected,
  messages: wsMessages,
  error: wsError,
  connect,
  disconnect,
  clearMessages,
} = useWebSocket();

// Sections
const sections = [
  { id: "health", name: "Santé", icon: "🏥" },
  { id: "auth", name: "Auth", icon: "🔐" },
  { id: "users", name: "Users", icon: "👤" },
  { id: "observations", name: "Obs", icon: "🛸" },
  { id: "comments", name: "Comm", icon: "💬" },
  { id: "images", name: "Images", icon: "🖼️" },
  { id: "admin", name: "Admin", icon: "👑" },
  { id: "websocket", name: "WS", icon: "🔌" },
];

// Formulaires
const authForms = ref({
  login: { email: "admin@phenom.app", password: "Admin123!" },
  register: { name: "", email: "", password: "" },
});

const userForms = ref({
  update: { name: "", bio: "" },
  password: { currentPassword: "", newPassword: "", confirmPassword: "" },
});

const observationForms = ref({
  list: {
    page: 1,
    limit: 50,
    search: "",
    sortBy: "createdAt",
    order: "desc",
    // Filtres Phenom Search
    country: "",
    locale: "",
    startYear: null,
    endYear: null,
    minCredibility: null,
    maxCredibility: null,
    minStrangeness: null,
    maxStrangeness: null,
    observerType: "",
    ufoShape: "",
    phenomenon: "",
    hasCoordinates: null,
    hasImages: null,
  },
  create: {
    // Format Phenom Search
    date: "",
    time: "",
    location: "",
    country: "Suisse",
    locale: "",
    description: "",
    credibility: 5,
    strangeness: 5,
    duration: null,
    observerTypes: [],
    ufoShapes: [],
    phenomena: [],
    longitude: null,
    latitude: null,
    imageFile: null,
    imagePreview: null,
    locationError: "",
    generateAiImage: false,
  },
  generateAi: {
    id: "",
  },
  getOne: { id: "" },
  update: {
    id: "",
    date: "",
    time: "",
    location: "",
    country: "",
    locale: "",
    description: "",
    credibility: null,
    strangeness: null,
    duration: null,
    observerTypes: [],
    ufoShapes: [],
    phenomena: [],
    longitude: null,
    latitude: null,
  },
  delete: { id: "" },
});

const commentForms = ref({
  list: {
    observationId: "",
    page: 1,
    limit: 10,
  },
  create: { observationId: "", text: "" },
  delete: { id: "" },
});

const adminForms = ref({
  users: {
    page: 1,
    limit: 10,
    search: "",
    role: "",
  },
  updateRole: { userId: "", role: "" },
  deleteObservation: { id: "" },
  deleteComment: { id: "" },
  userDetails: { id: "" },
});

// Méthodes - Santé & Stats
async function checkHealth() {
  try {
    const response = await statsService.health();
    results.value.health = response;
    healthStatus.value = response.status;
  } catch (error) {
    results.value.health = { error: error.message };
    healthStatus.value = "error";
  }
}

async function getPublicStats() {
  try {
    const response = await statsService.getPublicStats();
    results.value.publicStats = response;
  } catch (error) {
    results.value.publicStats = { error: error.message };
  }
}

// Méthodes - Auth
async function testLogin() {
  try {
    // Valider l'email et le mot de passe avant l'envoi
    if (!validateEmail(authForms.value.login.email)) {
      results.value.login = { error: "Email invalide" };
      return;
    }

    const response = await authService.login(authForms.value.login);
    results.value.login = response;

    console.log("📦 Réponse login complète:", response);

    // Stocker le token et l'utilisateur avec les utilitaires
    const token = response.data?.accessToken || response.data?.token;
    const user = response.data?.user;

    if (token) {
      currentToken.value = token;
      saveAuthToken(token);
      console.log("✅ Token stocké:", token.substring(0, 20) + "...");

      // Stocker aussi le refreshToken
      if (response.data?.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
    } else {
      console.error("❌ Aucun token trouvé dans la réponse");
    }

    // Récupérer et stocker les infos utilisateur avec formatage
    if (user) {
      const formattedUser = formatUserForDisplay(user);
      currentUser.value = formattedUser;
      saveUserData(formattedUser);
      console.log("✅ Utilisateur stocké:", formattedUser.name);
    } else {
      console.error("❌ Aucun utilisateur trouvé dans la réponse");
    }

    console.log("✅ Connecté avec succès");
  } catch (error) {
    console.error("❌ Erreur login:", error);
    results.value.login = { error: error.response?.data || error.message };
  }
}

async function testRegister() {
  try {
    // Valider les données avant l'envoi
    const validation = validateUserData(authForms.value.register, false);
    if (!validation.valid) {
      results.value.register = { error: validation.errors };
      return;
    }

    // Nettoyer les données
    const cleanData = sanitizeUserData(authForms.value.register);
    const response = await authService.register(cleanData);
    results.value.register = response;
  } catch (error) {
    results.value.register = { error: error.response?.data || error.message };
  }
}

async function getProfile() {
  try {
    const response = await authService.getProfile();
    results.value.profile = response;
  } catch (error) {
    results.value.profile = { error: error.response?.data || error.message };
  }
}

function debugLocalStorage() {
  const token = getAuthToken();
  const refreshToken = localStorage.getItem("refreshToken");
  const user = getUserData();

  results.value.debug = {
    token: token
      ? token.substring(0, 30) + "... (" + token.length + " chars)"
      : "null",
    refreshToken: refreshToken
      ? refreshToken.substring(0, 30) +
        "... (" +
        refreshToken.length +
        " chars)"
      : "null",
    user: user,
    currentUser: currentUser.value,
    currentToken: currentToken.value
      ? currentToken.value.substring(0, 30) + "..."
      : "null",
    isAdmin: isAdmin(user),
    canAccessAdmin: canAccessAdminPanel(user),
  };

  console.log("🔍 Debug localStorage:", results.value.debug);
}

async function testLogout() {
  try {
    const response = await authService.logout();
    results.value.logout = response;

    // Nettoyer toutes les données d'authentification avec l'utilitaire
    currentToken.value = null;
    currentUser.value = null;
    clearAuthData();

    console.log("👋 Déconnecté avec succès");
  } catch (error) {
    results.value.logout = { error: error.response?.data || error.message };
  }
}

// Méthodes - Users
async function updateProfile() {
  try {
    // Valider les données
    const validation = validateUserData(userForms.value.update, true);
    if (!validation.valid) {
      results.value.updateProfile = { error: validation.errors };
      return;
    }

    // Nettoyer les données
    const cleanData = sanitizeUserData(userForms.value.update);
    const response = await userService.updateMe(cleanData);
    results.value.updateProfile = response;

    // Mettre à jour l'utilisateur courant
    if (response.success && response.data) {
      const formattedUser = formatUserForDisplay(response.data);
      currentUser.value = formattedUser;
      saveUserData(formattedUser);
    }
  } catch (error) {
    results.value.updateProfile = {
      error: error.response?.data || error.message,
    };
  }
}

async function changePassword() {
  try {
    // Validation côté client avec les utilitaires
    const { currentPassword, newPassword, confirmPassword } =
      userForms.value.password;

    if (!currentPassword || !newPassword || !confirmPassword) {
      results.value.changePassword = {
        error: {
          success: false,
          error: "Tous les champs sont requis",
        },
      };
      return;
    }

    // Utiliser validatePasswordMatch
    if (!validatePasswordMatch(newPassword, confirmPassword)) {
      results.value.changePassword = {
        error: {
          success: false,
          error: "Les mots de passe ne correspondent pas",
        },
      };
      return;
    }

    // Utiliser validatePassword
    if (!validatePassword(newPassword)) {
      results.value.changePassword = {
        error: {
          success: false,
          error: "Le nouveau mot de passe doit contenir au moins 6 caractères",
        },
      };
      return;
    }

    // Debug: vérifier le token
    const token = getAuthToken();
    console.log("🔑 Token présent:", !!token);
    console.log("📝 Données envoyées:", {
      currentPassword: "***",
      newPassword: "***",
      confirmPassword: "***",
    });

    const response = await userService.changePassword(userForms.value.password);
    results.value.changePassword = response;

    // Réinitialiser le formulaire en cas de succès
    if (response.success) {
      userForms.value.password = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
      console.log("✅ Mot de passe changé avec succès");
    }
  } catch (error) {
    console.error("❌ Erreur changement mot de passe:", error);
    results.value.changePassword = {
      error: error.response?.data || error.message,
    };
  }
}

// Méthodes - Géolocalisation et upload
function getGeolocation() {
  observationForms.value.create.locationError = "";

  if (!navigator.geolocation) {
    observationForms.value.create.locationError =
      "❌ Géolocalisation non supportée par ce navigateur";
    return;
  }

  observationForms.value.create.locationError = "🔄 Détection en cours...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      observationForms.value.create.longitude = position.coords.longitude;
      observationForms.value.create.latitude = position.coords.latitude;
      observationForms.value.create.locationError = `✅ Position détectée: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
    },
    (error) => {
      let errorMsg = "❌ ";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg +=
            "Permission refusée. Autorisez la géolocalisation dans les paramètres.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg += "Position non disponible.";
          break;
        case error.TIMEOUT:
          errorMsg += "Délai de détection dépassé.";
          break;
        default:
          errorMsg += "Erreur inconnue.";
      }
      observationForms.value.create.locationError = errorMsg;
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
  );
}

function handleObservationImageSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Validation du fichier
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 10 * 1024 * 1024; // 10 MB

  if (!validTypes.includes(file.type)) {
    results.value.createObservation = {
      error: "Format non valide. Utilisez JPEG, PNG ou WebP.",
    };
    event.target.value = "";
    return;
  }

  if (file.size > maxSize) {
    results.value.createObservation = {
      error: "Fichier trop volumineux. Max: 10 MB.",
    };
    event.target.value = "";
    return;
  }

  // Stocker le fichier
  observationForms.value.create.imageFile = file;

  // Créer un aperçu
  const reader = new FileReader();
  reader.onload = (e) => {
    observationForms.value.create.imagePreview = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Méthodes - Observations
function resetObservationFilters() {
  observationForms.value.list = {
    page: 1,
    limit: 10,
    search: "",
    country: "",
    locale: "",
    startYear: null,
    endYear: null,
    minCredibility: null,
    maxCredibility: null,
    minStrangeness: null,
    maxStrangeness: null,
    minDuration: null,
    maxDuration: null,
    observerType: "",
    ufoShape: "",
    phenomenon: "",
    hasCoordinates: null,
    hasImages: null,
  };
  results.value.observations = null;
}

async function getObservations() {
  try {
    const response = await observationService.getAll(
      observationForms.value.list,
    );
    results.value.observations = response;
  } catch (error) {
    results.value.observations = {
      error: error.response?.data || error.message,
    };
  }
}

async function createObservation() {
  try {
    const useAiImage = observationForms.value.create.generateAiImage;

    // Validation
    if (!useAiImage && !observationForms.value.create.imageFile) {
      results.value.createObservation = { error: "Une photo est requise (ou activez la génération IA)" };
      return;
    }

    if (!observationForms.value.create.description || observationForms.value.create.description.length < 10) {
      results.value.createObservation = {
        error: "La description doit contenir au moins 10 caractères",
      };
      return;
    }

    // Étape 1: Créer l'observation
    results.value.createObservation = {
      status: useAiImage ? "🤖 Création de l'observation + génération IA en cours..." : "Création de l'observation...",
    };

    // Format Phenom Search
    const observationData = {
      description: observationForms.value.create.description,
    };

    // Champs optionnels
    if (observationForms.value.create.date) {
      observationData.date = observationForms.value.create.date;
    }
    if (observationForms.value.create.time) {
      observationData.time = observationForms.value.create.time;
    }
    if (observationForms.value.create.location) {
      observationData.location = observationForms.value.create.location;
    }
    if (observationForms.value.create.country) {
      observationData.country = observationForms.value.create.country;
    }
    if (observationForms.value.create.locale) {
      observationData.locale = observationForms.value.create.locale;
    }
    if (observationForms.value.create.credibility !== null) {
      observationData.credibility = observationForms.value.create.credibility;
    }
    if (observationForms.value.create.strangeness !== null) {
      observationData.strangeness = observationForms.value.create.strangeness;
    }
    if (observationForms.value.create.duration !== null) {
      observationData.duration = observationForms.value.create.duration;
    }
    if (observationForms.value.create.observerTypes?.length > 0) {
      observationData.observerTypes = observationForms.value.create.observerTypes;
    }
    if (observationForms.value.create.ufoShapes?.length > 0) {
      observationData.ufoShapes = observationForms.value.create.ufoShapes;
    }
    if (observationForms.value.create.phenomena?.length > 0) {
      observationData.phenomena = observationForms.value.create.phenomena;
    }
    if (observationForms.value.create.latitude && observationForms.value.create.longitude) {
      observationData.coordinates = {
        lat: observationForms.value.create.latitude,
        lng: observationForms.value.create.longitude,
      };
    }

    // Si génération IA, ajouter le flag
    if (useAiImage) {
      observationData.generateAiImage = true;
    }

    const observationResponse =
      await observationService.create(observationData);
    const observationId =
      observationResponse.data?.id || observationResponse.data?._id;

    // Étape 2: Si upload classique, uploader l'image
    if (!useAiImage && observationForms.value.create.imageFile) {
      results.value.createObservation = { status: "Upload de l'image..." };

      await imageService.uploadToObservation(
        observationId,
        observationForms.value.create.imageFile,
      );
    }

    // Récupérer l'observation complète avec l'image
    const finalObservation = await observationService.getById(observationId);
    results.value.createObservation = finalObservation;

    // Reset du formulaire
    observationForms.value.create = {
      date: "",
      time: "",
      location: "",
      country: "Suisse",
      locale: "",
      description: "",
      credibility: 5,
      strangeness: 5,
      duration: null,
      observerTypes: [],
      ufoShapes: [],
      phenomena: [],
      longitude: null,
      latitude: null,
      imageFile: null,
      imagePreview: null,
      locationError: "",
      generateAiImage: false,
    };
  } catch (error) {
    results.value.createObservation = {
      error: error.response?.data || error.message,
    };
  }
}

async function getOneObservation() {
  try {
    const response = await observationService.getById(
      observationForms.value.getOne.id,
    );
    results.value.oneObservation = response;
  } catch (error) {
    results.value.oneObservation = {
      error: error.response?.data || error.message,
    };
  }
}

async function updateObservation() {
  try {
    const { id, longitude, latitude, ...formData } =
      observationForms.value.update;

    // Construire l'objet data en format Phenom Search
    const data = {};

    // Champs optionnels - n'ajouter que si définis
    if (formData.date) data.date = formData.date;
    if (formData.time) data.time = formData.time;
    if (formData.location) data.location = formData.location;
    if (formData.country) data.country = formData.country;
    if (formData.locale) data.locale = formData.locale;
    if (formData.description) data.description = formData.description;
    if (formData.credibility !== null && formData.credibility !== undefined) {
      data.credibility = formData.credibility;
    }
    if (formData.strangeness !== null && formData.strangeness !== undefined) {
      data.strangeness = formData.strangeness;
    }
    if (formData.duration !== null && formData.duration !== undefined) {
      data.duration = formData.duration;
    }
    if (formData.observerTypes?.length > 0) {
      data.observerTypes = formData.observerTypes;
    }
    if (formData.ufoShapes?.length > 0) {
      data.ufoShapes = formData.ufoShapes;
    }
    if (formData.phenomena?.length > 0) {
      data.phenomena = formData.phenomena;
    }

    // Ajouter les coordonnées si fournies (format Phenom Search)
    if (latitude !== null && longitude !== null) {
      data.coordinates = {
        lat: latitude,
        lng: longitude,
      };
    }

    const response = await observationService.update(id, data);
    results.value.updateObservation = response;
  } catch (error) {
    results.value.updateObservation = {
      error: error.response?.data || error.message,
    };
  }
}

async function deleteObservation() {
  try {
    const response = await observationService.delete(
      observationForms.value.delete.id,
    );
    results.value.deleteObservation = response;
  } catch (error) {
    results.value.deleteObservation = {
      error: error.response?.data || error.message,
    };
  }
}

// Générer une image IA pour une observation existante
async function generateAiImageForObservation() {
  try {
    aiImageLoading.value = true;
    const response = await observationService.generateAiImage(
      observationForms.value.generateAi.id,
    );
    results.value.generateAiImage = response;
  } catch (error) {
    results.value.generateAiImage = {
      error: error.response?.data || error.message,
    };
  } finally {
    aiImageLoading.value = false;
  }
}

// Méthodes - Comments
async function getComments() {
  try {
    const { observationId, page, limit } = commentForms.value.list;
    const params = { page, limit };
    const response = await commentService.getByObservation(
      observationId,
      params,
    );
    results.value.comments = response;
  } catch (error) {
    results.value.comments = { error: error.response?.data || error.message };
  }
}

async function createComment() {
  try {
    const { observationId, text } = commentForms.value.create;
    const response = await commentService.create(observationId, text);
    results.value.createComment = response;
  } catch (error) {
    results.value.createComment = {
      error: error.response?.data || error.message,
    };
  }
}

async function deleteComment() {
  try {
    const response = await commentService.delete(commentForms.value.delete.id);
    results.value.deleteComment = response;
  } catch (error) {
    results.value.deleteComment = {
      error: error.response?.data || error.message,
    };
  }
}

// Méthodes - Admin
async function getAdminStats() {
  try {
    const response = await adminService.getStats();
    results.value.adminStats = response;
  } catch (error) {
    results.value.adminStats = { error: error.response?.data || error.message };
  }
}

async function getAllUsers() {
  try {
    const params = adminForms.value.users;
    const response = await adminService.getUsers(params);
    results.value.allUsers = response;
  } catch (error) {
    results.value.allUsers = { error: error.response?.data || error.message };
  }
}

async function updateUserRole() {
  try {
    const { userId, role } = adminForms.value.updateRole;
    const response = await adminService.updateUserRole(userId, role);
    results.value.updateUserRole = response;
  } catch (error) {
    results.value.updateUserRole = {
      error: error.response?.data || error.message,
    };
  }
}

async function deleteObservationAdmin() {
  try {
    const response = await adminService.deleteObservation(
      adminForms.value.deleteObservation.id,
    );
    results.value.deleteObservationAdmin = response;
  } catch (error) {
    results.value.deleteObservationAdmin = {
      error: error.response?.data || error.message,
    };
  }
}

async function deleteCommentAdmin() {
  try {
    const response = await adminService.deleteComment(
      adminForms.value.deleteComment.id,
    );
    results.value.deleteCommentAdmin = response;
  } catch (error) {
    results.value.deleteCommentAdmin = {
      error: error.response?.data || error.message,
    };
  }
}

async function getUserDetails() {
  try {
    const response = await adminService.getUserDetails(
      adminForms.value.userDetails.id,
    );
    results.value.userDetails = response;
  } catch (error) {
    results.value.userDetails = {
      error: error.response?.data || error.message,
    };
  }
}

// Méthodes - WebSocket
function connectWs() {
  // Pas besoin de token pour WsMini PubSub (canaux en lecture seule)
  connect();
}

function disconnectWs() {
  disconnect();
}

function clearWsMessages() {
  clearMessages();
}

// Utilitaires
function scrollToSection(sectionId) {
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
}

// Lifecycle
onMounted(() => {
  checkHealth();

  // Charger l'utilisateur depuis localStorage avec l'utilitaire
  const savedUser = getUserData();
  if (savedUser) {
    currentUser.value = savedUser;
    console.log("👤 Utilisateur chargé:", savedUser.name);
    console.log("🔑 Est admin:", isAdmin(savedUser));
  }
});
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
  font-family: "Courier New", monospace;
}
</style>
