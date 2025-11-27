// ===================================================================
// IMPORTANT: Load .env BEFORE any other imports
// ===================================================================
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// ===================================================================
// Imports after .env loading
// ===================================================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { connectDB } from './config/database.js';
import { validateJwtConfig } from './config/jwt.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import {
  createWebSocketServer
} from './config/websocket.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

// Utility function to resolve file paths
// Compatible with local development and Render deployment
const resolveFilePath = (relativePath) => {
  const localPath = join(__dirname, relativePath);
  if (existsSync(localPath)) {
    return localPath;
  }

  // Fallback for Render or other environments
  const alternativePath = join(process.cwd(), 'src', relativePath);
  if (existsSync(alternativePath)) {
    return alternativePath;
  }

  return null;
};

// Validate JWT configuration
validateJwtConfig();

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Secure CORS configuration
// In production, CORS_ORIGIN must not be empty or undefined.
if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
  console.error('❌ Critical Error: CORS_ORIGIN environment variable is not defined in production.');
  console.error('Server cannot start with insecure CORS configuration.');
  console.error('Please define CORS_ORIGIN with allowed domains (comma separated).');
  process.exit(1);
}

// Allowed origins from environment variable
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : [];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without origin (e.g. Postman) and allowed origins
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('This origin is not allowed by CORS policy.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser for HttpOnly refresh tokens
app.use(cookieParser());

// Protection against MongoDB NoSQL injection
app.use(mongoSanitize());

// Global Rate limiting
app.use(generalLimiter);

// Health check route
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

// Base route
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

// Swagger Documentation
// Documentation homepage
app.get('/api-docs', (req, res) => {
  const htmlPath = resolveFilePath('public/docs/index.html');

  if (htmlPath) {
    res.sendFile(htmlPath);
  } else {
    res.status(404).json({
      success: false,
      error: 'Documentation index.html not found',
      __dirname,
      cwd: process.cwd()
    });
  }
});

// REST Documentation (Swagger)
app.use('/api-docs/rest', swaggerUi.serve);
app.get('/api-docs/rest', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Phenom REST API Documentation',
  customfavIcon: '/favicon.ico'
}));

// WebSocket Documentation (AsyncAPI) - HTML page with iframe to AsyncAPI Studio
app.get('/api-docs/websocket', (req, res) => {
  // CSP allowing iframe to studio.asyncapi.com
  const csp = 'default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; frame-src https://studio.asyncapi.com; img-src \'self\' data:; connect-src \'self\' https://studio.asyncapi.com';
  res.setHeader('Content-Security-Policy', csp);

  const htmlPath = resolveFilePath('public/docs/websocket.html');

  if (htmlPath) {
    res.sendFile(htmlPath);
  } else {
    res.status(404).json({
      success: false,
      error: 'websocket.html not found'
    });
  }
});

// Serve loader JS for WebSocket page
app.get('/api-docs/websocket/loader.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');

  const jsPath = resolveFilePath('public/docs/loader.js');

  if (jsPath) {
    res.sendFile(jsPath);
  } else {
    res.status(404).send('// loader.js not found');
  }
});

// Endpoint to serve AsyncAPI spec in JSON (parsed from YAML)
app.get('/api-docs/websocket/spec', (req, res) => {
  try {
    // Add CORS headers to allow AsyncAPI Studio to access the spec
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const yamlPath = resolveFilePath('config/asyncapi.yaml');

    if (!yamlPath) {
      return res.status(404).json({
        success: false,
        error: 'asyncapi.yaml not found'
      });
    }

    const yamlContent = readFileSync(yamlPath, 'utf8');
    const asyncApiSpec = yaml.load(yamlContent);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(asyncApiSpec);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error loading AsyncAPI spec',
      error: err.message
    });
  }
});

// Handle OPTIONS requests for CORS preflight
app.options('/api-docs/websocket/spec', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(204).end();
});

// Endpoint to export OpenAPI spec in JSON
app.get('/openapi.json', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    // swaggerSpec is the object returned by swagger-jsdoc
    res.status(200).send(swaggerSpec);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to generate OpenAPI spec', error: err.message });
  }
});

// API Routes
app.use(API_PREFIX, routes);

// Handle 404
app.use(notFound);

// Centralized error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create HTTP server WITHOUT listening immediately
    const http = await import('http');
    const server = http.createServer(app);

    // Create and start WebSocket server (wss.start() is called inside)
    createWebSocketServer(server);

    // Now make the HTTP server listen (with WebSocket attached)
    server.listen(PORT, '0.0.0.0', () => {
      console.log('='.repeat(50));
      console.log('🚀 Phenom API Server started successfully');
      console.log('='.repeat(50));
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT} or https://phenom-backend.onrender.com/`);
      console.log(`📚 Documentation: http://localhost:${PORT}/api-docs or https://phenom-backend.onrender.com/api-docs`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health or https://phenom-backend.onrender.com/health`);
      console.log(`🔌 API Endpoints: http://localhost:${PORT}${API_PREFIX} or https://phenom-backend.onrender.com${API_PREFIX}`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT} (same port as HTTP)`);
      console.log('='.repeat(50));
    });

  } catch (error) {
    console.error('❌ Error starting server:', error.message);
    process.exit(1);
  }
};

// Unhandled Rejection
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

// Uncaught Exception
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received, graceful shutdown...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n👋 SIGINT received, graceful shutdown...');
  process.exit(0);
});

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
