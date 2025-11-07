# 🧪 Guide de Test WebSocket (WsMini)

## 📋 Aperçu

Le WebSocket utilise **WsMini** avec le pattern **PubSub**. Les canaux sont en **lecture seule** pour les clients - seul le backend peut publier des événements.

## 🔌 Configuration

### URLs WebSocket
- **Production**: `wss://phenom-backend.onrender.com`
- **Développement**: `ws://localhost:3000`

### Variables d'environnement
```env
# frontend/.env
VITE_WS_URL=wss://phenom-backend.onrender.com
```

## 📡 Canaux disponibles

### 1. `observations`
Souscription automatique à la connexion

**Événements diffusés:**
- `observation:created` - Nouvelle observation créée
- `observation:updated` - Observation modifiée
- `observation:deleted` - Observation supprimée

### 2. `comments`
Souscription automatique à la connexion

**Événements diffusés:**
- `comment:created` - Nouveau commentaire ajouté
- `comment:updated` - Commentaire modifié
- `comment:deleted` - Commentaire supprimé

## 🧪 Scénarios de test

### Test 1: Connexion WebSocket

1. Aller sur HomeView.vue → Section WebSocket
2. Cliquer sur "🔌 Connecter"
3. **Vérifier**:
   - Statut passe à "🟢 Connecté"
   - Console affiche: `✅ WebSocket connecté`
   - Console affiche: `📡 Souscription au canal: observations`
   - Console affiche: `📡 Souscription au canal: comments`

### Test 2: Réception événement `observation:created`

1. S'assurer que WebSocket est connecté
2. Créer une nouvelle observation via le formulaire de test
3. **Vérifier** dans la section Messages:
   ```json
   {
     "type": "observation:created",
     "data": {
       "observation": {
         "_id": "...",
         "title": "...",
         "description": "...",
         "location": { "type": "Point", "coordinates": [...] },
         "images": [...],
         "userId": {...},
         "createdAt": "...",
         "updatedAt": "..."
       }
     },
     "timestamp": "2025-11-07T...",
     "receivedAt": "2025-11-07T..."
   }
   ```
4. Badge vert `observation:created` doit apparaître

### Test 3: Réception événement `comment:created`

1. S'assurer que WebSocket est connecté
2. Créer un nouveau commentaire via le formulaire de test
3. **Vérifier** dans la section Messages:
   ```json
   {
     "type": "comment:created",
     "data": {
       "comment": {
         "_id": "...",
         "text": "...",
         "userId": {...},
         "observationId": "...",
         "createdAt": "...",
         "updatedAt": "..."
       },
       "observationId": "..."
     },
     "timestamp": "2025-11-07T...",
     "receivedAt": "2025-11-07T..."
   }
   ```
4. Badge vert `comment:created` doit apparaître

### Test 4: Réception événement `observation:updated`

1. S'assurer que WebSocket est connecté
2. Modifier une observation existante
3. **Vérifier**: Badge bleu `observation:updated` apparaît avec les données mises à jour

### Test 5: Réception événement `observation:deleted`

1. S'assurer que WebSocket est connecté
2. Supprimer une observation
3. **Vérifier**: Badge rouge `observation:deleted` avec `observationId`

### Test 6: Reconnexion automatique

1. Connecter le WebSocket
2. Arrêter le backend temporairement
3. **Vérifier**:
   - Statut passe à "🔴 Déconnecté"
   - Console affiche: `🔄 Reconnexion (1/5)...`
4. Redémarrer le backend
5. **Vérifier**:
   - WebSocket se reconnecte automatiquement
   - Souscriptions aux canaux sont refaites
   - Statut repasse à "🟢 Connecté"

### Test 7: Déconnexion manuelle

1. Connecter le WebSocket
2. Cliquer sur "🔴 Déconnecter"
3. **Vérifier**:
   - Statut passe à "🔴 Déconnecté"
   - Aucune tentative de reconnexion automatique
   - Console affiche: `🔌 WebSocket déconnecté`

### Test 8: Messages multiples

1. Connecter le WebSocket
2. Effectuer plusieurs actions rapidement:
   - Créer 2 observations
   - Ajouter 3 commentaires
   - Modifier 1 observation
3. **Vérifier**:
   - Compteur de messages affiche (6)
   - Tous les messages sont listés dans l'ordre chronologique
   - Chaque message a le bon badge de couleur

### Test 9: Effacement des messages

1. Avoir plusieurs messages dans la liste
2. Cliquer sur "🗑️ Effacer"
3. **Vérifier**:
   - Liste des messages est vide
   - Compteur affiche (0)
   - Message "📭 Aucun message reçu" apparaît

## ✅ Checklist de validation

- [ ] Connexion WebSocket réussie (prod & dev)
- [ ] Souscription automatique aux 2 canaux
- [ ] Réception événement `observation:created`
- [ ] Réception événement `observation:updated`
- [ ] Réception événement `observation:deleted`
- [ ] Réception événement `comment:created`
- [ ] Réception événement `comment:updated`
- [ ] Réception événement `comment:deleted`
- [ ] Reconnexion automatique fonctionne
- [ ] Déconnexion manuelle fonctionne
- [ ] Badge de couleur correct pour chaque type
- [ ] Affichage timestamp correct
- [ ] Effacement des messages fonctionne
- [ ] Compteur de messages à jour

## 🐛 Dépannage

### WebSocket ne se connecte pas

**Symptômes**: Reste sur "🔴 Déconnecté"

**Solutions**:
1. Vérifier que le backend est démarré
2. Vérifier `VITE_WS_URL` dans `.env`
3. En production, utiliser `wss://` (WebSocket Secure)
4. Vérifier la console pour les erreurs

### Pas de messages reçus

**Symptômes**: WebSocket connecté mais aucun message

**Solutions**:
1. Vérifier les logs de console: souscriptions OK ?
2. Créer une observation/commentaire pour déclencher un événement
3. Vérifier que le backend publie bien les événements (logs backend)

### Reconnexion infinie

**Symptômes**: Console spam de reconnexions

**Solutions**:
1. Vérifier que le backend WebSocket est bien démarré
2. Maximum 5 tentatives puis arrêt
3. Déconnecter manuellement puis reconnecter

## 📚 Références

- [Documentation WsMini](https://github.com/yourusername/wsmini)
- [Backend WebSocket README](../../../backend/src/config/WEBSOCKET_README.md)
- [AsyncAPI Spec](https://phenom-backend.onrender.com/api-docs/websocket)
