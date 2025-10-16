# 🗄️ Base de Données - Phenom

Documentation complète des modèles de données MongoDB utilisés dans le projet Phenom.

## 📊 Vue d'Ensemble

Le projet utilise **MongoDB** avec **Mongoose** pour la gestion des données. La base contient 3 collections principales:

- **users** - Utilisateurs de la plateforme
- **observations** - Observations de phénomènes
- **comments** - Commentaires sur les observations

## 🔗 Relations Entre Collections

```
┌─────────────┐
│    users    │
└──────┬──────┘
       │
       │ _id
       │
       ├───────────────────────────┐
       │                           │
       ↓                           ↓
┌──────────────┐           ┌──────────────┐
│ observations │←──────────│   comments   │
└──────────────┘  obs_id   └──────────────┘
```

## 📄 Modèle User

### Schéma

```javascript
{
  _id: ObjectId,
  username: String,      // Unique, requis
  email: String,         // Unique, requis
  password: String,      // Hash bcrypt, requis
  role: String,          // 'user' | 'admin', défaut: 'user'
  createdAt: Date,       // Auto
  updatedAt: Date        // Auto
}
```

### Indexes

- `username`: Unique
- `email`: Unique

### Méthodes

```javascript
// Méthode d'instance
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
}
```

### Exemple

```json
{
  "_id": "670f1234567890abcdef1234",
  "username": "john_doe",
  "email": "john@example.com",
  "password": "$2b$10$...",
  "role": "user",
  "createdAt": "2025-10-15T10:30:00.000Z",
  "updatedAt": "2025-10-15T10:30:00.000Z"
}
```

## 📸 Modèle Observation

### Schéma

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,           // Ref: 'User', requis
  title: String,               // Requis, max 200 caractères
  description: String,         // Requis
  location: {
    type: String,              // 'Point'
    coordinates: [Number]      // [longitude, latitude]
  },
  date: Date,                  // Requis
  images: [String],            // URLs des images
  category: String,            // Ex: 'aurora', 'meteor', 'cloud'
  status: String,              // 'pending' | 'approved' | 'rejected'
  createdAt: Date,             // Auto
  updatedAt: Date              // Auto
}
```

### Indexes

- `location`: GeoSpatial index (2dsphere)
- `user_id`: Index
- `category`: Index
- `status`: Index
- `date`: Index (descending)

### Virtuals

```javascript
observationSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'observation_id'
});
```

### Exemple

```json
{
  "_id": "670f5678901234abcdef5678",
  "user_id": "670f1234567890abcdef1234",
  "title": "Magnifique aurore boréale",
  "description": "Observation d'une aurore boréale intense...",
  "location": {
    "type": "Point",
    "coordinates": [24.9384, 60.1695]
  },
  "date": "2025-10-14T22:15:00.000Z",
  "images": [
    "https://storage.example.com/aurora-001.jpg"
  ],
  "category": "aurora",
  "status": "approved",
  "createdAt": "2025-10-15T08:00:00.000Z",
  "updatedAt": "2025-10-15T09:30:00.000Z"
}
```

## 💬 Modèle Comment

### Schéma

```javascript
{
  _id: ObjectId,
  observation_id: ObjectId,    // Ref: 'Observation', requis
  user_id: ObjectId,           // Ref: 'User', requis
  content: String,             // Requis, max 1000 caractères
  createdAt: Date,             // Auto
  updatedAt: Date              // Auto
}
```

### Indexes

- `observation_id`: Index
- `user_id`: Index
- `createdAt`: Index (descending)

### Exemple

```json
{
  "_id": "670f9012345678abcdef9012",
  "observation_id": "670f5678901234abcdef5678",
  "user_id": "670f1234567890abcdef1234",
  "content": "Superbe photo ! J'étais au même endroit...",
  "createdAt": "2025-10-15T10:45:00.000Z",
  "updatedAt": "2025-10-15T10:45:00.000Z"
}
```

## 🔍 Requêtes Communes

### Récupérer une observation avec l'auteur et les commentaires

```javascript
const observation = await Observation.findById(id)
  .populate('user_id', 'username email')
  .populate({
    path: 'comments',
    populate: {
      path: 'user_id',
      select: 'username'
    }
  });
```

### Rechercher des observations par géolocalisation

```javascript
const observations = await Observation.find({
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      $maxDistance: 50000 // 50km en mètres
    }
  }
});
```

### Récupérer les observations d'un utilisateur

```javascript
const observations = await Observation.find({ user_id: userId })
  .sort({ createdAt: -1 })
  .limit(20);
```

## 🔒 Validation

### User

- `username`: 3-30 caractères, alphanumériques et underscore
- `email`: Format email valide
- `password`: Minimum 6 caractères (avant hash)
- `role`: Valeurs autorisées: 'user', 'admin'

### Observation

- `title`: 1-200 caractères
- `description`: Requis
- `coordinates`: Longitude [-180, 180], Latitude [-90, 90]
- `date`: Date valide
- `category`: Valeurs prédéfinies
- `status`: 'pending', 'approved', 'rejected'

### Comment

- `content`: 1-1000 caractères
- `observation_id`: Doit référencer une observation existante
- `user_id`: Doit référencer un utilisateur existant

## 🚀 Migrations

### Ajouter un nouveau champ

```javascript
// Script de migration
const mongoose = require('mongoose');
const Observation = require('./models/observation');

async function addWeatherField() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  await Observation.updateMany(
    { weather: { $exists: false } },
    { $set: { weather: null } }
  );
  
  console.log('Migration terminée');
  process.exit(0);
}

addWeatherField();
```

## 📊 Statistiques

### Nombre d'observations par catégorie

```javascript
const stats = await Observation.aggregate([
  { $match: { status: 'approved' } },
  { $group: {
    _id: '$category',
    count: { $sum: 1 }
  }},
  { $sort: { count: -1 } }
]);
```

### Utilisateurs les plus actifs

```javascript
const topUsers = await Observation.aggregate([
  { $match: { status: 'approved' } },
  { $group: {
    _id: '$user_id',
    observationCount: { $sum: 1 }
  }},
  { $sort: { observationCount: -1 } },
  { $limit: 10 },
  { $lookup: {
    from: 'users',
    localField: '_id',
    foreignField: '_id',
    as: 'user'
  }}
]);
```

## 🔐 Sécurité

### Bonnes Pratiques

1. **Mots de passe**
   - Toujours hasher avec bcrypt (salt rounds: 10)
   - Ne jamais renvoyer le hash dans les réponses API

2. **Validation**
   - Utiliser Mongoose validation + express-validator
   - Sanitizer les entrées utilisateur

3. **ObjectIds**
   - Valider que les IDs sont des ObjectId valides
   - Vérifier les permissions avant modification

4. **Indexes**
   - Indexes sur les champs fréquemment requêtés
   - Monitoring des performances

## 📝 Changelog Base de Données

### v1.0.0 (Octobre 2025)
- ✅ Création modèles User, Observation, Comment
- ✅ Indexes de performance
- ✅ Validation des données
- ✅ Support géospatial

---

**Voir aussi:**
- [Architecture Backend](backend))
- [API Endpoints](../api/endpoints))
- [Guide de Déploiement](../guides/deployment))
