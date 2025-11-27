# Frontend Architecture

The Phenom frontend is a Single Page Application (SPA) built with **Vue.js 3** and **Vite**.

## Tech Stack
- **Vue 3**: Using Composition API (`<script setup>`).
- **Vite**: Next-generation build tool for fast development.
- **Pinia**: State management library (successor to Vuex).
- **Vue Router**: Client-side routing.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Leaflet**: Interactive maps.

## Directory Structure

```
frontend/src/
├── assets/         # Static assets (images, fonts)
├── components/     # Reusable Vue components
│   ├── common/     # Generic components (Buttons, Inputs)
│   ├── map/        # Map-related components
│   └── ...
├── composables/    # Shared logic (Vue Composables)
├── layout/         # Layout components (Header, Footer)
├── router/         # Route definitions
├── services/       # API client services (Axios wrappers)
├── stores/         # Pinia state stores
├── views/          # Page components
└── main.js         # App entry point
```

## State Management (Pinia)
We use Pinia to manage global application state.
- `auth.store.js`: Manages user login status and tokens.
- `observation.store.js`: Manages list of observations and active filters.
- `ui.store.js`: Manages UI state (modals, toasts).

## API Integration
The `services/` directory contains modules that interact with the Backend API using Axios.
- Interceptors are used to attach the JWT token to every request.
- Automatic token refreshing is handled transparently.

## Maps
Leaflet is used for rendering maps. We use OpenStreetMap tiles. Custom markers allow visualizing observations on the map.

## PWA (Progressive Web App)
The application is configured as a PWA, allowing it to be installed on devices and work offline (caching static assets).
