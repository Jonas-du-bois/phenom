import { WSServerPubSub } from 'wsmini';
import { verifyToken } from '../config/jwt.js';
import User from '../models/User.js';

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
  console.log('🔌 Configuration du serveur WebSocket avec WsMini...');

  // Validate CORS configuration for production
  if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
    console.error(
      '❌ Erreur critique : La variable d\'environnement CORS_ORIGIN n\'est pas définie pour le serveur WebSocket en production.'
    );
    console.error('Veuillez définir CORS_ORIGIN.');
    process.exit(1);
  }

  const corsOrigin = process.env.CORS_ORIGIN || '';
  const allowedOrigins = corsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  console.log(
    `🔐 CORS Origins configuré pour WebSocket: ${allowedOrigins.join(', ')}`
  );

  wss = new WSServerPubSub({
    origins: allowedOrigins.includes('*') ? ['*'] : allowedOrigins,
    maxNbOfClients: 1000,
    maxInputSize: 100000,
    pingTimeout: 30000,
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    // Authentication callback - called when a client connects with a token
    authCallback: async (token, request, wsServer) => {
      // Allow anonymous connections for public data
      if (!token) {
        console.log('ℹ️ Connexion WebSocket anonyme acceptée');
        return { anonymous: true };
      }

      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
          console.log('❌ Authentification WebSocket échouée: utilisateur non trouvé.');
          return false;
        }

        console.log(`✅ Utilisateur ${user.name || user.email} authentifié pour WebSocket.`);
        return {
          userId: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        };
      } catch (error) {
        console.log('❌ Authentification WebSocket échouée: token invalide.', error.message);
        // Return metadata for anonymous access instead of rejecting
        return { anonymous: true, authError: error.message };
      }
    }
  });

  // Add channels BEFORE start()
  wss.addChannel('observations', {
    usersCanPub: false,
    usersCanSub: true
  });

  wss.addChannel('comments', {
    usersCanPub: false,
    usersCanSub: true
  });

  // Start with the existing HTTP server
  wss.start({ server });

  console.log('✅ Serveur WebSocket configuré et démarré (PubSub)');
  console.log('📡 WebSocket disponible sur le même port que le serveur HTTP');
  console.log('🔐 Canaux: observations, comments (serveur uniquement)');

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
    console.warn('⚠️ WebSocket non disponible pour publier');
    return;
  }

  const message = {
    type,
    data,
    timestamp: new Date().toISOString()
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
  publishToChannel('observations', type, data);
};

/**
 * Helper to publish comment events
 * @param {string} type - Event type (comment:created, comment:updated, comment:deleted)
 * @param {Object} data - Comment data
 */
export const publishCommentEvent = (type, data) => {
  publishToChannel('comments', type, data);
};

export default createWebSocketServer;
