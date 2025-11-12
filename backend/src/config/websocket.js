import { WSServerPubSub } from 'wsmini';

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

  const corsOrigin = process.env.CORS_ORIGIN || '*';
  console.log(`🔐 CORS Origins configuré: ${corsOrigin}`);

  wss = new WSServerPubSub({
    origins: corsOrigin,
    maxNbOfClients: 1000,
    maxInputSize: 100000,
    pingTimeout: 30000,
    logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info'
  });

  // Ajouter les canaux AVANT start()
  wss.addChannel('observations', {
    usersCanPub: false,
    usersCanSub: true
  });

  wss.addChannel('comments', {
    usersCanPub: false,
    usersCanSub: true
  });

  // Démarrer avec le serveur HTTP existant
  wss.start({ server });

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
