# 🏗️ Architecture Visuelle - Phenom App

## 📊 Vue d'Ensemble du Système

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         UTILISATEURS                                     │
│  👤 Observateur Mobile    👥 Visiteur Desktop    👮 Administrateur      │
└────────────┬───────────────────────┬────────────────────┬───────────────┘
             │                       │                    │
             ▼                       ▼                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Port 80)                            │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  Vue.js 3 + Vite + TailwindCSS + Pinia                          │  │
│  │  - Pages (Home, Observations, Login, Admin)                     │  │
│  │  - Composants (ObservationCard, Map, Camera)                    │  │
│  │  - Services (API Client Axios)                                  │  │
│  │  - PWA (Service Worker pour offline)                            │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Nginx 1.25 Alpine (Serveur Web)                                       │
│  - Gzip compression                                                     │
│  - Cache des assets statiques                                          │
│  - SPA routing (try_files)                                             │
└────────────────────────┬───────────────────────────────────────────────┘
                         │ HTTP Requests
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Port 3000)                            │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  Node.js 20 + Express.js                                         │  │
│  │                                                                   │  │
│  │  Routes:                                                          │  │
│  │  ├─ GET  /health           (Health check)                        │  │
│  │  ├─ POST /auth/register    (Inscription)                         │  │
│  │  ├─ POST /auth/login       (Connexion)                          │  │
│  │  ├─ GET  /observations     (Liste observations)                 │  │
│  │  ├─ POST /observations     (Créer observation)                  │  │
│  │  ├─ GET  /observations/:id (Détail observation)                 │  │
│  │  └─ POST /comments         (Ajouter commentaire)                │  │
│  │                                                                   │  │
│  │  Middleware:                                                      │  │
│  │  ├─ helmet (Sécurité headers)                                   │  │
│  │  ├─ cors (Cross-origin)                                         │  │
│  │  ├─ express-rate-limit (Anti-spam)                              │  │
│  │  ├─ multer (Upload photos)                                      │  │
│  │  └─ JWT Auth (Authentification)                                 │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└────────────────────────┬───────────────────────────────────────────────┘
                         │ Mongoose ODM
                         │
                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        MongoDB (Port 27017)                            │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │  Collections:                                                     │  │
│  │  ┌────────────┐  ┌──────────────────┐  ┌──────────────┐        │  │
│  │  │  users     │  │  observations    │  │  comments    │        │  │
│  │  ├────────────┤  ├──────────────────┤  ├──────────────┤        │  │
│  │  │ email      │  │ title            │  │ text         │        │  │
│  │  │ username   │  │ description      │  │ userId       │        │  │
│  │  │ password   │  │ location (GeoJSON)│  │ observationId│       │  │
│  │  │ role       │  │ photoUrl         │  │ createdAt    │        │  │
│  │  │ createdAt  │  │ userId           │  └──────────────┘        │  │
│  │  └────────────┘  │ status           │                          │  │
│  │                  │ createdAt        │                          │  │
│  │                  └──────────────────┘                          │  │
│  │                                                                   │  │
│  │  Index:                                                           │  │
│  │  ├─ users: email (unique)                                       │  │
│  │  ├─ observations: location (2dsphere pour géospatial)          │  │
│  │  ├─ observations: title + description (text search)            │  │
│  │  └─ comments: observationId + createdAt                        │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Mongo Express (Port 8081) - Interface Admin Web                       │
└────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Flux de Données - Créer une Observation

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. UTILISATEUR                                                       │
│    ├─ Ouvre l'app sur smartphone                                   │
│    ├─ Clique "Nouvelle observation"                                │
│    └─ Autorise GPS et caméra                                       │
└─────────────┬───────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. FRONTEND - Capture                                                │
│    ├─ navigator.geolocation.getCurrentPosition()                   │
│    │  └─> Récupère latitude/longitude                             │
│    │                                                                 │
│    ├─ navigator.mediaDevices.getUserMedia({video: true})          │
│    │  └─> Ouvre la caméra                                         │
│    │                                                                 │
│    └─ canvas.toDataURL('image/jpeg')                               │
│       └─> Convertit photo en base64                               │
└─────────────┬───────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. FRONTEND - Formulaire                                             │
│    Données collectées:                                               │
│    {                                                                 │
│      "title": "OVNI triangulaire",                                  │
│      "description": "Lumières rouges clignotantes...",             │
│      "location": {                                                   │
│        "type": "Point",                                             │
│        "coordinates": [48.8566, 2.3522]  // [lat, lon]            │
│      },                                                              │
│      "photoBase64": "data:image/jpeg;base64,/9j/4AAQ..."          │
│    }                                                                 │
└─────────────┬───────────────────────────────────────────────────────┘
              │
              │ HTTP POST /observations
              │ Headers: { Authorization: 'Bearer JWT_TOKEN' }
              │ Body: FormData avec photo
              │
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. BACKEND - API Route                                              │
│    POST /observations                                                │
│    │                                                                 │
│    ├─ Middleware: verifyToken()                                    │
│    │  └─> Vérifie JWT, extrait userId                             │
│    │                                                                 │
│    ├─ Middleware: upload.single('photo')                           │
│    │  └─> Multer sauvegarde photo dans /uploads                   │
│    │                                                                 │
│    ├─ Controller: createObservation()                              │
│    │  ├─> Valide les données (express-validator)                  │
│    │  ├─> Crée document MongoDB                                   │
│    │  └─> Sauvegarde avec Mongoose                                │
│    │                                                                 │
│    └─ Response: { success: true, observation: {...} }             │
└─────────────┬───────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. MONGODB - Enregistrement                                         │
│    db.observations.insertOne({                                      │
│      _id: ObjectId("..."),                                          │
│      title: "OVNI triangulaire",                                    │
│      description: "Lumières rouges...",                            │
│      location: {                                                     │
│        type: "Point",                                               │
│        coordinates: [2.3522, 48.8566]  // [lon, lat] GeoJSON      │
│      },                                                              │
│      photoUrl: "/uploads/photo-1697384920.jpg",                    │
│      userId: ObjectId("..."),                                       │
│      status: "pending",                                             │
│      createdAt: ISODate("2025-10-15T13:20:00Z")                   │
│    })                                                                │
│    │                                                                 │
│    └─> Index 2dsphere créé automatiquement sur location            │
└─────────────┬───────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 6. FRONTEND - Affichage                                              │
│    ├─ Notification: "✅ Observation créée"                          │
│    ├─ Redirect vers /observations/:id                              │
│    └─ Update store Pinia                                            │
└─────────────────────────────────────────────────────────────────────┘
```

## 🐳 Architecture Docker

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Docker Host                                   │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Docker Network: phenom-network (Bridge)                      │   │
│  │                                                                │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │   │
│  │  │  phenom-frontend│  │  phenom-backend │  │ phenom-mongo │ │   │
│  │  │                 │  │                 │  │              │ │   │
│  │  │  Container      │  │  Container      │  │  Container   │ │   │
│  │  │  ────────────── │  │  ────────────── │  │  ─────────── │ │   │
│  │  │  Image:         │  │  Image:         │  │  Image:      │ │   │
│  │  │  nginx:alpine   │  │  node:20-alpine │  │  mongo:7.0   │ │   │
│  │  │                 │  │                 │  │              │ │   │
│  │  │  Port: 80       │◄─┤  Port: 3000     │◄─┤  Port: 27017 │ │   │
│  │  │  (External)     │  │  (External)     │  │  (Internal)  │ │   │
│  │  │                 │  │                 │  │              │ │   │
│  │  │  Health: ✅     │  │  Health: ✅     │  │  Health: ✅  │ │   │
│  │  └─────────────────┘  └─────────────────┘  └──────┬───────┘ │   │
│  │                                                     │         │   │
│  │  ┌────────────────────────────────────────────────┘         │   │
│  │  │                                                            │   │
│  │  │  ┌─────────────────────┐                                 │   │
│  │  └──┤  phenom-mongo-express│                                │   │
│  │     │                      │                                 │   │
│  │     │  Container           │                                 │   │
│  │     │  ──────────────────  │                                 │   │
│  │     │  Image:              │                                 │   │
│  │     │  mongo-express       │                                 │   │
│  │     │                      │                                 │   │
│  │     │  Port: 8081          │                                 │   │
│  │     │  (External)          │                                 │   │
│  │     └──────────────────────┘                                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  Volumes:                                                             │
│  ┌────────────────────┐  ┌─────────────────────┐                    │
│  │ mongodb_data       │  │ backend/src (dev)   │                    │
│  │ /data/db           │  │ Hot-reload          │                    │
│  └────────────────────┘  └─────────────────────┘                    │
└──────────────────────────────────────────────────────────────────────┘
```

## 🔐 Flux d'Authentification JWT

```
┌─────────────┐                                ┌──────────────┐
│  Frontend   │                                │   Backend    │
│  (Vue.js)   │                                │  (Express)   │
└──────┬──────┘                                └──────┬───────┘
       │                                              │
       │  1. POST /auth/register                     │
       │     { email, username, password }           │
       ├────────────────────────────────────────────►│
       │                                              │
       │                                              │ 2. Hash password
       │                                              │    bcrypt.hash()
       │                                              │
       │                                              │ 3. Save to MongoDB
       │                                              │    db.users.insertOne()
       │                                              │
       │  4. ◄─── { success: true, user }            │
       │◄─────────────────────────────────────────────┤
       │                                              │
       │                                              │
       │  5. POST /auth/login                        │
       │     { email, password }                     │
       ├────────────────────────────────────────────►│
       │                                              │
       │                                              │ 6. Find user
       │                                              │    db.users.findOne({email})
       │                                              │
       │                                              │ 7. Compare password
       │                                              │    bcrypt.compare()
       │                                              │
       │                                              │ 8. Generate JWT
       │                                              │    jwt.sign({userId, role})
       │                                              │
       │  9. ◄─── { token: "eyJhbG...", user }       │
       │◄─────────────────────────────────────────────┤
       │                                              │
       │ 10. Store token                             │
       │     localStorage.setItem('token', ...)      │
       │                                              │
       │                                              │
       │ 11. GET /observations                       │
       │     Headers: {                              │
       │       Authorization: "Bearer eyJhbG..."     │
       │     }                                        │
       ├────────────────────────────────────────────►│
       │                                              │
       │                                              │ 12. Verify token
       │                                              │     jwt.verify(token)
       │                                              │
       │                                              │ 13. Extract userId
       │                                              │     req.user = payload
       │                                              │
       │                                              │ 14. Query DB
       │                                              │     db.observations.find()
       │                                              │
       │ 15. ◄─── { observations: [...] }            │
       │◄─────────────────────────────────────────────┤
       │                                              │
```

## 📦 Build & Deploy Pipeline

```
┌────────────────────────────────────────────────────────────────┐
│  DÉVELOPPEMENT LOCAL                                            │
│  ────────────────────                                          │
│                                                                  │
│  1. Code source (VS Code)                                       │
│     ├─ backend/src/*.js                                        │
│     └─ frontend/src/*.vue                                      │
│                                                                  │
│  2. Docker Compose Dev                                          │
│     $ docker-compose up -d                                     │
│     ├─ Hot-reload backend (nodemon)                           │
│     └─ Build frontend (Vite)                                  │
│                                                                  │
│  3. Test local                                                  │
│     ├─ http://localhost           (Frontend)                  │
│     ├─ http://localhost:3000      (Backend)                   │
│     └─ http://localhost:8081      (Mongo Express)             │
└────────────────────────────────────────────────────────────────┘
                         │
                         │ git push origin main
                         │
                         ▼
┌────────────────────────────────────────────────────────────────┐
│  PRODUCTION (Render.com)                                        │
│  ────────────────────────                                      │
│                                                                  │
│  1. MongoDB Atlas                                               │
│     ├─ Cluster M0 (gratuit)                                   │
│     ├─ Connexion: mongodb+srv://...                           │
│     └─ Collections: users, observations, comments             │
│                                                                  │
│  2. Backend (Web Service)                                       │
│     ├─ Build: npm install                                     │
│     ├─ Start: npm start                                       │
│     ├─ URL: https://phenom-backend.onrender.com              │
│     └─ Env: MONGODB_URI, JWT_SECRET, CORS_ORIGIN             │
│                                                                  │
│  3. Frontend (Static Site)                                      │
│     ├─ Build: npm install && npm run build                    │
│     ├─ Publish: dist/                                         │
│     ├─ URL: https://phenom.onrender.com                      │
│     └─ Env: VITE_API_BASE_URL                                │
│                                                                  │
│  4. Auto-deploy on push                                         │
│     └─ Webhook GitHub → Render rebuild                        │
└────────────────────────────────────────────────────────────────┘
```

---

**Diagrammes créés le** : 15 octobre 2025  
**Version** : 1.0
