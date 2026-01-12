# 📚 API Phenom - Documentation complète pour Frontend

> **Note**: Cette API est compatible avec le format [Phenom Search API](https://github.com/Jonas-du-bois/phenom-search) (Hatch UFO Database).

## 🔐 Authentification

Tous les endpoints protégés nécessitent le header :
```
Authorization: Bearer <accessToken>
```

---

## 🔍 **SIGHTINGS - Observations (Phenom Search Format)**

Ces endpoints sont compatibles avec Phenom Search et utilisent le nouveau format de données.

### GET /api/v1/sightings
**Lister les observations avec filtres avancés**
```json
// Query params disponibles:
// - country: Filtrer par pays (ex: "USA", "France")
// - startYear: Année minimum (ex: 1947)
// - endYear: Année maximum (ex: 2024)
// - minCredibility: Crédibilité min 0-15 (ex: 10)
// - maxCredibility: Crédibilité max 0-15
// - minStrangeness: Étrangeté min 0-10
// - maxStrangeness: Étrangeté max 0-10
// - observerType: Type d'observateur (ex: "MIL,CIV")
// - ufoShape: Forme OVNI (ex: "SCR,DLT")
// - phenomenon: Phénomène (ex: "LND,PHT")
// - hasCoordinates: true/false
// - hasImages: true/false
// - search: Recherche textuelle
// - limit: Nombre par page (défaut: 50, max: 500)
// - offset: Décalage pour pagination

// Exemple: /api/v1/sightings?country=USA&minCredibility=10&ufoShape=DLT

// Response 200
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "_id": "507f1f77bcf86cd799439012",
      "date": "6/24/1947",
      "time": "15:00",
      "location": "Mount Rainier, Washington",
      "country": "USA",
      "state": "Washington",
      "description": "Nine bright objects moving at incredible speed...",
      "credibility": 12,
      "strangeness": 8,
      "duration": 180,
      "locale": "Mountains",
      "coordinates": {
        "lat": 46.8523,
        "lng": -121.7603
      },
      "observerTypes": ["CIV", "HQO"],
      "ufoShapes": ["SCR"],
      "phenomena": ["PHT", "OBS"],
      "images": [],
      "userId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Kenneth Arnold"
      },
      "tags": ["historic", "formation"],
      "source": "phenom-app",
      "createdAt": "2024-11-15T21:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 18116,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### GET /api/v1/sightings/paginated
**Pagination simple**
```json
// Query params:
// - page: Numéro de page (1-based)
// - perPage: Nombre par page (1-500, défaut: 50)

// Response 200
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "perPage": 50,
    "total": 18116,
    "totalPages": 363,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### GET /api/v1/sightings/:id
**Récupérer une observation par ID**
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "date": "6/24/1947",
    "time": "15:00",
    "location": "Mount Rainier, Washington",
    "country": "USA",
    "description": "...",
    "credibility": 12,
    "strangeness": 8,
    "duration": 180,
    "coordinates": { "lat": 46.8523, "lng": -121.7603 },
    "observerTypes": ["CIV", "HQO"],
    "ufoShapes": ["SCR"],
    "phenomena": ["PHT", "OBS"],
    "images": [],
    "userId": { "_id": "...", "name": "..." },
    "commentsCount": 5
  }
}
```

---

## 🎛️ **FILTERS - Valeurs de filtres disponibles**

### GET /api/v1/filters/countries
**Liste des pays disponibles**
```json
// Response 200
{
  "success": true,
  "data": ["USA", "France", "UK", "Germany", ...]
}
```

### GET /api/v1/filters/observer-types
**Types d'observateurs**
```json
// Response 200
{
  "success": true,
  "data": [
    { "code": "GND", "description": "Observateurs au sol" },
    { "code": "MIL", "description": "Observateurs militaires" },
    { "code": "CIV", "description": "Observateurs civils" },
    { "code": "HQO", "description": "Observateurs haute qualité" },
    { "code": "SCI", "description": "Observateurs scientifiques" },
    { "code": "CST", "description": "Garde-côtes" },
    { "code": "SEA", "description": "Marins" },
    { "code": "NWS", "description": "Médias/Presse" }
  ]
}
```

### GET /api/v1/filters/ufo-shapes
**Formes d'OVNI**
```json
// Response 200
{
  "success": true,
  "data": [
    { "code": "SCR", "description": "Soucoupe/Disque" },
    { "code": "CIG", "description": "Cigare/Cylindre" },
    { "code": "DLT", "description": "Delta/Triangle" },
    { "code": "NLT", "description": "Lumières nocturnes" },
    { "code": "FBL", "description": "Boule de feu" },
    { "code": "FIG", "description": "Figuratif/Complexe" },
    { "code": "PRB", "description": "Sonde/Petit objet" },
    { "code": "NFO", "description": "Forme indéfinie" }
  ]
}
```

### GET /api/v1/filters/phenomena
**Phénomènes associés**
```json
// Response 200
{
  "success": true,
  "data": [
    { "code": "WAV", "description": "Vague/cluster/flap" },
    { "code": "LND", "description": "Atterrissage" },
    { "code": "PHT", "description": "Photos/Vidéos" },
    // ... 23 codes au total
  ]
}
```

### GET /api/v1/filters/locales
**Types de localités**
```json
// Response 200
{
  "success": true,
  "data": [
    "Town & City", "Rural", "Mountains", "Farmlands",
    "Coastal", "Desert", "Forest", "Lake/River",
    "Ocean", "Airport", "Military Base", "Unknown"
  ]
}
```

---

## 📊 **STATISTICS - Statistiques**

### GET /api/v1/statistics
**Statistiques globales (format Phenom Search)**
```json
// Response 200
{
  "success": true,
  "data": {
    "total": 18116,
    "withCoordinates": 15234,
    "withImages": 456,
    "byCountry": [
      { "_id": "USA", "count": 8500 },
      { "_id": "France", "count": 2100 },
      ...
    ],
    "byYear": [
      { "_id": 2024, "count": 234 },
      { "_id": 2023, "count": 456 },
      ...
    ],
    "byShape": [
      { "_id": "SCR", "count": 5000 },
      { "_id": "DLT", "count": 3500 },
      ...
    ],
    "avgCredibility": 7.5,
    "avgStrangeness": 5.2
  }
}
```

---

## 🔑 **AUTH - Authentification**

### POST /api/v1/auth/signup
**Inscription d'un nouvel utilisateur**
```json
// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

// Response 201
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "viewer"
    }
  }
}
```

### POST /api/v1/auth/login
**Connexion**
```json
// Request
{
  "email": "john@example.com",
  "password": "password123"
}

// Response 200
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "viewer"
    }
  }
}
```

---

## 👤 **USERS - Utilisateurs**

### GET /api/v1/users/me
**Récupérer son profil** 🔒
```json
// Response 200
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "viewer",
    "isActive": true,
    "observationsCount": 5,
    "createdAt": "2025-10-16T10:00:00.000Z"
  }
}
```

### PUT /api/v1/users/me
**Mettre à jour son profil** 🔒
```json
// Request
{
  "name": "John Updated",
  "email": "john.new@example.com"
}

// Response 200
{
  "success": true,
  "message": "Profil mis à jour",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Updated",
    "email": "john.new@example.com",
    "role": "viewer"
  }
}
```

### PATCH /api/v1/users/me/password
**Changer son mot de passe** 🔒
```json
// Request
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}

// Response 200
{
  "success": true,
  "message": "Mot de passe modifié avec succès"
}
```

### DELETE /api/v1/users/me
**Supprimer son compte** 🔒
```json
// Response 204 (No Content)
```

### GET /api/v1/users/me/observations
**Récupérer ses observations** 🔒
```json
// Query params: ?page=1&limit=10&sort=createdAt&order=desc

// Response 200
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Strange lights",
      "description": "I saw...",
      "location": {
        "type": "Point",
        "coordinates": [2.3522, 48.8566]
      },
      "status": "pending",
      "images": ["imageId1", "imageId2"],
      "createdAt": "2025-10-16T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 🛸 **OBSERVATIONS - CRUD (Format Phenom Search)**

> Ces endpoints utilisent le nouveau format compatible Phenom Search.

### POST /api/v1/observations
**Créer une observation** 🔒
```json
// Request
{
  "date": "11/15/2024",
  "time": "22:30",
  "location": "Geneva, Switzerland",
  "country": "Switzerland",
  "state": "Geneva",
  "description": "Witnessed a large triangular craft with bright lights at each corner. Silent movement, estimated altitude 500m.",
  "credibility": 8,
  "strangeness": 7,
  "duration": 300,
  "locale": "Town & City",
  "coordinates": {
    "lat": 46.2044,
    "lng": 6.1432
  },
  "observerTypes": ["CIV"],
  "ufoShapes": ["DLT"],
  "phenomena": ["NOC", "RAY"],
  "tags": ["night", "triangular", "silent"],
  "generateAiImage": true  // Optionnel: génère une image IA
}

// Response 201
{
  "success": true,
  "message": "Observation créée avec succès",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "_id": "507f1f77bcf86cd799439012",
    "date": "11/15/2024",
    "time": "22:30",
    "location": "Geneva, Switzerland",
    "country": "Switzerland",
    "state": "Geneva",
    "description": "Witnessed a large triangular craft...",
    "credibility": 8,
    "strangeness": 7,
    "duration": 300,
    "locale": "Town & City",
    "coordinates": { "lat": 46.2044, "lng": 6.1432 },
    "observerTypes": ["CIV"],
    "ufoShapes": ["DLT"],
    "phenomena": ["NOC", "RAY"],
    "images": [],
    "userId": "507f1f77bcf86cd799439011",
    "tags": ["night", "triangular", "silent"],
    "source": "phenom-app",
    "createdAt": "2024-11-15T21:00:00.000Z"
  }
}
```

### GET /api/v1/observations
**Lister toutes les observations**
```json
// Query params: ?page=1&limit=10&country=Switzerland

// Response 200
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### GET /api/v1/observations/:id
**Récupérer une observation**
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "date": "11/15/2024",
    "time": "22:30",
    "location": "Geneva, Switzerland",
    "country": "Switzerland",
    "description": "...",
    "credibility": 8,
    "strangeness": 7,
    "duration": 300,
    "coordinates": { "lat": 46.2044, "lng": 6.1432 },
    "observerTypes": ["CIV"],
    "ufoShapes": ["DLT"],
    "phenomena": ["NOC", "RAY"],
    "images": [
      {
        "publicId": "phenom/abc123",
        "url": "https://res.cloudinary.com/...",
        "size": 245678,
        "format": "jpg",
        "source": "user"
      }
    ],
    "userId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe"
    },
    "tags": ["night", "triangular"],
    "commentsCount": 5,
    "createdAt": "2024-11-15T21:00:00.000Z"
  }
}
```

### PUT /api/v1/observations/:id
**Mettre à jour une observation** 🔒
```json
// Request (champs modifiables)
{
  "description": "Updated description...",
  "credibility": 10,
  "strangeness": 8,
  "ufoShapes": ["DLT", "NLT"],
  "phenomena": ["NOC", "RAY", "PHT"],
  "tags": ["updated", "tags"]
}

// Response 200
{
  "success": true,
  "message": "Observation mise à jour avec succès",
  "data": { /* observation complète */ }
}
```

### DELETE /api/v1/observations/:id
**Supprimer une observation** 🔒
```json
// Response 200
{
  "success": true,
  "message": "Observation supprimée avec succès"
}
```

### POST /api/v1/observations/:id/generate-ai-image
**Générer une image IA pour une observation** 🔒
```json
// Response 200
{
  "success": true,
  "message": "Image IA générée avec succès",
  "data": {
    /* observation avec nouvelle image (source: "ai") */
  }
}
```

### GET /api/v1/observations/nearby
**Rechercher des observations à proximité**
```json
// Query params: ?latitude=46.2044&longitude=6.1432&radius=10&limit=50

// Response 200
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "date": "11/15/2024",
      "location": "Geneva, Switzerland",
      "coordinates": { "lat": 46.2044, "lng": 6.1432 },
      "distance": 1234.56  // en mètres
    }
  ],
  "pagination": { ... }
}
```

### GET /api/v1/observations/stats
**Statistiques des observations**
```json
// Response 200
{
  "success": true,
  "data": {
    "totalObservations": 1234,
    "withImages": 456,
    "withCoordinates": 1100,
    "topCountries": [...],
    "topShapes": [...],
    "avgCredibility": 7.5,
    "avgStrangeness": 5.2
  }
}
```

---

## 📸 **IMAGES**

### POST /api/v1/observations/:observationId/images
**Upload une image pour une observation** 🔒
```
Content-Type: multipart/form-data

Form data:
- image: [binary file]

// Response 201
{
  "success": true,
  "message": "Image uploadée avec succès",
  "data": {
    "id": "67200e2f4db5e3a1234567890",
    "filename": "ufo-sighting.jpg",
    "contentType": "image/jpeg",
    "size": 245678,
    "url": "/api/v1/images/67200e2f4db5e3a1234567890",
    "observationId": "507f1f77bcf86cd799439011"
  }
}
```

### GET /api/v1/observations/:observationId/images
**Lister les images d'une observation**
```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "67200e2f4db5e3a1234567890",
      "filename": "ufo-sighting.jpg",
      "contentType": "image/jpeg",
      "size": 245678,
      "url": "/api/v1/images/67200e2f4db5e3a1234567890",
      "uploadedAt": "2025-10-16T10:00:00.000Z"
    }
  ]
}
```

### GET /api/v1/images/:imageId
**Récupérer une image (retourne le fichier binaire)**
```
Response: image/jpeg (binary)
Headers:
- Content-Type: image/jpeg
- Content-Disposition: inline; filename="ufo-sighting.jpg"

Utilisation dans HTML:
<img src="http://localhost:3000/api/v1/images/67200e2f4db5e3a1234567890" alt="UFO" />
```

### DELETE /api/v1/observations/:observationId/images/:imageId
**Supprimer une image** 🔒
```json
// Response 204 (No Content)
```

---

## 💬 **COMMENTS - Commentaires**

### POST /api/v1/observations/:observationId/comments
**Créer un commentaire** 🔒
```json
// Request
{
  "content": "Great sighting! I saw the same thing..."
}

// Response 201
{
  "success": true,
  "message": "Commentaire créé",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "content": "Great sighting! I saw the same thing...",
    "observationId": "507f1f77bcf86cd799439011",
    "userId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe"
    },
    "createdAt": "2025-10-16T10:00:00.000Z"
  }
}
```

### GET /api/v1/observations/:observationId/comments
**Lister les commentaires d'une observation**
```json
// Query params: ?page=1&limit=20

// Response 200
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "content": "Great sighting!",
      "userId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe"
      },
      "createdAt": "2025-10-16T10:00:00.000Z",
      "updatedAt": "2025-10-16T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 45
  }
}
```

### PUT /api/v1/comments/:id
**Modifier un commentaire** 🔒
```json
// Request
{
  "content": "Updated comment content"
}

// Response 200
{
  "success": true,
  "message": "Commentaire modifié",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "content": "Updated comment content",
    "updatedAt": "2025-10-16T11:00:00.000Z"
  }
}
```

### DELETE /api/v1/comments/:id
**Supprimer un commentaire** 🔒
```json
// Response 204 (No Content)
```

---

## 👨‍💼 **ADMIN - Administration**

🔐 Tous ces endpoints nécessitent le rôle `admin`

### GET /api/v1/admin/users
**Lister tous les utilisateurs** 🔒 (Admin)
```json
// Query params: ?page=1&limit=10

// Response 200
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "viewer",
      "isActive": true,
      "createdAt": "2025-10-16T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 95
  }
}
```

### GET /api/v1/admin/users/:id
**Récupérer un utilisateur** 🔒 (Admin)
```json
// Response 200
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "viewer",
    "isActive": true,
    "observationsCount": 12,
    "createdAt": "2025-10-16T10:00:00.000Z"
  }
}
```

### PUT /api/v1/admin/users/:id/role
**Modifier le rôle d'un utilisateur** 🔒 (Admin)
```json
// Request
{
  "role": "admin"  // "admin" ou "viewer"
}

// Response 200
{
  "success": true,
  "message": "Rôle mis à jour",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "role": "admin"
  }
}
```

### POST /api/v1/admin/users/:id/suspend
**Suspendre un utilisateur** 🔒 (Admin)
```json
// Response 200
{
  "success": true,
  "message": "Utilisateur suspendu",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "isActive": false
  }
}
```

### POST /api/v1/admin/users/:id/activate
**Activer un utilisateur** 🔒 (Admin)
```json
// Response 200
{
  "success": true,
  "message": "Utilisateur activé",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "isActive": true
  }
}
```

### GET /api/v1/admin/observations
**Lister toutes les observations (y compris pending/rejected)** 🔒 (Admin)
```json
// Query params: ?page=1&limit=10&status=pending

// Response 200
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Strange lights",
      "status": "pending",
      "userId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe"
      },
      "createdAt": "2025-10-16T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 45
  }
}
```

### POST /api/v1/admin/observations/:id/approve
**Approuver une observation** 🔒 (Admin)
```json
// Response 200
{
  "success": true,
  "message": "Observation approuvée",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "approved",
    "moderatedBy": "507f1f77bcf86cd799439099",
    "moderatedAt": "2025-10-16T11:00:00.000Z"
  }
}
```

### POST /api/v1/admin/observations/:id/reject
**Rejeter une observation** 🔒 (Admin)
```json
// Request (optionnel)
{
  "reason": "Contenu inapproprié"
}

// Response 200
{
  "success": true,
  "message": "Observation rejetée",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "rejected",
    "moderatedBy": "507f1f77bcf86cd799439099",
    "moderatedAt": "2025-10-16T11:00:00.000Z"
  }
}
```

### DELETE /api/v1/admin/observations/:id
**Supprimer une observation** 🔒 (Admin)
```json
// Response 204 (No Content)
```

### GET /api/v1/admin/comments
**Lister tous les commentaires** 🔒 (Admin)
```json
// Query params: ?page=1&limit=20

// Response 200
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "content": "Comment content",
      "userId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe"
      },
      "observationId": "507f1f77bcf86cd799439011",
      "createdAt": "2025-10-16T10:00:00.000Z"
    }
  ]
}
```

### DELETE /api/v1/admin/comments/:id
**Supprimer un commentaire** 🔒 (Admin)
```json
// Response 204 (No Content)
```

### GET /api/v1/admin/stats
**Statistiques globales** 🔒 (Admin)
```json
// Response 200
{
  "success": true,
  "data": {
    "totalUsers": 1234,
    "totalObservations": 567,
    "totalComments": 890,
    "recentObservations": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Recent sighting",
        "createdAt": "2025-10-16T10:00:00.000Z"
      }
    ],
    "topContributors": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "count": 45
      }
    ]
  }
}
```

---

## ⚠️ **Codes d'erreur**

```json
// 400 Bad Request
{
  "success": false,
  "error": "Validation échouée",
  "errors": [
    {
      "field": "email",
      "message": "Email invalide"
    }
  ]
}

// 401 Unauthorized
{
  "success": false,
  "error": "Token invalide ou expiré"
}

// 403 Forbidden
{
  "success": false,
  "error": "Accès refusé"
}

// 404 Not Found
{
  "success": false,
  "error": "Ressource non trouvée"
}

// 429 Too Many Requests
{
  "success": false,
  "error": "Trop de requêtes, veuillez réessayer plus tard"
}

// 500 Internal Server Error
{
  "success": false,
  "error": "Erreur serveur interne"
}
```

---

## 🔔 **PUSH NOTIFICATIONS**

### POST /api/v1/push/subscribe 🔒
**S'abonner aux notifications push**
```json
// Request body
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "location": {
    "latitude": 46.5197,
    "longitude": 6.6323
  },
  "alertRadiusKm": 50
}

// Response 201
{
  "success": true,
  "data": {
    "_id": "...",
    "userId": "...",
    "endpoint": "https://fcm.googleapis.com/...",
    "alertRadiusKm": 50,
    "location": {
      "type": "Point",
      "coordinates": [6.6323, 46.5197]
    }
  }
}
```

### PUT /api/v1/push/location 🔒
**Mettre à jour la position (background sync)**
```json
// Request body
{
  "latitude": 46.5197,
  "longitude": 6.6323,
  "alertRadiusKm": 100
}

// Response 200
{
  "success": true,
  "message": "Position mise à jour"
}
```

### DELETE /api/v1/push/unsubscribe 🔒
**Se désabonner des notifications**
```json
// Response 200
{
  "success": true,
  "message": "Désabonnement réussi"
}
```

---

## 📬 **NOTIFICATIONS (Alertes persistantes)**

### GET /api/v1/notifications 🔒
**Lister les notifications de l'utilisateur**
```json
// Query params:
// - page: Numéro de page (défaut: 1)
// - limit: Par page (défaut: 20, max: 100)

// Response 200
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "userId": "...",
      "observationId": "...",
      "title": "Nouvelle observation à proximité",
      "body": "Un phénomène a été signalé à 15 km de vous",
      "data": {
        "observationId": "...",
        "distance": 15.2
      },
      "isRead": false,
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### GET /api/v1/notifications/unread-count 🔒
**Nombre de notifications non lues**
```json
// Response 200
{
  "success": true,
  "data": {
    "count": 3
  }
}
```

### PATCH /api/v1/notifications/:id/read 🔒
**Marquer une notification comme lue**
```json
// Response 200
{
  "success": true,
  "data": {
    "_id": "...",
    "isRead": true
  }
}
```

### POST /api/v1/notifications/mark-all-read 🔒
**Marquer toutes comme lues**
```json
// Response 200
{
  "success": true,
  "data": {
    "modifiedCount": 3
  }
}
```

### DELETE /api/v1/notifications/:id 🔒
**Supprimer une notification**
```json
// Response 200
{
  "success": true,
  "message": "Notification supprimée"
}
```

---

## 🎯 **Exemples d'utilisation (JavaScript)**

### Connexion et stockage du token
```javascript
const response = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const data = await response.json();
localStorage.setItem('accessToken', data.data.accessToken);
```

### Requête authentifiée
```javascript
const token = localStorage.getItem('accessToken');

const response = await fetch('http://localhost:3000/api/v1/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const userData = await response.json();
```

### Upload d'image
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch(`http://localhost:3000/api/v1/observations/${observationId}/images`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const imageData = await response.json();
```

### Afficher une image
```html
<img src="http://localhost:3000/api/v1/images/67200e2f4db5e3a1234567890" alt="UFO" />
```

---

## 📝 **Notes importantes**

1. **Authentification** : Tous les endpoints marqués 🔒 nécessitent un token JWT
2. **Pagination** : Par défaut `page=1` et `limit=10`
3. **Images** : Formats acceptés : JPEG, PNG, WebP - Taille max : 10MB
4. **Coordonnées** : Format GeoJSON `[longitude, latitude]`
5. **Dates** : Format ISO 8601 (UTC)
6. **Rate limiting** : 
   - Auth endpoints : 5 tentatives / 15 min
   - Autres endpoints : 100 requêtes / 15 min
7. **CORS** : Activé pour le développement
8. **Base URL** : `http://localhost:3000` (dev) - à remplacer en production

---

## 🚀 **Démarrage rapide**

```bash
# Backend
cd backend
npm install
npm run dev

# Le serveur démarre sur http://localhost:3000
# Documentation Swagger : http://localhost:3000/api-docs
```

Pour plus de détails, consultez la documentation Swagger interactive ! 🎉
