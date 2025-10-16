# Architecture & Conception Frontend — Phenom App

> Document de référence pour concevoir et implémenter l'interface utilisateur du projet Phenom (UFO Observation App). Toutes les équipes doivent s'y référer avant et pendant le développement.

---

## 1. Vision Produit & Objectifs

### 1.1 Mission
Créer une Progressive Web App (PWA) intuitive et accessible qui permet aux utilisateurs de signaler des observations de phénomènes OVNI avec géolocalisation automatique et capture photo, tout en offrant aux administrateurs une interface de modération complète et efficace.

### 1.2 Objectifs clés
- **Expérience utilisateur** : interface simple et rapide pour signaler une observation avec photo et GPS.
- **Expérience administrative** : outils de modération et gestion des utilisateurs efficaces.
- **Performance** : chargement rapide (< 3s), interactions fluides, fonctionnement hors-ligne basique.
- **Mobile-first** : optimisé pour smartphones avec accès aux fonctionnalités matérielles (caméra, GPS).

### 1.3 Personas principaux
| Persona | Besoins clés | Appareil principal |
|---------|--------------|-------------------|
| **Observateur** | Signaler rapidement un phénomène, prendre photo, voir observations proches | Smartphone (PWA) |
| **Admin** | Modérer contenus, gérer utilisateurs, analyser activité | Desktop/Tablette |
| **Visiteur** | Consulter observations publiques, commenter | Smartphone/Desktop |

---

## 2. Cartographie Fonctionnelle

### 2.1 Modules Fonctionnels
| Domaine | Description | Interfaces |
|---------|-------------|------------|
| **Observations** | Liste, création, détail, modification des observations OVNI | Public + Admin |
| **Géolocalisation** | Capture position GPS, affichage sur carte, filtrage par zone | Public |
| **Photos** | Capture via caméra, upload, affichage, gestion | Public + Admin |
| **Commentaires** | Système de commentaires sur observations | Public + Admin |
| **Authentification** | Inscription, connexion, gestion profil | Public |
| **Administration** | Modération observations/commentaires, gestion utilisateurs | Admin |
| **Navigation** | Structure d'app mobile-first avec navigation intuitive | Public + Admin |

### 2.2 User Journeys clés
1. **Observateur** : ouvre l'app → se géolocalise → capture photo → décrit observation → publie → reçoit confirmation.
2. **Visiteur** : parcourt observations → filtre par zone géographique → consulte détails → commente.
3. **Admin** : se connecte → consulte observations récentes → modère contenu → gère utilisateurs.

---

## 3. Exigences & Contraintes

### 3.1 Exigences non fonctionnelles
| Catégorie | Cible | Notes |
|-----------|-------|-------|
| Performance | LCP < 3s, FID < 100ms | Mesures sur mobile 3G |
| Responsivité | Support 320px → 1920px | Design mobile-first |
| UX | Création observation en < 5 interactions | Navigation simplifiée |
| Accessibilité | WCAG 2.1 AA | Navigation clavier, contrastes |
| PWA | Installable, cache basique | Service worker pour offline |
| Sécurité | Protection XSS, validation inputs | Sanitisation données |

### 3.2 Compatibilité
- Navigateurs : Chrome 90+, Safari 14+, Firefox 88+, Edge 90+
- PWA installable sur Android et iOS (limitations Safari)
- Fonctionnalités matérielles : caméra, géolocalisation GPS
- Résolutions : responsive design 320×568 → 1920×1080

---

## 4. Architecture d'Application

### 4.1 Stack Technique
| Couche | Technologies |
|--------|--------------|
| Framework | Vue.js 3.4+ (Composition API) |
| Outil build | Vite 5.0+ |
| Routage | Vue Router 4.2+ |
| Gestion HTTP | Axios 1.6+ (client configuré) |
| État | Pinia 2.1+ + Composables |
| Styling | TailwindCSS 3.3+ |
| UI Components | Headless UI + composants custom |
| Cartes | Leaflet.js + OpenStreetMap |
| PWA | vite-plugin-pwa + Workbox |
| Tests | Vitest + Testing Library Vue |

### 4.2 Vue d'ensemble architecture
```
[App Shell] → [Layouts responsifs] → [Pages (views)] → [Composants métier] → [Composants UI de base]
                                ↓
                    [Composables métier] ─┬─> [Services API (Axios)]
                                         ├─> [Stores Pinia]
                                         └─> [Services navigateur (GPS, Caméra)]
```

### 4.3 Décisions d'architecture majeures
| ID | Décision | Motivation | Impact |
|----|----------|------------|--------|
| **F-ADR-001** | Vue 3 Composition API | Réutilisabilité, testabilité moderne | Courbe apprentissage Vue 3 |
| **F-ADR-002** | TailwindCSS | Cohérence visuelle, développement rapide | Discipline design nécessaire |
| **F-ADR-003** | Leaflet pour cartes | Léger, gratuit, flexible | Alternative à Google Maps |
| **F-ADR-004** | PWA avec cache minimal | Fonctionnement offline basique | Maintenance service worker |
| **F-ADR-005** | Mobile-first design | Usage principal sur smartphone | Contraintes UI desktop |

---

## 5. Structure de Projet Vue

```
src/
├── app/
│   ├── App.vue
│   ├── main.js
│   └── router/
│       ├── index.js
│       ├── guards.js
│       └── routes.js
├── assets/
│   ├── images/
│   └── icons/
├── components/
│   ├── base/           # Composants UI génériques
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   ├── BaseModal.vue
│   │   └── BaseSpinner.vue
│   ├── layout/
│   │   ├── AppHeader.vue
│   │   ├── AppFooter.vue
│   │   ├── AppNavigation.vue
│   │   └── AppSidebar.vue
│   └── domain/         # Composants métier
│       ├── ObservationCard.vue
│       ├── ObservationForm.vue
│       ├── CommentList.vue
│       ├── LocationMap.vue
│       └── PhotoCapture.vue
├── composables/
│   ├── useAuth.js
│   ├── useObservations.js
│   ├── useGeolocation.js
│   ├── useCamera.js
│   └── useComments.js
├── layouts/
│   ├── DefaultLayout.vue
│   ├── AuthLayout.vue
│   └── AdminLayout.vue
├── pages/
│   ├── HomeView.vue
│   ├── ObservationsView.vue
│   ├── ObservationDetailView.vue
│   ├── CreateObservationView.vue
│   ├── LoginView.vue
│   ├── RegisterView.vue
│   ├── ProfileView.vue
│   └── admin/
│       ├── AdminDashboard.vue
│       ├── AdminObservations.vue
│       └── AdminUsers.vue
├── services/
│   ├── api/
│   │   ├── client.js
│   │   ├── auth.js
│   │   ├── observations.js
│   │   ├── comments.js
│   │   └── admin.js
│   ├── geolocation.js
│   ├── camera.js
│   └── storage.js
├── stores/
│   ├── auth.js
│   ├── observations.js
│   └── ui.js
├── utils/
│   ├── constants.js
│   ├── validators.js
│   └── formatters.js
└── styles/
    ├── main.css
    └── components.css
```

---

## 6. Gestion d'État & Services

### 6.1 Stores Pinia
| Store | Responsabilité | État principal |
|-------|----------------|----------------|
| `useAuthStore` | Authentification utilisateur | `user`, `token`, `isAuthenticated` |
| `useObservationsStore` | Cache observations | `observations`, `filters`, `pagination` |
| `useUIStore` | État interface | `loading`, `notifications`, `modals` |

### 6.2 Composables métier
- `useAuth()` : gestion authentification, permissions
- `useObservations()` : CRUD observations, filtres, pagination
- `useGeolocation()` : accès GPS, gestion permissions
- `useCamera()` : capture photo, preview, upload
- `useComments()` : gestion commentaires sur observations

### 6.3 Services API
```javascript
// services/api/observations.js
export class ObservationsService {
  async getObservations(filters = {}) {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      search: filters.search,
      lat: filters.lat,
      lng: filters.lng,
      radius: filters.radius
    }
    return apiClient.get('/observations', { params })
  }

  async createObservation(data) {
    return apiClient.post('/observations', data)
  }

  async updateObservation(id, data) {
    return apiClient.put(`/observations/${id}`, data)
  }
}
```

---

## 7. Fonctionnalités Matérielles

### 7.1 Géolocalisation
```javascript
// composables/useGeolocation.js
export function useGeolocation() {
  const location = ref(null)
  const error = ref(null)
  const loading = ref(false)

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      error.value = 'Géolocalisation non supportée'
      return
    }

    loading.value = true
    navigator.geolocation.getCurrentPosition(
      (position) => {
        location.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        loading.value = false
      },
      (err) => {
        error.value = err.message
        loading.value = false
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return { location, error, loading, getCurrentPosition }
}
```

### 7.2 Capture Photo
```javascript
// composables/useCamera.js
export function useCamera() {
  const canvas = ref(null)
  const video = ref(null)
  const photo = ref(null)
  const stream = ref(null)

  const startCamera = async () => {
    try {
      stream.value = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }  // Caméra arrière préférée
      })
      if (video.value) {
        video.value.srcObject = stream.value
      }
    } catch (error) {
      console.error('Erreur accès caméra:', error)
    }
  }

  const takePhoto = () => {
    if (canvas.value && video.value) {
      const context = canvas.value.getContext('2d')
      canvas.value.width = video.value.videoWidth
      canvas.value.height = video.value.videoHeight
      context.drawImage(video.value, 0, 0)
      photo.value = canvas.value.toDataURL('image/jpeg', 0.8)
    }
  }

  return { photo, startCamera, takePhoto, stopCamera }
}
```

---

## 8. Design System & UI

### 8.1 Palette de couleurs (thème sombre pour le ciel nocturne)
```css
:root {
  /* Couleurs primaires */
  --color-primary: #1E40AF;      /* Bleu profond */
  --color-primary-light: #3B82F6; /* Bleu clair */
  --color-secondary: #7C3AED;     /* Violet (mystérieux) */
  
  /* Couleurs neutres */
  --color-dark: #0F172A;         /* Noir bleuté */
  --color-gray: #334155;         /* Gris ardoise */
  --color-light: #F8FAFC;       /* Blanc cassé */
  
  /* Couleurs d'état */
  --color-success: #059669;      /* Vert */
  --color-warning: #D97706;      /* Orange */
  --color-error: #DC2626;        /* Rouge */
}
```

### 8.2 Composants de base
- **BaseButton** : variations primary, secondary, ghost, sizes
- **BaseInput** : validation intégrée, états erreur/succès
- **BaseModal** : overlay avec gestion escape/backdrop
- **BaseSpinner** : indicateurs de chargement cohérents

### 8.3 Composants métier critiques
1. **ObservationCard** : carte d'observation avec photo, localisation, preview
2. **LocationMap** : carte interactive Leaflet avec marqueurs
3. **PhotoCapture** : interface caméra avec preview et validation
4. **CommentList** : liste commentaires avec pagination infinie

---

## 9. Routing & Navigation

### 9.1 Structure des routes
```javascript
const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      { path: '', name: 'home', component: HomeView },
      { path: '/observations', name: 'observations', component: ObservationsView },
      { path: '/observations/new', name: 'create-observation', component: CreateObservationView, meta: { requiresAuth: true } },
      { path: '/observations/:id', name: 'observation-detail', component: ObservationDetailView },
      { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } }
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { path: 'login', name: 'login', component: LoginView },
      { path: 'register', name: 'register', component: RegisterView }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresRole: 'admin' },
    children: [
      { path: '', name: 'admin-dashboard', component: AdminDashboard },
      { path: 'observations', name: 'admin-observations', component: AdminObservations },
      { path: 'users', name: 'admin-users', component: AdminUsers }
    ]
  }
]
```

### 9.2 Guards de navigation
- **Authentication Guard** : vérification connexion
- **Role Guard** : vérification permissions admin
- **Route Meta** : informations additionnelles pour les guards

---

## 10. PWA & Performance

### 10.1 Configuration PWA
```javascript
// vite.config.js - plugin PWA
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.phenom\.app\/observations/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'observations-cache'
        }
      }
    ]
  },
  manifest: {
    name: 'Phenom - Observations OVNI',
    short_name: 'Phenom',
    description: 'Application d\'observation de phénomènes OVNI',
    theme_color: '#1E40AF',
    background_color: '#0F172A',
    display: 'standalone',
    start_url: '/',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
})
```

### 10.2 Optimisations performance
- **Lazy loading** : composants et routes chargés à la demande
- **Image optimization** : compression et formats WebP
- **Bundle splitting** : séparation vendor/app chunks
- **Prefetching** : pré-chargement ressources critiques

---

## 11. Tests & Qualité

### 11.1 Stratégie de test
- **Unit tests** : composables et utilitaires (Vitest)
- **Component tests** : composants clés (Testing Library Vue)
- **E2E tests** : parcours utilisateur critiques (Cypress/Playwright)

### 11.2 Tests critiques
1. **Création observation** : capture photo + GPS + soumission
2. **Navigation** : routage et guards d'authentification
3. **Responsive** : affichage mobile/desktop
4. **PWA** : installation et fonctionnement offline basique

---

## 12. Sécurité Frontend

### 12.1 Bonnes pratiques
- **Token management** : stockage sécurisé JWT (memory + refresh)
- **Input validation** : sanitisation côté client (+ serveur)
- **XSS protection** : Vue échappe par défaut, attention v-html
- **HTTPS** : force SSL en production
- **CSP headers** : configuré côté serveur

### 12.2 Gestion des erreurs
```javascript
// services/api/client.js
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status } = error.response || {}
    
    switch (status) {
      case 401:
        // Token expiré - redirection login
        authStore.logout()
        router.push('/auth/login')
        break
      case 403:
        // Accès interdit
        uiStore.showNotification('Accès non autorisé', 'error')
        break
      case 500:
        // Erreur serveur
        uiStore.showNotification('Erreur serveur temporaire', 'error')
        break
      default:
        uiStore.showNotification('Une erreur est survenue', 'error')
    }
    
    return Promise.reject(error)
  }
)
```

---

## 13. Déploiement & Build

### 13.1 Configuration Vite production
```javascript
// vite.config.js
export default defineConfig({
  plugins: [vue(), VitePWA(...)],
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['@headlessui/vue'],
          'map-vendor': ['leaflet']
        }
      }
    }
  },
  define: {
    __VUE_PROD_DEVTOOLS__: false
  }
})
```

### 13.2 Variables d'environnement
| Variable | Description | Exemple |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | URL de l'API backend | `https://phenom-api.onrender.com` |
| `VITE_APP_NAME` | Nom de l'application | `Phenom` |
| `VITE_MAP_TILES_URL` | URL des tuiles de carte | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` |

---

## 14. Checklist Développement

### Phase 1 - Setup (1 semaine)
- [ ] Initialiser projet Vite + Vue 3
- [ ] Configurer TailwindCSS et structure de base
- [ ] Mettre en place router et layouts
- [ ] Configurer API client Axios
- [ ] Tests unitaires de base

### Phase 2 - Core Features (3 semaines)
- [ ] Authentification (login/register/logout)
- [ ] Liste observations avec pagination
- [ ] Création observation (photo + GPS + formulaire)
- [ ] Détail observation + commentaires
- [ ] Interface responsive mobile-first

### Phase 3 - Admin & Polish (2 semaines)
- [ ] Interface administration
- [ ] PWA configuration et test
- [ ] Optimisations performance
- [ ] Tests E2E
- [ ] Documentation utilisateur

---

**Mainteneur principal** : Équipe Frontend Phenom  
**Version** : Frontend Design v1.0 (15/10/2025)  
**Statut** : En cours de validation