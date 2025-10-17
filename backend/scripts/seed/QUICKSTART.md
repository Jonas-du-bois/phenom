# 🚀 Guide de Démarrage Rapide - Seed

## Étape 1 : Télécharger les images placeholder (optionnel)

```bash
cd backend
npm run seed:images
```

**Alternative** : Place tes propres images dans `scripts/seed/images/` (voir liste dans `scripts/seed/images/README.md`)

## Étape 2 : Lancer le seed

```bash
npm run seed
```

## Étape 3 : Tester

Connecte-toi avec :
- **Admin** : `admin@phenom.app` / `Admin123!`
- **User** : `sophie.martin@example.com` / `Password123!`

## 📝 Modifier les données

### Changer les credentials admin
Édite `scripts/seed/data/admin.data.js`

### Ajouter des utilisateurs
Édite `scripts/seed/data/users.data.js`

### Ajouter des observations
1. Édite `scripts/seed/data/observations.data.js`
2. Ajoute l'image dans `scripts/seed/images/`
3. Re-lance `npm run seed`

### Ajouter des commentaires
Édite `scripts/seed/data/comments.data.js`

## 🗜️ Compression automatique

Les images sont automatiquement compressées lors de l'upload :
- Redimensionnement si > 1920x1920px
- Qualité 85%
- Économie ~80% de l'espace

## 📍 Coordonnées GPS (format MongoDB)

⚠️ **Attention** : MongoDB utilise `[longitude, latitude]` (ordre inversé !)

Exemple Lausanne :
```javascript
location: {
  type: 'Point',
  coordinates: [6.6323, 46.5197] // [lng, lat]
}
```

## 🐛 Problèmes courants

### "Cannot find module"
```bash
cd backend
npm install
```

### "Image not found"
➡️ Lance `npm run seed:images` ou place les images manuellement

### "Connection refused"
➡️ Vérifie que `MONGO_URI` est bien configuré dans `.env`

### "Duplicate key error"
➡️ Normal si tu re-lances le seed, il nettoie automatiquement

## 📚 Plus de détails

Voir `scripts/seed/README.md` pour la documentation complète.

## 🎯 Workflow de développement

```bash
# 1. Première fois
npm run seed:images  # Télécharge les placeholders
npm run seed        # Peuple la DB

# 2. Modifications
# Édite les fichiers dans scripts/seed/data/
npm run seed        # Re-seed

# 3. Test
npm run dev         # Lance le serveur
# Ouvre http://localhost:3000/api-docs
```

C'est tout ! 🛸
