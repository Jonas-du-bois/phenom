import { createWebSocketServer, startWebSocketServer, publishToChannel } from '../src/config/websocket.js';
import http from 'http';

describe('WebSocket Configuration', () => {
  let server;
  let wss;

  beforeEach(() => {
    // Créer un serveur HTTP de test
    server = http.createServer();
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
  });

  describe('createWebSocketServer', () => {
    it('should create a WebSocket server with PubSub', () => {
      wss = createWebSocketServer(server);

      expect(wss).toBeDefined();
      expect(wss.pub).toBeDefined();
    });

    it('should configure channels correctly', () => {
      wss = createWebSocketServer(server);

      expect(wss).toBeDefined();
      // Vérifier que le serveur est configuré avec PubSub
      expect(typeof wss.pub).toBe('function');
    });
  });

  describe('startWebSocketServer', () => {
    it('should start the WebSocket server', () => {
      wss = createWebSocketServer(server);

      // Juste vérifier que la fonction s'exécute sans erreur
      expect(() => startWebSocketServer()).not.toThrow();
    });
  });

  describe('publishToChannel', () => {
    it('should publish message to channel without error', () => {
      wss = createWebSocketServer(server);

      const testData = { id: '123', title: 'Test' };

      // Vérifier que la fonction s'exécute sans erreur
      expect(() => publishToChannel('observations', 'observation:created', testData)).not.toThrow();
    });

    it('should handle publishing when WebSocket is not available', () => {
      // Ne pas créer de serveur WebSocket

      // Vérifier que la fonction gère gracieusement l'absence de WebSocket
      expect(() => publishToChannel('observations', 'observation:created', { id: '789' })).not.toThrow();
    });
  });
});
