# Endpoints Implémentés - API Phenom REST Niveau 2

Ce document liste tous les nouveaux endpoints implémentés pour compléter l'API Phenom selon les spécifications du fichier `instruction/routes-a-implementer.md`.

## 📊 Résumé

- **Total endpoints implémentés** : 22/22 (100%)
- **Conformité REST** : Niveau 2 ✅ (HTTP verbs, status codes, URIs cohérentes)
- **Code quality** : KISS et YAGNI respectés

---

## 🔐 Authentification (3 nouveaux endpoints)

### POST /api/v1/auth/refresh-token
**Description** : Rafraîchir le token JWT expiré avec un refresh token valide

**Requête** :
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token rafraîchi avec succès"
}
```

**Fichiers** :
- Route : `src/routes/auth.routes.js`
- Controller : `src/controllers/auth.controller.js` → `refreshToken()`
- Service : `src/services/auth.service.js` → `refreshToken()`

---

### POST /api/v1/auth/forgot-password
**Description** : Demander un reset de mot de passe par email

**Requête** :
```json
{
  "email": "user@example.com"
}
```

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "message": "Si cet email existe, un lien de réinitialisation a été envoyé",
    "resetToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Développement uniquement
  }
}
```

**Fichiers** :
- Route : `src/routes/auth.routes.js`
- Controller : `src/controllers/auth.controller.js` → `forgotPassword()`
- Service : `src/services/auth.service.js` → `forgotPassword()`
- Validator : `src/validators/auth.validator.js` → `forgotPasswordValidation`

**Note** : Le token est actuellement loggé dans la console. Une intégration email (SendGrid, etc.) peut être ajoutée plus tard.

---

### POST /api/v1/auth/reset-password
**Description** : Réinitialiser le mot de passe avec un token

**Requête** :
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NouveauPassword123!"
}
```

**Réponse 200** :
```json
{
  "success": true,
  "data": null,
  "message": "Mot de passe réinitialisé avec succès"
}
```

**Fichiers** :
- Route : `src/routes/auth.routes.js`
- Controller : `src/controllers/auth.controller.js` → `resetPassword()`
- Service : `src/services/auth.service.js` → `resetPassword()`
- Validator : `src/validators/auth.validator.js` → `resetPasswordValidation`

---

## 👤 Utilisateurs (5 nouveaux endpoints)

### GET /api/v1/users/me
**Description** : Récupérer le profil complet de l'utilisateur connecté

**Auth** : JWT requis

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "role": "viewer",
    "bio": "Passionné d'astronomie",
    "status": "active",
    "createdAt": "2024-10-15T10:00:00Z",
    "observationsCount": 12,
    "commentsCount": 45
  }
}
```

**Fichiers** :
- Route : `src/routes/user.routes.js`
- Controller : `src/controllers/user.controller.js` → `getProfile()`
- Service : `src/services/user.service.js` → `getProfile()`

---

### PUT /api/v1/users/me
**Description** : Mettre à jour le profil de l'utilisateur connecté

**Auth** : JWT requis

**Requête** :
```json
{
  "name": "Jean Dupont",
  "email": "nouveau@example.com",
  "bio": "Passionné d'astronomie et d'ufologie"
}
```

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "id": "507f...",
    "name": "Jean Dupont",
    "email": "nouveau@example.com",
    "bio": "Passionné d'astronomie et d'ufologie",
    "role": "viewer",
    "updatedAt": "2024-10-16T13:44:00Z"
  },
  "message": "Profil mis à jour avec succès"
}
```

**Validation** :
- `name` : 2-50 caractères
- `email` : format email valide, unique
- `bio` : max 500 caractères (optionnel)

**Fichiers** :
- Route : `src/routes/user.routes.js`
- Controller : `src/controllers/user.controller.js` → `updateProfile()`
- Service : `src/services/user.service.js` → `updateProfile()`
- Validator : `src/validators/user.validator.js` → `updateProfileValidation`

---

### PATCH /api/v1/users/me/password
**Description** : Changer le mot de passe de l'utilisateur connecté

**Auth** : JWT requis

**Requête** :
```json
{
  "currentPassword": "AncienPass123!",
  "newPassword": "NouveauPass123!",
  "confirmPassword": "NouveauPass123!"
}
```

**Réponse 200** :
```json
{
  "success": true,
  "data": null,
  "message": "Mot de passe modifié avec succès"
}
```

**Validation** :
- `newPassword` : min 6 caractères, au moins 1 majuscule, 1 minuscule, 1 chiffre
- `confirmPassword` : doit correspondre à `newPassword`

**Fichiers** :
- Route : `src/routes/user.routes.js`
- Controller : `src/controllers/user.controller.js` → `changePassword()`
- Service : `src/services/user.service.js` → `changePassword()`
- Validator : `src/validators/user.validator.js` → `changePasswordValidation`

---

### DELETE /api/v1/users/me
**Description** : Supprimer son propre compte (suppression hard)

**Auth** : JWT requis

**Réponse 200** :
```json
{
  "success": true,
  "data": null,
  "message": "Compte supprimé avec succès"
}
```

**Note** : Supprime également toutes les observations et commentaires de l'utilisateur.

**Fichiers** :
- Route : `src/routes/user.routes.js`
- Controller : `src/controllers/user.controller.js` → `deleteAccount()`
- Service : `src/services/user.service.js` → `deleteAccount()`

---

### GET /api/v1/users/me/observations
**Description** : Liste des observations de l'utilisateur connecté

**Auth** : JWT requis

**Query Params** :
- `page` : Page (défaut: 1)
- `limit` : Éléments par page (défaut: 10, max: 100)
- `sort` : Champ de tri (createdAt, updatedAt, title)
- `order` : Ordre (asc, desc)

**Réponse 200** :
```json
{
  "success": true,
  "data": [
    {
      "id": "507f...",
      "title": "Observation nocturne",
      "description": "...",
      "location": {...},
      "createdAt": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Fichiers** :
- Route : `src/routes/user.routes.js`
- Controller : `src/controllers/user.controller.js` → `getUserObservations()`
- Service : `src/services/user.service.js` → `getUserObservations()`
- Validator : `src/validators/user.validator.js` → `getUserObservationsValidation`

---

## 🛸 Observations (4 nouveaux endpoints)

### POST /api/v1/observations/:id/images
**Description** : Upload d'une image pour une observation

**Auth** : JWT requis (propriétaire ou admin)

**Content-Type** : `multipart/form-data`

**Multipart Form** :
- `image` : Fichier (JPEG, PNG, WebP, max 10MB)

**Réponse 201** :
```json
{
  "success": true,
  "data": {
    "imageId": "img_1697478000_abc123",
    "imageUrl": "/uploads/observation-1697478000-123456789.jpg",
    "size": 1024000,
    "format": "jpeg",
    "uploadedAt": "2024-10-16T13:44:00Z"
  },
  "message": "Image ajoutée avec succès"
}
```

**Fichiers** :
- Route : `src/routes/observation.routes.js`
- Controller : `src/controllers/observation.controller.js` → `addImage()`
- Service : `src/services/observation.service.js` → `addImage()`
- Config : `src/config/multer.js` (configuration upload)

---

### DELETE /api/v1/observations/:id/images/:imageId
**Description** : Supprimer une image d'une observation

**Auth** : JWT requis (propriétaire ou admin)

**Réponse 200** :
```json
{
  "success": true,
  "data": null,
  "message": "Image supprimée avec succès"
}
```

**Fichiers** :
- Route : `src/routes/observation.routes.js`
- Controller : `src/controllers/observation.controller.js` → `deleteImage()`
- Service : `src/services/observation.service.js` → `deleteImage()`
- Validator : `src/validators/observation.validator.js` → `imageIdParamValidation`

---

### GET /api/v1/observations/nearby
**Description** : Recherche géographique d'observations

**Query Params** :
- `latitude` : Latitude (requis)
- `longitude` : Longitude (requis)
- `radius` : Rayon en km (défaut: 10, max: 1000)
- `page`, `limit` : Pagination

**Réponse 200** :
```json
{
  "success": true,
  "data": [
    {
      "id": "507f...",
      "title": "Observation à proximité",
      "location": {
        "type": "Point",
        "coordinates": [2.3522, 48.8566]
      },
      "userId": {...}
    }
  ],
  "pagination": {...}
}
```

**Note** : Utilise l'index géospatial MongoDB (`2dsphere`) pour des recherches performantes.

**Fichiers** :
- Route : `src/routes/observation.routes.js`
- Controller : `src/controllers/observation.controller.js` → `getNearbyObservations()`
- Service : `src/services/observation.service.js` → `getNearbyObservations()`
- Validator : `src/validators/observation.validator.js` → `nearbyObservationsValidation`

---

### GET /api/v1/observations/stats
**Description** : Statistiques publiques sur les observations

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "totalObservations": 1234,
    "totalApproved": 1100,
    "totalPending": 34,
    "totalRejected": 100,
    "observationsByMonth": [
      {
        "_id": { "year": 2024, "month": 10 },
        "count": 145
      },
      ...
    ]
  }
}
```

**Note** : Utilise MongoDB aggregation pipeline pour grouper par mois.

**Fichiers** :
- Route : `src/routes/observation.routes.js`
- Controller : `src/controllers/observation.controller.js` → `getObservationStats()`
- Service : `src/services/observation.service.js` → `getObservationStats()`

---

## 👮 Administration (8 nouveaux endpoints)

### GET /api/v1/admin/observations
**Description** : Liste de toutes les observations avec filtres admin

**Auth** : JWT + rôle admin requis

**Query Params** :
- `page`, `limit` : Pagination
- `status` : Filtrer par statut (pending, approved, rejected)
- `flagged` : Observations signalées uniquement (true/false)
- `userId` : Par utilisateur spécifique

**Réponse 200** :
```json
{
  "success": true,
  "data": [
    {
      "id": "507f...",
      "title": "...",
      "userId": {...},
      "status": "pending",
      "flagged": true,
      "flagReason": "Contenu inapproprié",
      "moderatedBy": {...},
      "createdAt": "..."
    }
  ],
  "pagination": {...}
}
```

**Fichiers** :
- Route : `src/routes/admin.routes.js`
- Controller : `src/controllers/admin.controller.js` → `getAllObservations()`
- Service : `src/services/admin.service.js` → `getAllObservations()`

---

### POST /api/v1/admin/observations/:id/approve
**Description** : Approuver une observation signalée

**Auth** : JWT + rôle admin requis

**Requête** :
```json
{
  "note": "Contenu validé après vérification"
}
```

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "id": "507f...",
    "status": "approved",
    "moderatedAt": "2024-10-16T13:44:00Z",
    "moderatedBy": {...},
    "moderationNote": "Contenu validé après vérification",
    "flagged": false
  },
  "message": "Observation approuvée avec succès"
}
```

**Fichiers** :
- Route : `src/routes/admin.routes.js`
- Controller : `src/controllers/admin.controller.js` → `approveObservation()`
- Service : `src/services/admin.service.js` → `approveObservation()`

---

### POST /api/v1/admin/observations/:id/reject
**Description** : Rejeter une observation avec motif

**Auth** : JWT + rôle admin requis

**Requête** :
```json
{
  "reason": "Contenu inapproprié",
  "notify": true
}
```

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "id": "507f...",
    "status": "rejected",
    "moderatedAt": "2024-10-16T13:44:00Z",
    "moderatedBy": {...},
    "moderationNote": "Contenu inapproprié",
    "flagged": false
  },
  "message": "Observation rejetée avec succès"
}
```

**Fichiers** :
- Route : `src/routes/admin.routes.js`
- Controller : `src/controllers/admin.controller.js` → `rejectObservation()`
- Service : `src/services/admin.service.js` → `rejectObservation()`

---

### POST /api/v1/admin/users/:id/suspend
**Description** : Suspendre un utilisateur

**Auth** : JWT + rôle admin requis

**Requête** :
```json
{
  "reason": "Violation des conditions d'utilisation",
  "duration": 7,
  "notify": true
}
```

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "id": "507f...",
    "status": "suspended",
    "suspendedUntil": "2024-10-23T13:44:00Z",
    "suspendedReason": "Violation des conditions d'utilisation"
  },
  "message": "Utilisateur suspendu avec succès"
}
```

**Validation** :
- `reason` : 10-500 caractères (requis)
- `duration` : 1-365 jours (optionnel)
- `notify` : booléen (optionnel)

**Fichiers** :
- Route : `src/routes/admin.routes.js`
- Controller : `src/controllers/admin.controller.js` → `suspendUser()`
- Service : `src/services/admin.service.js` → `suspendUser()`

---

### POST /api/v1/admin/users/:id/activate
**Description** : Réactiver un utilisateur suspendu

**Auth** : JWT + rôle admin requis

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "id": "507f...",
    "status": "active",
    "suspendedUntil": null,
    "suspendedReason": null
  },
  "message": "Utilisateur réactivé avec succès"
}
```

**Fichiers** :
- Route : `src/routes/admin.routes.js`
- Controller : `src/controllers/admin.controller.js` → `activateUser()`
- Service : `src/services/admin.service.js` → `activateUser()`

---

### GET /api/v1/admin/comments
**Description** : Liste de tous les commentaires (vue admin)

**Auth** : JWT + rôle admin requis

**Query Params** :
- `page`, `limit` : Pagination
- `flagged` : Commentaires signalés uniquement (true/false)
- `userId` : Par utilisateur
- `observationId` : Par observation

**Réponse 200** :
```json
{
  "success": true,
  "data": [
    {
      "id": "507f...",
      "content": "...",
      "userId": {...},
      "observationId": {...},
      "flagged": false,
      "createdAt": "..."
    }
  ],
  "pagination": {...}
}
```

**Fichiers** :
- Route : `src/routes/admin.routes.js`
- Controller : `src/controllers/admin.controller.js` → `getAllComments()`
- Service : `src/services/admin.service.js` → `getAllComments()`

---

### GET /api/v1/admin/users/:id
**Description** : Détails complets d'un utilisateur (vue admin)

**Auth** : JWT + rôle admin requis

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "id": "507f...",
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "role": "viewer",
    "status": "active",
    "observationsCount": 42,
    "commentsCount": 156,
    "recentObservations": [...],
    "recentComments": [...],
    "createdAt": "..."
  }
}
```

**Fichiers** :
- Route : `src/routes/admin.routes.js`
- Controller : `src/controllers/admin.controller.js` → `getUserDetails()`
- Service : `src/services/admin.service.js` → `getUserDetails()`

---

## 📦 Modifications du Modèle de Données

### User Model (`src/models/User.js`)

Nouveaux champs ajoutés :
```javascript
{
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  suspendedUntil: {
    type: Date,
    default: null
  },
  suspendedReason: {
    type: String,
    default: null
  }
}
```

---

### Observation Model (`src/models/Observation.js`)

Nouveaux champs ajoutés :
```javascript
{
  images: [{
    imageId: String,
    imageUrl: String,
    size: Number,
    format: String,
    uploadedAt: Date
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  moderatedAt: Date,
  moderatedBy: ObjectId,
  moderationNote: String,
  flagged: Boolean,
  flagReason: String
}
```

---

## 🔒 Sécurité et Validation

### Authentification
- JWT avec access token (1h) et refresh token (7j)
- Middleware `authenticate` pour routes protégées
- Middleware `authorize('admin')` pour routes admin
- Middleware `isOwnerOrAdmin` pour ressources propriétaires

### Rate Limiting
- `authLimiter` appliqué sur login, signup, forgot-password, reset-password
- `generalLimiter` appliqué globalement
- `createLimiter` sur création d'observations

### Validation
- Validation avec `express-validator` sur tous les endpoints
- Middleware `validate` pour gérer les erreurs de validation
- Validation au niveau du modèle Mongoose

---

## 📝 Conventions REST

### HTTP Verbs
- `GET` : Lecture de ressources
- `POST` : Création ou actions non-CRUD (approve, reject, suspend)
- `PUT` : Mise à jour complète
- `PATCH` : Mise à jour partielle (ex: password)
- `DELETE` : Suppression

### Status Codes
- `200 OK` : Succès
- `201 Created` : Ressource créée
- `400 Bad Request` : Erreur de validation
- `401 Unauthorized` : Authentification requise
- `403 Forbidden` : Autorisation insuffisante
- `404 Not Found` : Ressource introuvable
- `500 Internal Server Error` : Erreur serveur

### Structure de Réponse
```json
{
  "success": true/false,
  "data": {...},
  "message": "...",
  "pagination": {...}
}
```

---

## 🚀 Utilisation

### Démarrage
```bash
cd backend
npm install
npm run dev
```

### Documentation Swagger
Disponible sur : `http://localhost:3000/api-docs`

### Health Check
`GET http://localhost:3000/health`

---

## 📚 Ressources

- Code source : `backend/src/`
- Instructions : `backend/instruction/routes-a-implementer.md`
- Matrice de cohérence : `backend/instruction/matrice-coherence.md`
- Configuration : `backend/.env.example`

---

**Dernière mise à jour** : 16 octobre 2024  
**Version API** : 1.0.0  
**Conformité REST** : Niveau 2 ✅
