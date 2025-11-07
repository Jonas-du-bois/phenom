# Frontend Phenom

Application Vue.js 3 pour la visualisation et la gestion d'observations d'OVNIs.

## 🚀 Démarrage rapide

### Installation

```bash
npm install
```

### Configuration

1. Copiez le fichier `.env.example` en `.env.local` pour le développement local :
   ```bash
   cp .env.example .env.local
   ```

2. Ou utilisez `.env` pour la production

### Variables d'environnement

| Variable | Description | Exemple Local | Exemple Production |
|----------|-------------|---------------|-------------------|
| `VITE_API_BASE_URL` | URL de base du backend | `http://localhost:3000` | `https://phenom-backend.onrender.com` |
| `VITE_API_PREFIX` | Préfixe de l'API | `/api/v1` | `/api/v1` |
| `VITE_WS_URL` | URL WebSocket | `ws://localhost:3000` | `wss://phenom-backend.onrender.com` |
| `VITE_APP_NAME` | Nom de l'application | `Phenom` | `Phenom` |
| `VITE_MAP_TILES_URL` | URL tuiles OSM | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` | idem |

**Important** : 
- L'URL complète de l'API sera : `VITE_API_BASE_URL + VITE_API_PREFIX`
- Exemple : `http://localhost:3000/api/v1`
- Le health check est accessible à : `VITE_API_BASE_URL/health` (sans le préfixe)

### Développement

```bash
npm run dev
```

Ouvre le navigateur à : http://localhost:5173

### Build Production

```bash
npm run build
```

### Preview Production

```bash
npm run preview
```

## 📁 Structure

```
src/
├── components/     # Composants réutilisables
├── composables/    # Logique réutilisable (useWebSocket)
├── router/         # Configuration des routes
├── services/       # Services API
│   ├── authService.js
│   ├── userService.js
│   ├── observationService.js
│   ├── commentService.js
│   ├── imageService.js
│   ├── adminService.js
│   └── statsService.js
├── stores/         # État global (Pinia)
│   ├── auth.js
│   ├── user.js
│   ├── observation.js
│   ├── comment.js
│   └── admin.js
├── utils/          # Utilitaires
│   └── api.js      # Configuration Axios
├── views/          # Pages de l'application
└── App.vue         # Composant racine
```

## 🧪 Page de test

La page d'accueil (`HomeView.vue`) est une interface de test complète permettant de tester tous les endpoints de l'API :

1. **Health & Stats** - Vérifier la santé de l'API
2. **Authentication** - Login, register, logout
3. **Users** - Gestion du profil utilisateur
4. **Observations** - CRUD des observations
5. **Comments** - CRUD des commentaires
6. **Images** - Upload et gestion d'images
7. **Admin** - Statistiques et modération
8. **WebSocket** - Connexion temps réel

## 🔧 Technologies

- **Vue 3** - Framework JavaScript progressif
- **Vite** - Build tool ultra-rapide
- **Vue Router** - Routage officiel
- **Pinia** - Gestion d'état
- **Axios** - Client HTTP
- **Tailwind CSS** - Framework CSS utilitaire

## 📚 Documentation API

- REST API : https://phenom-backend.onrender.com/api-docs/rest
- WebSocket : https://phenom-backend.onrender.com/api-docs/websocket

## 🐛 Debug

Si vous rencontrez des problèmes de connexion à l'API :

1. Vérifiez que le backend est démarré
2. Vérifiez les variables d'environnement dans `.env.local` ou `.env`
3. Vérifiez la console du navigateur pour les erreurs CORS
4. Utilisez la page de test (`HomeView.vue`) pour diagnostiquer

## 📝 Notes

- Toutes les variables d'environnement doivent commencer par `VITE_` pour être accessibles côté client
- Le fichier `.env.local` est ignoré par Git (à utiliser pour le développement local)
- Le fichier `.env` est commité (à utiliser pour la production sur Render)
