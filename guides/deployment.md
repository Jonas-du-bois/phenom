# Guide Complet Docker & Déploiement — Phenom App

> Documentation complète pour la containerisation et le déploiement de l'application Phenom (backend Node.js + frontend Vue.js) avec Docker et Render.

---

## 1. Vue d'ensemble de l'architecture

### 1.1 Structure des dossiers
```
phenom-app/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .dockerignore
├── docs/
│   ├── phenom-backend-architecture.md
│   ├── phenom-design-system.md
│   └── phenom-frontend-architecture.md
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

---

## 2. Configuration Backend Docker

### 2.1 Dockerfile Backend
```dockerfile
# backend/Dockerfile
FROM node:24-alpine

# Metadata
LABEL maintainer="equipe-phenom@example.com"
LABEL version="1.0.0"
LABEL description="Phenom Backend API - OVNI Observation App"

# Arguments de build
ARG NODE_ENV=production
ARG PORT=3000

# Variables d'environnement
ENV NODE_ENV=$NODE_ENV
ENV PORT=$PORT

# Working directory
WORKDIR /app

# Installer les dépendances système
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production --silent && \
    npm cache clean --force --silent

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S phenom -u 1001

# Copier le code source
COPY --chown=phenom:nodejs src ./src

# Changer vers l'utilisateur non-root
USER phenom

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:$PORT/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Exposer le port
EXPOSE $PORT

# Utiliser dumb-init pour une meilleure gestion des signaux
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage
CMD ["node", "src/app.js"]
```

### 2.2 .dockerignore Backend
```
# backend/.dockerignore
node_modules
npm-debug.log*
.npm
tests
coverage
.nyc_output
.env.local
.env.development
.env.test
.git
.gitignore
README.md
Dockerfile
.dockerignore
docs
*.md
.DS_Store
```

### 2.3 package.json Backend
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
    "test:coverage": "jest --coverage",
    "docker:build": "docker build -t phenom-backend .",
    "docker:run": "docker run -p 3000:3000 --env-file .env phenom-backend"
  },
  "dependencies": {
    "express": "^5.1.0",
    "mongoose": "^8.18.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "express-validator": "^7.2.0",
    "express-rate-limit": "^7.5.0",
    "multer": "^1.4.5",
    "cors": "^2.8.5",
    "helmet": "^8.0.0",
    "dotenv": "^16.4.5",
    "swagger-ui-express": "^5.0.1",
    "swagger-jsdoc": "^6.2.8",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "jest": "^30.2.0",
    "supertest": "^7.1.4",
    "nodemon": "^3.1.7"
  },
  "engines": {
    "node": ">=24.0.0",
    "npm": ">=10.0.0"
  }
}
```

---

## 3. Configuration Frontend Docker

### 3.1 Dockerfile Frontend (Multi-stage)
```dockerfile
# frontend/Dockerfile
# Stage 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --silent

# Copier le code source
COPY . .

# Arguments de build
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME="Phenom"

# Variables d'environnement pour le build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

# Build de l'application
RUN npm run build

# Stage 2: Production
FROM nginx:1.25-alpine

# Installer dumb-init
RUN apk add --no-cache dumb-init

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés depuis le stage précédent
COPY --from=builder /app/dist /usr/share/nginx/html

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nginx && \
    adduser -S appuser -u 1001

# Ajuster les permissions
RUN chown -R appuser:nginx /var/cache/nginx && \
    chown -R appuser:nginx /var/log/nginx && \
    chown -R appuser:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R appuser:nginx /var/run/nginx.pid

# Changer vers l'utilisateur non-root
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Exposer le port
EXPOSE 80

# Utiliser dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 3.2 Configuration Nginx Frontend
```nginx
# frontend/nginx.conf
user appuser;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html index.htm;

        # PWA Support
        location /sw.js {
            add_header Cache-Control "no-cache";
            proxy_cache_bypass $http_pragma;
            proxy_cache_revalidate on;
            expires off;
            access_log off;
        }

        # API Proxy (si nécessaire)
        location /api/ {
            proxy_pass http://backend:3000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Static assets caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # SPA fallback
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Error pages
        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            root /usr/share/nginx/html;
        }
    }
}
```

### 3.3 .dockerignore Frontend
```
# frontend/.dockerignore
node_modules
dist
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
.git
.gitignore
README.md
Dockerfile
.dockerignore
coverage
tests
```

### 3.4 package.json Frontend
```json
{
  "name": "phenom-frontend",
  "version": "1.0.0",
  "description": "Frontend Vue.js pour Phenom - Observations OVNI",
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview --host",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs --fix --ignore-path .gitignore",
    "docker:build": "docker build -t phenom-frontend .",
    "docker:run": "docker run -p 80:80 phenom-frontend"
  },
  "dependencies": {
    "vue": "^3.5.0",
    "vue-router": "^4.4.5",
    "pinia": "^2.2.4",
    "axios": "^1.7.7",
    "@headlessui/vue": "^1.7.23",
    "leaflet": "^1.9.4",
    "@vueuse/core": "^11.1.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.1.4",
    "vite": "^5.4.8",
    "vite-plugin-pwa": "^0.20.5",
    "tailwindcss": "^3.4.13",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "vitest": "^2.1.2",
    "@vue/test-utils": "^2.4.6",
    "eslint": "^9.12.0",
    "eslint-plugin-vue": "^9.28.0"
  },
  "engines": {
    "node": ">=24.0.0",
    "npm": ">=10.0.0"
  }
}
```

---

## 4. Docker Compose

### 4.1 docker-compose.yml (Développement)
```yaml
# docker-compose.yml
version: '3.8'

services:
  # Base de données MongoDB
  mongodb:
    image: mongo:8.0
    container_name: phenom-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME:-admin}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD:-passw0rdi2Tr0is}
      MONGO_INITDB_DATABASE: ${MONGO_DB_NAME:-phenom_dev}
    volumes:
      - mongodb_data:/data/db
      - ./backend/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - phenom-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Interface d'administration MongoDB
  mongo-express:
    image: mongo-express:1.0
    container_name: phenom-mongo-express
    restart: unless-stopped
    ports:
      - "8081:8081"
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: ${MONGO_ROOT_USERNAME:-admin}
      ME_CONFIG_MONGODB_ADMINPASSWORD: ${MONGO_ROOT_PASSWORD:-passw0rdi2Tr0is}
      ME_CONFIG_MONGODB_SERVER: mongodb
      ME_CONFIG_MONGODB_PORT: 27017
      ME_CONFIG_BASICAUTH: false
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - phenom-network

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      args:
        NODE_ENV: development
    container_name: phenom-backend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      PORT: 3000
      MONGODB_URI: mongodb://${MONGO_ROOT_USERNAME:-admin}:${MONGO_ROOT_PASSWORD:-Passw0rd12Tr0is}@mongodb:27017/${MONGO_DB_NAME:-phenom_dev}?authSource=admin
      JWT_SECRET: ${JWT_SECRET:-dev-jwt-secret-key-change-in-production}
      CORS_ORIGIN: http://localhost:5173,http://localhost:80
      RATE_LIMIT_WINDOW_MS: 900000
      RATE_LIMIT_MAX_REQUESTS: 1000
      MAX_FILE_SIZE: 10485760
      UPLOAD_PATH: /app/uploads
    volumes:
      - ./backend/src:/app/src:ro
      - backend_uploads:/app/uploads
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - phenom-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

  # Frontend Vue.js
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_BASE_URL: http://localhost:3000
        VITE_APP_NAME: Phenom
    container_name: phenom-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - phenom-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80/"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  phenom-network:
    driver: bridge
    name: phenom-network

volumes:
  mongodb_data:
    name: phenom_mongodb_data
  backend_uploads:
    name: phenom_backend_uploads
```

### 4.2 docker-compose.prod.yml (Production)
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      args:
        NODE_ENV: production
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      MONGODB_URI: ${MONGODB_URI}
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
      RATE_LIMIT_WINDOW_MS: ${RATE_LIMIT_WINDOW_MS:-900000}
      RATE_LIMIT_MAX_REQUESTS: ${RATE_LIMIT_MAX_REQUESTS:-100}
      MAX_FILE_SIZE: ${MAX_FILE_SIZE:-10485760}
    volumes:
      - backend_uploads:/app/uploads
    networks:
      - phenom-network
    deploy:
      replicas: 1
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_BASE_URL: ${VITE_API_BASE_URL}
        VITE_APP_NAME: Phenom
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - phenom-network
    deploy:
      replicas: 1
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M

networks:
  phenom-network:
    driver: bridge

volumes:
  backend_uploads:
```

---

## 5. Fichiers de configuration

### 5.1 .env.example
```bash
# .env.example - Copiez vers .env et remplissez les valeurs

# Base de données MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=passw0rdi2Tr0is
MONGO_DB_NAME=phenom_dev

# Backend API
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://admin:passw0rdi2Tr0is@localhost:27017/phenom_dev?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:5173,http://localhost:80

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/app/uploads

# Frontend
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Phenom
VITE_MAP_TILES_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

### 5.2 backend/mongo-init.js
```javascript
// backend/mongo-init.js
// Script d'initialisation MongoDB

db = db.getSiblingDB('phenom_dev');

// Créer les collections avec validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Name is required and must be a string'
        },
        email: {
          bsonType: 'string',
          pattern: '^.+@.+\..+$',
          description: 'Email is required and must be a valid email address'
        },
        password: {
          bsonType: 'string',
          minLength: 6,
          description: 'Password is required and must be at least 6 characters'
        },
        role: {
          bsonType: 'string',
          enum: ['admin', 'viewer'],
          description: 'Role must be either admin or viewer'
        }
      }
    }
  }
});

db.createCollection('observations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'description', 'userId', 'location'],
      properties: {
        title: {
          bsonType: 'string',
          description: 'Title is required'
        },
        description: {
          bsonType: 'string',
          description: 'Description is required'
        },
        imageUrl: {
          bsonType: 'string',
          description: 'URL of the uploaded observation photo'
        },
        location: {
          bsonType: 'object',
          required: ['type', 'coordinates'],
          properties: {
            type: {
              bsonType: 'string',
              enum: ['Point']
            },
            coordinates: {
              bsonType: 'array',
              minItems: 2,
              maxItems: 2,
              items: {
                bsonType: 'double'
              },
              description: 'GPS coordinates [longitude, latitude] captured at photo time'
            }
          }
        }
      }
    }
  }
});

db.createCollection('comments');

// Créer les index
db.users.createIndex({ 'email': 1 }, { unique: true });
db.observations.createIndex({ 'location': '2dsphere' });
db.observations.createIndex({ 'userId': 1, 'createdAt': -1 });
db.observations.createIndex({ 'title': 'text', 'description': 'text' });
db.comments.createIndex({ 'observationId': 1, 'createdAt': -1 });

// Créer un utilisateur admin par défaut (développement seulement)
if (db.getName() === 'phenom_dev') {
  // Hash bcrypt du mot de passe 'admin123'
  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  
  db.users.insertOne({
    name: 'Admin',
    email: 'admin@phenom.dev',
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Créer des observations d'exemple avec photos
  const adminUser = db.users.findOne({ email: 'admin@phenom.dev' });
  
  db.observations.insertMany([
    {
      title: 'Lumière triangulaire au-dessus de Lausanne',
      description: 'Observation d\'un objet triangulaire lumineux se déplaçant silencieusement',
      imageUrl: 'https://example.com/uploads/observation-1.jpg',
      location: {
        type: 'Point',
        coordinates: [6.6323, 46.5197] // Lausanne
      },
      userId: adminUser._id,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Sphère brillante au-dessus du Léman',
      description: 'Sphère lumineuse stationnaire observée pendant 15 minutes',
      imageUrl: 'https://example.com/uploads/observation-2.jpg',
      location: {
        type: 'Point',
        coordinates: [6.1432, 46.2044] // Genève
      },
      userId: adminUser._id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  
  print('Database initialized successfully!');
  print('Admin user created: admin@phenom.dev (password: admin123)');
  print('Sample observations with photos created');
}
```

---

## 6. Scripts de build et déploiement

### 6.1 Makefile
```makefile
# Makefile
.PHONY: help build start stop clean logs test

# Variables
COMPOSE_FILE = docker-compose.yml
COMPOSE_PROD_FILE = docker-compose.prod.yml

help: ## Afficher l'aide
	@echo "Commands disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

build: ## Build les images Docker
	docker-compose -f $(COMPOSE_FILE) build --no-cache

start: ## Démarrer l'application en mode développement
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "Application démarrée!"
	@echo "Frontend: http://localhost"
	@echo "Backend API: http://localhost:3000"
	@echo "Swagger: http://localhost:3000/api-docs"
	@echo "MongoDB Express: http://localhost:8081"

stop: ## Arrêter l'application
	docker-compose -f $(COMPOSE_FILE) down

restart: stop start ## Redémarrer l'application

logs: ## Voir les logs
	docker-compose -f $(COMPOSE_FILE) logs -f

logs-backend: ## Voir les logs du backend
	docker-compose -f $(COMPOSE_FILE) logs -f backend

logs-frontend: ## Voir les logs du frontend
	docker-compose -f $(COMPOSE_FILE) logs -f frontend

test: ## Lancer les tests
	docker-compose -f $(COMPOSE_FILE) exec backend npm test

clean: ## Nettoyer les containers et volumes
	docker-compose -f $(COMPOSE_FILE) down -v
	docker system prune -f

prod-build: ## Build pour production
	docker-compose -f $(COMPOSE_PROD_FILE) build --no-cache

prod-start: ## Démarrer en production
	docker-compose -f $(COMPOSE_PROD_FILE) up -d

prod-stop: ## Arrêter la production
	docker-compose -f $(COMPOSE_PROD_FILE) down

status: ## Voir le statut des services
	docker-compose -f $(COMPOSE_FILE) ps

shell-backend: ## Accéder au shell du backend
	docker-compose -f $(COMPOSE_FILE) exec backend sh

shell-frontend: ## Accéder au shell du frontend
	docker-compose -f $(COMPOSE_FILE) exec frontend sh

db-shell: ## Accéder au shell MongoDB
	docker-compose -f $(COMPOSE_FILE) exec mongodb mongosh -u admin -p passw0rdi2Tr0is
```

### 6.2 scripts/deploy.sh
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Déploiement de Phenom App"

# Variables
ENV_FILE=".env"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"

# Vérifier que le fichier .env existe
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Fichier .env manquant. Copiez .env.example vers .env"
    exit 1
fi

# Charger les variables d'environnement
source $ENV_FILE

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

echo "📦 Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🛑 Arrêt des services existants..."
docker-compose -f docker-compose.prod.yml down

echo "🗄️  Sauvegarde de la base de données..."
if [ "$(docker ps -q -f name=phenom-mongo)" ]; then
    docker exec phenom-mongo mongodump --out /backup
    docker cp phenom-mongo:/backup $BACKUP_DIR/
fi

echo "🚀 Démarrage des nouveaux services..."
docker-compose -f docker-compose.prod.yml up -d

echo "🏥 Vérification de l'état des services..."
sleep 10

# Vérifier que les services sont healthy
services=("backend" "frontend")
for service in "${services[@]}"; do
    health=$(docker-compose -f docker-compose.prod.yml ps -q $service | xargs docker inspect --format='{{.State.Health.Status}}')
    if [ "$health" != "healthy" ]; then
        echo "❌ Service $service n'est pas healthy: $health"
        exit 1
    fi
    echo "✅ Service $service est healthy"
done

echo "🧹 Nettoyage des anciennes images..."
docker image prune -f

echo "✅ Déploiement terminé avec succès!"
echo "🌐 Frontend: http://localhost"
echo "🔗 Backend API: http://localhost:3000"
```

---

## 7. Déploiement sur Render

### 7.1 Configuration Backend pour Render
```dockerfile
# backend/Dockerfile.render
FROM node:24-alpine

WORKDIR /app

# Copier et installer les dépendances
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copier le code source
COPY src ./src

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && adduser -S phenom -u 1001
RUN chown -R phenom:nodejs /app
USER phenom

# Health check pour Render
COPY health-check.js ./

# Port dynamique pour Render
EXPOSE ${PORT:-3000}

CMD ["node", "src/app.js"]
```

### 7.2 health-check.js pour Render
```javascript
// backend/health-check.js
const http = require('http');

const port = process.env.PORT || 3000;

const options = {
  hostname: 'localhost',
  port: port,
  path: '/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('timeout', () => {
  req.destroy();
  process.exit(1);
});

req.on('error', () => {
  process.exit(1);
});

req.end();
```

### 7.3 render.yaml (Infrastructure as Code)
```yaml
# render.yaml
services:
  - type: web
    name: phenom-backend
    runtime: node
    env: node
    region: oregon
    plan: starter
    buildCommand: npm install
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        fromDatabase:
          name: phenom-mongodb
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: PORT
        value: 3000

  - type: web
    name: phenom-frontend
    runtime: static
    env: static
    region: oregon
    plan: starter
    buildCommand: npm run build
    staticPublishPath: ./dist
    buildFilter:
      paths:
        - frontend/**
    envVars:
      - key: VITE_API_BASE_URL
        value: https://phenom-backend.onrender.com

databases:
  - name: phenom-mongodb
    databaseName: phenom_prod
    user: phenom_user
    region: oregon
    plan: starter
```

### 7.4 Guide de déploiement sur Render

#### Étape 1: Préparation du repository
```bash
# Cloner le repository
git clone https://github.com/votre-username/phenom-app.git
cd phenom-app

# S'assurer que tous les fichiers sont commitiés
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

#### Étape 2: Configuration sur Render
1. **Connecter le repository**:
   - Aller sur [render.com](https://render.com)
   - Cliquer sur "New +" → "Web Service"
   - Connecter votre repository GitHub

2. **Configurer le Backend**:
   ```
   Name: phenom-backend
   Runtime: Node.js
   Build Command: npm install
   Start Command: npm start
   ```

3. **Configurer les variables d'environnement**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-super-secret-key
   CORS_ORIGIN=https://phenom-frontend.onrender.com
   ```

4. **Configurer le Frontend**:
   ```
   Name: phenom-frontend
   Runtime: Static Site
   Build Command: npm run build
   Publish Directory: dist
   ```

#### Étape 3: Configuration MongoDB Atlas
```bash
# 1. Créer un cluster sur MongoDB Atlas
# 2. Configurer l'accès réseau (0.0.0.0/0 pour Render)
# 3. Créer un utilisateur de base de données
# 4. Copier la chaîne de connexion dans MONGODB_URI
```

---

## 8. Monitoring et Maintenance

### 8.1 Scripts de monitoring
```bash
#!/bin/bash
# scripts/monitor.sh

echo "🔍 État des services Docker"
docker-compose ps

echo "📊 Utilisation des ressources"
docker stats --no-stream

echo "💾 Utilisation disque"
docker system df

echo "🏥 Health checks"
curl -f http://localhost:3000/health || echo "❌ Backend down"
curl -f http://localhost/ || echo "❌ Frontend down"

echo "📝 Derniers logs d'erreur"
docker-compose logs --tail=10 backend | grep ERROR
```

### 8.2 Maintenance et mises à jour
```bash
#!/bin/bash
# scripts/update.sh

set -e

echo "🔄 Mise à jour de l'application Phenom"

# Pull des dernières modifications
git pull origin main

# Rebuild avec cache
docker-compose build --pull

# Rolling update
docker-compose up -d --no-deps backend
sleep 30
docker-compose up -d --no-deps frontend

echo "✅ Mise à jour terminée"
```

---

## 9. Dépannage

### 9.1 Commandes de diagnostic
```bash
# Voir tous les containers
docker ps -a

# Voir les logs détaillés
docker-compose logs -f --tail=100 backend

# Vérifier la connectivité réseau
docker network ls
docker network inspect phenom-network

# Tester la base de données
docker-compose exec mongodb mongosh -u admin -p passw0rdi2Tr0is

# Vérifier les volumes
docker volume ls
docker volume inspect phenom_mongodb_data

# Redémarrer un service spécifique
docker-compose restart backend
```

### 9.2 Problèmes courants

#### Backend ne démarre pas
```bash
# Vérifier les logs
docker-compose logs backend

# Vérifier la connectivité MongoDB
docker-compose exec backend node -e "console.log(process.env.MONGODB_URI)"

# Recréer le container
docker-compose up -d --force-recreate backend
```

#### Frontend ne build pas
```bash
# Nettoyer le cache npm
docker-compose exec frontend npm cache clean --force

# Vérifier les variables d'environnement
docker-compose exec frontend printenv | grep VITE

# Rebuild sans cache
docker-compose build --no-cache frontend
```

---

## 10. Checklist de déploiement

### Pré-déploiement
- [ ] Variables d'environnement configurées
- [ ] Base de données MongoDB accessible
- [ ] SSL/HTTPS configuré pour la production
- [ ] Secrets JWT sécurisés générés
- [ ] CORS configuré correctement
- [ ] Rate limiting configuré
- [ ] Tests passent en local

### Post-déploiement
- [ ] Health checks fonctionnent
- [ ] Frontend accessible publiquement  
- [ ] API backend répond correctement
- [ ] Upload d'images fonctionne
- [ ] Géolocalisation fonctionne
- [ ] Authentification fonctionne
- [ ] Base de données peuplée correctement

### Monitoring
- [ ] Logs centralisés configurés
- [ ] Métriques de performance en place
- [ ] Alertes configurées
- [ ] Backups automatiques planifiés

---

**Mainteneur principal** : Équipe DevOps Phenom  
**Version** : Docker Deploy Guide v1.0 (15/10/2025)  
**Statut** : Prêt pour déploiement