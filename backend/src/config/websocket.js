import { WSServerPubSub } from 'wsmini';
import { verifyToken } from '../config/jwt.js';
import User from '../models/User.js';
import url from 'url';

/**
 * Instance du serveur WebSocket
 */
let wss = null;

/**
 * Crée le serveur WebSocket avec WsMini PubSub
 * @param {http.Server} server - Serveur HTTP existant
 * @returns {WSServerPubSub}
 */
export const createWebSocketServer = (server) => {
  console.log('🔌 Configuration du serveur WebSocket avec WsMini...');

  // Valider la configuration CORS pour la production
  if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
    console.error('❌ Erreur critique : La variable d\'environnement CORS_ORIGIN n\'est pas définie pour le serveur WebSocket en production.');
    console.error('Veuillez définir CORS_ORIGIN.');
    process.exit(1);
  }

  const corsOrigin = process.env.CORS_ORIGIN || '';
  const allowedOrigins = corsOrigin.split(',').map(origin => origin.trim()).filter(Boolean);

  console.log(`🔐 CORS Origins configuré pour WebSocket: ${allowedOrigins.join(', ')}`);

  wss = new WSServerPubSub({
    origins: allowedOrigins.includes('*') ? ['*'] : allowedOrigins,
    maxNbOfClients: 1000,
    maxInputSize: 100000,
    pingTimeout: 30000,
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info'
  });

  // Ajouter les canaux AVANT start()
  wss.addChannel('observations', {
    usersCanPub: false,
    usersCanSub: true
    // TODO: Ajouter une logique d'autorisation si nécessaire
  });

  wss.addChannel('comments', {
    usersCanPub: false,
    usersCanSub: true
    // TODO: Ajouter une logique d'autorisation si nécessaire
  });

  // Démarrer avec le serveur HTTP existant
  wss.start({ server });

  // Hook pour l'authentification lors de la connexion
  // Basé sur l'hypothèse que wss.httpServer est le serveur sous-jacent de 'ws'
  if (wss.httpServer) {
    wss.httpServer.on('upgrade', async (request, socket, head) => {
      console.log('Tentative de mise à niveau WebSocket...');
      const { query } = url.parse(request.url, true);
      const token = query.token;

      if (!token) {
        console.log('❌ Authentification WebSocket échouée: token manquant.');
        socket.destroy();
        return;
      }

      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
          console.log('❌ Authentification WebSocket échouée: utilisateur non trouvé.');
          socket.destroy();
          return;
        }

        // Stocker l'utilisateur sur la requête pour le passer au client
        request.user = user;
        console.log(`✅ Utilisateur ${user.username} authentifié pour WebSocket.`);

        // Laisser wsmini gérer la mise à niveau finale
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });

      } catch (error) {
        console.log('❌ Authentification WebSocket échouée: token invalide ou expiré.', error.message);
        socket.destroy();
      }
    });
  }

  console.log('✅ Serveur WebSocket configuré et démarré (PubSub)');
  console.log('📡 WebSocket disponible sur le même port que le serveur HTTP');
  console.log('🔐 Canaux: observations, comments (serveur uniquement)');

  return wss;
};

/**
 * Publie un message sur un canal WebSocket
 * @param {string} channel - Nom du canal (observations ou comments)
 * @param {string} type - Type d'événement
 * @param {Object} data - Données à envoyer
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
    // Utiliser la méthode pub de WSmini pour publier sur le canal
    // WsMini envoie automatiquement l'objet au format JSON
    wss.pub(channel, message);
    console.log(`📤 Message publié sur ${channel}:`, type);
  } catch (error) {
    console.error(`❌ Erreur lors de la publication sur ${channel}:`, error);
  }
};

/**
 * Helper pour publier des événements d'observation
 * @param {string} type - Type d'événement (observation:created, observation:updated, observation:deleted)
 * @param {Object} data - Données de l'observation
 */
export const publishObservationEvent = (type, data) => {
  publishToChannel('observations', type, data);
};

/**
 * Helper pour publier des événements de commentaire
 * @param {string} type - Type d'événement (comment:created, comment:updated, comment:deleted)
 * @param {Object} data - Données du commentaire
 */
export const publishCommentEvent = (type, data) => {
  publishToChannel('comments', type, data);
};

export default createWebSocketServer;
