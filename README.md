# Phenom App 🛸

Application web moderne de signalement d'observations de phénomènes OVNI avec géolocalisation interactive, capture photo et communauté d'observateurs.

## ✨ Fonctionnalités

- 🗺️ **Carte interactive** - Visualisation géolocalisée des observations avec Leaflet
- 📸 **Upload d'images** - Capture et traitement d'images avec compression automatique
- 👥 **Authentification** - Système JWT avec refresh tokens sécurisé
- 💬 **Commentaires** - Système de discussion sur les observations
- 🔍 **Recherche avancée** - Filtres par date, localisation, type de phénomène
- 📊 **Statistiques** - Tableau de bord admin avec métriques
- 📱 **PWA** - Application Progressive Web App installable
- 🔒 **Sécurité** - Rate limiting, validation, sanitization, helmet
- 🎨 **Design moderne** - Interface Tailwind CSS responsive
- 🔔 **Notifications push** - Alertes pour observations à proximité (Web Push API)
- 📍 **Alertes géolocalisées** - Rayon d'alerte personnalisable (1-500 km)
- 🔕 **Déduplication** - Une seule notification par observation
- ⚡ **Temps réel** - WebSocket pour les mises à jour instantanées

## 🏗️ Stack Technique

### Backend
- **Runtime** : Node.js 18+
- **Framework** : Express.js 4.18
- **Base de données** : MongoDB Atlas avec Mongoose 8
- **Authentification** : JWT (jsonwebtoken)
- **Upload** : Multer + Sharp (compression images)
- **Validation** : Express-validator
- **Documentation** : Swagger/OpenAPI 3.0
- **Tests** : Jest + Supertest
- **Sécurité** : Helmet, CORS, Rate limiting

### Frontend
- **Framework** : Vue.js 3.4 (Composition API)
- **Build** : Vite 5
- **Router** : Vue Router 4
- **State** : Pinia 2
- **HTTP** : Axios
- **Carte** : Leaflet 1.9
- **Styling** : Tailwind CSS 3.4
- **Icons** : Vicons Fluent
- **Tests** : Vitest + Vue Test Utils
- **PWA** : Vite Plugin PWA

### DevOps
- **Conteneurisation** : Docker + Docker Compose
- **CI/CD** : GitHub Actions (à venir)
- **Déploiement** : Render.com
- **Monitoring** : Scripts personnalisés

## �🚀 Démarrage Rapide

### Prérequis
- **Docker Desktop** installé et démarré
- **Git** pour cloner le repository
- **Node.js 18+** (pour le développement local sans Docker)
- **MongoDB Atlas** (compte gratuit) pour la base de données

### Installation et Démarrage

#### 1. Cloner le repository
```bash
git clone https://github.com/Jonas-du-bois/phenom.git
cd phenom
```

#### 2. Configurer MongoDB Atlas

1. Créer un compte gratuit sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un nouveau cluster (Free Tier M0)
3. Créer un utilisateur de base de données
4. Autoriser l'accès depuis n'importe quelle IP (0.0.0.0/0) dans Network Access
5. Obtenir la connection string (Format : `mongodb+srv://...`)

#### 3. Configuration de l'environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env avec vos vraies valeurs
# Paramètres essentiels à modifier :
# - MONGODB_URI : votre connection string MongoDB Atlas
# - MONGODB_TEST_URI : connection string pour les tests
# - JWT_SECRET : clé secrète forte et aléatoire
# - JWT_REFRESH_SECRET : autre clé secrète différente
```

**Exemple de configuration `.env` minimale :**
```bash
NODE_ENV=development
PORT=3000

# Remplacez avec votre vraie connection string
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/phenom_dev?retryWrites=true&w=majority

# Générez des clés secrètes fortes (ex: avec openssl rand -base64 32)
JWT_SECRET=votre-cle-super-secrete-a-changer
JWT_REFRESH_SECRET=votre-autre-cle-super-secrete

VITE_API_BASE_URL=http://localhost:3000
```

#### 4. Démarrer l'application avec Docker

**⚡ Méthode recommandée : Scripts de gestion**

Nous fournissons des scripts optimisés pour chaque plateforme :

**Sur Linux/Mac :**
```bash
# Donner les permissions d'exécution (une seule fois)
chmod +x phenom.sh

# Démarrer l'application
./phenom.sh start

# Voir les logs en temps réel
./phenom.sh logs

# Afficher toutes les commandes
./phenom.sh help
```

**Sur Windows (PowerShell) :**
```powershell
# Autoriser l'exécution de scripts (une seule fois, en Admin)
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

# Démarrer l'application
.\phenom.ps1 start

# Voir les logs en temps réel
.\phenom.ps1 logs

# Afficher toutes les commandes
.\phenom.ps1 help
```

**Sur Windows (Git Bash) :**
```bash
# Utiliser directement le script bash
./phenom.sh start
./phenom.sh logs
```

**📖 Documentation complète des scripts : [SCRIPTS_README.md](SCRIPTS_README.md)**

---

**Alternative : Docker Compose directement**
```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter tous les services
docker-compose down
```

#### 5. Initialiser les données (optionnel)

**Avec les scripts :**
```bash
# Linux/Mac
./phenom.sh create-admin    # Créer un compte administrateur
./phenom.sh seed             # Peupler la base de données
./phenom.sh check-db         # Vérifier la connexion

# Windows
.\phenom.ps1 create-admin
.\phenom.ps1 seed
.\phenom.ps1 check-db
```

**Avec Docker Compose directement :**
```bash
docker-compose exec backend npm run create-admin
docker-compose exec backend npm run seed
docker-compose exec backend npm run check-db
```

### 🌐 Accès aux services

Une fois démarrés, les services sont accessibles à :

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | [http://localhost](http://localhost) | Interface utilisateur Vue.js |
| **Backend API** | [http://localhost:3000](http://localhost:3000) | API REST Express |
| **API Documentation** | [http://localhost:3000/api-docs](http://localhost:3000/api-docs) | Swagger UI interactif |
| **MongoDB Express** | [http://localhost:8081](http://localhost:8081) | Interface d'administration MongoDB (admin/admin123) |

### 📱 Premier compte utilisateur

Après l'installation, créez votre premier compte :

1. Ouvrez [http://localhost](http://localhost)
2. Cliquez sur "S'inscrire"
3. Remplissez le formulaire
4. Connectez-vous avec vos identifiants

**Pour créer un compte administrateur** :
```bash
make create-admin
# Suivez les instructions interactives
```

### 📦 Structure du Projet

```
phenom/
├── backend/              # API Node.js + Express
│   ├── src/
│   │   ├── app.js
│   │   ├── config/       # Configuration (DB, JWT, Swagger, etc.)
│   │   ├── controllers/  # Contrôleurs des routes
│   │   ├── middleware/   # Middlewares (auth, validation, etc.)
│   │   ├── models/       # Modèles MongoDB (User, Observation, Comment, Notification, PushSubscription)
│   │   ├── routes/       # Définition des routes API
│   │   ├── services/     # Logique métier
│   │   ├── utils/        # Utilitaires
│   │   └── validators/   # Schémas de validation
│   ├── db/
│   │   └── init/         # Scripts d'initialisation MongoDB
│   ├── scripts/          # Scripts utilitaires (seed, admin, etc.)
│   ├── tests/            # Tests unitaires et d'intégration
│   ├── uploads/          # Dossier de stockage des images
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   ├── package.json
│   ├── jest.config.js
│   └── openapi.json      # Spécification OpenAPI
├── frontend/             # Application Vue.js 3
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.js
│   │   ├── style.css
│   │   ├── components/   # Composants Vue réutilisables
│   │   ├── composables/  # Composables Vue
│   │   ├── router/       # Configuration Vue Router
│   │   ├── services/     # Services API
│   │   ├── stores/       # Stores Pinia
│   │   ├── tests/        # Tests frontend
│   │   ├── utils/        # Utilitaires
│   │   └── views/        # Pages/vues de l'application
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── docs/                 # Documentation complète
│   ├── api/              # Documentation API
│   ├── architecture/     # Architecture du projet
│   ├── design/           # Design system
│   ├── guides/           # Guides d'utilisation
│   └── figmaMake/        # Maquettes et prototypes
├── scripts/              # Scripts utilitaires
│   ├── deploy.sh         # Script de déploiement
│   ├── monitor.sh        # Script de monitoring
│   ├── show-info.sh      # Informations système
│   └── test-api.sh       # Tests API
├── docker-compose.yml    # Config développement
├── docker-compose.prod.yml # Config production
├── render.yaml           # Config déploiement Render
├── .env.example
├── .gitignore
└── Readme.md
```

## 🛠️ Développement

### Installer les dépendances localement

Pour développer sans Docker :

```bash
# Backend
cd backend
npm install
npm run dev    # Lance avec nodemon (hot reload)

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev    # Lance Vite dev server sur http://localhost:5173
```

### Scripts Backend disponibles

```bash
npm run dev              # Développement avec hot reload (nodemon)
npm start                # Production
npm test                 # Lancer les tests avec Jest
npm run test:watch       # Tests en mode watch
npm run test:coverage    # Tests avec rapport de couverture
npm run lint             # Vérifier le code avec ESLint
npm run lint:fix         # Corriger automatiquement les erreurs ESLint
npm run seed             # Peupler la base avec des données de test
npm run seed:images      # Télécharger les images placeholder
npm run create-admin     # Créer un compte administrateur
npm run check-db         # Vérifier la connexion à MongoDB
npm run export:swagger   # Exporter la spécification OpenAPI
```

### Scripts Frontend disponibles

```bash
npm run dev              # Serveur de développement Vite
npm run build            # Build de production
npm run preview          # Prévisualiser le build de production
npm test                 # Lancer les tests Vitest
npm run test:ui          # Interface UI pour les tests
npm run test:coverage    # Tests avec couverture
npm run lint             # Linter le code
npm run format           # Formater avec Prettier
```

### Commandes Docker utiles

```bash
# Voir les logs d'un service spécifique
make logs-backend
make logs-frontend
docker-compose logs -f backend
docker-compose logs -f frontend

# Accéder au shell d'un container
make shell-backend
make shell-frontend
docker-compose exec backend sh
docker-compose exec frontend sh

# Accéder au MongoDB shell
make db-shell

# Voir le statut des services
make status
docker-compose ps

# Redémarrer un service spécifique
docker-compose restart backend
docker-compose restart frontend

# Rebuild un service
docker-compose up -d --build backend

# Nettoyer tout (containers + volumes + images)
make clean
docker-compose down -v --rmi all
```

### Variables d'environnement

#### Backend (.env)
```bash
# Environnement
NODE_ENV=development|production|test
PORT=3000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://...
MONGODB_TEST_URI=mongodb+srv://...

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=1h
JWT_REFRESH_SECRET=your-refresh-secret
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

# Image Compression
IMAGE_QUALITY=85
IMAGE_MAX_WIDTH=1920
IMAGE_MAX_HEIGHT=1920
JPEG_QUALITY=85
PNG_QUALITY=85
WEBP_QUALITY=85

# Push Notifications (VAPID)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_CONTACT=mailto:admin@phenom.app
```

#### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Phenom
VITE_MAP_TILES_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

## 🧪 Tests

### Backend

```bash
# Lancer tous les tests
npm test

# Tests en mode watch (re-exécute automatiquement)
npm run test:watch

# Tests avec rapport de couverture
npm run test:coverage

# Lancer un fichier de test spécifique
npm test auth.test.js
```

**Fichiers de tests disponibles :**
- `tests/auth.test.js` - Tests d'authentification (register, login, JWT)
- `tests/user.test.js` - Tests utilisateurs (profil, update, delete)
- `tests/observation.test.js` - Tests observations (CRUD, filtres, géolocalisation)
- `tests/comment.test.js` - Tests commentaires
- `tests/admin.test.js` - Tests administration

### Frontend

```bash
# Lancer tous les tests
npm test

# Interface UI interactive pour les tests
npm run test:ui

# Tests avec rapport de couverture
npm run test:coverage
```

## 🔒 Sécurité

L'application implémente plusieurs mesures de sécurité :

- ✅ **Helmet.js** - Headers HTTP sécurisés
- ✅ **CORS** - Configuration stricte des origines autorisées
- ✅ **Rate Limiting** - Protection contre les attaques par force brute
- ✅ **JWT** - Tokens d'authentification avec expiration
- ✅ **Bcrypt** - Hachage des mots de passe (10 rounds)
- ✅ **Validation** - Express-validator sur tous les endpoints
- ✅ **Sanitization** - Nettoyage des entrées utilisateur
- ✅ **HTTPS** - Recommandé en production
- ✅ **CSP** - Content Security Policy
- ✅ **MongoDB Injection** - Protection via Mongoose

## � API Documentation

L'API REST est documentée avec **Swagger/OpenAPI 3.0** et accessible à :

**🔗 [http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

### Endpoints principaux

#### Authentification
- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Déconnexion

#### Observations
- `GET /api/v1/observations` - Liste des observations (avec filtres)
- `GET /api/v1/observations/:id` - Détail d'une observation
- `POST /api/v1/observations` - Créer une observation 🔐
- `PUT /api/v1/observations/:id` - Modifier 🔐
- `DELETE /api/v1/observations/:id` - Supprimer 🔐

#### Utilisateurs
- `GET /api/v1/users/profile` - Profil utilisateur 🔐
- `PUT /api/v1/users/profile` - Modifier profil 🔐
- `GET /api/v1/users/:id/observations` - Observations d'un utilisateur

#### Commentaires
- `GET /api/v1/observations/:id/comments` - Commentaires d'une observation
- `POST /api/v1/observations/:id/comments` - Ajouter un commentaire 🔐
- `PUT /api/v1/comments/:id` - Modifier un commentaire 🔐
- `DELETE /api/v1/comments/:id` - Supprimer un commentaire 🔐

#### Admin
- `GET /api/v1/admin/stats` - Statistiques 👑
- `GET /api/v1/admin/users` - Liste des utilisateurs 👑
- `PATCH /api/v1/admin/users/:id/role` - Modifier le rôle 👑
- `DELETE /api/v1/admin/observations/:id` - Supprimer n'importe quelle observation 👑

#### Push Notifications
- `POST /api/v1/push/subscribe` - S'abonner aux notifications push 🔐
- `PUT /api/v1/push/location` - Mettre à jour la position 🔐
- `DELETE /api/v1/push/unsubscribe` - Se désabonner 🔐

#### Notifications (Alertes)
- `GET /api/v1/notifications` - Liste des notifications 🔐
- `GET /api/v1/notifications/unread-count` - Nombre de non-lues 🔐
- `PATCH /api/v1/notifications/:id/read` - Marquer comme lue 🔐
- `POST /api/v1/notifications/mark-all-read` - Tout marquer comme lu 🔐
- `DELETE /api/v1/notifications/:id` - Supprimer une notification 🔐

🔐 = Authentification requise  
👑 = Admin uniquement

## 🚢 Déploiement

### Production locale avec Docker

```bash
# Build des images de production
make prod-build
docker-compose -f docker-compose.prod.yml build

# Démarrer en mode production
make prod-start
docker-compose -f docker-compose.prod.yml up -d

# Voir les logs
docker-compose -f docker-compose.prod.yml logs -f

# Arrêter
make prod-stop
docker-compose -f docker-compose.prod.yml down
```

**Ou utiliser le script de déploiement automatique :**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Déploiement sur Render.com

#### Préparation

1. **Créer un compte sur [Render.com](https://render.com)** (gratuit)
2. **Forker le repository** sur votre compte GitHub
3. **Configurer MongoDB Atlas** (voir section MongoDB ci-dessous)

#### MongoDB Atlas

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un nouveau cluster **M0 (Free)**
3. Database Access : créer un utilisateur avec mot de passe
4. Network Access : ajouter `0.0.0.0/0` (accès depuis n'importe où)
5. Récupérer la **connection string** :
   ```
   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/phenom?retryWrites=true&w=majority
   ```

#### Déployer le Backend

1. Dans Render : **New → Web Service**
2. Connecter votre repository GitHub
3. Configurer :
   - **Name** : `phenom-backend`
   - **Environment** : `Node`
   - **Build Command** : `cd backend && npm install`
   - **Start Command** : `cd backend && npm start`
   - **Instance Type** : Free

4. **Variables d'environnement** (Environment) :
   ```bash
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=mongodb+srv://...  # Votre connection string Atlas
   JWT_SECRET=votre-secret-production-fort
   JWT_REFRESH_SECRET=votre-autre-secret-fort
   CORS_ORIGIN=https://phenom-frontend.onrender.com  # URL de votre frontend
   ```

5. Cliquer sur **Create Web Service**
6. Noter l'URL générée (ex: `https://phenom-backend.onrender.com`)

#### Déployer le Frontend

1. Dans Render : **New → Static Site**
2. Connecter votre repository GitHub
3. Configurer :
   - **Name** : `phenom-frontend`
   - **Build Command** : `cd frontend && npm install && npm run build`
   - **Publish Directory** : `frontend/dist`

4. **Variables d'environnement** :
   ```bash
   VITE_API_BASE_URL=https://phenom-backend.onrender.com  # URL de votre backend
   VITE_APP_NAME=Phenom
   ```

5. Cliquer sur **Create Static Site**

#### Finalisation

1. Mettre à jour la variable `CORS_ORIGIN` du backend avec l'URL du frontend
2. Redéployer le backend si nécessaire
3. Créer un compte admin :
   ```bash
   # Dans Render, ouvrir le shell du backend
   npm run create-admin
   ```

### Déploiement avec d'autres plateformes

Le projet peut aussi être déployé sur :
- **Vercel** (frontend) + **Railway** (backend)
- **Netlify** (frontend) + **Heroku** (backend)
- **AWS** (EC2 + S3 + RDS)
- **Azure** (App Service + Cosmos DB)
- **Google Cloud** (Cloud Run + Cloud Storage)

Consultez le fichier `render.yaml` comme référence pour la configuration.

## 📊 Monitoring et Maintenance

### Scripts de monitoring

```bash
# Monitoring complet (CPU, RAM, disque, services)
chmod +x scripts/monitor.sh
./scripts/monitor.sh

# Afficher les informations système
chmod +x scripts/show-info.sh
./scripts/show-info.sh

# Tester l'API
chmod +x scripts/test-api.sh
./scripts/test-api.sh
```

### Logs et Debugging

```bash
# Logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend

# Dernières 100 lignes
docker-compose logs --tail=100 backend

# Logs depuis une date
docker-compose logs --since 2025-10-18 backend
```

### Backups MongoDB

```bash
# Export de la base de données
docker-compose exec mongodb mongodump --uri="$MONGODB_URI" --out=/tmp/backup

# Import d'un backup
docker-compose exec mongodb mongorestore --uri="$MONGODB_URI" /tmp/backup
```

## 🔧 Dépannage

### Problèmes courants

#### ❌ Le backend ne démarre pas

**Symptômes** : Le container backend crash ou redémarre en boucle

**Solutions** :
```bash
# 1. Vérifier les logs pour identifier l'erreur
docker-compose logs backend

# 2. Vérifier la connexion MongoDB Atlas
docker-compose exec backend node -e "console.log(process.env.MONGODB_URI)"

# 3. Tester la connexion depuis le backend
docker-compose exec backend npm run check-db

# 4. Recréer le container
docker-compose up -d --force-recreate backend

# 5. Rebuild complet si nécessaire
docker-compose build --no-cache backend
docker-compose up -d backend
```

**Erreurs fréquentes** :
- `MongooseServerSelectionError` → Vérifier la connection string MongoDB
- `JWT_SECRET is not defined` → Vérifier le fichier `.env`
- `EADDRINUSE: port 3000 already in use` → Arrêter le processus utilisant le port 3000

#### ❌ Le frontend ne s'affiche pas

**Symptômes** : Page blanche, erreurs 404, ou problèmes de CORS

**Solutions** :
```bash
# 1. Vérifier les logs
docker-compose logs frontend

# 2. Rebuild sans cache
docker-compose build --no-cache frontend
docker-compose up -d frontend

# 3. Vérifier la configuration Vite
docker-compose exec frontend cat /app/.env

# 4. Tester l'API depuis le frontend
docker-compose exec frontend wget -O- http://backend:3000/api/v1/health
```

**Erreurs fréquentes** :
- `Failed to fetch` → Vérifier `VITE_API_BASE_URL` dans `.env`
- `CORS error` → Vérifier `CORS_ORIGIN` dans le backend
- `404 on refresh` → Normal avec Nginx, géré par le routeur Vue

#### ❌ Erreurs MongoDB / Base de données

**Symptômes** : Erreurs de connexion à MongoDB

**Solutions** :
```bash
# 1. Vérifier les logs MongoDB (si local)
docker-compose logs mongodb

# 2. Tester la connexion depuis le terminal
docker-compose exec backend node scripts/check-db-connection.js

# 3. Vérifier les credentials MongoDB Atlas
# - Username/password corrects
# - IP whitelisted (0.0.0.0/0)
# - Nom de base de données correct dans l'URI

# 4. Redémarrer MongoDB (si local)
docker-compose restart mongodb

# 5. Nettoyer les volumes et redémarrer (ATTENTION: efface les données)
docker-compose down -v
docker-compose up -d
```

#### ❌ Problèmes d'upload d'images

**Symptômes** : Erreur lors de l'upload de photos

**Solutions** :
```bash
# 1. Vérifier les permissions du dossier uploads
docker-compose exec backend ls -la /app/uploads

# 2. Créer le dossier si nécessaire
docker-compose exec backend mkdir -p /app/uploads
docker-compose exec backend chmod 755 /app/uploads

# 3. Vérifier la taille maximale
# MAX_FILE_SIZE dans .env (défaut: 10MB)

# 4. Vérifier les formats autorisés
# ALLOWED_IMAGE_TYPES dans .env
```

#### ❌ Erreurs de tests

**Symptômes** : Les tests échouent

**Solutions** :
```bash
# 1. Vérifier que MongoDB test est accessible
echo $MONGODB_TEST_URI

# 2. Nettoyer la base de test
docker-compose exec backend npm run test -- --clearCache

# 3. Lancer les tests en mode verbose
docker-compose exec backend npm test -- --verbose

# 4. Vérifier les dépendances
docker-compose exec backend npm install
```

### Commandes de diagnostic

```bash
# Vérifier l'état de tous les services
docker-compose ps

# Vérifier l'utilisation des ressources
docker stats

# Vérifier les variables d'environnement
docker-compose exec backend env | grep -E "MONGODB|JWT|PORT"

# Tester l'API manuellement
curl http://localhost:3000/api/v1/health

# Vérifier les ports ouverts
netstat -an | grep -E "3000|5173|8081"
```

### Réinitialisation complète

Si tout le reste échoue :

```bash
# 1. Arrêter tous les containers
docker-compose down

# 2. Supprimer les volumes (ATTENTION: perte de données)
docker-compose down -v

# 3. Supprimer les images
docker-compose down --rmi all

# 4. Nettoyer Docker
docker system prune -a --volumes

# 5. Reconstruire et redémarrer
docker-compose build --no-cache
docker-compose up -d

# 6. Vérifier les logs
docker-compose logs -f
```

## 🆘 Support

### Obtenir de l'aide

- 📖 **Documentation** : Consultez le [wiki complet](docs/)
- 🐛 **Bugs** : Ouvrir une [issue GitHub](https://github.com/Jonas-du-bois/phenom/issues)
- 💬 **Questions** : Ouvrir une [discussion GitHub](https://github.com/Jonas-du-bois/phenom/discussions)
- 📧 **Email** : contact@phenom.com

### Rapporter un bug

Quand vous rapportez un bug, incluez :
1. **Description** du problème
2. **Étapes** pour reproduire
3. **Comportement attendu** vs **comportement actuel**
4. **Logs** pertinents (backend/frontend)
5. **Environnement** : OS, Docker version, Node version
6. **Screenshots** si applicable

## 📚 Documentation

### Documentation complète

Le projet dispose d'une documentation exhaustive organisée en wiki :

| Section | Description | Lien |
|---------|-------------|------|
| 🚀 **Quick Start** | Démarrer en 5 minutes | [quickstart.md](docs/guides/quickstart.md) |
| 🏗️ **Architecture Backend** | Structure Node.js/Express détaillée | [backend.md](docs/architecture/backend.md) |
| 🎨 **Architecture Frontend** | Structure Vue.js 3 complète | [frontend.md](docs/architecture/frontend.md) |
| 💾 **Base de Données** | Modèles et schémas MongoDB | [database.md](docs/architecture/database.md) |
| 📡 **API Documentation** | Tous les endpoints REST | [endpoints.md](docs/api/endpoints.md) |
| 🎨 **Design System** | Composants et styles | [design-system.md](docs/design/design-system.md) |
| 🐳 **Docker & Déploiement** | Guide complet de déploiement | [deployment.md](docs/guides/deployment.md) |
| 🌊 **Git Workflow** | Bonnes pratiques Git | [git-workflow.md](docs/guides/git-workflow.md) |

### Ressources utiles

- 📄 **[OpenAPI Specification](backend/openapi.json)** - Spécification API complète
- 🗂️ **[Composants Index](docs/frontend/COMPONENT_INDEX.md)** - Tous les composants Vue
- 🏛️ **[Architecture Diagrams](docs/architecture/diagrams.md)** - Diagrammes du système
- 📦 **[Backend README](backend/README.md)** - Documentation backend détaillée

## 🛣️ Roadmap

### Version actuelle : 1.0.0

#### ✅ Fonctionnalités implémentées
- [x] Authentification JWT complète
- [x] CRUD observations avec géolocalisation
- [x] Upload et compression d'images
- [x] Système de commentaires
- [x] Carte interactive Leaflet
- [x] Filtres et recherche
- [x] Panel administrateur
- [x] Tests unitaires et d'intégration
- [x] Documentation Swagger
- [x] PWA ready
- [x] Docker multi-stage
- [x] Rate limiting et sécurité
- [x] Notifications push (Web Push API)
- [x] Alertes géolocalisées avec rayon personnalisable
- [x] Notifications persistantes avec déduplication
- [x] WebSocket temps réel (WsMini)

#### 🚧 En cours de développement
- [ ] Système de likes/votes sur les observations
- [ ] Export PDF des observations
- [ ] Statistiques avancées avec graphiques
- [ ] Mode sombre (dark mode)

#### 📋 Prochaines versions

**v1.1.0 - Social Features**
- [ ] Système de followers/following
- [ ] Feed personnalisé d'observations
- [ ] Partage sur réseaux sociaux
- [ ] Badges et achievements

**v1.2.0 - Advanced Features**
- [ ] Machine Learning pour classification automatique
- [ ] Détection de doublons d'observations
- [ ] API publique avec clés d'API
- [ ] Webhooks pour intégrations tierces

**v2.0.0 - Mobile**
- [ ] Application mobile React Native
- [ ] Mode offline complet
- [ ] Géolocalisation automatique

## 🔐 Sécurité

### Pratiques de sécurité implémentées

| Mesure | Implémentation | Fichier |
|--------|----------------|---------|
| **HTTPS** | Recommandé en production | nginx.conf |
| **Helmet.js** | Headers HTTP sécurisés | `src/app.js` |
| **CORS** | Origines whitelist | `src/config/cors.js` |
| **Rate Limiting** | 100 req/15min par IP | `src/middleware/rateLimiter.js` |
| **JWT** | Tokens avec expiration | `src/middleware/auth.js` |
| **Bcrypt** | Hash passwords (10 rounds) | `src/models/User.js` |
| **Validation** | Toutes les entrées | `src/validators/` |
| **Sanitization** | Express-validator | `src/middleware/validate.js` |
| **File Upload** | Types et tailles limités | `src/config/multer.js` |
| **NoSQL Injection** | Protection Mongoose | `src/config/database.js` |
| **CSP** | Content Security Policy | Helmet middleware |
| **XSS** | Filtrage automatique | Express-validator |

### Recommandations de sécurité

#### En production

1. **Variables d'environnement sensibles**
   ```bash
   # Générer des secrets forts
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Utiliser des gestionnaires de secrets
   # - Render: Environment Variables (encrypted)
   # - AWS: Secrets Manager
   # - Azure: Key Vault
   # - GCP: Secret Manager
   ```

2. **HTTPS obligatoire**
   - Activer HTTPS avec Let's Encrypt
   - Forcer la redirection HTTP → HTTPS
   - Activer HSTS

3. **MongoDB**
   - Utiliser MongoDB Atlas avec VPC
   - Activer l'authentification
   - Whitelist uniquement les IPs nécessaires
   - Sauvegardes automatiques activées

4. **Rate Limiting ajusté**
   ```javascript
   // Adapter selon le trafic
   RATE_LIMIT_WINDOW_MS=900000  // 15 minutes
   RATE_LIMIT_MAX_REQUESTS=50   // Plus strict en prod
   ```

5. **Logs et monitoring**
   - Logger toutes les authentifications
   - Alertes sur comportements suspects
   - Backup réguliers

### Signaler une vulnérabilité

Si vous découvrez une vulnérabilité de sécurité, **ne créez PAS d'issue publique**.
Envoyez un email à : **security@phenom.com**

## 🤝 Contribution

Nous accueillons toutes les contributions ! Voici comment participer :

### Processus de contribution

1. **Fork** le projet sur GitHub
2. **Cloner** votre fork
   ```bash
   git clone https://github.com/VOTRE-USERNAME/phenom.git
   cd phenom
   ```

3. **Créer une branche** pour votre fonctionnalité
   ```bash
   git checkout -b feature/AmazingFeature
   # ou
   git checkout -b fix/BugFix
   ```

4. **Développer** votre fonctionnalité
   - Suivre les conventions de code existantes
   - Ajouter des tests si applicable
   - Mettre à jour la documentation

5. **Commit** vos changements
   ```bash
   git add .
   git commit -m "feat: Add amazing new feature"
   ```
   
   Suivre la convention [Conventional Commits](https://www.conventionalcommits.org/) :
   - `feat:` Nouvelle fonctionnalité
   - `fix:` Correction de bug
   - `docs:` Documentation
   - `style:` Formatage (pas de changement de code)
   - `refactor:` Refactoring
   - `test:` Ajout de tests
   - `chore:` Maintenance

6. **Push** vers votre fork
   ```bash
   git push origin feature/AmazingFeature
   ```

7. **Ouvrir une Pull Request** sur le repository principal

### Guidelines de code

#### Backend (Node.js)
- ESLint configuration fournie
- Style : ES6+ modules
- Async/await préféré aux promesses
- Commentaires JSDoc pour les fonctions principales
- Tests avec Jest

#### Frontend (Vue.js)
- Composition API préférée
- Composables pour la logique réutilisable
- Tailwind CSS pour le styling
- Tests avec Vitest

### Checklist avant PR

- [ ] Le code build sans erreur
- [ ] Les tests passent (`npm test`)
- [ ] Le linter est content (`npm run lint`)
- [ ] La documentation est à jour
- [ ] Les commits suivent Conventional Commits
- [ ] Pas de credentials ou secrets dans le code

## 📜 Changelog

### [1.0.0] - 2025-10-18

#### ✨ Ajouté
- Système d'authentification JWT complet (login, register, refresh token)
- CRUD observations avec géolocalisation GPS
- Upload et compression automatique d'images (JPEG, PNG, WebP)
- Système de commentaires sur les observations
- Carte interactive Leaflet avec marqueurs personnalisés
- Filtres avancés (date, localisation, type)
- Panel administrateur avec statistiques
- API REST documentée avec Swagger/OpenAPI
- Tests unitaires et d'intégration (Jest + Vitest)
- Rate limiting par IP
- Sécurité : Helmet, CORS, validation, sanitization
- PWA ready avec manifest et service worker
- Docker multi-stage pour dev et prod
- Scripts utilitaires (seed, monitoring, déploiement)
- Documentation complète en wiki
- Notifications push Web Push API avec VAPID
- Système d'alertes géolocalisées (rayon 1-500 km)
- Notifications persistantes avec TTL 30 jours
- Déduplication des notifications (une par observation)
- Background sync pour mises à jour de position
- WebSocket temps réel avec WsMini

#### � Technique
- Backend : Node.js 18 + Express 4.18 + MongoDB/Mongoose 8
- Frontend : Vue.js 3.4 + Vite 5 + Pinia + Vue Router
- Styling : Tailwind CSS 3.4
- Déploiement : Docker Compose + Render.com ready
- CI/CD : Configuration pour GitHub Actions (à venir)

## 📄 License

Ce projet est sous licence **MIT**. 

```
MIT License

Copyright (c) 2025 Équipe Phenom

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe & Contact

**Équipe Phenom** - Application de signalement OVNI collaborative

### Contributeurs

- **Jonas du Bois** - [@Jonas-du-bois](https://github.com/Jonas-du-bois) - Lead Developer

### Contact

- 📧 **Email** : contact@phenom.com
- 🐛 **Issues** : [GitHub Issues](https://github.com/Jonas-du-bois/phenom/issues)
- 💬 **Discussions** : [GitHub Discussions](https://github.com/Jonas-du-bois/phenom/discussions)
- 🌐 **Website** : https://phenom-app.com (à venir)

### Remerciements

- [OpenStreetMap](https://www.openstreetmap.org) pour les tuiles de carte
- [Leaflet](https://leafletjs.com) pour la bibliothèque de cartographie
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) pour l'hébergement de base de données
- [Render.com](https://render.com) pour l'hébergement de l'application
- La communauté open source pour tous les outils fantastiques

---

<div align="center">

**Version** : Z.5.1  
**Dernière mise à jour** : 18 octobre 2025

Made with 💚 by Équipe Phenom

⭐ Si ce projet vous plaît, donnez-lui une étoile sur GitHub !

[⬆ Retour en haut](#phenom-app-)

</div>
