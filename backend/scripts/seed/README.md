# 🌱 Système de Seed Modulaire Phenom

Ce système permet de peupler la base de données MongoDB Atlas avec des données réalistes et complètes.

## 📁 Structure

```
scripts/
├── seed.js                    # Script principal (orchestrateur)
└── seed/
    ├── data/                  # 📊 DONNÉES (facile à modifier)
    │   ├── admin.data.js      # 1 admin
    │   ├── users.data.js      # 10 utilisateurs
    │   ├── observations.data.js # 15 observations détaillées
    │   └── comments.data.js   # ~50 commentaires réalistes
    ├── seeders/               # 🔧 LOGIQUE (ne touche pas sauf besoin)
    │   ├── seed-admin.js
    │   ├── seed-users.js
    │   ├── seed-observations.js
    │   └── seed-comments.js
    └── images/                # 🖼️ IMAGES (à placer ici)
        ├── README.md
        └── [tes images OVNI].jpg
```

## 🚀 Utilisation

### 1. Préparer les images (optionnel)

```bash
cd scripts/seed/images
# Place tes 15 images OVNI ici (voir images/README.md)
```

Si tu ne mets pas d'images, le seed fonctionnera quand même mais les observations n'auront pas d'images.

### 2. Lancer le seed

```bash
npm run seed
```

### 3. Résultat

```
╔════════════════════════════════════════════════════╗
║     🌱 SEED DE LA BASE DE DONNÉES PHENOM          ║
╚════════════════════════════════════════════════════╝

🔌 Connexion à MongoDB Atlas...
📦 Initialisation de GridFS...

🧹 Nettoyage des collections...
   ✅ Collections nettoyées

👤 Seed de l'administrateur...
   ✅ Admin créé: Admin Phenom (admin@phenom.app)
   🔑 Mot de passe: Admin123!

👥 Seed des utilisateurs...
   ✅ Sophie Martin (sophie.martin@example.com)
   ✅ Jean Dupont (jean.dupont@example.com)
   ...
   📊 Total: 10 utilisateurs créés
   🔑 Mot de passe pour tous: Password123!

📸 Seed des observations...
   ✅ [1/15] Objet triangulaire lumineux... (avec image)
   ✅ [2/15] Sphère orange brillante... (avec image)
   ...
   📊 Total: 15 observations créées

💬 Seed des commentaires...
   ✅ 50 commentaires créés
   📊 Observations avec commentaires: 15
   📊 Moyenne par observation: 3.3

╔════════════════════════════════════════════════════╗
║            📊 STATISTIQUES FINALES                 ║
╚════════════════════════════════════════════════════╝
   👤 Administrateurs:    1
   👥 Utilisateurs:       10
   📸 Observations:       15
   💬 Commentaires:       50
   🖼️  Images uploadées:   15

╔════════════════════════════════════════════════════╗
║           🔑 INFORMATIONS DE CONNEXION            ║
╚════════════════════════════════════════════════════╝
   📧 Email admin:    admin@phenom.app
   🔒 Mot de passe:   Admin123!
   📧 Email users:    sophie.martin@example.com
   🔒 Mot de passe:   Password123!

✅ Seed terminé avec succès !
```

## ✏️ Personnalisation

### Modifier l'admin

Édite `seed/data/admin.data.js` :

```javascript
export const adminData = {
  name: 'Ton Nom',
  email: 'ton@email.com',
  password: 'TonMotDePasse!',
  role: 'admin'
};
```

### Ajouter/Modifier des utilisateurs

Édite `seed/data/users.data.js` :

```javascript
export const usersData = [
  {
    name: 'Nouveau User',
    email: 'nouveau@example.com',
    password: 'Password123!',
    role: 'viewer'
  },
  // ...
];
```

### Ajouter/Modifier des observations

Édite `seed/data/observations.data.js` :

```javascript
{
  title: 'Ta nouvelle observation',
  description: 'Description détaillée...',
  location: {
    type: 'Point',
    coordinates: [longitude, latitude] // Attention à l'ordre !
  },
  imageFilename: 'ton-image.jpg', // Doit exister dans seed/images/
  userIndex: 0 // Index de l'utilisateur (0-9)
}
```

**⚠️ Important** : Pour les coordonnées MongoDB GeoJSON :
- Format : `[longitude, latitude]` (ordre inversé !)
- Exemple Lausanne : `[6.6323, 46.5197]`

### Ajouter/Modifier des commentaires

Édite `seed/data/comments.data.js` :

```javascript
{
  observationIndex: 0,  // Observation 0 (première)
  userIndex: 1,         // User 1 (Jean Dupont)
  text: 'Ton commentaire...',
  daysAgo: 2            // Il y a 2 jours
}
```

## 🌍 Coordonnées GPS des villes

Quelques coordonnées utiles (format : `[longitude, latitude]`) :

**Suisse :**
- Lausanne : `[6.6323, 46.5197]`
- Genève : `[6.1432, 46.2044]`
- Berne : `[7.4474, 46.9480]`
- Zurich : `[8.5417, 47.3769]`
- Neuchâtel : `[6.9306, 46.9920]`
- Fribourg : `[7.1512, 46.8060]`

**France :**
- Paris : `[2.3522, 48.8566]`
- Lyon : `[4.8357, 45.7640]`
- Marseille : `[5.3698, 43.2965]`
- Toulouse : `[1.4442, 43.6047]`
- Nice : `[7.2619, 43.7102]`
- Bordeaux : `[0.5792, 44.8378]`

## 🗜️ Compression d'images

Les images sont automatiquement compressées lors de l'upload :
- Redimensionnées si > 1920x1920px
- Qualité 85% (excellent compromis)
- Format préservé (JPEG/PNG/WebP)
- Économie moyenne : ~80%

## 🔄 Re-seed

Pour vider et re-peupler la base :

```bash
npm run seed
```

**⚠️ Attention** : Cela supprime **TOUTES** les données existantes !

## 🐛 Dépannage

### "Image not found"
➡️ Vérifie que l'image existe dans `seed/images/` avec le bon nom

### "User index out of bounds"
➡️ `userIndex` dans observations/comments doit être entre 0 et 9

### "GridFS not initialized"
➡️ Assure-toi que MongoDB est bien connecté avant le seed

### "Duplicate key error"
➡️ Lance le seed une seule fois, ou attends qu'il se termine

## 📚 Données générées

### Admin (1)
- Email : `admin@phenom.app`
- Mot de passe : `Admin123!`
- Rôle : admin

### Users (10)
- Emails : `{prenom}.{nom}@example.com`
- Mot de passe : `Password123!` (tous)
- Rôle : viewer

### Observations (15)
- Titres descriptifs réalistes
- Descriptions détaillées (200-500 mots)
- Coordonnées GPS réelles (Suisse & France)
- Images OVNI (si fournies)
- Réparties sur 10 utilisateurs

### Commentaires (~50)
- Réactions réalistes
- Discussions entre utilisateurs
- Dates échelonnées (0-5 jours)
- Contextualisés par observation

## 🎯 Pourquoi cette architecture ?

✅ **Séparation des responsabilités** : Données / Logique / Script principal  
✅ **Facile à modifier** : Change uniquement les fichiers `data/`  
✅ **Réutilisable** : Seeders peuvent être appelés individuellement  
✅ **Maintenable** : Code clair et modulaire  
✅ **Extensible** : Facile d'ajouter de nouveaux seeders  

## 📝 Exemple de workflow

1. **Développement frontend** : Lance `npm run seed` pour avoir des données
2. **Modifier un utilisateur** : Édite `data/users.data.js`
3. **Ajouter une observation** : Édite `data/observations.data.js` + ajoute image
4. **Re-seed** : `npm run seed`
5. **Test** : Données fraîches et cohérentes !

## 🚀 Prochaines étapes

Après le seed, tu peux :
- Tester l'API avec Swagger : `http://localhost:3000/api-docs`
- Te connecter en admin : `admin@phenom.app` / `Admin123!`
- Explorer les observations dans la carte
- Tester les commentaires
- Uploader de nouvelles images

Bon développement ! 🛸
