/**
 * Composable pour la connexion WebSocket avec WsMini PubSub
 * Utilise le client WSClient de WsMini
 */
import { ref, onUnmounted, getCurrentInstance } from "vue";
import { WSClient } from "wsmini";
// Singleton instance so multiple calls to `useWebSocket()` share the same client/state
let _singleton = null;

export function useWebSocket() {
  if (_singleton) return _singleton;

  const ws = ref(null);
  const connected = ref(false);
  const messages = ref([]);
  const error = ref(null);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  // Determine WebSocket URL dynamically:
  // - If running in a browser on localhost/127.0.0.1, prefer VITE_WS_URL_LOCAL (dev)
  // - Otherwise use VITE_WS_URL (prod) and fallback to ws://localhost:3000
  const envWs = import.meta.env.VITE_WS_URL || '';
  const envWsLocal = import.meta.env.VITE_WS_URL_LOCAL || '';
  let WS_URL = '';
  try {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '';
      if (isLocal && envWsLocal) {
        WS_URL = envWsLocal;
      } else if (isLocal && !envWsLocal) {
        WS_URL = 'ws://localhost:3000';
      } else if (!isLocal && envWs) {
        WS_URL = envWs;
      } else {
        // fallback to envWs or local
        WS_URL = envWs || envWsLocal || 'ws://localhost:3000';
      }
    } else {
      WS_URL = envWs || envWsLocal || 'ws://localhost:3000';
    }
  } catch (e) {
    WS_URL = import.meta.env.VITE_WS_URL || import.meta.env.VITE_WS_URL_LOCAL || 'ws://localhost:3000';
  }
  console.log('ℹ️ useWebSocket selected WS_URL =', WS_URL);

  /**
   * Connexion au WebSocket avec WsMini WSClient
   */
  async function connect(token = null) {
    try {
      if (connected.value && ws.value) {
        console.log("ℹ️ WebSocket déjà connecté, saut de la connexion");
        return;
      }

      console.log(`🔌 Tentative de connexion WebSocket à: ${WS_URL}`);

      // Créer le client WsMini
      ws.value = new WSClient(WS_URL);

      // Se connecter
      await ws.value.connect();

      connected.value = true;
      error.value = null;
      reconnectAttempts.value = 0;
      console.log("✅ WebSocket connecté avec WSClient");

      // S'abonner aux canaux avec callbacks
      await ws.value.sub("observations", (data) => {
        console.log("📨 Message observations:", data);
        messages.value.push({
          channel: "observations",
          data,
          receivedAt: new Date().toISOString(),
        });
      });

      await ws.value.sub("comments", (data) => {
        console.log("📨 Message comments:", data);
        messages.value.push({
          channel: "comments",
          data,
          receivedAt: new Date().toISOString(),
        });
      });

      console.log("✅ Souscriptions aux canaux: observations, comments");
    } catch (err) {
      error.value = err.message;
      connected.value = false;
      console.error("❌ Erreur connexion WebSocket:", err);
      console.error(
        `⚠️ Vérifiez que le serveur backend est accessible à ${WS_URL}`,
      );

      // Tentative de reconnexion automatique
      if (reconnectAttempts.value < maxReconnectAttempts) {
        reconnectAttempts.value++;
        console.log(
          `🔄 Reconnexion (${reconnectAttempts.value}/${maxReconnectAttempts}) dans ${reconnectDelay / 1000}s...`,
        );
        setTimeout(() => connect(token), reconnectDelay);
      } else {
        console.warn("⚠️ Nombre maximum de tentatives de reconnexion atteint");
        console.warn(`💡 Vérifiez que le backend est accessible à ${WS_URL}`);
      }
    }
  }

  /**
   * Déconnexion du WebSocket
   */
  function disconnect() {
    reconnectAttempts.value = maxReconnectAttempts; // Empêcher la reconnexion auto
    if (ws.value) {
      try {
        if (typeof ws.value.close === "function") ws.value.close();
        else if (typeof ws.value.disconnect === "function") ws.value.disconnect();
      } catch (e) {
        // ignore
      }
      ws.value = null;
      connected.value = false;
      console.log("🔌 WebSocket déconnecté");
    }
  }

  /**
   * S'abonne à un canal supplémentaire (si besoin)
   */
  async function subscribe(channel, callback) {
    if (ws.value && connected.value) {
      try {
        await ws.value.sub(channel, callback);
        console.log(`📡 Souscription au canal: ${channel}`);
      } catch (err) {
        console.error(`❌ Erreur souscription au canal ${channel}:`, err);
      }
    }
  }

  /**
   * Se désabonne d'un canal
   */
  async function unsubscribe(channel) {
    if (ws.value && connected.value) {
      try {
        await ws.value.unsub(channel);
        console.log(`📡 Désinscription du canal: ${channel}`);
      } catch (err) {
        console.error(`❌ Erreur désinscription du canal ${channel}:`, err);
      }
    }
  }

  /**
   * Efface les messages
   */
  function clearMessages() {
    messages.value = [];
  }

  // NOTE: Ne pas s'abonner à `onUnmounted` ici — la connexion est gérée
  // globalement (ex. dans `main.js`). Enregistrer des hooks de nettoyage
  // depuis un composant qui appelle `useWebSocket()` fermerait la connexion
  // globale à chaque démontage de composant.

  const instance = {
    ws,
    connected,
    messages,
    error,
    reconnectAttempts,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    clearMessages,
  };

  _singleton = instance;
  return instance;
}
