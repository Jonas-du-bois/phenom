# 🧪 Tests Backend Phenom

Ce document explique comment exécuter et comprendre les tests du backend de l'application Phenom.

## 📋 Table des Matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Exécuter les Tests](#exécuter-les-tests)
- [Structure des Tests](#structure-des-tests)
- [Couverture des Tests](#couverture-des-tests)
- [Tests Disponibles](#tests-disponibles)

---

## ✅ Prérequis

- **Node.js** >= 18.x
- **MongoDB** (local ou Atlas)
- **npm** ou **yarn**

## 📦 Installation

1. Installer les dépendances :
```bash
cd backend
npm install
```

2. Configurer les variables d'environnement pour les tests :
```bash
# Créer un fichier .env.test ou utiliser .env existant
MONGODB_TEST_URI=mongodb://localhost:27017/phenom_test
JWT_SECRET=test-secret-key
JWT_REFRESH_SECRET=test-refresh-secret-key
NODE_ENV=test
```

---

## 🚀 Exécuter les Tests

### Tous les tests
```bash
npm test
```

### Tests avec surveillance (watch mode)
```bash
npm run test:watch
```

### Tests avec couverture de code
```bash
npm run test:coverage
```

### Tests spécifiques

#### Tests d'authentification uniquement
```bash
npm test -- auth.test.js
```

#### Tests utilisateur uniquement
```bash
npm test -- user.test.js
```

#### Tests avec pattern
```bash
npm test -- --testNamePattern="should get user profile"
```

---

## 📁 Structure des Tests

```
backend/tests/
├── setup.js           # Configuration globale des tests
├── auth.test.js       # Tests des endpoints d'authentification
└── user.test.js       # Tests des endpoints utilisateur
```

### Fichiers de Tests

#### `setup.js`
Configuration globale avant tous les tests :
- Connexion à la base de données de test
- Nettoyage entre chaque test
- Configuration des timeouts
- Variables d'environnement

#### `auth.test.js`
Tests pour `/api/v1/auth/*` :
- ✅ POST /auth/signup
- ✅ POST /auth/login
- ✅ GET /auth/me
- ✅ POST /auth/logout

#### `user.test.js` ⭐ **NOUVEAU**
Tests pour `/api/v1/users/*` :
- ✅ GET /users/me (Profil utilisateur)
- ✅ PUT /users/me (Mise à jour profil)
- ✅ PATCH /users/me/password (Changement mot de passe)
- ✅ DELETE /users/me (Suppression compte)
- ✅ GET /users/me/observations (Observations utilisateur)
- ✅ Tests de sécurité et edge cases

---

## 📊 Couverture des Tests

### Objectif de Couverture
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Voir le rapport de couverture
```bash
npm run test:coverage
```

Le rapport HTML sera généré dans `coverage/lcov-report/index.html`

---

## 🧪 Tests Disponibles

### 1. Tests d'Authentification (`auth.test.js`)

#### POST /auth/signup
- [x] Inscription réussie avec données valides
- [x] Échec avec email dupliqué
- [x] Échec avec email invalide
- [x] Échec avec mot de passe trop court

#### POST /auth/login
- [x] Connexion réussie avec bonnes credentials
- [x] Échec avec mauvais mot de passe
- [x] Échec avec email inexistant

#### GET /auth/me
- [x] Récupération profil avec token valide
- [x] Échec sans token
- [x] Échec avec token invalide

---

### 2. Tests Utilisateur (`user.test.js`) ⭐

#### GET /users/me - Profil Utilisateur
- [x] Récupération profil complet avec token valide
- [x] Inclusion du nombre d'observations
- [x] Échec sans authentification
- [x] Échec avec token invalide
- [x] Échec avec header Authorization malformé

#### PUT /users/me - Mise à Jour Profil
- [x] Mise à jour complète du profil (name, email, bio)
- [x] Mise à jour partielle (name seulement)
- [x] Mise à jour partielle (email seulement)
- [x] Échec avec email dupliqué
- [x] Échec avec format email invalide
- [x] Échec avec nom trop court
- [x] Protection contre modification du rôle
- [x] Échec sans authentification

#### PATCH /users/me/password - Changement Mot de Passe
- [x] Changement réussi avec données valides
- [x] Connexion possible avec nouveau mot de passe
- [x] Échec avec mauvais mot de passe actuel
- [x] Échec quand confirmation ne correspond pas
- [x] Échec avec nouveau mot de passe trop court
- [x] Échec quand nouveau = ancien mot de passe
- [x] Échec sans authentification
- [x] Échec avec champs manquants

#### DELETE /users/me - Suppression Compte
- [x] Suppression réussie du compte
- [x] Suppression en cascade des observations
- [x] Token inutilisable après suppression
- [x] Échec sans authentification
- [x] Échec avec token invalide

#### GET /users/me/observations - Observations Utilisateur
- [x] Récupération de toutes les observations
- [x] Support de la pagination (page, limit)
- [x] Tri par date (newest first par défaut)
- [x] Tri personnalisé (sort, order)
- [x] Retour array vide si aucune observation
- [x] Isolation des données (pas d'observations d'autres users)
- [x] Échec sans authentification
- [x] Gestion paramètres pagination invalides
- [x] Inclusion liens HATEOAS

#### Tests de Sécurité et Edge Cases
- [x] Pas d'exposition du hash de mot de passe
- [x] Gestion des tokens expirés
- [x] Mises à jour concurrentes du profil
- [x] Protection contre XSS (sanitization inputs)
- [x] Rate limiting sur changement mot de passe

---

## 🔧 Configuration Jest

Le fichier `jest.config.js` configure :
- **Timeout**: 10 secondes par test
- **Coverage**: Exclusion de fichiers non essentiels
- **Environment**: Node.js
- **Transform**: Support ESM modules

---

## 📝 Bonnes Pratiques

### Écrire de nouveaux tests

1. **Suivre la structure AAA** :
   - **Arrange** : Préparer les données
   - **Act** : Exécuter l'action
   - **Assert** : Vérifier le résultat

```javascript
it('should do something', async () => {
  // Arrange
  const userData = { name: 'Test' };
  
  // Act
  const response = await request(app)
    .post('/api/v1/endpoint')
    .send(userData);
  
  // Assert
  expect(response.status).toBe(200);
  expect(response.body.data).toHaveProperty('name');
});
```

2. **Isoler les tests** :
   - Chaque test doit être indépendant
   - Utiliser `beforeEach` pour setup
   - Nettoyer dans `afterEach`

3. **Nommer clairement** :
   - `should [action] when [condition]`
   - Exemple : `should fail with invalid email`

4. **Tester les cas limites** :
   - Données valides ✅
   - Données invalides ❌
   - Données manquantes ⚠️
   - Edge cases 🔍

---

## 🐛 Debugging des Tests

### Test échoue ?

1. **Voir les détails** :
```bash
npm test -- --verbose
```

2. **Isoler un test** :
```javascript
it.only('should do something', async () => {
  // Ce test sera le seul exécuté
});
```

3. **Ignorer temporairement** :
```javascript
it.skip('should do something', async () => {
  // Ce test sera ignoré
});
```

4. **Ajouter des logs** :
```javascript
console.log('Response:', response.body);
```

---

## 📈 Statistiques

### Endpoints Testés

| Endpoint | Tests | Couverture |
|----------|-------|-----------|
| POST /auth/signup | 4 | 100% |
| POST /auth/login | 3 | 100% |
| GET /auth/me | 3 | 100% |
| GET /users/me | 5 | 100% |
| PUT /users/me | 8 | 100% |
| PATCH /users/me/password | 8 | 100% |
| DELETE /users/me | 5 | 100% |
| GET /users/me/observations | 10 | 100% |

**Total : 46 tests couvrant 8 endpoints** ✅

---

## 🎯 Prochaines Étapes

- [ ] Tests pour les observations (CRUD)
- [ ] Tests pour les commentaires
- [ ] Tests pour les endpoints admin
- [ ] Tests d'intégration E2E
- [ ] Tests de performance/charge
- [ ] Tests de sécurité avancés

---

## 💡 Ressources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Best Practices Testing Node.js](https://github.com/goldbergyoni/nodebestpractices#4-testing-and-overall-quality-practices)

---

## 📞 Support

Si vous rencontrez des problèmes avec les tests :
1. Vérifiez que MongoDB est démarré
2. Vérifiez les variables d'environnement
3. Nettoyez `node_modules` et réinstallez : `rm -rf node_modules && npm install`
4. Consultez les logs de test avec `--verbose`

---

**Dernière mise à jour** : 16 octobre 2025
