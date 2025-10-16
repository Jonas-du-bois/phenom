# Architecture & Conception Backend — Phenom App

> Document de référence pour concevoir et implémenter la plateforme backend de Phenom (UFO Observation App). Il décrit de manière exhaustive les choix technologiques, l'architecture logicielle, le modèle de données et les contrats d'API requis pour respecter les contraintes du projet.

---

## 1. Vision & Objectifs

### 1.1 Mission du backend
- Fournir une **API REST sécurisée** pour la gestion des observations OVNI avec géolocalisation et photos.
- Permettre aux utilisateurs de **signaler, consulter et commenter** les phénomènes observés.
- Assurer la **modération** via un système d'administration à deux niveaux (admin/viewer).
- Garantir la **scalabilité**, la **sécurité** et la **maintenabilité** selon les principes KISS.

### 1.2 Objectifs techniques
| Domaine | Objectif |
|---------|----------|
| Conformité | Respect strict des exigences REST API du cours |
| Sécurité | JWT + autorisation basée sur les rôles |
| Performance | Temps de réponse < 300ms, pagination optimisée |
| Scalabilité | Architecture modulaire prête pour le déploiement sur Render |
| Maintenabilité | Code simple (KISS), documentation Swagger complète |
| Tests | Minimum 10 tests automatisés reproductibles |

---

## 2. Architecture Globale

### 2.1 Stack technique (Versions 2025)
| Couche | Technologies | Version |
|--------|--------------|---------| 
| Framework | Express.js | **5.1.0** (Mars 2025) |
| Runtime | Node.js | **24.x LTS** (Mai 2025) |
| Base de données | MongoDB | **8.2.x** (Septembre 2025) |
| ODM | Mongoose | **8.18.x** (Août 2025) |
| Authentification | JWT + bcryptjs | **2.4.3** |
| Validation | Express-validator | **7.2.x** |
| Documentation | Swagger UI + OpenAPI 3.0 | **5.x** |
| Upload images | Multer | **1.4.x** |
| Tests | Jest + Supertest | **30.2.x** + **7.1.4** |
| Conteneurisation | Docker | **28.x** (Octobre 2025) |
| Déploiement | Render (Docker) | - |

### 2.2 Diagramme logique
```
[Frontend Vue.js] --HTTP--> [Express.js API] --┐
                                              │
                    ┌─────────────────────────▼─────────────────────────┐
                    │              Couche API                           │
                    │  Routes → Controllers → Services → Repositories   │
                    └─────────────────────────┬─────────────────────────┘
                                              │
                    ┌─────────────────────────▼─────────────────────────┐
                    │            Middlewares Transversaux               │
                    │   Auth • Validation • Rate Limiting • Errors     │
                    └─────────────────────────┬─────────────────────────┘
                                              │
                    ┌─────────────────────────▼─────────────────────────┐
                    │                  MongoDB                          │
                    │   Collections : Users, Observations, Comments    │
                    └───────────────────────────────────────────────────┘
```

### 2.3 Séparation des responsabilités
- **Routes** : définissent les endpoints et appliquent les middlewares.
- **Controllers** : traitent les requêtes HTTP, valident les données, appellent les services.
- **Services** : contiennent la logique métier et orchestrent les opérations.
- **Repositories** : encapsulent l'accès aux données via Mongoose.
- **Middlewares** : gèrent l'authentification, l'autorisation, la validation et les erreurs.

---

## 3. Modèles de Données MongoDB

### 3.1 Structure des collections

#### Collection `users`
```javascript
{
  _id: ObjectId,
  name: String, // required
  email: String, // required, unique
  password: String, // hashed with bcryptjs, required
  role: String, // enum: ['admin', 'viewer'], default: 'viewer'
  createdAt: Date, // default: Date.now
  updatedAt: Date
}
```

#### Collection `observations`
```javascript
{
  _id: ObjectId,
  title: String, // required
  description: String, // required
  imageUrl: String, // URL vers l'image uploadée
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number] // [longitude, latitude] - required
  },
  userId: ObjectId, // référence vers users._id, required
  createdAt: Date, // default: Date.now
  updatedAt: Date
}
```

#### Collection `comments`
```javascript
{
  _id: ObjectId,
  text: String, // required
  observationId: ObjectId, // référence vers observations._id, required
  userId: ObjectId, // référence vers users._id, required
  createdAt: Date, // default: Date.now
  updatedAt: Date
}
```

### 3.2 Index et contraintes
- **users** : index unique sur `email`
- **observations** : index géospatial sur `location`, index sur `userId` et `createdAt`
- **comments** : index composé sur `observationId` et `createdAt`, index sur `userId`

---

## 4. API REST - Endpoints

### 4.1 Authentification
| Méthode | Route | Description | Auth | Body |
|---------|-------|-------------|------|------|
| POST | `/auth/signup` | Inscription | Non | `{name, email, password}` |
| POST | `/auth/login` | Connexion | Non | `{email, password}` |
| POST | `/auth/logout` | Déconnexion | Oui | - |
| GET | `/auth/me` | Profile utilisateur | Oui | - |

### 4.2 Observations
| Méthode | Route | Description | Auth | Params/Body |
|---------|-------|-------------|------|-------------|
| GET | `/observations` | Liste paginée avec filtres | Non | `?page=1&limit=10&search=ovni&lat=46.5&lng=6.6&radius=50` |
| POST | `/observations` | Créer une observation | Oui | `{title, description, imageUrl, location}` |
| GET | `/observations/:id` | Détail d'une observation | Non | - |
| PUT | `/observations/:id` | Modifier (propriétaire/admin) | Oui | `{title, description, imageUrl}` |
| DELETE | `/observations/:id` | Supprimer (propriétaire/admin) | Oui | - |

### 4.3 Commentaires
| Méthode | Route | Description | Auth | Body |
|---------|-------|-------------|------|------|
| GET | `/observations/:id/comments` | Commentaires d'une observation | Non | - |
| POST | `/observations/:id/comments` | Ajouter un commentaire | Oui | `{text}` |
| PUT | `/comments/:id` | Modifier (propriétaire/admin) | Oui | `{text}` |
| DELETE | `/comments/:id` | Supprimer (propriétaire/admin) | Oui | - |

### 4.4 Administration (Admins uniquement)
| Méthode | Route | Description | Auth | Params |
|---------|-------|-------------|------|--------|
| GET | `/admin/users` | Liste des utilisateurs | Admin | `?page=1&limit=20` |
| PUT | `/admin/users/:id/role` | Changer le rôle | Admin | `{role}` |
| DELETE | `/admin/observations/:id` | Supprimer observation | Admin | - |
| DELETE | `/admin/comments/:id` | Supprimer commentaire | Admin | - |
| GET | `/admin/stats` | Statistiques globales | Admin | - |

### 4.5 Pipeline d'agrégation
Exemples d'opérations d'agrégation requises :
- **Nombre d'observations par utilisateur** : utilisé dans `/admin/stats`
- **Observations dans un rayon géographique** : utilisé dans le filtre de localisation
- **Commentaires les plus récents par observation** : optimisation des listes

---

## 5. Sécurité et Authentification

### 5.1 JWT Implementation
- **Access Token** : expire en 1 heure, stocké côté client
- **Payload** : `{userId, role, email, iat, exp}`
- **Secret** : variable d'environnement `JWT_SECRET`

### 5.2 Autorisation par rôles
| Rôle | Permissions |
|------|-------------|
| **viewer** | Créer/modifier/supprimer ses propres observations et commentaires |
| **admin** | Toutes les permissions viewer + modération complète + gestion utilisateurs |

### 5.3 Middlewares sécurité
- **Authentication** : vérifie la validité du JWT
- **Authorization** : contrôle les permissions selon le rôle
- **Rate Limiting** : limite les requêtes par IP (express-rate-limit)
- **Validation** : validation stricte des inputs (express-validator)

---

## 6. Structure du Projet

```
backend/
├── src/
│   ├── app.js              # Point d'entrée Express
│   ├── config/
│   │   ├── database.js     # Configuration MongoDB
│   │   ├── jwt.js          # Configuration JWT
│   │   └── multer.js       # Configuration upload images
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── observationController.js
│   │   ├── commentController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js         # Vérification JWT
│   │   ├── authorize.js    # Vérification rôles
│   │   ├── validate.js     # Validation des données
│   │   └── errorHandler.js # Gestion des erreurs
│   ├── models/
│   │   ├── User.js
│   │   ├── Observation.js
│   │   └── Comment.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── observation.routes.js
│   │   ├── comment.routes.js
│   │   └── admin.routes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── observationService.js
│   │   ├── commentService.js
│   │   └── adminService.js
│   ├── utils/
│   │   ├── geocoding.js    # Utilitaires géolocalisation
│   │   ├── imageUpload.js  # Gestion upload images
│   │   └── pagination.js   # Helpers pagination
│   └── docs/
│       └── swagger.json    # Documentation API
├── tests/
│   ├── auth.test.js
│   ├── observations.test.js
│   ├── comments.test.js
│   └── admin.test.js
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
├── package.json
└── README.md
```

---

## 7. Configuration Package.json (Versions 2025)

```json
{
  "name": "phenom-backend",
  "version": "1.0.0",
  "description": "API Backend pour Phenom - Observations OVNI",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "express": "^5.1.0",
    "mongoose": "^8.18.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "express-validator": "^7.2.0",
    "express-rate-limit": "^7.5.0",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "helmet": "^8.0.0",
    "dotenv": "^16.4.5",
    "swagger-ui-express": "^5.0.1",
    "swagger-jsdoc": "^6.2.8"
  },
  "devDependencies": {
    "jest": "^30.2.0",
    "supertest": "^7.1.4",
    "nodemon": "^3.1.7",
    "@types/jest": "^29.5.14"
  },
  "engines": {
    "node": ">=24.0.0",
    "npm": ">=10.0.0"
  }
}
```

---

## 8. Fonctionnalités Matérielles Mobiles

### 8.1 Géolocalisation
- **Collection** : stockage au format GeoJSON dans MongoDB
- **Index** : index 2dsphere pour les requêtes géospatiales
- **Requêtes** : recherche par proximité avec `$near` ou `$geoWithin`

### 8.2 Gestion des images
- **Upload** : via Multer middleware
- **Stockage** : URLs stockées en base (cloud storage ou local selon env)
- **Validation** : types MIME autorisés (image/jpeg, image/png, image/webp)
- **Taille** : limitation à 10MB par image (optimisé pour mobile)

---

## 9. Pagination et Filtres

### 9.1 Implémentation pagination
```javascript
// Exemple pour GET /observations avec Mongoose 8.18
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

const observations = await Observation.find(query)
  .populate('userId', 'name')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean(); // Optimisation performance avec lean()
```

### 9.2 Filtres disponibles
- **Recherche textuelle** : sur titre et description avec index text
- **Géolocalisation** : observations dans un rayon donné
- **Période** : filtrage par date de création
- **Utilisateur** : observations d'un utilisateur spécifique

---

## 10. Tests Automatisés (Jest 30.2 + Supertest 7.1.4)

### 10.1 Stratégie de test (minimum 10 tests)
1. **Authentification** (3 tests)
   - Inscription utilisateur valide
   - Connexion avec credentials corrects
   - Rejet connexion avec credentials incorrects

2. **Observations** (5 tests)
   - Création d'observation avec géolocalisation
   - Liste paginée d'observations
   - Récupération détail observation
   - Modification par propriétaire
   - Suppression par propriétaire

3. **Commentaires** (2 tests)
   - Ajout commentaire sur observation
   - Liste commentaires d'une observation

4. **Administration** (2 tests)
   - Suppression observation par admin
   - Rejet accès admin pour viewer

### 10.2 Configuration Jest 30.2
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: ['src/**/*.js'],
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  // Nouvelles fonctionnalités Jest 30
  testTimeout: 10000,
  maxWorkers: '50%'
};
```

### 10.3 Exemple de test avec Supertest 7.1.4
```javascript
// tests/observations.test.js
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Observations API', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Setup test user
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword'
    });
    userId = user._id;
    
    // Get auth token
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = response.body.token;
  });

  it('should create a new observation', async () => {
    const observationData = {
      title: 'OVNI triangulaire',
      description: 'Observation d\'un objet triangulaire lumineux',
      location: {
        type: 'Point',
        coordinates: [6.6323, 46.5197] // Lausanne
      },
      imageUrl: 'https://example.com/image.jpg'
    };

    const response = await request(app)
      .post('/observations')
      .set('Authorization', `Bearer ${authToken}`)
      .send(observationData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe(observationData.title);
    expect(response.body.data.location.coordinates).toEqual(observationData.location.coordinates);
  });

  // ... autres tests
});
```

---

## 11. Documentation Swagger

### 11.1 Configuration OpenAPI 3.0
```javascript
// src/docs/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Phenom API',
      version: '1.0.0',
      description: 'API pour l\'application d\'observations OVNI Phenom',
      contact: {
        name: 'Équipe Phenom',
        email: 'contact@phenom.app'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Serveur de développement'
      },
      {
        url: 'https://phenom-api.onrender.com',
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js'], // Paths to files containing OpenAPI definitions
};

module.exports = swaggerJsdoc(options);
```

### 11.2 Exemples de documentation des endpoints
```javascript
/**
 * @swagger
 * /observations:
 *   post:
 *     summary: Créer une nouvelle observation
 *     tags: [Observations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *                 example: "OVNI lumineux"
 *               description:
 *                 type: string
 *                 example: "Observation d'un objet lumineux non identifié"
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [6.6323, 46.5197]
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Observation créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ObservationResponse'
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Token d'authentification requis
 */
```

---

## 12. Déploiement et Infrastructure

### 12.1 Dockerfile (Node.js 24)
```dockerfile
FROM node:24-alpine

# Metadata
LABEL maintainer="equipe-phenom@example.com"
LABEL version="1.0"
LABEL description="Phenom Backend API"

# Working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src ./src

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S phenom -u 1001
USER phenom

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node src/health-check.js || exit 1

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "src/app.js"]
```

### 12.2 Docker Compose (développement)
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongo:27017/phenom_dev
      - JWT_SECRET=dev-secret-key
      - PORT=3000
    depends_on:
      - mongo
    volumes:
      - .:/app
      - /app/node_modules
    networks:
      - phenom-network
      
  mongo:
    image: mongo:8.0
    container_name: phenom-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - phenom-network

  mongo-express:
    image: mongo-express:1.0
    ports:
      - "8081:8081"
    environment:
      - ME_CONFIG_MONGODB_SERVER=mongo
      - ME_CONFIG_MONGODB_PORT=27017
      - ME_CONFIG_BASICAUTH=false
    depends_on:
      - mongo
    networks:
      - phenom-network

volumes:
  mongo_data:

networks:
  phenom-network:
    driver: bridge
```

### 12.3 Variables d'environnement Render
```bash
# Production environment variables
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/phenom?retryWrites=true&w=majority
JWT_SECRET=super-secure-jwt-secret-for-production
PORT=3000
CORS_ORIGIN=https://phenom-frontend.onrender.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
```

---

## 13. Bonnes Pratiques REST

### 13.1 Express.js 5.1 - Nouvelles fonctionnalités
- **Support natif des Promises** : middlewares peuvent retourner des promises
- **Meilleure gestion d'erreurs** : catch automatique des promises rejetées
- **Performance améliorée** : optimisations internes
- **Sécurité renforcée** : protection contre ReDoS attacks

### 13.2 Structure des réponses
```javascript
// Succès
{
  "success": true,
  "data": {...},
  "message": "Observation créée avec succès"
}

// Erreur
{
  "success": false,
  "error": "Validation failed",
  "details": ["Le titre est requis", "La description est requise"]
}

// Liste paginée
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "totalPages": 16,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 13.3 Gestion des erreurs asynchrones (Express 5)
```javascript
// Express 5 gère automatiquement les promises rejetées
const createObservation = async (req, res) => {
  // Plus besoin de try/catch, Express 5 gère automatiquement
  const observation = await Observation.create(req.body);
  
  res.status(201).json({
    success: true,
    data: observation,
    message: 'Observation créée avec succès'
  });
};

// Middleware de gestion d'erreur centralisé
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { status: 400, message };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Ressource déjà existante';
    error = { status: 400, message };
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token invalide';
    error = { status: 401, message };
  }

  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Erreur serveur'
  });
};
```

---

## 14. MongoDB 8.2 - Nouvelles fonctionnalités

### 14.1 Améliorations de performance
- **Optimisations des requêtes géospatiales** : meilleure performance pour les recherches par proximité
- **Index améliorés** : nouveaux types d'index pour de meilleures performances
- **Agregation pipeline optimisée** : réductions de temps d'exécution

### 14.2 Configuration optimisée
```javascript
// src/config/database.js avec MongoDB 8.2
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Nouvelles options optimisées pour MongoDB 8.2
      maxPoolSize: 50,
      wtimeoutMS: 2500,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      // Amélioration des performances pour les geo queries
      bufferCommands: false,
      bufferMaxEntries: 0
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Log des événements de connexion
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.log('Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
    });

  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

## 15. Checklist Pré-développement

### Phase 1 - Setup (1 semaine)
- [ ] Valider ce document avec l'équipe
- [ ] Installer Node.js 24.x et npm latest
- [ ] Initialiser projet avec Express 5.1.0
- [ ] Configurer MongoDB 8.2 (local + Atlas)
- [ ] Setup Mongoose 8.18.x avec les nouveaux schemas
- [ ] Configurer Jest 30.2 et Supertest 7.1.4

### Phase 2 - Core Development (3 semaines)
- [ ] Implémenter authentification JWT avec bcryptjs
- [ ] Créer les modèles Mongoose avec validation
- [ ] Développer les routes REST avec Express 5.1
- [ ] Implémenter géolocalisation avec MongoDB geospatial
- [ ] Setup upload d'images avec Multer
- [ ] Créer middleware d'autorisation basé sur les rôles

### Phase 3 - Tests & Deploy (2 semaines)
- [ ] Écrire minimum 10 tests avec Jest 30 et Supertest 7.1
- [ ] Configurer documentation Swagger UI
- [ ] Préparer Docker avec Node 24 et MongoDB 8.2
- [ ] Tester déploiement sur Render
- [ ] Optimisations performance et sécurité
- [ ] Documentation utilisateur complète

---

**Mainteneur principal** : Équipe Backend Phenom  
**Version** : Backend Design v2.0 (15/10/2025) - **Versions technos mises à jour**  
**Statut** : Prêt pour implémentation avec stack 2025