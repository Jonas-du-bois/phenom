/**
 * Composable pour la connexion WebSocket avec WsMini PubSub
 * Utilise le client WSClient de WsMini
 */
import { ref, onUnmounted } from "vue";
import { WSClient } from "wsmini";

export function useWebSocket() {
  const ws = ref(null);
  const connected = ref(false);
  const messages = ref([]);
  const error = ref(null);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  // URL du WebSocket - VITE_WS_URL est passé par Docker, sinon fallback sur LOCAL pour dev Vite
  const WS_URL =
    import.meta.env.VITE_WS_URL ||
    import.meta.env.VITE_WS_URL_LOCAL ||
    "ws://localhost:3000";

  /**
   * Connexion au WebSocket avec WsMini WSClient
   */
  async function connect(token = null) {
    try {
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
      // WSmini gère la fermeture automatiquement
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

  onUnmounted(() => {
    disconnect();
  });

  return {
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
}
