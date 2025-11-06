# 📁 Configuration Backend - Documentation

Ce dossier contient tous les fichiers de configuration centralisés du backend Phenom.

---

## 📋 Vue d'ensemble

| Fichier | Rôle | Variables .env utilisées |
|---------|------|--------------------------|
| `database.js` | Connexion MongoDB (Atlas/Local) | `MONGODB_URI`, `MONGODB_TEST_URI`, `NODE_ENV` |
| `jwt.js` | Génération et validation des tokens JWT | `JWT_SECRET`, `JWT_EXPIRE`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRE` |
| `multer.js` | Upload de fichiers (images) | `UPLOAD_DIR`, `MAX_FILE_SIZE`, `ALLOWED_IMAGE_TYPES` |
| `swagger.js` | Documentation API OpenAPI/Swagger | `API_BASE_URL` (optionnel) |

---

## 🗄️ database.js

### Rôle
Configure et établit la connexion à MongoDB (local ou Atlas) via Mongoose.

### Fonctionnalités
- ✅ Détecte automatiquement si l'URI est Atlas (`mongodb+srv://`) ou local
- ✅ Désactive `autoIndex` en production pour meilleures performances
- ✅ Gère les événements de connexion/déconnexion
- ✅ Fermeture propre sur SIGINT (Ctrl+C)
- ✅ Utilise `MONGODB_TEST_URI` quand `NODE_ENV=test`

### Variables d'environnement

```env
# Base de données principale
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/phenom_dev?retryWrites=true&w=majority

# Base de données de test (pour Jest)
MONGODB_TEST_URI=mongodb+srv://user:pass@cluster.mongodb.net/phenom_test?retryWrites=true&w=majority

# Environnement
NODE_ENV=development  # ou 'test' ou 'production'
```

### Options de connexion

| Option | Valeur | Description |
|--------|--------|-------------|
| `maxPoolSize` | 10 | Nombre max de connexions simultanées |
| `minPoolSize` | 5 | Nombre min de connexions maintenues |
| `socketTimeoutMS` | 45000 | Timeout socket (45s) |
| `serverSelectionTimeoutMS` | 10000 | Timeout sélection serveur (10s) |
| `family` | 4 (local uniquement) | Force IPv4 pour MongoDB local |

### Utilisation

```javascript
import { connectDB, disconnectDB } from './config/database.js';

// Connexion
await connectDB();

// Déconnexion (optionnel, pour tests)
await disconnectDB();
```

### Logs

```
✅ MongoDB Atlas (Cloud) connecté avec succès
   Database: phenom_dev
   AutoIndex: activé (dev)
```

---

## 🔐 jwt.js

### Rôle
Gère la génération, validation et vérification des tokens JWT (Access & Refresh).

### Fonctionnalités
- ✅ Génère des access tokens (courte durée)
- ✅ Génère des refresh tokens (longue durée)
- ✅ Vérifie et décode les tokens
- ✅ Valide la présence des secrets au démarrage
- ✅ Avertit si secrets trop courts en production

### Variables d'environnement

```env
# Secrets JWT (minimum 32 caractères en production)
JWT_SECRET=votre-secret-access-token-minimum-32-caracteres
JWT_EXPIRE=1h

JWT_REFRESH_SECRET=votre-secret-refresh-token-minimum-32-caracteres
JWT_REFRESH_EXPIRE=7d
```

### ⚠️ Sécurité

**Production** :
- Secrets de **minimum 64 caractères** (générer avec `crypto.randomBytes(64).toString('hex')`)
- Ne JAMAIS commiter les secrets dans Git
- Stocker dans les variables d'environnement du serveur (Heroku, Vercel, Azure, etc.)

**Génération de secrets forts** :
```bash
# Dans Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Utilisation

```javascript
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyToken,
  createTokenPayload 
} from './config/jwt.js';

// Créer un payload
const payload = createTokenPayload(user);
// { userId: '...', email: '...', role: 'viewer' }

// Générer les tokens
const accessToken = generateAccessToken(payload);
const refreshToken = generateRefreshToken(payload);

// Vérifier un token
try {
  const decoded = verifyToken(accessToken);
  console.log(decoded.userId);
} catch (error) {
  console.error('Token invalide');
}

// Vérifier un refresh token
const decoded = verifyToken(refreshToken, true); // 2e param = isRefresh
```

### Format des tokens

**Access Token** (courte durée) :
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "viewer",
  "iat": 1634567890,
  "exp": 1634571490
}
```

**Refresh Token** (longue durée) :
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "viewer",
  "iat": 1634567890,
  "exp": 1635172690
}
```

---

## 📤 multer.js

### Rôle
Configure l'upload de fichiers (images) via Multer middleware.

### Fonctionnalités
- ✅ Crée automatiquement le dossier `uploads/` si inexistant
- ✅ Génère des noms de fichiers uniques (évite collisions)
- ✅ Sanitize les noms de fichiers (sécurité)
- ✅ Filtre par type MIME (accepte uniquement images autorisées)
- ✅ Limite la taille des fichiers

### Variables d'environnement

```env
# Dossier de destination
UPLOAD_DIR=uploads

# Taille maximale (en bytes, 10MB par défaut)
MAX_FILE_SIZE=10485760

# Types MIME autorisés (séparés par virgules)
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
```

### Format des fichiers uploadés

**Avant** : `photo.jpg`  
**Après** : `photo-1634567890123-456789012.jpg`

### Utilisation

```javascript
import upload from './config/multer.js';
import express from 'express';

const router = express.Router();

// Upload d'un seul fichier
router.post('/upload', upload.single('image'), (req, res) => {
  // req.file contient les infos du fichier
  console.log(req.file);
  /*
  {
    fieldname: 'image',
    originalname: 'photo.jpg',
    filename: 'photo-1634567890123-456789012.jpg',
    path: '/path/to/uploads/photo-1634567890123-456789012.jpg',
    size: 2048576,
    mimetype: 'image/jpeg'
  }
  */
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// Upload de plusieurs fichiers
router.post('/multiple', upload.array('images', 5), (req, res) => {
  // req.files contient un tableau de fichiers
  console.log(req.files);
  res.json({ images: req.files.map(f => f.filename) });
});
```

### Gestion d'erreurs

```javascript
router.post('/upload', upload.single('image'), (req, res) => {
  // Erreurs multer disponibles dans req.file
}, (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    // Erreur Multer (taille, nombre de fichiers, etc.)
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'Fichier trop volumineux' 
      });
    }
  } else if (error) {
    // Erreur custom (type de fichier non autorisé)
    return res.status(400).json({ 
      error: error.message 
    });
  }
  next(error);
});
```

### Logs au démarrage

```
📁 Dossier uploads créé: /path/to/backend/uploads
📤 Upload configuré:
   Dossier: /path/to/backend/uploads
   Taille max: 10MB
   Types autorisés: image/jpeg,image/png,image/webp
```

### ⚠️ Production

En production, **préférez un stockage cloud** :
- AWS S3
- Azure Blob Storage
- Google Cloud Storage
- Cloudinary

Multer peut être configuré avec des adaptateurs pour ces services (ex: `multer-s3`).

---

## 📖 swagger.js

### Rôle
Configure la documentation interactive de l'API via Swagger UI (OpenAPI 3.0).

### Fonctionnalités
- ✅ Génère la documentation depuis les commentaires JSDoc
- ✅ Interface Swagger UI accessible à `/api-docs`
- ✅ Définit les schémas des modèles (User, Observation, Comment)
- ✅ Spécifie l'authentification Bearer JWT
- ✅ Liste les serveurs (dev, prod)

### Variables d'environnement

```env
# URL de base de l'API (optionnel)
API_BASE_URL=http://localhost:3000
```

### Configuration

```javascript
const options = {
  definition: {
    openapi: '3.2.4',
    info: {
      title: 'Phenom API',
      version: '3.2.4',
      description: 'API pour observations OVNI'
    },
    servers: [
      { 
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Développement'
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
  apis: ['./src/routes/*.js'] // Fichiers à scanner
};
```

### Utilisation dans les routes

Ajouter des commentaires JSDoc dans vos routes :

```javascript
/**
 * @swagger
 * /api/v1/observations:
 *   get:
 *     summary: Récupérer toutes les observations
 *     tags: [Observations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des observations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Observation'
 */
router.get('/observations', auth, getObservations);
```

### Accès

- **Dev** : http://localhost:3000/api-docs
- **Prod** : https://votre-domaine.com/api-docs

### ⚠️ Sécurité en Production

Désactivez Swagger en production ou protégez-le avec une authentification :

```javascript
// Dans app.js
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
```

---

## 🔄 Chargement des Variables d'Environnement

Tous ces fichiers utilisent `process.env.*` pour lire les variables.

### Où sont chargées les variables ?

Dans `src/app.js` :
```javascript
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger depuis la RACINE du projet (phenom/.env)
const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });
```

### Fichier .env (racine du projet)

Toutes les variables sont dans **1 seul fichier** : `phenom/.env`

```env
# Environnement
NODE_ENV=development
PORT=3000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/phenom_dev
MONGODB_TEST_URI=mongodb+srv://user:pass@cluster.mongodb.net/phenom_test

# JWT
JWT_SECRET=secret-64-caracteres-minimum
JWT_EXPIRE=1h
JWT_REFRESH_SECRET=autre-secret-64-caracteres
JWT_REFRESH_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Upload
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
UPLOAD_DIR=uploads

# Pagination
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100

# API
API_PREFIX=/api/v1

# Frontend (pour Docker/VITE)
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Phenom
```

---

## 🧪 Tests

### Configuration Jest

Les tests utilisent `MONGODB_TEST_URI` automatiquement quand `NODE_ENV=test` :

```json
// package.json
{
  "scripts": {
    "test": "cross-env NODE_ENV=test jest --coverage"
  }
}
```

### Setup des tests

Dans `tests/setup.js` :
```javascript
import { connectDB, disconnectDB } from '../src/config/database.js';

beforeAll(async () => {
  await connectDB(); // Utilise MONGODB_TEST_URI
});

afterAll(async () => {
  await disconnectDB();
});
```

---

## 📝 Checklist de Configuration

Avant de lancer le backend :

- [ ] Fichier `phenom/.env` créé (copier depuis `.env.example`)
- [ ] `MONGODB_URI` configuré avec votre connection string Atlas
- [ ] `MONGODB_TEST_URI` configuré pour les tests
- [ ] `JWT_SECRET` et `JWT_REFRESH_SECRET` générés (64+ caractères)
- [ ] Dossier `uploads/` créé (ou sera créé automatiquement)
- [ ] Variables CORS configurées avec les URLs frontend
- [ ] `.env` ajouté au `.gitignore` (ne pas commiter)

---

## 🚀 Démarrage

```bash
# Vérifier la connexion MongoDB
npm run check-db

# Créer un admin
npm run create-admin

# Peupler avec des données de test
npm run seed

# Lancer le serveur
npm run dev
```

---

## 🔗 Liens Utiles

- [Guide MongoDB Atlas](../MIGRATION_MONGODB_ATLAS.md)
- [Configuration .env simplifiée](../../CONFIG_ENV_SIMPLE.md)
- [Documentation Mongoose](https://mongoosejs.com/docs/)
- [Documentation JWT](https://jwt.io/)
- [Documentation Multer](https://github.com/expressjs/multer)
- [Documentation Swagger](https://swagger.io/docs/)

---

**Configuration mise à jour le 16 octobre 2025** ✅
