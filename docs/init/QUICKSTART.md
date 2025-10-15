# 🚀 Guide de Démarrage Rapide - Phenom App

## ✅ Prérequis installés

- ✅ Docker version 28.5.1
- ✅ Docker Compose v2.40.0

## 📋 Étapes de Démarrage

### 1. Vérifier la configuration

Le fichier `.env` a été créé avec les valeurs par défaut. Pour le développement local, ces valeurs sont suffisantes.

### 2. Démarrer l'application

**Option A : Avec Make (recommandé sur Linux/Mac)**
```bash
make start
```

**Option B : Avec Docker Compose (fonctionne partout)**
```bash
docker-compose up -d
```

### 3. Vérifier que tout fonctionne

Après 30-60 secondes, vérifiez que les services sont démarrés :

```bash
docker-compose ps
```

Vous devriez voir 4 services en cours d'exécution :
- `phenom-backend` (Backend API)
- `phenom-frontend` (Frontend Vue.js)
- `phenom-mongo` (Base de données)
- `phenom-mongo-express` (Interface admin MongoDB)

### 4. Accéder à l'application

- **Frontend** : http://localhost
- **Backend API** : http://localhost:3000
- **Backend Health Check** : http://localhost:3000/health
- **MongoDB Express** : http://localhost:8081 (utilisateur: `admin`, mot de passe: `admin123`)

### 5. Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🛠️ Commandes Utiles

### Gestion des services

```bash
# Arrêter l'application
docker-compose down

# Redémarrer l'application
docker-compose restart

# Voir le statut
docker-compose ps

# Reconstruire les images
docker-compose build --no-cache

# Nettoyer tout (attention : supprime les données)
docker-compose down -v
docker system prune -f
```

### Accès aux containers

```bash
# Shell backend
docker-compose exec backend sh

# Shell frontend
docker-compose exec frontend sh

# MongoDB shell
docker-compose exec mongodb mongosh -u admin -p passw0rdi2Tr0is
```

## 🔧 Dépannage

### Les containers ne démarrent pas

1. **Vérifier Docker Desktop**
   ```bash
   docker ps
   ```

2. **Voir les logs d'erreur**
   ```bash
   docker-compose logs
   ```

3. **Redémarrer Docker Desktop**
   - Quitter Docker Desktop
   - Relancer Docker Desktop
   - Attendre qu'il soit complètement démarré
   - Réessayer `docker-compose up -d`

### Port déjà utilisé

Si vous avez une erreur "port already in use" :

```bash
# Trouver le processus qui utilise le port
netstat -ano | findstr :3000    # Windows
lsof -i :3000                    # Linux/Mac

# Changer le port dans .env
# Éditer .env et changer PORT=3000 en PORT=3001
```

### Problème de connexion MongoDB

```bash
# Vérifier que MongoDB est démarré
docker-compose ps mongodb

# Redémarrer MongoDB
docker-compose restart mongodb

# Vérifier les logs MongoDB
docker-compose logs mongodb
```

### Les modifications de code ne sont pas prises en compte

Pour le **développement** avec hot-reload, il faut monter les volumes :

**Backend** : Le volume est déjà configuré dans docker-compose.yml
```yaml
volumes:
  - ./backend/src:/app/src
```

**Frontend** : Pour le développement, lancez Vite en local plutôt que Docker :
```bash
cd frontend
npm install
npm run dev
```

## 🚢 Déploiement en Production

### Option 1 : Déploiement local avec docker-compose.prod.yml

```bash
# 1. Configurer les variables d'environnement de production
cp .env.example .env.production
# Éditer .env.production avec les vraies valeurs

# 2. Build
docker-compose -f docker-compose.prod.yml build

# 3. Démarrer
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2 : Déploiement sur Render.com

#### A. Préparer MongoDB Atlas

1. Créer un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créer un cluster gratuit (M0)
3. Configurer l'accès réseau :
   - Dans "Network Access", ajouter `0.0.0.0/0` (autoriser tout)
4. Créer un utilisateur :
   - Dans "Database Access", créer un utilisateur avec permissions
5. Copier la chaîne de connexion :
   - Remplacer `<password>` par votre mot de passe
   - Exemple : `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/phenom?retryWrites=true&w=majority`

#### B. Déployer le Backend sur Render

1. Aller sur [Render.com](https://render.com) et se connecter
2. Cliquer sur "New +" → "Web Service"
3. Connecter votre repository GitHub
4. Configuration :
   - **Name** : `phenom-backend`
   - **Root Directory** : `backend`
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Plan** : Free
5. Variables d'environnement :
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=<votre-url-mongodb-atlas>
   JWT_SECRET=<générer-une-clé-sécurisée>
   CORS_ORIGIN=https://votre-frontend.onrender.com
   ```
6. Déployer

#### C. Déployer le Frontend sur Render

1. Cliquer sur "New +" → "Static Site"
2. Connecter le même repository
3. Configuration :
   - **Name** : `phenom-frontend`
   - **Root Directory** : `frontend`
   - **Build Command** : `npm install && npm run build`
   - **Publish Directory** : `dist`
4. Variables d'environnement :
   ```
   VITE_API_BASE_URL=https://phenom-backend.onrender.com
   VITE_APP_NAME=Phenom
   ```
5. Déployer

#### D. Configurer les URLs

Une fois les deux services déployés :

1. Noter l'URL du backend (ex: `https://phenom-backend.onrender.com`)
2. Mettre à jour la variable `VITE_API_BASE_URL` du frontend avec cette URL
3. Redéployer le frontend

## 📊 Monitoring

### Vérifier la santé des services

```bash
# Backend health check
curl http://localhost:3000/health

# Frontend
curl http://localhost/

# Docker stats
docker stats --no-stream
```

### Script de monitoring automatique

```bash
chmod +x scripts/monitor.sh
./scripts/monitor.sh
```

## 🎯 Prochaines Étapes

1. ✅ Docker et services de base configurés
2. 📝 Développer les routes API du backend
3. 🎨 Créer les composants Vue.js du frontend
4. 🗺️ Intégrer Leaflet pour les cartes
5. 📸 Implémenter la capture photo
6. 🔐 Ajouter l'authentification JWT
7. 👮 Créer l'interface admin
8. 🧪 Écrire les tests
9. 🚀 Déployer en production

## 📞 Support

En cas de problème :

1. Vérifier les logs : `docker-compose logs -f`
2. Consulter la documentation dans `/docs`
3. Vérifier les issues GitHub
4. Contacter l'équipe

---

**Bonne chance avec votre projet Phenom! 🛸**
