# Architecture Overview

Phenom is built as a modern, scalable full-stack application following a clean separation of concerns with a RESTful API backend, real-time WebSocket communication, and a reactive frontend.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Vue.js 3 SPA (Vite + Tailwind CSS)           │  │
│  │  ┌──────────┬──────────┬──────────┬────────────┐    │  │
│  │  │  Views   │ Components│ Stores   │ Composables│    │  │
│  │  │ (Pages)  │  (UI)     │ (Pinia)  │  (Logic)   │    │  │
│  │  └──────────┴──────────┴──────────┴────────────┘    │  │
│  └────────────────────┬─────────────────────────────────┘  │
└───────────────────────┼─────────────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
    HTTP/REST                      WebSocket
    (Axios)                        (WsMini)
         │                             │
┌────────┴─────────────────────────────┴───────────────────────┐
│                    API Gateway Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      Express.js 4 Server (Node.js 18+)               │   │
│  │  ┌──────────┬──────────┬─────────────────────────┐  │   │
│  │  │ Middleware│ Routes   │ WebSocket (WsMini)      │  │   │
│  │  │ (Auth,    │ (REST    │ (PubSub Channels)       │  │   │
│  │  │  CORS,    │  API)    │                         │  │   │
│  │  │  Rate     │          │                         │  │   │
│  │  │  Limit)   │          │                         │  │   │
│  │  └──────────┴──────────┴─────────────────────────┘  │   │
│  └────────────────────┬─────────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
    Business Logic              Services Layer
         │                             │
┌────────┴─────────────────────────────┴───────────────────────┐
│                   Application Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 Controllers                          │   │
│  │  ┌──────┬──────┬─────────┬────────┬───────┬──────┐  │   │
│  │  │ Auth │ User │Observation│Comment│Image │Admin │  │   │
│  │  └──────┴──────┴─────────┴────────┴───────┴──────┘  │   │
│  └──────────────────────┬───────────────────────────────┘   │
│  ┌──────────────────────┴───────────────────────────────┐   │
│  │                   Services                           │   │
│  │  ┌──────┬──────┬─────────┬────────┬───────┬──────┐  │   │
│  │  │ Auth │ User │Observation│Comment│Image │Admin │  │   │
│  │  └──────┴──────┴─────────┴────────┴───────┴──────┘  │   │
│  └──────────────────────┬───────────────────────────────┘   │
└───────────────────────┼─────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────┐
│                  Data Layer                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              MongoDB Atlas (Cloud)                   │   │
│  │  ┌─────────────┬──────────────┬──────────────────┐  │   │
│  │  │   Users     │ Observations │    Comments      │  │   │
│  │  │ Collection  │  Collection  │   Collection     │  │   │
│  │  └─────────────┴──────────────┴──────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                 External Services                            │
│  ┌─────────────────────┬────────────────────────────────┐   │
│  │   Cloudinary CDN    │  OpenStreetMap Tiles           │   │
│  │  (Image Storage)    │  (Map Rendering)               │   │
│  └─────────────────────┴────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend (Vue.js 3)

**Purpose**: Single Page Application providing the user interface.

**Key Technologies**:
- Vue.js 3.4 with Composition API
- Vite 5 for fast builds
- Pinia 2 for state management
- Vue Router 4 for navigation
- Tailwind CSS 3.4 for styling
- Leaflet 1.9 for maps
- Axios for HTTP requests

**Structure**:
```
frontend/src/
├── components/     # Reusable UI components
├── views/          # Page components (routes)
├── stores/         # Pinia stores (state)
├── composables/    # Reusable composition functions
├── services/       # API client services
├── router/         # Vue Router configuration
├── utils/          # Helper functions
└── constants/      # Application constants
```

### 2. Backend (Node.js + Express)

**Purpose**: RESTful API and WebSocket server.

**Key Technologies**:
- Node.js 18+
- Express.js 4.18
- Mongoose 8 (MongoDB ODM)
- JWT for authentication
- WsMini for WebSocket
- Cloudinary for image storage
- Swagger/OpenAPI for documentation

**Structure**:
```
backend/src/
├── app.js              # Main application entry
├── config/             # Configuration modules
│   ├── database.js     # MongoDB connection
│   ├── jwt.js          # JWT utilities
│   ├── websocket.js    # WebSocket setup
│   ├── cloudinary.js   # Cloudinary config
│   └── swagger.js      # API documentation
├── controllers/        # Request handlers
├── services/           # Business logic
├── models/             # Mongoose schemas
├── routes/             # API routes
├── middleware/         # Custom middleware
├── validators/         # Request validation
└── utils/              # Helper functions
```

### 3. Database (MongoDB Atlas)

**Purpose**: Cloud-hosted NoSQL database.

**Collections**:
- **users**: User accounts and profiles
- **observations**: UFO observation reports
- **comments**: User comments on observations

**Indexes**:
- Geospatial 2dsphere index on observation locations
- Text search indexes on titles and descriptions
- Compound indexes for common queries

### 4. External Services

#### Cloudinary
- **Purpose**: CDN for image storage and optimization
- **Features**: Automatic compression, format conversion, responsive images
- **Integration**: Direct upload from backend, secure URLs

#### OpenStreetMap
- **Purpose**: Map tiles for Leaflet visualization
- **Features**: Free, open-source map data
- **Integration**: Client-side tile loading

## Communication Patterns

### REST API (HTTP)

**Request Flow**:
1. Client sends HTTP request (GET, POST, PUT, DELETE)
2. Express middleware processes request (CORS, auth, validation)
3. Route handler forwards to controller
4. Controller calls service layer
5. Service interacts with database/external services
6. Response flows back through layers

**Authentication**:
- JWT Bearer token in `Authorization` header
- Access token (1 hour expiry)
- Refresh token (7 days expiry)

### WebSocket (Real-time)

**Connection Flow**:
1. Client establishes WebSocket connection
2. Client subscribes to channels (`observations`, `comments`)
3. Server publishes events when data changes
4. All subscribed clients receive updates

**Event Types**:
- `observation:created` - New observation posted
- `observation:updated` - Observation modified
- `observation:deleted` - Observation removed
- `comment:created` - New comment posted
- `comment:updated` - Comment modified
- `comment:deleted` - Comment removed

**Implementation**: WsMini PubSub pattern (server-only publishing)

## Data Flow Examples

### Creating an Observation

```
User fills form → Frontend validation
    ↓
Upload images → Cloudinary API
    ↓
POST /api/v1/observations
    ↓
JWT auth middleware → Validate token
    ↓
Request validation → Check required fields
    ↓
Observation service → Create in MongoDB
    ↓
WebSocket publish → Notify all clients
    ↓
Response with created observation
    ↓
Frontend updates UI + local state
```

### Real-time Comment Updates

```
User posts comment → POST /api/v1/observations/:id/comments
    ↓
Comment created in MongoDB
    ↓
WebSocket server publishes: comment:created
    ↓
All clients subscribed to 'comments' channel receive event
    ↓
Clients update UI without page refresh
```

## Security Layers

1. **Network Security**
   - HTTPS in production
   - CORS configured for allowed origins
   - Helmet.js for HTTP headers

2. **Authentication & Authorization**
   - JWT tokens with expiration
   - Refresh token rotation
   - Role-based access control (admin/viewer)

3. **Input Validation**
   - Express-validator on all endpoints
   - Mongoose schema validation
   - File type and size restrictions

4. **Rate Limiting**
   - General: 100 requests/15min
   - Auth endpoints: 5 attempts/15min
   - Create endpoints: 20/hour

5. **Data Protection**
   - Password hashing with bcrypt (10 rounds)
   - MongoDB injection prevention
   - XSS protection via sanitization

## Scalability Considerations

### Current Implementation
- Stateless API (horizontally scalable)
- MongoDB Atlas (managed scaling)
- Cloudinary CDN (global distribution)
- WebSocket connection pooling

### Future Enhancements
- Redis for caching and sessions
- Load balancer for multiple instances
- Database replication and sharding
- Message queue for async processing

## Deployment Architecture

### Development
- Docker Compose orchestration
- Local MongoDB container (optional)
- Hot reload for frontend (Vite)
- Nodemon for backend auto-restart

### Production
- Frontend: Static hosting (Render, Vercel, Netlify)
- Backend: Container deployment (Render, Railway, Heroku)
- Database: MongoDB Atlas (M0 Free → M10 Dedicated)
- Images: Cloudinary CDN

## Monitoring & Logging

- **Backend**: Morgan HTTP logger
- **Database**: MongoDB Atlas monitoring
- **Errors**: Centralized error handler
- **Health Check**: `/health` endpoint
- **API Docs**: Real-time Swagger documentation

## Related Documentation

- [Backend Architecture](Backend-Architecture) - Detailed backend structure
- [Frontend Architecture](Frontend-Architecture) - Detailed frontend structure
- [Database Schema](Database-Schema) - MongoDB collections and models
- [API Reference](API-Reference) - Complete API documentation
- [WebSocket Integration](WebSocket-Integration) - Real-time features
