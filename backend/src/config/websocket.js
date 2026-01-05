import { WSServerPubSub } from "wsmini";
import { verifyToken } from "../config/jwt.js";
import User from "../models/User.js";
import url from "url";

/**
 * WebSocket server instance
 */
let wss = null;

/**
 * Creates the WebSocket server with WsMini PubSub
 * @param {http.Server} server - Existing HTTP server
 * @returns {WSServerPubSub}
 */
export const createWebSocketServer = (server) => {
  console.log("🔌 Configuration du serveur WebSocket avec WsMini...");

  // Validate CORS configuration for production
  if (process.env.NODE_ENV === "production" && !process.env.CORS_ORIGIN) {
    console.error(
      "❌ Erreur critique : La variable d'environnement CORS_ORIGIN n'est pas définie pour le serveur WebSocket en production."
    );
    console.error("Veuillez définir CORS_ORIGIN.");
    process.exit(1);
  }

  const corsOrigin = process.env.CORS_ORIGIN || "";
  const allowedOrigins = corsOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  console.log(
    `🔐 CORS Origins configuré pour WebSocket: ${allowedOrigins.join(", ")}`
  );

  wss = new WSServerPubSub({
    origins: allowedOrigins.includes("*") ? ["*"] : allowedOrigins,
    maxNbOfClients: 1000,
    maxInputSize: 100000,
    pingTimeout: 30000,
    logLevel: process.env.NODE_ENV === "production" ? "warn" : "info",
  });

  // Add channels BEFORE start()
  wss.addChannel("observations", {
    usersCanPub: false,
    usersCanSub: true,
    // TODO: Add authorization logic if needed
  });

  wss.addChannel("comments", {
    usersCanPub: false,
    usersCanSub: true,
    // TODO: Add authorization logic if needed
  });

  // Start with the existing HTTP server
  wss.start({ server });

  // Hook for authentication during connection
  // Based on the assumption that wss.httpServer is the underlying 'ws' server
  if (wss.httpServer) {
    wss.httpServer.on("upgrade", async (request, socket, head) => {
      console.log("Tentative de mise à niveau WebSocket...");
      const { query } = url.parse(request.url, true);
      const token = query.token;

      if (!token) {
        console.log("❌ Authentification WebSocket échouée: token manquant.");
        socket.destroy();
        return;
      }

      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
          console.log(
            "❌ Authentification WebSocket échouée: utilisateur non trouvé."
          );
          socket.destroy();
          return;
        }

        // Store the user on the request to pass it to the client
        request.user = user;
        console.log(
          `✅ Utilisateur ${user.username} authentifié pour WebSocket.`
        );

        // Let wsmini handle the final upgrade
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      } catch (error) {
        console.log(
          "❌ Authentification WebSocket échouée: token invalide ou expiré.",
          error.message
        );
        socket.destroy();
      }
    });
  }

  console.log("✅ Serveur WebSocket configuré et démarré (PubSub)");
  console.log("📡 WebSocket disponible sur le même port que le serveur HTTP");
  console.log("🔐 Canaux: observations, comments (serveur uniquement)");

  return wss;
};

/**
 * Publishes a message to a WebSocket channel
 * @param {string} channel - Channel name (observations or comments)
 * @param {string} type - Event type
 * @param {Object} data - Data to send
 */
export const publishToChannel = (channel, type, data) => {
  if (!wss) {
    console.warn("⚠️ WebSocket non disponible pour publier");
    return;
  }

  const message = {
    type,
    data,
    timestamp: new Date().toISOString(),
  };

  try {
    // Use WsMini's pub method to publish to the channel
    // WsMini automatically sends the object in JSON format
    wss.pub(channel, message);
    console.log(`📤 Message publié sur ${channel}:`, type);
  } catch (error) {
    console.error(`❌ Erreur lors de la publication sur ${channel}:`, error);
  }
};

/**
 * Helper to publish observation events
 * @param {string} type - Event type (observation:created, observation:updated, observation:deleted)
 * @param {Object} data - Observation data
 */
export const publishObservationEvent = (type, data) => {
  publishToChannel("observations", type, data);
};

/**
 * Helper to publish comment events
 * @param {string} type - Event type (comment:created, comment:updated, comment:deleted)
 * @param {Object} data - Comment data
 */
export const publishCommentEvent = (type, data) => {
  publishToChannel("comments", type, data);
};

export default createWebSocketServer;
