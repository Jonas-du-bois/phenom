# Phenom Backend API

API Backend pour l'application Phenom - Plateforme d'observation de phénomènes OVNI avec géolocalisation et gestion de photos.

## 🏗️ Architecture

L'architecture suit le principe **KISS** (Keep It Simple, Stupid) avec une séparation claire des responsabilités :

```
src/
├── config/           # Configuration (DB, JWT, Multer, Swagger)
├── controllers/      # Contrôleurs HTTP (gestion des requêtes/réponses)
├── middleware/       # Middlewares (auth, validation, erreurs, rate limiting)
├── models/           # Modèles Mongoose (User, Observation, Comment)
├── routes/           # Définition des routes API
├── services/         # Logique métier
├── utils/            # Utilitaires réutilisables
└── validators/       # Validations express-validator
```

## 🚀 Démarrage rapide

### Prérequis

- Node.js >= 18.0.0
- MongoDB >= 8.0
- npm >= 9.0.0

### Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Démarrer MongoDB (via Docker)
docker-compose up -d mongodb

# Démarrer le serveur en mode développement
npm run dev
```

### Accès

- 🔗 API: http://localhost:3000
- 📚 Documentation Swagger: http://localhost:3000/api-docs
- 🏥 Health Check: http://localhost:3000/health

## 📋 Endpoints API

### Authentification (`/api/v1/auth`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/signup` | Inscription | Non |
| POST | `/login` | Connexion | Non |
| POST | `/logout` | Déconnexion | Oui |
| GET | `/me` | Profil utilisateur | Oui |

### Observations (`/api/v1/observations`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/` | Liste avec filtres | Non |
| POST | `/` | Créer | Oui |
| GET | `/:id` | Détail | Non |
| PUT | `/:id` | Modifier | Oui (Propriétaire/Admin) |
| DELETE | `/:id` | Supprimer | Oui (Propriétaire/Admin) |

### Commentaires

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/observations/:id/comments` | Liste | Non |
| POST | `/observations/:id/comments` | Créer | Oui |
| PUT | `/comments/:id` | Modifier | Oui (Propriétaire/Admin) |
| DELETE | `/comments/:id` | Supprimer | Oui (Propriétaire/Admin) |

### Administration (`/api/v1/admin`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/users` | Liste utilisateurs | Admin |
| PUT | `/users/:id/role` | Changer rôle | Admin |
| GET | `/stats` | Statistiques | Admin |
| DELETE | `/observations/:id` | Supprimer observation | Admin |
| DELETE | `/comments/:id` | Supprimer commentaire | Admin |

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

### Connexion

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Utilisation du token

```bash
GET /api/v1/observations
Authorization: Bearer <votre_token_jwt>
```

## 📦 Modèles de données

### User

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['admin', 'viewer']),
  createdAt: Date,
  updatedAt: Date
}
```

### Observation

```javascript
{
  title: String,
  description: String,
  imageUrl: String,
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  userId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Comment

```javascript
{
  text: String,
  observationId: ObjectId (ref: Observation),
  userId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Lancer les tests en mode watch
npm run test:watch

# Générer le rapport de couverture
npm run test:coverage
```

## 🔧 Scripts disponibles

```bash
npm start          # Démarrer en production
npm run dev        # Démarrer en développement (nodemon)
npm test           # Lancer les tests
npm run lint       # Vérifier le code
npm run lint:fix   # Corriger automatiquement
```

## 🛡️ Sécurité

- **Helmet**: Protection des headers HTTP
- **Rate Limiting**: Limitation des requêtes par IP
- **CORS**: Configuration CORS restrictive
- **Validation**: Validation stricte des entrées avec express-validator
- **JWT**: Authentification sécurisée
- **Bcrypt**: Hash des mots de passe

## 📝 Variables d'environnement

Voir `.env.example` pour la liste complète des variables.

Variables critiques :
- `MONGODB_URI`: URI de connexion MongoDB
- `JWT_SECRET`: Secret pour signer les tokens JWT
- `CORS_ORIGIN`: Origines autorisées pour CORS

## 🐳 Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Arrêter les services
docker-compose down
```

## 📚 Documentation

- Documentation Swagger interactive disponible sur `/api-docs`
- Documentation architecture dans `/docs/architecture/backend.md`
- Documentation base de données dans `/docs/architecture/database.md`
- Documentation endpoints dans `/docs/api/endpoints.md`

## 🤝 Contribution

1. Respecter l'architecture en place
2. Suivre le principe KISS
3. Écrire des tests pour les nouvelles fonctionnalités
4. Documenter les endpoints dans Swagger
5. Valider avec `npm run lint` avant de commit

## 📄 Licence

MIT

## 👥 Équipe

Équipe Backend Phenom - 2025
