# Routes à Implémenter - API Phenom REST Niveau 2-3

## 📊 Vue d'Ensemble

Ce document liste toutes les routes à implémenter pour compléter l'API Phenom et atteindre une conformité REST niveau 2-3 complète.

### État Actuel
- **Routes implémentées** : 20/42 (48%)
- **Routes à implémenter** : 22/42 (52%)
- **Conformité REST** : Niveau 2 ✅ | Niveau 3 ⚠️ (HATEOAS à ajouter)

---

## 🔴 Priorité 1 - Routes CRITIQUES (8 routes)

Ces routes sont essentielles au bon fonctionnement de l'application et doivent être implémentées en priorité.

### 1. POST /api/v1/auth/refresh-token
**Fichier** : `backend/src/routes/auth.routes.js`  
**Controller** : `backend/src/controllers/auth.controller.js`  
**Service** : `backend/src/services/auth.service.js`

**Description** : Rafraîchir le token JWT expiré avec un refresh token valide

**Corps de la requête** :
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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Implémentation** :
```javascript
// auth.routes.js
router.post('/refresh-token', authController.refreshToken);

// auth.controller.js
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshToken(refreshToken);
    
    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    next(error);
  }
};

// auth.service.js
const refreshToken = async (refreshToken) => {
  // Vérifier le refresh token
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  
  // Vérifier que l'utilisateur existe toujours
  const user = await User.findById(decoded.sub);
  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }
  
  // Générer nouveaux tokens
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  
  return {
    token: newAccessToken,
    refreshToken: newRefreshToken
  };
};
```

---

### 2. GET /api/v1/users/me
**Fichier** : `backend/src/routes/user.routes.js` (à créer)  
**Controller** : `backend/src/controllers/user.controller.js` (à créer)  
**Service** : `backend/src/services/user.service.js` (à créer)

**Description** : Récupérer le profil complet de l'utilisateur connecté (remplace `/auth/me`)

**Authentification** : JWT requis

**Réponse 200** :
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "role": "user",
    "createdAt": "2024-10-15T10:00:00Z",
    "observationsCount": 12,
    "commentsCount": 45
  },
  "_links": {
    "self": { "href": "/api/v1/users/me" },
    "update": { "href": "/api/v1/users/me", "method": "PUT" },
    "delete": { "href": "/api/v1/users/me", "method": "DELETE" },
    "observations": { "href": "/api/v1/users/me/observations" },
    "changePassword": { "href": "/api/v1/users/me/password", "method": "PATCH" }
  }
}
```

**Implémentation** :
```javascript
// user.routes.js
import express from 'express';
import userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', authenticate, userController.getProfile);

export default router;

// index.js - ajouter la route
router.use('/users', userRoutes);

// user.controller.js
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await userService.getProfile(userId);
    
    res.json({
      success: true,
      data: profile,
      _links: generateUserLinks(userId, req.user.role)
    });
  } catch (error) {
    next(error);
  }
};
```

---

### 3. PUT /api/v1/users/me
**Fichier** : `backend/src/routes/user.routes.js`  
**Controller** : `backend/src/controllers/user.controller.js`  
**Service** : `backend/src/services/user.service.js`

**Description** : Mettre à jour le profil de l'utilisateur connecté

**Authentification** : JWT requis

**Corps de la requête** :
```json
{
  "name": "Jean Dupont",
  "email": "nouveau@example.com",
  "bio": "Passionné d'astronomie"
}
```

**Validation** :
- `name` : 2-50 caractères
- `email` : format email valide, unique
- `bio` : max 500 caractères (optionnel)

**Implémentation** :
```javascript
// user.routes.js
import { updateProfileValidation } from '../validators/user.validator.js';
import { validate } from '../middleware/validate.js';

router.put('/me', 
  authenticate, 
  updateProfileValidation, 
  validate, 
  userController.updateProfile
);

// user.validator.js
import { body } from 'express-validator';

export const updateProfileValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La bio ne peut pas dépasser 500 caractères')
];
```

---

### 4. POST /api/v1/observations/:id/images
**Fichier** : `backend/src/routes/observation.routes.js`  
**Controller** : `backend/src/controllers/observation.controller.js`  
**Service** : `backend/src/services/observation.service.js`

**Description** : Upload d'une image pour une observation (sous-ressource RESTful)

**Authentification** : JWT requis (propriétaire uniquement)

**Content-Type** : `multipart/form-data`

**Multipart Form** :
- `image` : Fichier (JPEG, PNG, WebP, max 10MB)

**Réponse 201** :
```json
{
  "success": true,
  "data": {
    "imageId": "img_507f1f77bcf86cd799439011",
    "imageUrl": "https://phenom.app/uploads/img_507f1f77bcf86cd799439011.jpg",
    "size": 1024000,
    "format": "jpeg"
  },
  "_links": {
    "self": { "href": "/api/v1/observations/507f.../images/img_507f..." },
    "delete": { "href": "/api/v1/observations/507f.../images/img_507f...", "method": "DELETE" },
    "observation": { "href": "/api/v1/observations/507f..." }
  }
}
```

**Implémentation** :
```javascript
// observation.routes.js
import upload from '../config/multer.js';
import observationService from '../services/observation.service.js';

router.post(
  '/:id/images',
  authenticate,
  upload.single('image'),
  isOwnerOrAdmin(async (req) => {
    return await observationService.getObservationOwnerId(req.params.id);
  }),
  observationController.addImage
);

// observation.controller.js
const addImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'Aucun fichier fourni' }
      });
    }
    
    const observationId = req.params.id;
    const imageData = await observationService.addImage(observationId, req.file);
    
    res.status(201).json({
      success: true,
      data: imageData,
      _links: generateImageLinks(observationId, imageData.imageId)
    });
  } catch (error) {
    next(error);
  }
};
```

---

### 5. GET /api/v1/admin/observations
**Fichier** : `backend/src/routes/admin.routes.js`  
**Controller** : `backend/src/controllers/admin.controller.js`  
**Service** : `backend/src/services/admin.service.js`

**Description** : Liste de toutes les observations avec filtres admin

**Authentification** : JWT + rôle admin requis

**Query Params** :
- `page`, `limit`, `sort`, `order` (pagination standard)
- `status=pending` : Filtrer par statut de modération
- `flagged=true` : Observations signalées uniquement
- `userId=507f...` : Par utilisateur spécifique

**Réponse 200** :
```json
{
  "success": true,
  "data": [
    {
      "id": "507f...",
      "title": "...",
      "userId": { "id": "...", "name": "..." },
      "status": "pending",
      "flagged": true,
      "flagReason": "Contenu inapproprié",
      "createdAt": "...",
      "_links": {
        "self": { "href": "/api/v1/observations/507f..." },
        "approve": { "href": "/api/v1/admin/observations/507f.../approve", "method": "POST" },
        "reject": { "href": "/api/v1/admin/observations/507f.../reject", "method": "POST" },
        "delete": { "href": "/api/v1/admin/observations/507f...", "method": "DELETE" }
      }
    }
  ],
  "pagination": { ... }
}
```

**Implémentation** :
```javascript
// admin.routes.js
router.get('/observations', 
  getObservationsValidation, 
  validate, 
  adminController.getAllObservations
);

// admin.controller.js
const getAllObservations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, flagged, userId } = req.query;
    
    const observations = await adminService.getAllObservations({
      page,
      limit,
      status,
      flagged,
      userId
    });
    
    res.json({
      success: true,
      data: observations.data,
      pagination: observations.pagination
    });
  } catch (error) {
    next(error);
  }
};
```

---

### 6. POST /api/v1/admin/observations/:id/approve
**Fichier** : `backend/src/routes/admin.routes.js`  
**Controller** : `backend/src/controllers/admin.controller.js`  
**Service** : `backend/src/services/admin.service.js`

**Description** : Approuver une observation signalée (action non-CRUD = POST)

**Authentification** : JWT + rôle admin requis

**Corps de la requête** :
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
    "approvedAt": "2024-10-15T22:00:00Z",
    "approvedBy": "507f...",
    "note": "Contenu validé après vérification"
  }
}
```

**Implémentation** :
```javascript
// admin.routes.js
router.post('/observations/:id/approve',
  idParamValidation,
  validate,
  adminController.approveObservation
);

// admin.controller.js
const approveObservation = async (req, res, next) => {
  try {
    const observationId = req.params.id;
    const adminId = req.user.id;
    const { note } = req.body;
    
    const result = await adminService.approveObservation(observationId, adminId, note);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
```

---

### 7. POST /api/v1/admin/observations/:id/reject
**Fichier** : `backend/src/routes/admin.routes.js`  
**Controller** : `backend/src/controllers/admin.controller.js`  
**Service** : `backend/src/services/admin.service.js`

**Description** : Rejeter une observation avec motif

**Authentification** : JWT + rôle admin requis

**Corps de la requête** :
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
    "rejectedAt": "2024-10-15T22:00:00Z",
    "rejectedBy": "507f...",
    "reason": "Contenu inapproprié"
  }
}
```

---

### 8. POST /api/v1/admin/users/:id/suspend
**Fichier** : `backend/src/routes/admin.routes.js`  
**Controller** : `backend/src/controllers/admin.controller.js`  
**Service** : `backend/src/services/admin.service.js`

**Description** : Suspendre un utilisateur (action non-CRUD = POST)

**Authentification** : JWT + rôle admin requis

**Corps de la requête** :
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
    "suspendedAt": "2024-10-15T22:00:00Z",
    "suspendedUntil": "2024-10-22T22:00:00Z",
    "reason": "Violation des conditions d'utilisation"
  }
}
```

**Implémentation** :
```javascript
// admin.routes.js
router.post('/users/:id/suspend',
  suspendUserValidation,
  validate,
  adminController.suspendUser
);

// admin.validator.js
export const suspendUserValidation = [
  param('id').isMongoId().withMessage('ID utilisateur invalide'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('La raison est requise')
    .isLength({ min: 10, max: 500 })
    .withMessage('La raison doit contenir entre 10 et 500 caractères'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('La durée doit être entre 1 et 365 jours'),
  body('notify')
    .optional()
    .isBoolean()
    .withMessage('notify doit être un booléen')
];
```

---

## 🟡 Priorité 2 - Routes IMPORTANTES (7 routes)

Ces routes améliorent significativement l'expérience utilisateur et doivent être implémentées après les routes critiques.

### 9. PATCH /api/v1/users/me/password
**Description** : Changer le mot de passe de l'utilisateur connecté

**Corps** :
```json
{
  "currentPassword": "AncienPass123!",
  "newPassword": "NouveauPass123!",
  "confirmPassword": "NouveauPass123!"
}
```

---

### 10. DELETE /api/v1/users/me
**Description** : Supprimer son propre compte (suppression soft ou hard)

---

### 11. GET /api/v1/users/me/observations
**Description** : Liste des observations de l'utilisateur connecté

**Query Params** : `page`, `limit`, `sort`, `order`

---

### 12. GET /api/v1/observations/nearby
**Description** : Recherche géographique d'observations

**Query Params** :
- `latitude=48.8566` (requis)
- `longitude=2.3522` (requis)
- `radius=50` (en km, défaut: 10)

**Utilise l'index géospatial MongoDB** :
```javascript
const observations = await Observation.find({
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      $maxDistance: radius * 1000 // convertir km en mètres
    }
  }
});
```

---

### 13. DELETE /api/v1/observations/:id/images/:imageId
**Description** : Supprimer une image d'une observation

---

### 14. GET /api/v1/admin/comments
**Description** : Liste de tous les commentaires (vue admin)

**Query Params** :
- `flagged=true` : Commentaires signalés
- `userId=507f...`
- `observationId=507f...`

---

### 15. POST /api/v1/admin/users/:id/activate
**Description** : Réactiver un utilisateur suspendu

---

## 🟢 Priorité 3 - Routes OPTIONNELLES (7 routes)

Ces routes sont des améliorations qui peuvent être implémentées ultérieurement.

### 16. POST /api/v1/auth/forgot-password
**Description** : Demander un reset de mot de passe par email

---

### 17. POST /api/v1/auth/reset-password
**Description** : Réinitialiser le mot de passe avec un token

---

### 18. GET /api/v1/admin/users/:id
**Description** : Détails complets d'un utilisateur (vue admin)

---

### 19. DELETE /api/v1/admin/users/:id
**Description** : Supprimer définitivement un utilisateur

---

### 20. GET /api/v1/observations/stats
**Description** : Statistiques publiques sur les observations (agrégation MongoDB)

**Utilise pipeline MongoDB** :
```javascript
const stats = await Observation.aggregate([
  {
    $group: {
      _id: { $month: '$createdAt' },
      count: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } }
]);
```

---

### 21. GET /api/v1/admin/stats/observations
**Description** : Statistiques détaillées sur les observations

---

### 22. GET /api/v1/admin/stats/users
**Description** : Statistiques détaillées sur les utilisateurs

---

## 📋 Checklist d'Implémentation

### Pour chaque nouvelle route :

#### 1. Créer/Modifier les fichiers
- [ ] Route dans `backend/src/routes/*.routes.js`
- [ ] Controller dans `backend/src/controllers/*.controller.js`
- [ ] Service dans `backend/src/services/*.service.js`
- [ ] Validator dans `backend/src/validators/*.validator.js` (si nécessaire)

#### 2. Ajouter les validations
- [ ] Validation des paramètres (express-validator)
- [ ] Validation Mongoose schema
- [ ] Middleware `validate`

#### 3. Ajouter l'authentification/autorisation
- [ ] Middleware `authenticate` (si requis)
- [ ] Middleware `authorize('admin')` (si admin)
- [ ] Middleware `isOwnerOrAdmin` (si propriété)

#### 4. Implémenter HATEOAS
- [ ] Ajouter `_links` dans la réponse
- [ ] Liens conditionnels selon les permissions
- [ ] Liens vers ressources liées

#### 5. Tester
- [ ] Test unitaire du service
- [ ] Test d'intégration de la route
- [ ] Test des cas d'erreur
- [ ] Test des permissions

#### 6. Documenter
- [ ] Commentaires JSDoc dans le code
- [ ] Annotations Swagger
- [ ] Mise à jour de `endpoints.md`

---

## 🛠️ Structure de Fichiers Recommandée

### Créer ces nouveaux fichiers :

```
backend/src/
├── routes/
│   └── user.routes.js                    (nouveau)
├── controllers/
│   └── user.controller.js                (nouveau)
├── services/
│   └── user.service.js                   (nouveau)
└── validators/
    └── user.validator.js                 (nouveau)
```

### Modifier ces fichiers existants :

```
backend/src/
├── routes/
│   ├── index.js                          (ajouter route /users)
│   ├── auth.routes.js                    (ajouter refresh-token)
│   ├── observation.routes.js             (ajouter upload images, nearby)
│   └── admin.routes.js                   (ajouter approve, reject, suspend)
├── controllers/
│   ├── auth.controller.js
│   ├── observation.controller.js
│   └── admin.controller.js
└── services/
    ├── auth.service.js
    ├── observation.service.js
    └── admin.service.js
```

---

## 🔧 Helpers Utilitaires à Créer

### 1. Helper HATEOAS
**Fichier** : `backend/src/utils/hateoas.js`

```javascript
export const generateLinks = (resource, type, userId, userRole) => {
  const baseUrl = `/api/v1/${type}`;
  const links = {
    self: { href: `${baseUrl}/${resource.id}`, method: 'GET' }
  };
  
  // Liens conditionnels selon la propriété et le rôle
  const isOwner = resource.userId?.toString() === userId?.toString();
  const isAdmin = userRole === 'admin';
  
  if (isOwner || isAdmin) {
    links.update = { href: `${baseUrl}/${resource.id}`, method: 'PUT' };
    links.delete = { href: `${baseUrl}/${resource.id}`, method: 'DELETE' };
  }
  
  return links;
};

export const generateObservationLinks = (observation, userId, userRole) => {
  const links = generateLinks(observation, 'observations', userId, userRole);
  
  links.comments = {
    href: `/api/v1/observations/${observation.id}/comments`,
    method: 'GET'
  };
  
  if (userId) {
    links['add-comment'] = {
      href: `/api/v1/observations/${observation.id}/comments`,
      method: 'POST'
    };
  }
  
  const isOwner = observation.userId?.toString() === userId?.toString();
  if (isOwner) {
    links['upload-image'] = {
      href: `/api/v1/observations/${observation.id}/images`,
      method: 'POST',
      contentType: 'multipart/form-data'
    };
  }
  
  return links;
};
```

---

### 2. Helper Pagination
**Fichier** : `backend/src/utils/pagination.js` (déjà existant, à vérifier)

```javascript
export const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

export const buildPaginationResponse = (data, page, limit, total) => {
  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};
```

---

## 📝 Template de Route Complète

Voici un template pour implémenter une nouvelle route RESTful complète :

```javascript
// ============================================================
// ROUTE
// ============================================================
// routes/resource.routes.js
import express from 'express';
import resourceController from '../controllers/resource.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { resourceValidation } from '../validators/resource.validator.js';

const router = express.Router();

router.get('/',
  resourceValidation.list,
  validate,
  resourceController.list
);

router.post('/',
  authenticate,
  resourceValidation.create,
  validate,
  resourceController.create
);

export default router;

// ============================================================
// CONTROLLER
// ============================================================
// controllers/resource.controller.js
import resourceService from '../services/resource.service.js';
import { generateLinks } from '../utils/hateoas.js';

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await resourceService.list({ page, limit });
    
    res.json({
      success: true,
      data: result.data.map(item => ({
        ...item.toObject(),
        _links: generateLinks(item, 'resources', req.user?.id, req.user?.role)
      })),
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const resource = await resourceService.create(userId, req.body);
    
    res.status(201).json({
      success: true,
      data: {
        ...resource.toObject(),
        _links: generateLinks(resource, 'resources', userId, req.user.role)
      }
    });
  } catch (error) {
    next(error);
  }
};

export default { list, create };

// ============================================================
// SERVICE
// ============================================================
// services/resource.service.js
import Resource from '../models/Resource.js';
import { buildPaginationResponse } from '../utils/pagination.js';

const list = async ({ page, limit }) => {
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    Resource.find().skip(skip).limit(limit).populate('userId', 'name email'),
    Resource.countDocuments()
  ]);
  
  return buildPaginationResponse(data, page, limit, total);
};

const create = async (userId, data) => {
  const resource = new Resource({
    ...data,
    userId
  });
  
  await resource.save();
  return resource;
};

export default { list, create };

// ============================================================
// VALIDATOR
// ============================================================
// validators/resource.validator.js
import { query, body } from 'express-validator';

export const resourceValidation = {
  list: [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Le nom est requis')
      .isLength({ min: 3, max: 100 })
      .withMessage('Le nom doit contenir entre 3 et 100 caractères')
  ]
};
```

---

## 🎯 Plan d'Implémentation Recommandé

### Semaine 1 : Routes Critiques Auth + Users
1. POST /auth/refresh-token
2. GET /users/me
3. PUT /users/me
4. PATCH /users/me/password
5. DELETE /users/me

### Semaine 2 : Routes Critiques Observations
6. POST /observations/:id/images
7. DELETE /observations/:id/images/:imageId
8. GET /observations/nearby
9. GET /users/me/observations

### Semaine 3 : Routes Critiques Admin
10. GET /admin/observations
11. POST /admin/observations/:id/approve
12. POST /admin/observations/:id/reject
13. POST /admin/users/:id/suspend
14. POST /admin/users/:id/activate

### Semaine 4 : HATEOAS + Tests
15. Implémenter `_links` dans toutes les réponses
16. Tests unitaires et d'intégration
17. Documentation Swagger complète

---

## ✅ Conformité REST - Points de Vérification

Pour chaque route implémentée, vérifier :

### Niveau 2 ✅
- [ ] Verbe HTTP approprié (GET/POST/PUT/PATCH/DELETE)
- [ ] Code de statut HTTP correct (200/201/204/400/401/403/404)
- [ ] URI cohérente (ressources au pluriel, sous-ressources)
- [ ] Idempotence respectée (GET, PUT, DELETE)
- [ ] Safe methods (GET ne modifie pas les données)

### Niveau 3 ✅
- [ ] `_links` présent dans la réponse
- [ ] Lien `self` vers la ressource
- [ ] Liens vers actions possibles (conditionnels selon permissions)
- [ ] Liens vers ressources liées (author, comments, etc.)
- [ ] `method` et `href` corrects pour chaque lien

---

## 📚 Ressources Complémentaires

- **REST API Guidelines** : [Microsoft REST API Guidelines](https://github.com/Microsoft/api-guidelines/blob/master/Guidelines.md)
- **HATEOAS** : [REST API Tutorial - HATEOAS](https://restfulapi.net/hateoas/)
- **Express Best Practices** : [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- **MongoDB Geospatial** : [MongoDB Geospatial Queries](https://docs.mongodb.com/manual/geospatial-queries/)

---

Ce document doit être mis à jour au fur et à mesure de l'implémentation des routes.

**Dernière mise à jour** : 16 octobre 2025
