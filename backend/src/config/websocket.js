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

  // Créer le serveur WebSocket avec PubSub selon la doc WsMini
  wss = new WSServerPubSub({
    httpServer: server, // Utiliser le même serveur HTTP
    channels: {
      observations: {
        usersCanPub: false // Seul le serveur peut publier
      },
      comments: {
        usersCanPub: false // Seul le serveur peut publier
      }
    }
  });

  console.log('✅ Serveur WebSocket configuré (PubSub)');

  return wss;
};

/**
 * Démarre le serveur WebSocket
 * ⚠️ Avec WsMini, le serveur WebSocket est automatiquement démarré
 * quand on crée l'instance avec httpServer
 */
export const startWebSocketServer = () => {
  if (wss) {
    console.log('✅ Serveur WebSocket opérationnel');
  } else {
    console.warn('⚠️ Serveur WebSocket non initialisé');
  }
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
    wss.pub(channel, JSON.stringify(message));
    console.log(`📤 Message publié sur ${channel}:`, type);
  } catch (error) {
    console.error(`❌ Erreur lors de la publication sur ${channel}:`, error);
  }
};

export default createWebSocketServer;
