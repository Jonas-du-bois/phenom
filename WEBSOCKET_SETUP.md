# Configuration WebSocket WsMini - Résumé

## 📋 Modifications effectuées

### Backend

#### 1. Contrôleurs - Publication d'événements WebSocket

**Fichier: `backend/src/controllers/observation.controller.js`**
- Ajout de l'import : `import { publishObservationEvent } from '../config/websocket.js'`
- `createObservation()` : Publie `observation:created`
- `updateObservation()` : Publie `observation:updated`
- `deleteObservation()` : Publie `observation:deleted`

**Fichier: `backend/src/controllers/comment.controller.js`**
- Ajout de l'import : `import { publishCommentEvent } from '../config/websocket.js'`
- `createComment()` : Publie `comment:created`
- `updateComment()` : Publie `comment:updated`
- `deleteComment()` : Publie `comment:deleted`

#### 2. Configuration WebSocket

**Fichier: `backend/src/config/websocket.js`**
- Correction de `publishToChannel()` : Envoi d'objets JavaScript (pas de `JSON.stringify`)
- WsMini gère automatiquement la sérialisation JSON

```javascript
// AVANT
wss.pub(channel, JSON.stringify(message));

// APRÈS
wss.pub(channel, message);
```

### Frontend

#### 1. Composable WebSocket

**Fichier: `frontend/src/composables/useWebSocket.js`**
- ✅ Utilisation de `WSClient` de WsMini (au lieu de WebSocket natif)
- ✅ Connexion avec `await ws.value.connect()`
- ✅ Souscription avec `await ws.value.sub(channel, callback)`
- ✅ URL par défaut : `wss://phenom-backend.onrender.com` (production)

```javascript
import { WSClient } from 'wsmini'

const ws.value = new WSClient(WS_URL)
await ws.value.connect()

await ws.value.sub('observations', (data) => {
  messages.value.push({ channel: 'observations', data, receivedAt: ... })
})
```

#### 2. Package

**Installation de WsMini**
```bash
npm install wsmini
```

#### 3. Configuration

**Fichier: `frontend/.env`**
- ✅ `VITE_WS_URL=wss://phenom-backend.onrender.com` (production par défaut)

**Fichier: `frontend/.env.local`** (pour développement local)
- ✅ `VITE_WS_URL=ws://localhost:3000`

---

## 🚀 Test en Production

### 1. Déployer le backend sur Render
Le code est déjà sur GitHub. Render va automatiquement déployer les modifications.

### 2. Tester le frontend

1. **Ouvrir** : https://votre-frontend.vercel.app (ou local)
2. **Se connecter** : `admin@phenom.app` / `Admin123!`
3. **Section WebSocket** (dernière section) :
   - Cliquer sur **🔌 Connecter**
   - Vérifier : **🟢 État: Connecté**
   - Canaux affichés : `observations`, `comments`

4. **Créer une observation** :
   - Remonter à la section **Observations**
   - Remplir le formulaire
   - Cliquer sur **📍 Obtenir ma position** (GPS)
   - Sélectionner une **image**
   - Cliquer sur **Créer**

5. **Vérifier les messages WebSocket** :
   - Descendre à la section **WebSocket**
   - Un message devrait apparaître :
     - Badge vert : `observation:created`
     - Données de l'observation créée
     - Timestamp

6. **Créer un commentaire** :
   - Copier l'ID de l'observation créée
   - Section **Commentaires**
   - Remplir le formulaire
   - Créer le commentaire

7. **Vérifier** :
   - Message `comment:created` dans la section WebSocket
   - Badge vert avec les données

---

## 📊 Format des messages

### Structure des événements

```javascript
{
  "type": "observation:created",  // ou observation:updated, observation:deleted
  "data": {
    "_id": "...",
    "title": "...",
    "description": "...",
    // ... autres champs
  },
  "timestamp": "2025-11-07T12:34:56.789Z"
}
```

### Canaux disponibles

- **`observations`** : Événements sur les observations
  - `observation:created`
  - `observation:updated`
  - `observation:deleted`

- **`comments`** : Événements sur les commentaires
  - `comment:created`
  - `comment:updated`
  - `comment:deleted`

---

## 🔍 Troubleshooting

### Frontend ne se connecte pas

1. **Vérifier la console** :
   ```
   🔌 Tentative de connexion WebSocket à: wss://...
   ✅ WebSocket connecté avec WSClient
   ✅ Souscriptions aux canaux: observations, comments
   ```

2. **Vérifier que le backend est accessible** :
   - Ouvrir : https://phenom-backend.onrender.com/health
   - Doit retourner `{ "status": "ok" }`

3. **Vérifier les logs backend sur Render** :
   ```
   ✅ Serveur WebSocket configuré (PubSub)
   ✅ Serveur WebSocket opérationnel
   ```

### Messages ne s'affichent pas

1. **Vérifier les logs backend lors de la création** :
   ```
   📤 Message publié sur observations: observation:created
   ```

2. **Vérifier la console frontend** :
   ```
   📨 Message observations: { type: "observation:created", data: {...}, timestamp: "..." }
   ```

3. **Vérifier la section WebSocket** :
   - Nombre de messages : doit augmenter
   - Badge avec le type d'événement
   - Données affichées

---

## ✅ Checklist finale

- [ ] Backend déployé sur Render
- [ ] Frontend configuré avec `VITE_WS_URL=wss://phenom-backend.onrender.com`
- [ ] Package `wsmini` installé dans le frontend
- [ ] Connexion WebSocket réussie (🟢 Connecté)
- [ ] Création d'observation → Message `observation:created` reçu
- [ ] Création de commentaire → Message `comment:created` reçu
- [ ] Mise à jour → Messages `*:updated` reçus
- [ ] Suppression → Messages `*:deleted` reçus

---

## 📝 Notes importantes

1. **WsMini PubSub** :
   - Les clients sont **en lecture seule** (`usersCanPub: false`)
   - Seul le serveur peut publier des messages
   - Les clients s'abonnent avec `.sub(channel, callback)`

2. **Format des messages** :
   - Le backend envoie des **objets JavaScript**
   - WsMini gère automatiquement la sérialisation JSON
   - Pas besoin de `JSON.stringify()` ni `JSON.parse()`

3. **Reconnexion automatique** :
   - Max 5 tentatives
   - Délai de 3 secondes entre chaque tentative
   - Logs dans la console pour le debugging

4. **Production vs Local** :
   - Production : `wss://phenom-backend.onrender.com`
   - Local : `ws://localhost:3000` (dans `.env.local`)
