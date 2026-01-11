/**
 * WebSocket Composable - WsMini PubSub Connection
 *
 * Provides real-time WebSocket connection using WsMini WSClient.
 * Implements singleton pattern for shared connection across components.
 *
 * @module composables/useWebSocket
 *
 * Features:
 * - Automatic reconnection with retry limits
 * - Dynamic URL selection (dev vs prod)
 * - Channel subscription (observations, comments)
 * - Connection state management
 *
 * @example
 * const { connect, disconnect, connected, messages } = useWebSocket();
 * await connect(authToken);
 */
import { ref } from "vue";
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
  const envWs = import.meta.env.VITE_WS_URL || "";
  const envWsLocal = import.meta.env.VITE_WS_URL_LOCAL || "";
  let WS_URL = "";
  try {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      const isLocal =
        host === "localhost" || host === "127.0.0.1" || host === "";
      if (isLocal && envWsLocal) {
        WS_URL = envWsLocal;
      } else if (isLocal && !envWsLocal) {
        WS_URL = "ws://localhost:3000";
      } else if (!isLocal && envWs) {
        WS_URL = envWs;
      } else {
        // fallback to envWs or local
        WS_URL = envWs || envWsLocal || "ws://localhost:3000";
      }
    } else {
      WS_URL = envWs || envWsLocal || "ws://localhost:3000";
    }
  } catch (e) {
    WS_URL =
      import.meta.env.VITE_WS_URL ||
      import.meta.env.VITE_WS_URL_LOCAL ||
      "ws://localhost:3000";
  }
  console.log("ℹ️ useWebSocket selected WS_URL =", WS_URL);

  /**
   * Connect to WebSocket using WsMini WSClient
   * @param {string|null} token - Optional auth token
   */
  async function connect(token = null) {
    try {
      if (connected.value && ws.value) {
        console.log("ℹ️ WebSocket already connected, skipping connection");
        return;
      }

      console.log(`🔌 Attempting WebSocket connection to: ${WS_URL}`);

      // Create WsMini client
      ws.value = new WSClient(WS_URL);

      // Connect with token for authentication (WsMini handles it via subprotocol)
      await ws.value.connect(token || undefined);

      connected.value = true;
      error.value = null;
      reconnectAttempts.value = 0;
      console.log("✅ WebSocket connected with WSClient", token ? "(authenticated)" : "(anonymous)");

      // Subscribe to channels with callbacks
      await ws.value.sub("observations", (data) => {
        console.log("📨 Message observations:", data);
        // Create new array reference for Vue reactivity
        messages.value = [...messages.value, {
          channel: "observations",
          data,
          receivedAt: new Date().toISOString(),
        }];
      });

      await ws.value.sub("comments", (data) => {
        console.log("📨 Message comments:", data);
        // Create new array reference for Vue reactivity
        messages.value = [...messages.value, {
          channel: "comments",
          data,
          receivedAt: new Date().toISOString(),
        }];
      });

      console.log("✅ Subscribed to channels: observations, comments");
    } catch (err) {
      error.value = err.message;
      connected.value = false;
      console.error("❌ WebSocket connection error:", err);
      console.error(
        `⚠️ Verify that the backend server is accessible at ${WS_URL}`
      );

      // Automatic reconnection attempt
      if (reconnectAttempts.value < maxReconnectAttempts) {
        reconnectAttempts.value++;
        console.log(
          `🔄 Reconnection (${reconnectAttempts.value}/${maxReconnectAttempts}) in ${reconnectDelay / 1000}s...`
        );
        setTimeout(() => connect(token), reconnectDelay);
      } else {
        console.warn("⚠️ Maximum reconnection attempts reached");
        console.warn(`💡 Verify that the backend is accessible at ${WS_URL}`);
      }
    }
  }

  /**
   * Disconnect from WebSocket
   */
  function disconnect() {
    reconnectAttempts.value = maxReconnectAttempts; // Prevent auto-reconnection
    if (ws.value) {
      try {
        if (typeof ws.value.close === "function") ws.value.close();
        else if (typeof ws.value.disconnect === "function")
          ws.value.disconnect();
      } catch (e) {
        // ignore
      }
      ws.value = null;
      connected.value = false;
      console.log("🔌 WebSocket disconnected");
    }
  }

  /**
   * Subscribe to an additional channel
   * @param {string} channel - Channel name
   * @param {Function} callback - Message handler
   */
  async function subscribe(channel, callback) {
    if (ws.value && connected.value) {
      try {
        await ws.value.sub(channel, callback);
        console.log(`📡 Subscribed to channel: ${channel}`);
      } catch (err) {
        console.error(`❌ Error subscribing to channel ${channel}:`, err);
      }
    }
  }

  /**
   * Unsubscribe from a channel
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
