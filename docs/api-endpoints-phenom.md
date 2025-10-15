# API REST Phenom - Documentation Complète des Endpoints

## Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Authentification et Gestion des Utilisateurs](#authentification-et-gestion-des-utilisateurs)
3. [Gestion des Observations](#gestion-des-observations)
4. [Gestion des Commentaires](#gestion-des-commentaires)
5. [Upload et Gestion d'Images](#upload-et-gestion-dimages)
6. [Endpoints d'Administration](#endpoints-dadministration)
7. [Endpoints de Données Agrégées](#endpoints-de-données-agrégées)
8. [Recherche et Filtrage](#recherche-et-filtrage)
9. [Endpoints Utilitaires](#endpoints-utilitaires)
10. [Documentation et Métadonnées](#documentation-et-métadonnées)
11. [Caractéristiques REST Niveau 2-3](#caractéristiques-rest-niveau-2-3)
12. [Sécurité et Autorisation](#sécurité-et-autorisation)

## Vue d'ensemble

Cette documentation présente la liste complète des endpoints pour l'API REST de l'application **Phenom**, une application d'observation de phénomènes OVNI. L'API est conçue pour respecter les standards REST niveau 2-3 avec documentation Swagger et implémente un système complet de gestion d'utilisateurs, d'observations géolocalisées, et de modération de contenu.

### Technologies Utilisées
- **Backend**: Express.js + MongoDB
- **Authentification**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI 3.0
- **Base de données**: MongoDB avec géospatialisation
- **Conteneurisation**: Docker
- **Déploiement**: Render

## Authentification et Gestion des Utilisateurs

### Endpoints d'Authentification

#### Inscription d'un nouvel utilisateur
```http
POST /auth/signup
```
- **Description**: Créer un nouveau compte utilisateur
- **Corps de la requête**: `{ "name", "email", "password", "confirmPassword" }`
- **Réponse**: Token JWT + données utilisateur
- **Status**: 201 Created / 400 Bad Request

#### Connexion utilisateur
```http
POST /auth/login
```
- **Description**: Authentifier un utilisateur existant
- **Corps de la requête**: `{ "email", "password" }`
- **Réponse**: Token JWT + données utilisateur
- **Status**: 200 OK / 401 Unauthorized

#### Déconnexion
```http
POST /auth/logout
```
- **Description**: Invalider le token JWT actuel
- **Headers**: Authorization Bearer token
- **Status**: 200 OK

#### Rafraîchissement du token
```http
POST /auth/refresh-token
```
- **Description**: Générer un nouveau token JWT
- **Corps de la requête**: `{ "refreshToken" }`
- **Status**: 200 OK / 401 Unauthorized

### Gestion du Profil Utilisateur

#### Récupérer le profil
```http
GET /users/profile
```
- **Description**: Obtenir les informations du profil utilisateur connecté
- **Headers**: Authorization Bearer token
- **Status**: 200 OK / 401 Unauthorized

#### Modifier le profil
```http
PUT /users/profile
```
- **Description**: Mise à jour complète du profil
- **Headers**: Authorization Bearer token
- **Corps**: `{ "name", "email", "bio", "avatar" }`
- **Status**: 200 OK / 400 Bad Request

#### Supprimer le compte
```http
DELETE /users/profile
```
- **Description**: Suppression définitive du compte utilisateur
- **Headers**: Authorization Bearer token
- **Status**: 204 No Content / 401 Unauthorized

#### Changer le mot de passe
```http
PATCH /users/profile/password
```
- **Description**: Modification du mot de passe
- **Corps**: `{ "currentPassword", "newPassword", "confirmPassword" }`
- **Status**: 200 OK / 400 Bad Request

## Gestion des Observations

### CRUD Principal des Observations

#### Lister les observations (avec pagination et filtres)
```http
GET /observations
```
- **Description**: Récupérer une liste paginée des observations publiques
- **Paramètres de requête**:
  - `page=1` (numéro de page)
  - `limit=10` (nombre d'éléments par page)
  - `sort=createdAt` (champ de tri)
  - `order=desc` (ordre de tri)
  - `location[lat]=46.5&location[lng]=6.6&location[radius]=10` (filtrage géographique)
  - `dateFrom=2024-01-01&dateTo=2024-12-31` (filtres temporels)
  - `keyword=ovni` (recherche textuelle)
  - `userId=123` (observations d'un utilisateur spécifique)
- **Status**: 200 OK

#### Créer une nouvelle observation
```http
POST /observations
```
- **Description**: Créer une observation avec géolocalisation automatique
- **Headers**: Authorization Bearer token
- **Corps**: 
```json
{
  "title": "OVNI observé au-dessus de Paris",
  "description": "Description détaillée du phénomène",
  "location": {
    "type": "Point",
    "coordinates": [2.3522, 48.8566]
  },
  "address": "Paris, France",
  "images": ["url1", "url2"],
  "tags": ["ovni", "lumière", "triangulaire"],
  "isPrivate": false
}
```
- **Status**: 201 Created / 400 Bad Request

#### Détails d'une observation spécifique
```http
GET /observations/:id
```
- **Description**: Récupérer les détails complets d'une observation
- **Paramètres**: `id` - Identifiant de l'observation
- **Status**: 200 OK / 404 Not Found

#### Mise à jour complète d'une observation
```http
PUT /observations/:id
```
- **Description**: Modifier une observation (propriétaire ou admin uniquement)
- **Headers**: Authorization Bearer token
- **Autorisation**: Propriétaire de l'observation ou Admin
- **Status**: 200 OK / 403 Forbidden / 404 Not Found

#### Mise à jour partielle d'une observation
```http
PATCH /observations/:id
```
- **Description**: Modification partielle d'une observation
- **Headers**: Authorization Bearer token
- **Autorisation**: Propriétaire de l'observation ou Admin
- **Status**: 200 OK / 403 Forbidden

#### Suppression d'une observation
```http
DELETE /observations/:id
```
- **Description**: Supprimer définitivement une observation
- **Headers**: Authorization Bearer token
- **Autorisation**: Propriétaire de l'observation ou Admin
- **Status**: 204 No Content / 403 Forbidden

### Endpoints Spécialisés pour les Observations

#### Observations à proximité
```http
GET /observations/nearby
```
- **Description**: Récupérer les observations dans un rayon donné
- **Paramètres**: `lat`, `lng`, `radius` (en kilomètres)
- **Status**: 200 OK

#### Observations d'un utilisateur spécifique
```http
GET /observations/user/:userId
```
- **Description**: Lister toutes les observations publiques d'un utilisateur
- **Status**: 200 OK

#### Statistiques agrégées des observations
```http
GET /observations/stats
```
- **Description**: Données statistiques générées par pipeline MongoDB
- **Réponse**: Nombre d'observations par mois, par région, etc.
- **Status**: 200 OK

#### Liker une observation
```http
POST /observations/:id/like
```
- **Description**: Ajouter un "like" à une observation
- **Headers**: Authorization Bearer token
- **Status**: 201 Created / 409 Conflict (déjà liké)

#### Retirer un like
```http
DELETE /observations/:id/like
```
- **Description**: Supprimer un "like" d'une observation
- **Headers**: Authorization Bearer token
- **Status**: 204 No Content / 404 Not Found

## Gestion des Commentaires

### CRUD des Commentaires

#### Lister tous les commentaires
```http
GET /comments
```
- **Description**: Liste paginée de tous les commentaires publics
- **Paramètres**: `page`, `limit`, `sort`, `order`
- **Status**: 200 OK

#### Créer un nouveau commentaire
```http
POST /comments
```
- **Description**: Ajouter un commentaire général (non lié à une observation)
- **Headers**: Authorization Bearer token
- **Corps**: `{ "content", "parentId?" }`
- **Status**: 201 Created

#### Détail d'un commentaire
```http
GET /comments/:id
```
- **Description**: Récupérer un commentaire spécifique
- **Status**: 200 OK / 404 Not Found

#### Modifier un commentaire
```http
PUT /comments/:id
```
- **Description**: Mise à jour d'un commentaire
- **Headers**: Authorization Bearer token
- **Autorisation**: Propriétaire du commentaire ou Admin
- **Status**: 200 OK / 403 Forbidden

#### Supprimer un commentaire
```http
DELETE /comments/:id
```
- **Description**: Suppression d'un commentaire
- **Headers**: Authorization Bearer token
- **Autorisation**: Propriétaire du commentaire ou Admin
- **Status**: 204 No Content / 403 Forbidden

### Commentaires par Observation

#### Lister les commentaires d'une observation
```http
GET /observations/:observationId/comments
```
- **Description**: Récupérer tous les commentaires d'une observation spécifique
- **Paramètres**: Pagination et tri disponibles
- **Status**: 200 OK

#### Ajouter un commentaire à une observation
```http
POST /observations/:observationId/comments
```
- **Description**: Commenter une observation spécifique
- **Headers**: Authorization Bearer token
- **Corps**: `{ "content", "parentId?" }` (pour les réponses)
- **Status**: 201 Created

## Upload et Gestion d'Images

#### Upload d'image
```http
POST /upload/image
```
- **Description**: Télécharger une image pour une observation
- **Headers**: Authorization Bearer token
- **Corps**: Multipart/form-data avec fichier image
- **Contraintes**: Formats JPG, PNG, WebP, taille max 5MB
- **Réponse**: URL de l'image stockée
- **Status**: 201 Created / 400 Bad Request

#### Supprimer une image
```http
DELETE /images/:imageId
```
- **Description**: Supprimer une image uploadée
- **Headers**: Authorization Bearer token
- **Autorisation**: Propriétaire de l'image ou Admin
- **Status**: 204 No Content / 403 Forbidden

#### Récupérer une image
```http
GET /images/:imageId
```
- **Description**: Accéder à une image stockée
- **Réponse**: Fichier image ou redirection vers CDN
- **Status**: 200 OK / 404 Not Found

## Endpoints d'Administration

### Gestion des Utilisateurs (Admin uniquement)

#### Liste des utilisateurs
```http
GET /admin/users
```
- **Description**: Liste paginée de tous les utilisateurs
- **Headers**: Authorization Bearer token
- **Autorisation**: Admin uniquement
- **Paramètres**: Filtres par rôle, statut, date d'inscription
- **Status**: 200 OK / 403 Forbidden

#### Détails d'un utilisateur
```http
GET /admin/users/:id
```
- **Description**: Informations détaillées d'un utilisateur
- **Autorisation**: Admin uniquement
- **Status**: 200 OK / 404 Not Found

#### Modifier le rôle d'un utilisateur
```http
PUT /admin/users/:id/role
```
- **Description**: Changer le rôle d'un utilisateur (user/admin)
- **Corps**: `{ "role": "admin" }`
- **Status**: 200 OK / 400 Bad Request

#### Supprimer un utilisateur
```http
DELETE /admin/users/:id
```
- **Description**: Suppression définitive d'un compte utilisateur
- **Status**: 204 No Content

#### Bannir/débannir un utilisateur
```http
PATCH /admin/users/:id/status
```
- **Description**: Modifier le statut d'un utilisateur
- **Corps**: `{ "status": "banned" | "active" }`
- **Status**: 200 OK

### Modération des Contenus (Admin uniquement)

#### Observations en attente de modération
```http
GET /admin/observations/pending
```
- **Description**: Liste des observations signalées ou en attente
- **Status**: 200 OK

#### Approuver une observation
```http
PUT /admin/observations/:id/approve
```
- **Description**: Valider une observation signalée
- **Status**: 200 OK

#### Rejeter une observation
```http
PUT /admin/observations/:id/reject
```
- **Description**: Rejeter une observation avec motif
- **Corps**: `{ "reason": "Contenu inapproprié" }`
- **Status**: 200 OK

#### Suppression définitive par admin
```http
DELETE /admin/observations/:id
```
- **Description**: Suppression administrative d'une observation
- **Status**: 204 No Content

### Modération des Commentaires (Admin uniquement)

#### Commentaires signalés
```http
GET /admin/comments/flagged
```
- **Description**: Liste des commentaires signalés par les utilisateurs
- **Status**: 200 OK

#### Approuver un commentaire
```http
PUT /admin/comments/:id/approve
```
- **Description**: Valider un commentaire signalé
- **Status**: 200 OK

#### Supprimer un commentaire
```http
DELETE /admin/comments/:id
```
- **Description**: Suppression administrative d'un commentaire
- **Status**: 204 No Content

## Endpoints de Données Agrégées (Pipeline MongoDB)

#### Statistiques par utilisateur
```http
GET /statistics/observations-by-user
```
- **Description**: Nombre d'observations publiées par chaque utilisateur
- **Pipeline MongoDB**: Agrégation avec regroupement par utilisateur
- **Status**: 200 OK

#### Statistiques par localisation
```http
GET /statistics/observations-by-location
```
- **Description**: Répartition géographique des observations
- **Réponse**: Données pour cartes de chaleur
- **Status**: 200 OK

#### Tendances temporelles
```http
GET /statistics/observations-by-date
```
- **Description**: Évolution du nombre d'observations dans le temps
- **Paramètres**: `period` (day/week/month/year)
- **Status**: 200 OK

#### Lieux populaires
```http
GET /statistics/popular-locations
```
- **Description**: Zones géographiques avec le plus d'observations
- **Status**: 200 OK

#### Dashboard administrateur
```http
GET /statistics/dashboard
```
- **Description**: Compilation de statistiques pour tableau de bord admin
- **Autorisation**: Admin uniquement
- **Réponse**: Métriques clés, graphiques, tendances
- **Status**: 200 OK

## Recherche et Filtrage

#### Recherche d'observations
```http
GET /search/observations
```
- **Description**: Recherche textuelle dans les observations
- **Paramètres**: 
  - `q` (terme de recherche)
  - `fields` (champs à rechercher: title,description,tags)
  - Paramètres de pagination standard
- **Status**: 200 OK

#### Filtrage avancé
```http
GET /observations/filter
```
- **Description**: Filtrage multi-critères des observations
- **Paramètres complexes**: 
  - Géographiques (rayon, pays, région)
  - Temporels (période, heure de la journée)
  - Tags et catégories
  - Auteur et popularité
- **Status**: 200 OK

## Endpoints Utilitaires

### Santé et Informations de l'API

#### État de santé de l'API
```http
GET /health
```
- **Description**: Vérification du fonctionnement de l'API et de la base de données
- **Réponse**: `{ "status": "ok", "database": "connected", "uptime": "..." }`
- **Status**: 200 OK / 503 Service Unavailable

#### Informations sur l'API
```http
GET /api-info
```
- **Description**: Métadonnées sur la version et les fonctionnalités de l'API
- **Réponse**: Version, date de déploiement, fonctionnalités disponibles
- **Status**: 200 OK

### Services de Géolocalisation

#### Géocodage d'adresses
```http
GET /locations/geocode
```
- **Description**: Convertir une adresse en coordonnées GPS
- **Paramètres**: `address` (adresse textuelle)
- **Réponse**: `{ "lat", "lng", "formatted_address" }`
- **Status**: 200 OK / 400 Bad Request

#### Géocodage inverse
```http
GET /locations/reverse-geocode
```
- **Description**: Convertir des coordonnées GPS en adresse
- **Paramètres**: `lat`, `lng`
- **Réponse**: Adresse formatée et composants
- **Status**: 200 OK

## Documentation et Métadonnées

#### Interface Swagger UI
```http
GET /api-docs
```
- **Description**: Interface web interactive de la documentation API
- **Réponse**: Page HTML avec Swagger UI
- **Status**: 200 OK

#### Spécification OpenAPI JSON
```http
GET /api-docs.json
```
- **Description**: Spécification complète de l'API en format OpenAPI 3.0
- **Content-Type**: application/json
- **Status**: 200 OK

#### Spécification OpenAPI YAML
```http
GET /api-docs.yaml
```
- **Description**: Spécification de l'API en format YAML
- **Content-Type**: application/yaml
- **Status**: 200 OK

## Caractéristiques REST Niveau 2-3

### Niveau 2 - HTTP Verbs et Status Codes

L'API implémente correctement les principes REST de niveau 2 :

- **Méthodes HTTP appropriées** :
  - `GET` : Récupération de données (idempotent)
  - `POST` : Création de nouvelles ressources
  - `PUT` : Mise à jour complète (idempotent)
  - `PATCH` : Mise à jour partielle
  - `DELETE` : Suppression de ressources (idempotent)

- **Codes de statut HTTP standardisés** :
  - `200 OK` : Succès avec contenu
  - `201 Created` : Ressource créée avec succès
  - `204 No Content` : Succès sans contenu de retour
  - `400 Bad Request` : Erreur de validation côté client
  - `401 Unauthorized` : Authentification requise
  - `403 Forbidden` : Accès interdit (autorisation insuffisante)
  - `404 Not Found` : Ressource non trouvée
  - `409 Conflict` : Conflit avec l'état actuel
  - `500 Internal Server Error` : Erreur serveur

- **Structure URI cohérente et hiérarchique** :
  - Ressources : `/observations`, `/comments`, `/users`
  - Sous-ressources : `/observations/:id/comments`
  - Actions : `/auth/login`, `/upload/image`
  - Administration : `/admin/users`, `/admin/observations`

### Niveau 3 - HATEOAS (Hypermedia as the Engine of Application State)

Pour atteindre le niveau 3 REST, chaque réponse inclut des liens vers les actions possibles sur la ressource :

#### Exemple de réponse HATEOAS pour une observation :
```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "OVNI triangulaire observé au-dessus de Paris",
  "description": "Observation d'un objet volant de forme triangulaire...",
  "location": {
    "type": "Point",
    "coordinates": [2.3522, 48.8566]
  },
  "images": ["https://api.phenom.app/images/abc123.jpg"],
  "author": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Jean Dupont"
  },
  "createdAt": "2024-10-15T15:30:00Z",
  "likesCount": 15,
  "commentsCount": 3,
  "_links": {
    "self": {
      "href": "/observations/507f1f77bcf86cd799439011",
      "method": "GET"
    },
    "comments": {
      "href": "/observations/507f1f77bcf86cd799439011/comments",
      "method": "GET"
    },
    "add-comment": {
      "href": "/observations/507f1f77bcf86cd799439011/comments",
      "method": "POST",
      "rel": "create",
      "type": "application/json"
    },
    "like": {
      "href": "/observations/507f1f77bcf86cd799439011/like",
      "method": "POST",
      "rel": "action"
    },
    "edit": {
      "href": "/observations/507f1f77bcf86cd799439011",
      "method": "PUT",
      "rel": "edit",
      "condition": "owner-or-admin"
    },
    "delete": {
      "href": "/observations/507f1f77bcf86cd799439011",
      "method": "DELETE",
      "rel": "delete",
      "condition": "owner-or-admin"
    },
    "author": {
      "href": "/users/507f1f77bcf86cd799439012",
      "method": "GET",
      "rel": "related"
    },
    "nearby": {
      "href": "/observations/nearby?lat=48.8566&lng=2.3522&radius=10",
      "method": "GET",
      "rel": "related"
    }
  }
}
```

#### Avantages de l'implémentation HATEOAS :
- **Navigation dynamique** : Le client découvre les actions possibles via les liens
- **Évolutivité** : Changements d'URLs transparents pour le client
- **État d'application** : Les liens reflètent l'état actuel et les permissions
- **Documentation vivante** : Les relations entre ressources sont explicites

## Sécurité et Autorisation

### Classification des Endpoints par Niveau de Sécurité

#### Endpoints Publics (aucune authentification)
- `GET /observations` (vue limitée, sans informations sensibles)
- `GET /observations/:id` (vue limitée)
- `GET /observations/nearby` (données géographiques publiques)
- `POST /auth/signup`
- `POST /auth/login`
- `GET /health`
- `GET /api-docs` et variants
- `GET /locations/*` (services de géolocalisation)

#### Endpoints Authentifiés (JWT requis)
- **Profil utilisateur** : `/users/profile` (toutes méthodes)
- **Création de contenu** : `POST /observations`, `POST /comments`
- **Gestion du contenu personnel** : `PUT|PATCH|DELETE /observations/:id` (propriétaire uniquement)
- **Interactions** : `POST|DELETE /observations/:id/like`
- **Upload** : `POST /upload/image`, `DELETE /images/:id`

#### Endpoints Administration (rôle Admin requis)
- **Gestion utilisateurs** : `/admin/users/*`
- **Modération** : `/admin/observations/*`, `/admin/comments/*`
- **Statistiques avancées** : `GET /statistics/dashboard`

### Modèle d'Autorisation

#### Rôles Utilisateur
1. **Public Viewer** (non connecté) :
   - Consultation limitée des observations publiques
   - Accès aux endpoints publics uniquement

2. **Registered User** (utilisateur connecté) :
   - Toutes les permissions Public Viewer
   - Création et gestion de ses propres observations
   - Commentaires et interactions (likes)
   - Gestion de son profil

3. **Admin** :
   - Toutes les permissions Registered User
   - Modération de tous les contenus
   - Gestion des utilisateurs
   - Accès aux statistiques complètes
   - Suppression et modification de tout contenu

#### Règles d'Autorisation Spécifiques
- **Propriété du contenu** : Un utilisateur ne peut modifier/supprimer que ses propres observations et commentaires
- **Modération** : Seuls les admins peuvent approuver/rejeter des contenus signalés
- **Données privées** : Les informations personnelles (email, etc.) ne sont accessibles qu'au propriétaire et aux admins
- **Géolocalisation précise** : Seul le créateur d'une observation peut voir la position exacte

### Implémentation JWT

#### Structure du Token
```json
{
  "sub": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "user",
  "iat": 1697374800,
  "exp": 1697461200
}
```

#### Headers d'Authentification
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Gestion des Erreurs d'Authentification
- **401 Unauthorized** : Token manquant ou invalide
- **403 Forbidden** : Token valide mais permissions insuffisantes
- **Token expiré** : Redirection vers `/auth/refresh-token`

## Recommandations d'Implémentation

### Pagination Standard
Tous les endpoints retournant des listes doivent supporter :
```
GET /endpoint?page=1&limit=20&sort=createdAt&order=desc
```

Réponse standardisée :
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Gestion d'Erreurs Cohérente
Format standardisé pour toutes les erreurs :
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les données fournies sont invalides",
    "details": [
      {
        "field": "email",
        "message": "Format d'email invalide"
      }
    ]
  }
}
```

### Validation des Données
- **Mongoose schemas** avec validations intégrées
- **Sanitisation** des entrées utilisateur
- **Validation des références** entre collections
- **Contraintes de géolocalisation** (coordonnées valides)

Cette documentation complète fournit tous les éléments nécessaires pour implémenter une API REST robuste et conforme aux standards modernes pour l'application Phenom.