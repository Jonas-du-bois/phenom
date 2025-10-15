# 📋 Structure Backend Phenom - Documentation Complète

## 🏗️ Vue d'ensemble de l'architecture

L'architecture backend suit les principes **SOLID** et **KISS** avec une séparation claire des responsabilités :

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Frontend)                        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────▼────────────────────────────────────┐
│                      MIDDLEWARES                            │
│  • Rate Limiting  • CORS  • Helmet  • Auth  • Validation   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                       ROUTES                                │
│  Définissent les endpoints et appliquent les middlewares   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    CONTROLLERS                              │
│    Gèrent les requêtes HTTP et les réponses                │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      SERVICES                               │
│         Contiennent la logique métier                       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   MODELS (Mongoose)                         │
│              Définissent les schémas de données             │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                      MONGODB                                │
│              Base de données NoSQL                          │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Structure des fichiers

```
backend/
├── src/
│   ├── app.js                    # Point d'entrée, configuration Express
│   │
│   ├── config/                   # Configuration de l'application
│   │   ├── database.js           # Connexion MongoDB
│   │   ├── jwt.js                # Génération et vérification JWT
│   │   ├── multer.js             # Configuration upload fichiers
│   │   └── swagger.js            # Configuration documentation API
│   │
│   ├── models/                   # Modèles Mongoose (schémas de données)
│   │   ├── User.js               # Schéma utilisateur
│   │   ├── Observation.js        # Schéma observation
│   │   └── Comment.js            # Schéma commentaire
│   │
│   ├── middleware/               # Middlewares réutilisables
│   │   ├── auth.js               # Authentification JWT
│   │   ├── authorize.js          # Autorisation par rôle
│   │   ├── validate.js           # Validation des données
│   │   ├── errorHandler.js       # Gestion centralisée des erreurs
│   │   └── rateLimiter.js        # Limitation de requêtes
│   │
│   ├── validators/               # Règles de validation
│   │   ├── auth.validator.js     # Validation auth (signup, login)
│   │   ├── observation.validator.js  # Validation observations
│   │   ├── comment.validator.js  # Validation commentaires
│   │   └── admin.validator.js    # Validation admin
│   │
│   ├── services/                 # Logique métier
│   │   ├── auth.service.js       # Logique authentification
│   │   ├── observation.service.js # Logique observations
│   │   ├── comment.service.js    # Logique commentaires
│   │   └── admin.service.js      # Logique administration
│   │
│   ├── controllers/              # Contrôleurs HTTP
│   │   ├── auth.controller.js    # Contrôleur auth
│   │   ├── observation.controller.js # Contrôleur observations
│   │   ├── comment.controller.js # Contrôleur commentaires
│   │   └── admin.controller.js   # Contrôleur admin
│   │
│   ├── routes/                   # Définition des routes
│   │   ├── index.js              # Agrégation de toutes les routes
│   │   ├── auth.routes.js        # Routes authentification
│   │   ├── observation.routes.js # Routes observations
│   │   ├── comment.routes.js     # Routes commentaires
│   │   └── admin.routes.js       # Routes administration
│   │
│   └── utils/                    # Utilitaires
│       ├── pagination.js         # Helpers pagination
│       └── response.js           # Formatage réponses HTTP
│
├── tests/                        # Tests automatisés
│   ├── setup.js                  # Configuration Jest
│   └── auth.test.js              # Tests authentification
│
├── scripts/                      # Scripts utilitaires
│   ├── create-admin.js           # Créer un admin
│   └── seed.js                   # Peupler la DB
│
├── uploads/                      # Dossier des fichiers uploadés
│   └── .gitkeep
│
├── .env                          # Variables d'environnement (dev)
├── .env.example                  # Template variables d'environnement
├── .gitignore                    # Fichiers à ignorer par Git
├── package.json                  # Dépendances et scripts
├── jest.config.js                # Configuration Jest
├── README.md                     # Documentation principale
└── QUICKSTART.md                 # Guide de démarrage rapide
```

## 🔄 Flux de données

### Exemple: Création d'une observation

```
1. Client → POST /api/v1/observations
   ↓
2. Middleware: Rate Limiter (limiter les abus)
   ↓
3. Middleware: Auth (vérifier JWT)
   ↓
4. Middleware: Validation (valider les données)
   ↓
5. Route: observation.routes.js
   ↓
6. Controller: observationController.createObservation()
   ├─ Extrait req.body et req.user
   ├─ Appelle le service
   └─ Formate la réponse
   ↓
7. Service: observationService.createObservation()
   ├─ Valide la logique métier
   ├─ Appelle le modèle
   └─ Retourne les données
   ↓
8. Model: Observation.create()
   ├─ Valide le schéma
   ├─ Sauvegarde dans MongoDB
   └─ Retourne le document créé
   ↓
9. Réponse au client: 201 Created
   {
     "success": true,
     "data": { observation },
     "message": "Observation créée avec succès"
   }
```

## 🔐 Sécurité

### Couches de sécurité implémentées

1. **Helmet**: Protection des headers HTTP
2. **CORS**: Contrôle des origines autorisées
3. **Rate Limiting**: Limitation des requêtes par IP
4. **JWT**: Authentification stateless
5. **Bcrypt**: Hash sécurisé des mots de passe
6. **Express Validator**: Validation stricte des inputs
7. **Mongoose**: Sanitisation et validation des données

### Authentification JWT

```javascript
// Génération du token lors de la connexion
const token = jwt.sign(
  { userId, email, role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Vérification du token
Authorization: Bearer <token>
```

### Autorisation par rôles

- **viewer**: Utilisateur standard
  - Créer ses propres observations/commentaires
  - Modifier/supprimer son propre contenu
  - Consulter tout le contenu public

- **admin**: Administrateur
  - Toutes les permissions viewer
  - Modérer tout le contenu
  - Gérer les utilisateurs
  - Accès aux statistiques

## 📊 Modèles de données

### User
```javascript
{
  name: String,           // Nom complet
  email: String,          // Email unique
  password: String,       // Hash bcrypt
  role: String,           // 'admin' ou 'viewer'
  createdAt: Date,        // Date de création
  updatedAt: Date         // Dernière modification
}
```

### Observation
```javascript
{
  title: String,          // Titre (3-100 caractères)
  description: String,    // Description (10-2000 caractères)
  imageUrl: String,       // URL de l'image
  location: {
    type: 'Point',
    coordinates: [lng, lat] // [longitude, latitude]
  },
  userId: ObjectId,       // Référence User
  createdAt: Date,
  updatedAt: Date
}
```

### Comment
```javascript
{
  text: String,           // Texte (1-500 caractères)
  observationId: ObjectId, // Référence Observation
  userId: ObjectId,       // Référence User
  createdAt: Date,
  updatedAt: Date
}
```

## 🔍 Index MongoDB

Pour optimiser les performances :

```javascript
// User
{ email: 1 }              // Unique, pour la connexion

// Observation
{ location: '2dsphere' }  // Index géospatial
{ userId: 1, createdAt: -1 }
{ title: 'text', description: 'text' } // Recherche textuelle

// Comment
{ observationId: 1, createdAt: -1 }
{ userId: 1 }
```

## 🛣️ Routes API

### Authentification (`/api/v1/auth`)
- `POST /signup` - Inscription
- `POST /login` - Connexion
- `POST /logout` - Déconnexion
- `GET /me` - Profil

### Observations (`/api/v1/observations`)
- `GET /` - Liste (filtres: search, lat, lng, radius, page, limit)
- `POST /` - Créer
- `GET /:id` - Détail
- `PUT /:id` - Modifier
- `DELETE /:id` - Supprimer

### Commentaires
- `GET /observations/:id/comments` - Liste
- `POST /observations/:id/comments` - Créer
- `PUT /comments/:id` - Modifier
- `DELETE /comments/:id` - Supprimer

### Administration (`/api/v1/admin`)
- `GET /users` - Liste utilisateurs
- `PUT /users/:id/role` - Changer rôle
- `GET /stats` - Statistiques
- `DELETE /observations/:id` - Supprimer observation
- `DELETE /comments/:id` - Supprimer commentaire

## 🧪 Tests

### Structure des tests

```javascript
describe('Module à tester', () => {
  beforeAll(() => {
    // Setup avant tous les tests
  });

  beforeEach(() => {
    // Setup avant chaque test
  });

  it('should test something', async () => {
    // Test unitaire
    const result = await fonction();
    expect(result).toBe(expected);
  });

  afterEach(() => {
    // Nettoyage après chaque test
  });

  afterAll(() => {
    // Nettoyage après tous les tests
  });
});
```

### Commandes de test

```bash
npm test                # Lancer tous les tests
npm run test:watch      # Mode watch
npm run test:coverage   # Avec couverture
```

## 📦 Scripts utiles

```bash
npm start               # Démarrer en production
npm run dev             # Démarrer en développement
npm test                # Lancer les tests
npm run lint            # Vérifier le code
npm run seed            # Peupler la DB
npm run create-admin    # Créer un admin
```

## 🌐 Variables d'environnement

### Essentielles
- `NODE_ENV`: Environnement (development/production/test)
- `PORT`: Port du serveur
- `MONGODB_URI`: URI MongoDB
- `JWT_SECRET`: Secret pour JWT
- `CORS_ORIGIN`: Origines autorisées

### Optionnelles
- `RATE_LIMIT_WINDOW_MS`: Fenêtre rate limiting
- `RATE_LIMIT_MAX_REQUESTS`: Max requêtes
- `MAX_FILE_SIZE`: Taille max fichiers
- `DEFAULT_PAGE_SIZE`: Pagination par défaut

## 🚀 Déploiement

### Checklist pré-déploiement

- [ ] Variables d'environnement configurées
- [ ] Secrets de production générés
- [ ] MongoDB Atlas ou équivalent configuré
- [ ] Tests passent
- [ ] Linting OK
- [ ] CORS configuré pour le domaine de production
- [ ] Rate limiting adapté
- [ ] Logs configurés

### Docker

```bash
# Build
docker build -t phenom-backend .

# Run
docker run -p 3000:3000 --env-file .env phenom-backend
```

## 📈 Monitoring

### Health Check
```
GET /health
```

Retourne :
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2025-10-15T14:30:00.000Z",
  "uptime": 12345.67,
  "environment": "production",
  "version": "1.0.0"
}
```

## 🐛 Debugging

### Logs
```javascript
// Mode développement: logs détaillés avec Morgan
// Mode production: logs format Apache

console.log()  // Informations
console.error() // Erreurs
console.warn()  // Avertissements
```

### Erreurs communes

1. **Connexion MongoDB échouée**
   - Vérifier `MONGODB_URI`
   - Vérifier que MongoDB est démarré

2. **JWT invalide**
   - Vérifier `JWT_SECRET`
   - Vérifier le format du token

3. **Rate limit atteint**
   - Ajuster `RATE_LIMIT_MAX_REQUESTS`
   - Vérifier les requêtes répétées

## 📚 Ressources

- **Express.js**: https://expressjs.com/
- **Mongoose**: https://mongoosejs.com/
- **JWT**: https://jwt.io/
- **Jest**: https://jestjs.io/

## ✅ Checklist qualité du code

- [ ] Fonctions courtes (< 50 lignes)
- [ ] Une responsabilité par fonction
- [ ] Nommage explicite
- [ ] Commentaires sur le "pourquoi", pas le "quoi"
- [ ] Gestion d'erreurs appropriée
- [ ] Validation des inputs
- [ ] Tests écrits
- [ ] Documentation à jour

---

**Version**: 1.0.0  
**Date**: 15 octobre 2025  
**Mainteneur**: Équipe Backend Phenom
