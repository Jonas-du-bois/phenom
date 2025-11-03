# WebSocket Backend - WsMini

## 🔌 Documentation WebSocket - Phenom Backend

## Configuration

Le serveur WebSocket utilise **WsMini** avec le pattern **PubSub** et est monté sur le **même serveur HTTP** que l'API REST.

### URLs

- **Production (Render)** : `wss://phenom-backend.onrender.com`
- **Développement** : `ws://localhost:3000`

⚠️ **Important** : En production, utilisez `wss://` (WebSocket Secure)

## Connexion depuis le Frontend

```javascript
// En production
const ws = new WebSocket('wss://phenom-backend.onrender.com');

// En développement  
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  console.log('✅ Connecté au WebSocket');
  
  // S'abonner aux canaux
  ws.send(JSON.stringify({ 
    action: 'subscribe', 
    channel: 'observations' 
  }));
  
  ws.send(JSON.stringify({ 
    action: 'subscribe', 
    channel: 'comments' 
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('📨 Message reçu:', message);
  
  // Gérer selon le type
  switch(message.type) {
    case 'observation:created':
      // Ajouter la nouvelle observation au feed
      break;
    case 'observation:updated':
      // Mettre à jour l'observation existante
      break;
    case 'observation:deleted':
      // Retirer l'observation du feed
      break;
    case 'comment:created':
      // Ajouter le nouveau commentaire
      break;
    case 'comment:updated':
      // Mettre à jour le commentaire
      break;
    case 'comment:deleted':
      // Retirer le commentaire
      break;
  }
};

ws.onerror = (error) => {
  console.error('❌ Erreur WebSocket:', error);
};

ws.onclose = () => {
  console.log('👋 Déconnecté du WebSocket');
  // Reconnecter après 3 secondes
  setTimeout(() => {
    console.log('🔄 Reconnexion...');
    // Créer une nouvelle connexion
  }, 3000);
};
```

## Variables d'environnement

Aucune variable spécifique n'est nécessaire. Le WebSocket utilise automatiquement le même port que le serveur HTTP.

## Canaux disponibles

### 1. `observations`

#### Événements :

**`observation:created`**
```json
{
  "type": "observation:created",
  "data": {
    "observation": {
      "_id": "673123abc...",
      "userId": {...},
      "species": "Phénomène lumineux",
      "location": {...},
      "description": "...",
      "date": "2025-11-03T10:00:00.000Z",
      "photos": [],
      "createdAt": "2025-11-03T12:00:00.000Z"
    }
  },
  "timestamp": "2025-11-03T12:00:00.123Z"
}
```

**`observation:updated`**
```json
{
  "type": "observation:updated",
  "data": {
    "observation": { /* observation complète mise à jour */ }
  },
  "timestamp": "2025-11-03T12:00:00.123Z"
}
```

**`observation:deleted`**
```json
{
  "type": "observation:deleted",
  "data": {
    "observationId": "673123abc..."
  },
  "timestamp": "2025-11-03T12:00:00.123Z"
}
```

### 2. `comments`

#### Événements :

**`comment:created`**
```json
{
  "type": "comment:created",
  "data": {
    "comment": {
      "_id": "673456def...",
      "observationId": "673123abc...",
      "userId": {...},
      "text": "Très intéressant !",
      "createdAt": "2025-11-03T12:00:00.000Z"
    },
    "observationId": "673123abc..."
  },
  "timestamp": "2025-11-03T12:00:00.123Z"
}
```

**`comment:updated`**
```json
{
  "type": "comment:updated",
  "data": {
    "comment": { /* commentaire complet mis à jour */ },
    "observationId": "673123abc..."
  },
  "timestamp": "2025-11-03T12:00:00.123Z"
}
```

**`comment:deleted`**
```json
{
  "type": "comment:deleted",
  "data": {
    "commentId": "673456def...",
    "observationId": "673123abc..."
  },
  "timestamp": "2025-11-03T12:00:00.123Z"
}
```

## Test avec websocat

```bash
# Installer websocat
cargo install websocat

# Se connecter au WebSocket (production)
websocat wss://phenom-backend.onrender.com

# S'abonner aux canaux
{"action":"subscribe","channel":"observations"}
{"action":"subscribe","channel":"comments"}

# Vous recevrez maintenant tous les événements en temps réel
```

## Composable Vue.js complet

```javascript
// composables/useWebSocket.js
import { ref, onMounted, onUnmounted } from 'vue';

export function useWebSocket() {
  const ws = ref(null);
  const isConnected = ref(false);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;
  const listeners = new Map();

  // Détecter l'environnement
  const wsUrl = import.meta.env.PROD 
    ? 'wss://phenom-backend.onrender.com'
    : 'ws://localhost:3000';

  const connect = () => {
    try {
      ws.value = new WebSocket(wsUrl);

      ws.value.onopen = () => {
        console.log('🔌 WebSocket connecté à', wsUrl);
        isConnected.value = true;
        reconnectAttempts.value = 0;

        // S'abonner automatiquement aux canaux
        subscribe('observations');
        subscribe('comments');
      };

      ws.value.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Appeler tous les listeners pour ce type d'événement
          if (listeners.has(message.type)) {
            listeners.get(message.type).forEach(callback => {
              callback(message.data);
            });
          }
        } catch (error) {
          console.error('❌ Erreur parsing message WebSocket:', error);
        }
      };

      ws.value.onclose = () => {
        console.log('👋 WebSocket déconnecté');
        isConnected.value = false;
        
        // Tentative de reconnexion
        if (reconnectAttempts.value < maxReconnectAttempts) {
          reconnectAttempts.value++;
          console.log(`🔄 Reconnexion (${reconnectAttempts.value}/${maxReconnectAttempts})...`);
          setTimeout(connect, reconnectDelay);
        }
      };

      ws.value.onerror = (error) => {
        console.error('❌ Erreur WebSocket:', error);
      };

    } catch (error) {
      console.error('❌ Erreur connexion WebSocket:', error);
    }
  };

  const subscribe = (channel) => {
    if (ws.value && isConnected.value) {
      ws.value.send(JSON.stringify({
        action: 'subscribe',
        channel
      }));
      console.log(`📡 Abonné au canal: ${channel}`);
    }
  };

  const on = (eventType, callback) => {
    if (!listeners.has(eventType)) {
      listeners.set(eventType, new Set());
    }
    listeners.get(eventType).add(callback);

    // Retourner une fonction de cleanup
    return () => {
      if (listeners.has(eventType)) {
        listeners.get(eventType).delete(callback);
      }
    };
  };

  const disconnect = () => {
    if (ws.value) {
      ws.value.close();
      ws.value = null;
    }
  };

  onMounted(() => {
    connect();
  });

  onUnmounted(() => {
    disconnect();
  });

  return {
    ws,
    isConnected,
    on,
    connect,
    disconnect
  };
}
```

## Notes importantes

1. ✅ Le WebSocket utilise le **même port** que l'API REST
2. ✅ En production, utilisez `wss://` (WebSocket Secure)
3. ✅ Les canaux `observations` et `comments` sont en **lecture seule** pour les clients
4. ✅ Seul le serveur peut publier des messages (sécurité)
5. ✅ Reconnexion automatique en cas de déconnexion
6. ✅ Compatible avec le déploiement sur Render
