# 🚀 Guide de Démarrage Rapide - Phenom Backend

## Étape 1: Installation des dépendances

```bash
cd backend
npm install
```

## Étape 2: Configuration de l'environnement

Le fichier `.env` est déjà créé avec des valeurs de développement. Si nécessaire, ajustez les variables :

```bash
# Vérifier le fichier .env
cat .env
```

## Étape 3: Démarrer MongoDB

Si vous utilisez Docker (recommandé) :

```bash
# Depuis la racine du projet
docker-compose up -d mongodb
```

Ou avec MongoDB local, assurez-vous que MongoDB est en cours d'exécution sur `mongodb://localhost:27017`

## Étape 4: Peupler la base de données (optionnel)

Pour créer des données de test :

```bash
npm run seed
```

Cela créera :
- 4 utilisateurs (1 admin + 3 viewers)
- 6 observations avec géolocalisation
- 6 commentaires

**Identifiants de test :**
- Admin: `admin@phenom.com` / `Admin123!`
- User 1: `jean.dupont@example.com` / `password123`
- User 2: `marie.martin@example.com` / `password123`
- User 3: `pierre.durand@example.com` / `password123`

## Étape 5: Démarrer le serveur

### Mode développement (avec rechargement automatique)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

## Étape 6: Vérifier que tout fonctionne

### Health Check
```bash
curl http://localhost:3000/health
```

### Documentation Swagger
Ouvrez dans votre navigateur : http://localhost:3000/api-docs

### Test d'authentification
```bash
# Connexion
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@phenom.com",
    "password": "Admin123!"
  }'
```

### Test d'observation
```bash
# Liste des observations (sans auth)
curl http://localhost:3000/api/v1/observations
```

## 🔧 Commandes utiles

### Lancer les tests
```bash
npm test
```

### Créer un admin manuellement
```bash
npm run create-admin
```

### Vérifier le code (linting)
```bash
npm run lint
npm run lint:fix  # Pour corriger automatiquement
```

## 📚 Endpoints principaux

### Authentification
- POST `/api/v1/auth/signup` - Inscription
- POST `/api/v1/auth/login` - Connexion
- GET `/api/v1/auth/me` - Profil (auth requise)

### Observations
- GET `/api/v1/observations` - Liste (public)
- POST `/api/v1/observations` - Créer (auth requise)
- GET `/api/v1/observations/:id` - Détail (public)
- PUT `/api/v1/observations/:id` - Modifier (propriétaire/admin)
- DELETE `/api/v1/observations/:id` - Supprimer (propriétaire/admin)

### Commentaires
- GET `/api/v1/observations/:id/comments` - Liste (public)
- POST `/api/v1/observations/:id/comments` - Créer (auth requise)
- PUT `/api/v1/comments/:id` - Modifier (propriétaire/admin)
- DELETE `/api/v1/comments/:id` - Supprimer (propriétaire/admin)

### Administration
- GET `/api/v1/admin/users` - Liste utilisateurs (admin)
- PUT `/api/v1/admin/users/:id/role` - Changer rôle (admin)
- GET `/api/v1/admin/stats` - Statistiques (admin)
- DELETE `/api/v1/admin/observations/:id` - Supprimer observation (admin)
- DELETE `/api/v1/admin/comments/:id` - Supprimer commentaire (admin)

## 🐛 Dépannage

### Erreur de connexion MongoDB
```bash
# Vérifier que MongoDB est démarré
docker ps | grep mongodb

# Voir les logs
docker-compose logs mongodb
```

### Port déjà utilisé
```bash
# Changer le port dans .env
PORT=3001
```

### Problème de permissions
```bash
# Sous Linux/Mac, donner les permissions
chmod +x scripts/*.js
```

## 📖 Documentation complète

- Architecture : `docs/phenom-backend-architecture-v2.md`
- API Endpoints : `docs/api-endpoints-phenom.md`
- README : `backend/README.md`

## ✅ Checklist de démarrage

- [ ] Dépendances installées (`npm install`)
- [ ] Fichier `.env` configuré
- [ ] MongoDB démarré
- [ ] Base de données peuplée (`npm run seed`)
- [ ] Serveur démarré (`npm run dev`)
- [ ] Health check réussi
- [ ] Documentation Swagger accessible
- [ ] Tests passent (`npm test`)

## 🎉 Prêt à développer !

Le backend est maintenant opérationnel. Vous pouvez :
1. Tester les endpoints via Swagger UI
2. Développer de nouvelles fonctionnalités
3. Connecter le frontend
4. Ajouter des tests

Pour toute question, consultez la documentation complète dans le dossier `docs/`.
