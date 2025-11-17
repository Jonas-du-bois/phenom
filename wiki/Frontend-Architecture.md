# Frontend Architecture

The Phenom frontend is a modern single-page application (SPA) built with Vue.js 3, providing an interactive and responsive user interface for UFO observation reporting and exploration.

## Technology Stack

- **Framework**: Vue.js 3.4 (Composition API)
- **Build Tool**: Vite 5.0
- **Router**: Vue Router 4.6
- **State Management**: Pinia 2.3
- **HTTP Client**: Axios 1.12
- **Maps**: Leaflet 1.9 + MarkerCluster
- **Styling**: Tailwind CSS 3.4
- **Icons**: Vicons Fluent 0.13
- **WebSocket**: WsMini 1.2.0
- **Testing**: Vitest 1.6 + Vue Test Utils 2.4
- **PWA**: Vite Plugin PWA 0.17

## Project Structure

```
frontend/
├── src/
│   ├── main.js                   # Application entry point
│   ├── App.vue                   # Root component
│   ├── style.css                 # Global styles (Tailwind)
│   ├── components/               # Reusable UI components
│   │   ├── StarryBackground.vue  # Animated starry background
│   │   ├── BottomNav.vue         # Mobile navigation bar
│   │   ├── HeroSection.vue       # Landing page hero
│   │   ├── PageContainer.vue     # Page wrapper component
│   │   ├── ImageManager.vue      # Image upload/management
│   │   ├── test_AppLayout.vue    # Main app layout with nav
│   │   ├── test_BaseAvatar.vue   # User avatar component
│   │   ├── test_BaseButton.vue   # Customizable button
│   │   ├── test_BaseCard.vue     # Card container
│   │   ├── test_BaseInput.vue    # Form input component
│   │   ├── test_BaseLoading.vue  # Loading spinner
│   │   └── test_BaseModal.vue    # Modal dialog
│   ├── views/                    # Page components (routes)
│   │   ├── test_AuthPage.vue     # Login/Register page
│   │   ├── test_HomeView.vue     # Home page with hero
│   │   ├── test_FeedView.vue     # Observations feed
│   │   ├── test_MapView.vue      # Interactive map view
│   │   ├── test_CreateObservationView.vue  # New observation form
│   │   ├── test_ObservationDetailView.vue  # Observation details
│   │   ├── test_UserProfileView.vue        # User profile page
│   │   ├── NotFoundView.vue      # 404 page
│   │   ├── HomeView.vue          # Legacy home (kept for compatibility)
│   │   └── pageTest.vue          # Testing page
│   ├── stores/                   # Pinia state stores
│   │   ├── auth.js               # Authentication state
│   │   ├── observation.js        # Observations state
│   │   ├── comment.js            # Comments state
│   │   ├── user.js               # User profile state
│   │   └── admin.js              # Admin features state
│   ├── composables/              # Reusable composition functions
│   │   ├── index.js              # Composables exports
│   │   ├── useAuth.js            # Authentication logic
│   │   ├── useObservations.js    # Observations management
│   │   ├── useComments.js        # Comments management
│   │   ├── useImageUpload.js     # Image upload logic
│   │   ├── useMap.js             # Leaflet map integration
│   │   ├── useGeolocation.js     # GPS location access
│   │   ├── useWebSocket.js       # WebSocket connection
│   │   ├── useToast.js           # Toast notifications
│   │   ├── useModal.js           # Modal dialog control
│   │   ├── useErrorHandler.js    # Error handling
│   │   ├── useCamera.js          # Camera access
│   │   ├── useTags.js            # Tag management
│   │   ├── useInfiniteScroll.js  # Infinite scroll pagination
│   │   └── useScrollDirection.js # Scroll direction detection
│   ├── services/                 # API client services
│   │   ├── authService.js        # Auth API calls
│   │   ├── userService.js        # User API calls
│   │   ├── observationService.js # Observations API calls
│   │   ├── commentService.js     # Comments API calls
│   │   ├── imageService.js       # Image upload API
│   │   ├── adminService.js       # Admin API calls
│   │   └── statsService.js       # Statistics API calls
│   ├── router/                   # Vue Router configuration
│   │   └── index.js              # Routes and navigation guards
│   ├── utils/                    # Helper utilities
│   │   ├── index.js              # Utilities exports
│   │   ├── api.js                # Axios configuration
│   │   ├── constants.js          # App constants
│   │   ├── formatters.js         # Data formatting
│   │   ├── validators.js         # Form validation
│   │   ├── storage.js            # LocalStorage helpers
│   │   ├── geolocation.js        # Geolocation utilities
│   │   ├── permissions.js        # Permission checks
│   │   ├── observationHelpers.js # Observation helpers
│   │   ├── commentHelpers.js     # Comment helpers
│   │   ├── userHelpers.js        # User helpers
│   │   └── imageHelpers.js       # Image helpers
│   └── constants/                # Application constants
│       ├── index.js
│       └── observationTypes.js   # UFO classification codes
├── public/                       # Static assets
├── index.html                    # HTML template
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS config
├── postcss.config.js             # PostCSS config
├── nginx.conf                    # Production nginx config
├── Dockerfile                    # Development container
├── Dockerfile.prod               # Production container
└── package.json                  # Dependencies
```

## Core Concepts

### 1. Composition API

All components use Vue 3's Composition API with `<script setup>`.

**Example**:
```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useObservations } from '@/composables/useObservations'

const { observations, loading, fetchObservations } = useObservations()
const searchQuery = ref('')

const filteredObservations = computed(() => {
  return observations.value.filter(obs => 
    obs.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

onMounted(async () => {
  await fetchObservations()
})
</script>
```

### 2. State Management (Pinia)

Pinia stores manage global application state.

**Store Pattern**:
```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMyStore = defineStore('myStore', () => {
  // State
  const items = ref([])
  const loading = ref(false)
  
  // Getters
  const itemCount = computed(() => items.value.length)
  
  // Actions
  const fetchItems = async () => {
    loading.value = true
    try {
      // API call
    } finally {
      loading.value = false
    }
  }
  
  return { items, loading, itemCount, fetchItems }
})
```

**Stores**:
- **auth.js**: User authentication state, tokens, login/logout
- **observation.js**: Observations list, current observation, CRUD operations
- **comment.js**: Comments management
- **user.js**: User profile data
- **admin.js**: Admin-only features and stats

### 3. Routing

Vue Router handles navigation with route guards.

**Routes**:
- `/auth` - Login/Register (public)
- `/home` - Home page with hero (protected)
- `/feed` - Observations feed (protected)
- `/map` - Interactive map (protected)
- `/create` - New observation form (protected)
- `/observations/:id` - Observation details (protected)
- `/profile/:userId?` - User profile (protected)
- `/*` - 404 Not Found

**Navigation Guard**:
```javascript
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = !!localStorage.getItem('token')
  
  if (requiresAuth && !isAuthenticated) {
    next('/auth')  // Redirect to login
  } else if (to.path === '/auth' && isAuthenticated) {
    next('/home')  // Redirect to home if already logged in
  } else {
    next()
  }
})
```

### 4. Composables

Reusable composition functions encapsulate logic.

#### useAuth.js
Manages authentication state and operations.

**Features**:
- Login/Register/Logout
- Token management (localStorage)
- Auto-refresh tokens
- User profile fetching
- Role checking (admin/viewer)

**API**:
```javascript
const {
  user,           // Current user object
  token,          // Access token
  isAuthenticated,// Boolean
  isAdmin,        // Boolean
  login,          // (credentials) => Promise
  register,       // (userData) => Promise
  logout,         // () => void
  init            // () => void (restore from localStorage)
} = useAuth()
```

#### useObservations.js
Manages observations data and operations.

**Features**:
- Fetch observations (with filters, pagination)
- Create/Update/Delete observations
- Search and filtering
- WebSocket real-time updates
- Infinite scroll support

**API**:
```javascript
const {
  observations,       // Array of observations
  currentObservation, // Selected observation
  loading,            // Boolean
  error,              // Error message
  hasMore,            // Boolean (pagination)
  fetchObservations,  // (filters?) => Promise
  fetchById,          // (id) => Promise
  createObservation,  // (data) => Promise
  updateObservation,  // (id, data) => Promise
  deleteObservation,  // (id) => Promise
  searchObservations, // (query) => Promise
  loadMore            // () => Promise (infinite scroll)
} = useObservations()
```

#### useMap.js
Leaflet map integration.

**Features**:
- Map initialization
- Marker management
- Clustering
- User location tracking
- Event handling

**API**:
```javascript
const {
  map,              // Leaflet map instance
  markers,          // Array of markers
  userMarker,       // User's location marker
  initMap,          // (elementId, options) => void
  addMarker,        // (lat, lng, data) => Marker
  removeMarker,     // (marker) => void
  clearMarkers,     // () => void
  centerOn,         // (lat, lng, zoom?) => void
  getUserLocation   // () => Promise<{lat, lng}>
} = useMap()
```

#### useWebSocket.js
Real-time WebSocket connection.

**Features**:
- Connection management
- Channel subscription
- Event listening
- Auto-reconnection

**API**:
```javascript
const {
  connected,        // Boolean
  subscribe,        // (channel, callback) => void
  unsubscribe,      // (channel) => void
  onObservation,    // (callback) => void (observation events)
  onComment,        // (callback) => void (comment events)
  connect,          // () => void
  disconnect        // () => void
} = useWebSocket()
```

#### useImageUpload.js
Image upload and preview.

**Features**:
- File selection
- Image preview
- Compression before upload
- Multiple images support
- Cloudinary upload

**API**:
```javascript
const {
  images,           // Array of image objects
  previews,         // Array of preview URLs
  uploading,        // Boolean
  selectImages,     // (files) => void
  uploadImages,     // () => Promise<imageUrls[]>
  removeImage,      // (index) => void
  clearImages       // () => void
} = useImageUpload()
```

### 5. Services

Services encapsulate API calls using Axios.

**Base Configuration** (utils/api.js):
```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor (add auth token)
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor (handle errors)
api.interceptors.response.use(
  response => response.data,
  error => {
    // Handle 401, refresh token, etc.
    return Promise.reject(error)
  }
)

export default api
```

**Service Pattern**:
```javascript
// observationService.js
import api from '@/utils/api'

export const observationService = {
  getAll: (params) => api.get('/api/v1/observations', { params }),
  getById: (id) => api.get(`/api/v1/observations/${id}`),
  create: (data) => api.post('/api/v1/observations', data),
  update: (id, data) => api.put(`/api/v1/observations/${id}`, data),
  delete: (id) => api.delete(`/api/v1/observations/${id}`),
  search: (query) => api.get('/api/v1/observations/search', { params: { q: query } })
}
```

## Component Architecture

### Base Components

Reusable UI components prefixed with `test_Base*`.

#### BaseButton
Customizable button component.

**Props**:
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `disabled`: boolean

**Usage**:
```vue
<BaseButton variant="primary" size="lg" @click="handleClick">
  Click me
</BaseButton>
```

#### BaseInput
Form input with validation.

**Props**:
- `modelValue`: string
- `type`: 'text' | 'email' | 'password' | 'number'
- `label`: string
- `error`: string
- `required`: boolean

**Usage**:
```vue
<BaseInput
  v-model="email"
  type="email"
  label="Email"
  :error="emailError"
  required
/>
```

#### BaseCard
Container card component.

**Props**:
- `title`: string
- `padding`: 'sm' | 'md' | 'lg'
- `hoverable`: boolean

#### BaseModal
Modal dialog component.

**Props**:
- `show`: boolean
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'full'

**Events**:
- `@close`: Emitted when modal is closed

### Layout Components

#### AppLayout
Main application layout with navigation.

**Features**:
- Top navigation bar
- Bottom navigation (mobile)
- User menu dropdown
- Responsive design
- Active route highlighting

#### BottomNav
Mobile bottom navigation bar.

**Features**:
- Home, Feed, Map, Create, Profile links
- Icon indicators
- Active state styling

### Feature Components

#### ImageManager
Image upload and management.

**Features**:
- Drag & drop upload
- Multiple image selection
- Image preview with thumbnails
- Remove individual images
- Cloudinary integration

#### StarryBackground
Animated starry background.

**Features**:
- Canvas-based animation
- Twinkling stars effect
- Performance optimized
- Responsive to window resize

## Views (Pages)

### AuthPage
Combined login and register page.

**Features**:
- Toggle between login/register forms
- Form validation
- Error display
- Auto-redirect on success

### HomeView
Landing page with hero section.

**Features**:
- Hero section with CTA
- Recent observations preview
- Statistics display
- Responsive design

### FeedView
Observations feed with infinite scroll.

**Features**:
- List of all observations
- Infinite scroll pagination
- Filters (type, date)
- Real-time updates (WebSocket)
- Loading states

### MapView
Interactive Leaflet map of observations.

**Features**:
- Clustered markers for observations
- Popup with observation details
- User location tracking
- Click to view observation
- Filter by visible area

### CreateObservationView
Form to create new observation.

**Features**:
- Multi-step form
- Image upload (ImageManager)
- GPS location picker (Map)
- Observation type selector
- Tag input
- Form validation
- Auto-save draft (localStorage)

### ObservationDetailView
Detailed view of single observation.

**Features**:
- Full observation details
- Image gallery
- Map showing location
- Comments section
- Edit/Delete (if owner or admin)
- Real-time comment updates

### UserProfileView
User profile page.

**Features**:
- User information display
- Bio editing (if own profile)
- User's observations list
- Statistics (observation count)
- Admin role indicator

## Styling

### Tailwind CSS

Utility-first CSS framework with custom configuration.

**Tailwind Config** (tailwind.config.js):
```javascript
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',    // Indigo
        secondary: '#10B981',  // Green
        danger: '#EF4444',     // Red
        dark: '#1E2640',       // Dark blue
        // ... custom colors
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto']
      }
    }
  },
  plugins: []
}
```

**Global Styles** (style.css):
- Tailwind base, components, utilities
- Custom utility classes
- CSS variables for theming
- Dark starry background

### Responsive Design

Mobile-first approach with breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**Example**:
```vue
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- Full width on mobile, half on tablet, third on desktop -->
</div>
```

## Build & Development

### Vite Configuration

**vite.config.js**:
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Phenom',
        short_name: 'Phenom',
        description: 'UFO Observation Platform',
        theme_color: '#1E2640',
        icons: [/* ... */]
      }
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

### Development Server

```bash
npm run dev   # Start Vite dev server on http://localhost:5173
```

**Features**:
- Hot Module Replacement (HMR)
- Fast refresh for Vue components
- Proxy API requests to backend
- Source maps

### Production Build

```bash
npm run build    # Build for production
npm run preview  # Preview production build
```

**Output**:
- Optimized bundles
- Code splitting
- Asset optimization
- PWA service worker

## Testing

### Vitest

Unit testing with Vitest and Vue Test Utils.

**Config** (vitest.config.js):
```javascript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html']
    }
  }
})
```

### Running Tests

```bash
npm test              # Run tests
npm run test:ui       # Interactive UI
npm run test:coverage # With coverage report
```

## Environment Variables

**Development** (`.env.development`):
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Phenom
VITE_MAP_TILES_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

**Production** (`.env.production`):
```bash
VITE_API_BASE_URL=https://phenom-backend.onrender.com
VITE_APP_NAME=Phenom
```

**Access in code**:
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

## PWA Features

Progressive Web App capabilities via Vite Plugin PWA.

**Features**:
- Installable on mobile/desktop
- Offline support (service worker)
- App manifest
- Custom icons
- Theme colors

**Manifest** (auto-generated):
```json
{
  "name": "Phenom",
  "short_name": "Phenom",
  "description": "UFO Observation Platform",
  "theme_color": "#1E2640",
  "background_color": "#1E2640",
  "display": "standalone",
  "icons": [ /* ... */ ]
}
```

## Performance Optimization

### Code Splitting

Routes are lazy-loaded for optimal performance.

```javascript
{
  path: '/feed',
  component: () => import('@/views/test_FeedView.vue')  // Lazy load
}
```

### Image Optimization

- Cloudinary CDN with automatic format selection
- Responsive images with srcset
- Lazy loading with Intersection Observer

### State Management

- Pinia with minimal reactivity overhead
- Selective store usage (don't load all stores)
- Computed properties for derived state

### Bundle Size

- Tree-shaking unused code
- Dynamic imports for large libraries (Leaflet)
- Minification and compression

## Deployment

### Docker Production

Multi-stage build with nginx.

**Dockerfile.prod**:
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

**nginx.conf**:
```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  # SPA fallback
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache static assets
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

## Related Documentation

- [Architecture Overview](Architecture-Overview) - System architecture
- [API Reference](API-Reference) - Backend API
- [WebSocket Integration](WebSocket-Integration) - Real-time updates
- [Development Guide](Development-Guide) - Development workflow
- [Testing Guide](Testing-Guide) - Testing practices
