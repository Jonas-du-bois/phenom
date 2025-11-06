// ===================================================================
// IMPORTANT : Charger .env AVANT tous les autres imports
// ===================================================================
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// ===================================================================
// Imports après chargement de .env
// ===================================================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { connectDB } from './config/database.js';
import { validateJwtConfig } from './config/jwt.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import {
  createWebSocketServer,
  startWebSocketServer
} from './config/websocket.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

// Valider la configuration JWT
validateJwtConfig();

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Middleware de logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Middleware de sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting global
app.use(generalLimiter);

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: '3.1.2'
  });
});

// Route de base
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Phenom API - UFO Observation Platform',
    version: '3.1.2',
    documentation: '/api-docs',
    endpoints: {
      health: '/health',
      api: API_PREFIX,
      docs: '/api-docs'
    }
  });
});

// Documentation Swagger
// Page d'accueil de la documentation
app.get('/api-docs', (req, res) => {
  const htmlPath = join(__dirname, 'public', 'docs', 'index.html');
  res.sendFile(htmlPath);
});

// Documentation REST (Swagger)
app.use('/api-docs/rest', swaggerUi.serve);
app.get('/api-docs/rest', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Phenom REST API Documentation',
  customfavIcon: '/favicon.ico'
}));

// Documentation WebSocket (AsyncAPI) - Page HTML avec iframe vers AsyncAPI Studio
app.get('/api-docs/websocket', (req, res) => {
  // Définir un CSP qui autorise l'iframe vers studio.asyncapi.com
  const csp = 'default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; frame-src https://studio.asyncapi.com; img-src \'self\' data:; connect-src \'self\' https://studio.asyncapi.com';
  res.setHeader('Content-Security-Policy', csp);

  const htmlPath = join(__dirname, 'public', 'docs', 'websocket.html');
  res.sendFile(htmlPath);
});

// Servir le loader JS pour la page WebSocket
app.get('/api-docs/websocket/loader.js', (req, res) => {
  const jsPath = join(__dirname, 'public', 'docs', 'loader.js');
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(jsPath);
});

// Endpoint pour servir la spec AsyncAPI en JSON (parsée depuis YAML)
app.get('/api-docs/websocket/spec', (req, res) => {
  try {
    const yamlPath = join(__dirname, 'config', 'asyncapi.yaml');
    const yamlContent = readFileSync(yamlPath, 'utf8');
    const asyncApiSpec = yaml.load(yamlContent);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(asyncApiSpec);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement de la spec AsyncAPI',
      error: err.message
    });
  }
});

// Endpoint pour exporter le spec OpenAPI en JSON
app.get('/openapi.json', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    // swaggerSpec est l'objet retourné par swagger-jsdoc
    res.status(200).send(swaggerSpec);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Impossible de générer le spec OpenAPI', error: err.message });
  }
});

// Routes API
app.use(API_PREFIX, routes);

// Gestion des routes non trouvées
app.use(notFound);

// Gestion centralisée des erreurs
app.use(errorHandler);

// Démarrage du serveur
const startServer = async () => {
  try {
    // Connexion à MongoDB
    await connectDB();

    // Démarrage du serveur HTTP
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('='.repeat(50));
      console.log('🚀 Serveur Phenom API démarré avec succès');
      console.log('='.repeat(50));
      console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT} ou https://phenom-backend.onrender.com/`);
      console.log(`📚 Documentation: http://localhost:${PORT}/api-docs ou https://phenom-backend.onrender.com/api-docs`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health ou https://phenom-backend.onrender.com/health`);
      console.log(`🔌 API Endpoints: http://localhost:${PORT}${API_PREFIX} ou https://phenom-backend.onrender.com${API_PREFIX}`);
      console.log('='.repeat(50));
    });

    // Créer le serveur WebSocket sur le MÊME serveur HTTP
    createWebSocketServer(server);
    startWebSocketServer();
    console.log(`🔌 WebSocket opérationnel sur le même port (${PORT})`);

  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error.message);
    process.exit(1);
  }
};

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM reçu, fermeture gracieuse...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n👋 SIGINT reçu, fermeture gracieuse...');
  process.exit(0);
});

// Démarrer le serveur uniquement si ce n'est pas un import
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
