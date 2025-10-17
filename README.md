# Phenom App 🛸

Application web de signalement d'observations de phénomènes OVNI avec géolocalisation et capture photo.

## 🚀 Démarrage Rapide

### Prérequis
- Docker Desktop installé et démarré
- Git
- Node.js 18+ (pour le développement local)

### Installation

1. **Cloner le repository**
```bash
git clone <votre-repo>
cd phenom
```

2. **Configuration de l'environnement**
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env avec vos valeurs
# (utilisez les valeurs par défaut pour le développement)
```

3. **Démarrer l'application avec Docker**

**Option 1 : Avec Make (recommandé)**
```bash
# Afficher l'aide
make help

# Démarrer l'application
make start

# Voir les logs
make logs

# Arrêter l'application
make stop
```

**Option 2 : Avec Docker Compose**
```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down
```

### 🌐 Accès aux services

Une fois démarrés, les services sont accessibles à :

- **Frontend** : http://localhost
- **Backend API** : http://localhost:3000
- **MongoDB Express** : http://localhost:8081 (admin/admin123)

### 📦 Structure du Projet

```
phenom/
├── backend/              # API Node.js + Express
│   ├── src/
│   │   └── app.js
│   ├── Dockerfile
│   ├── package.json
│   └── mongo-init.js
├── frontend/             # Application Vue.js
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.js
│   │   ├── router/
│   │   └── views/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docs/                 # Documentation
├── scripts/              # Scripts utilitaires
├── docker-compose.yml    # Config développement
├── docker-compose.prod.yml # Config production
├── .env.example
└── Makefile
```

## 🛠️ Développement

### Installer les dépendances localement

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Commandes utiles

```bash
# Voir les logs d'un service spécifique
make logs-backend
make logs-frontend

# Accéder au shell d'un container
make shell-backend
make shell-frontend

# Accéder à MongoDB
make db-shell

# Voir le statut des services
make status

# Nettoyer tout (containers + volumes)
make clean
```

## 🚢 Déploiement

### Déploiement en production

```bash
# Build des images de production
make prod-build

# Démarrer en production
make prod-start

# Ou utiliser le script de déploiement
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Déploiement sur Render

1. **Créer un compte sur [Render.com](https://render.com)**

2. **Configurer MongoDB Atlas**
   - Créer un cluster gratuit
   - Configurer l'accès réseau (0.0.0.0/0)
   - Copier la chaîne de connexion

3. **Déployer le Backend**
   - New Web Service → Connecter le repository
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Variables d'environnement : configurer depuis .env

4. **Déployer le Frontend**
   - New Static Site → Connecter le repository
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
   - Variable: `VITE_API_BASE_URL` = URL du backend

## 📊 Monitoring

```bash
# Script de monitoring
chmod +x scripts/monitor.sh
./scripts/monitor.sh
```

## 🔧 Dépannage

### Le backend ne démarre pas
```bash
# Vérifier les logs
docker-compose logs backend

# Vérifier la connectivité MongoDB
docker-compose exec backend node -e "console.log(process.env.MONGODB_URI)"

# Recréer le container
docker-compose up -d --force-recreate backend
```

### Le frontend ne s'affiche pas
```bash
# Vérifier les logs
docker-compose logs frontend

# Rebuild sans cache
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### MongoDB ne démarre pas
```bash
# Vérifier les logs
docker-compose logs mongodb

# Nettoyer le volume et redémarrer
docker-compose down -v
docker-compose up -d mongodb
```

## 📚 Documentation

Consultez la [documentation complète](docs/README.md) organisée en wiki :

- **[Guide de Démarrage Rapide](docs/guides/quickstart.md)** - Démarrer en 5 minutes
- **[Architecture Backend](docs/architecture/backend.md)** - Structure Node.js/Express
- **[Architecture Frontend](docs/architecture/frontend.md)** - Structure Vue.js 3
- **[Base de Données](docs/architecture/database.md)** - Modèles et schémas MongoDB
- **[Documentation API](docs/api/endpoints.md)** - Tous les endpoints REST
- **[Design System](docs/design/design-system.md)** - Composants et styles
- **[Guide Docker](docs/guides/deployment.md)** - Déploiement complet

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changes (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

MIT License - voir le fichier LICENSE

## 👥 Équipe

Équipe Phenom - [jonas.dubois@heig-vd.ch](mailto:jonas.dubois@heig-vd.ch)

---

**Version** : Zone.5.1  
**Dernière mise à jour** : 15 octobre 2025
