# Backend Architecture

The Phenom backend is a Node.js/Express application that provides a RESTful API and WebSocket server for the UFO observation platform.

## Technology Stack

- **Runtime**: Node.js 18+ (LTS)
- **Framework**: Express.js 4.18
- **Database**: MongoDB with Mongoose 8.0
- **Authentication**: JWT (jsonwebtoken)
- **Image Processing**: Sharp 0.34
- **Image Storage**: Cloudinary
- **WebSocket**: WsMini 1.2.0
- **Validation**: Express-validator 7.0
- **Security**: Helmet, CORS, bcrypt
- **Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest 29 + Supertest

## Project Structure

```
backend/
├── src/
│   ├── app.js                    # Main application entry point
│   ├── config/                   # Configuration modules
│   │   ├── database.js           # MongoDB connection
│   │   ├── jwt.js                # JWT utilities
│   │   ├── websocket.js          # WebSocket server setup
│   │   ├── cloudinary.js         # Cloudinary configuration
│   │   ├── swagger.js            # Swagger/OpenAPI setup
│   │   ├── image.config.js       # Image processing config
│   │   └── asyncapi.yaml         # WebSocket API spec
│   ├── controllers/              # Request handlers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── observation.controller.js
│   │   ├── comment.controller.js
│   │   ├── admin.controller.js
│   │   └── image.controller.js
│   ├── services/                 # Business logic layer
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── observation.service.js
│   │   ├── comment.service.js
│   │   ├── admin.service.js
│   │   └── image.service.js
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js
│   │   ├── Observation.js
│   │   └── Comment.js
│   ├── routes/                   # API route definitions
│   │   ├── index.js              # Route aggregator
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── observation.routes.js
│   │   ├── comment.routes.js
│   │   ├── admin.routes.js
│   │   └── image.routes.js
│   ├── middleware/               # Custom middleware
│   │   ├── auth.js               # JWT authentication
│   │   ├── authorize.js          # Role-based authorization
│   │   ├── validate.js           # Request validation
│   │   ├── rateLimiter.js        # Rate limiting
│   │   └── errorHandler.js       # Centralized error handling
│   ├── validators/               # Validation schemas
│   │   ├── auth.validator.js
│   │   ├── user.validator.js
│   │   ├── observation.validator.js
│   │   ├── comment.validator.js
│   │   └── admin.validator.js
│   ├── utils/                    # Helper utilities
│   │   ├── response.js           # Standardized responses
│   │   ├── pagination.js         # Pagination helper
│   │   └── compress-image.js     # Image compression (legacy)
│   ├── constants/                # Application constants
│   │   └── observationTypes.js   # UFO phenomenon types
│   └── public/                   # Static files
│       └── docs/                 # API documentation HTML
│           ├── index.html
│           ├── websocket.html
│           └── loader.js
├── scripts/                      # Utility scripts
│   ├── seed.js                   # Database seeding
│   ├── create-admin.js           # Create admin user
│   ├── check-db-connection.js    # Test DB connection
│   └── export-swagger.js         # Export OpenAPI spec
├── tests/                        # Test suite
│   ├── setup.js                  # Test configuration
│   ├── auth.test.js
│   ├── user.test.js
│   ├── observation.test.js
│   ├── comment.test.js
│   ├── admin.test.js
│   └── websocket.test.js
├── Dockerfile                    # Development container
├── Dockerfile.prod               # Production container
├── package.json
├── jest.config.js
└── openapi.json                  # Generated OpenAPI spec
```

## Core Components

### 1. Application Entry (app.js)

The main application file initializes the Express server with all middleware and configurations.

**Key Features**:
- Environment variable loading from `.env`
- MongoDB connection
- Middleware stack setup
- Route registration
- WebSocket server initialization
- Error handling
- Graceful shutdown

**Middleware Stack** (in order):
1. Morgan (HTTP logging)
2. Helmet (security headers)
3. CORS (cross-origin requests)
4. Compression (gzip responses)
5. Body parser (JSON/URL-encoded)
6. Rate limiting (global)
7. Routes
8. 404 handler
9. Error handler

**Port Configuration**:
- Default: 3000
- Configurable via `PORT` environment variable
- WebSocket shares the same port

### 2. Configuration Modules

#### database.js
Manages MongoDB connection with Mongoose.

**Features**:
- Automatic Atlas/Local detection
- Connection pooling (5-10 connections)
- Auto-index management (disabled in production)
- Timeout configurations
- Graceful shutdown handling

**Environment Detection**:
```javascript
const isAtlas = uri.includes('mongodb+srv://');
```

#### jwt.js
JWT token generation and verification.

**Functions**:
- `validateJwtConfig()` - Validates JWT secrets at startup
- `generateAccessToken()` - Creates 1-hour access token
- `generateRefreshToken()` - Creates 7-day refresh token
- `verifyToken()` - Validates and decodes tokens
- `createTokenPayload()` - Formats user data for token

**Token Payload**:
```javascript
{
  userId: string,
  email: string,
  role: 'admin' | 'viewer'
}
```

#### websocket.js
WebSocket server using WsMini PubSub.

**Channels**:
- `observations` - Observation updates
- `comments` - Comment updates

**Configuration**:
```javascript
{
  origins: CORS_ORIGIN,
  maxNbOfClients: 1000,
  maxInputSize: 100000,
  pingTimeout: 30000,
  logLevel: 'info' | 'warn'
}
```

**Permissions**:
- Users can **subscribe** to channels
- Only server can **publish** messages

**Helper Functions**:
- `publishObservationEvent(type, data)` - Publishes to observations channel
- `publishCommentEvent(type, data)` - Publishes to comments channel

#### cloudinary.js
Cloudinary CDN integration for image storage.

**Features**:
- Automatic image optimization
- Format auto-selection
- Size limiting (max 1920x1920)
- Quality adjustment (85%)
- HTTPS URLs

**Functions**:
- `uploadImage(buffer, options)` - Uploads image to Cloudinary
- `deleteImage(publicId)` - Removes single image
- `deleteImages(publicIds[])` - Batch deletion
- `getImageUrl(publicId, options)` - Generates optimized URL

**Storage Structure**:
- Folder: `phenom/observations/`
- Format: Auto-detected and optimized
- Transformations: Applied on upload

### 3. Data Models

#### User Model (User.js)

**Schema Fields**:
```javascript
{
  name: String (2-50 chars, required),
  email: String (unique, lowercase, validated),
  password: String (hashed, min 6 chars, not returned by default),
  role: Enum ['admin', 'viewer'] (default: 'viewer'),
  bio: String (max 500 chars, optional),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `email` (unique)
- `createdAt` (descending)

**Methods**:
- `comparePassword(candidatePassword)` - Verifies password
- `toSafeObject()` - Returns user without password

**Hooks**:
- `pre('save')` - Hashes password with bcrypt (10 rounds)

#### Observation Model (Observation.js)

**Schema Fields**:
```javascript
{
  title: String (3-100 chars, required),
  description: String (10-2000 chars, required),
  images: [{
    publicId: String (Cloudinary ID),
    url: String (Cloudinary HTTPS URL),
    size: Number (bytes),
    format: String (jpeg, png, webp),
    width: Number (pixels),
    height: Number (pixels),
    uploadedAt: Date
  }],
  location: {
    type: 'Point',
    coordinates: [longitude, latitude] (GeoJSON format)
  },
  userId: ObjectId (ref: User),
  date: Date (observation timestamp),
  type: Enum [27 phenomenon codes],
  tags: [String] (2-30 chars each),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `location` (2dsphere for geospatial queries)
- `userId, createdAt` (compound)
- `createdAt` (descending)
- `type`
- `tags`
- Text search on `title`, `description`, `tags`

**Virtual Fields**:
- `commentsCount` - Number of comments (populated)
- `comments` - Array of comment objects (populated)

**Observation Types**: 27 UFO phenomenon classification codes (WAV, TCH, HST, etc.)

#### Comment Model (Comment.js)

**Schema Fields**:
```javascript
{
  text: String (1-500 chars, required),
  observationId: ObjectId (ref: Observation),
  userId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `observationId, createdAt` (compound)
- `userId`
- `createdAt` (descending)

### 4. Controllers

Controllers handle HTTP requests and delegate to services.

**Pattern**:
```javascript
export const controllerFunction = async (req, res, next) => {
  try {
    // Extract parameters
    const data = req.body;
    const userId = req.user._id;
    
    // Call service
    const result = await service.doSomething(data);
    
    // Return response
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};
```

**Controllers**:
- `auth.controller.js` - Register, login, refresh, logout
- `user.controller.js` - Profile, update, delete
- `observation.controller.js` - CRUD operations, search, filters
- `comment.controller.js` - CRUD for comments
- `admin.controller.js` - Admin-only operations
- `image.controller.js` - Image upload/delete

### 5. Services

Services contain business logic and database operations.

**Responsibilities**:
- Data validation (business rules)
- Database queries
- External service calls (Cloudinary)
- WebSocket event publishing
- Error handling

**Example** (observation.service.js):
```javascript
export const createObservation = async (userId, observationData) => {
  // Validate coordinates
  // Create observation in DB
  // Publish WebSocket event
  // Return created observation
};
```

### 6. Middleware

#### auth.js - Authentication
Verifies JWT tokens and attaches user to request.

```javascript
export const authenticate = async (req, res, next) => {
  // Extract Bearer token
  // Verify JWT
  // Load user from DB
  // Attach to req.user
};
```

#### authorize.js - Authorization
Checks user roles for protected routes.

```javascript
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};
```

#### rateLimiter.js - Rate Limiting
Prevents abuse with configurable limits.

**Limiters**:
- `generalLimiter` - 100 req/15min (all routes)
- `authLimiter` - 5 req/15min (auth routes)
- `createLimiter` - 20 req/hour (create operations)

**Configuration**:
```javascript
{
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  skip: () => NODE_ENV === 'test'
}
```

#### errorHandler.js - Error Handling
Centralized error processing and response formatting.

**Handles**:
- Mongoose validation errors
- JWT errors (expired, invalid)
- MongoDB duplicate key errors
- Generic errors with stack traces (dev only)

### 7. Routes

Routes define API endpoints and apply middleware.

**Structure**:
```javascript
router.METHOD('/path',
  [middleware1, middleware2],
  validator,
  controller
);
```

**Route Modules**:
- `auth.routes.js` - `/api/v1/auth/*`
- `user.routes.js` - `/api/v1/users/*`
- `observation.routes.js` - `/api/v1/observations/*`
- `comment.routes.js` - `/api/v1/observations/:id/comments/*`
- `admin.routes.js` - `/api/v1/admin/*`
- `image.routes.js` - `/api/v1/images/*`

**Protection Levels**:
- Public: No authentication required
- Protected: `authenticate` middleware
- Admin: `authenticate` + `authorize('admin')`

### 8. Validators

Express-validator schemas for request validation.

**Features**:
- Field presence validation
- Type checking
- Format validation (email, ObjectId, coordinates)
- Length constraints
- Custom validators
- Sanitization

**Example**:
```javascript
export const createObservationValidator = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be 3-100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be 10-2000 characters'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be [lng, lat]')
];
```

## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Create new user account
- `POST /login` - Authenticate and get tokens
- `POST /refresh` - Refresh access token
- `POST /logout` - Invalidate refresh token

### Users (`/api/v1/users`)
- `GET /profile` - Get current user profile 🔐
- `PUT /profile` - Update profile 🔐
- `DELETE /profile` - Delete account 🔐
- `GET /:id` - Get user by ID (public)
- `GET /:id/observations` - Get user's observations (public)

### Observations (`/api/v1/observations`)
- `GET /` - List observations (filters, pagination)
- `GET /:id` - Get observation by ID
- `POST /` - Create observation 🔐
- `PUT /:id` - Update observation 🔐
- `DELETE /:id` - Delete observation 🔐
- `GET /search` - Full-text search

### Comments (`/api/v1/observations/:id/comments`)
- `GET /` - List comments for observation
- `POST /` - Create comment 🔐
- `PUT /:commentId` - Update comment 🔐
- `DELETE /:commentId` - Delete comment 🔐

### Admin (`/api/v1/admin`)
- `GET /stats` - System statistics 👑
- `GET /users` - List all users 👑
- `PATCH /users/:id/role` - Change user role 👑
- `DELETE /observations/:id` - Force delete observation 👑
- `DELETE /users/:id` - Delete user 👑

### Images (`/api/v1/images`)
- `POST /upload` - Upload to Cloudinary 🔐
- `DELETE /:publicId` - Delete from Cloudinary 🔐

🔐 = Requires authentication
👑 = Requires admin role

## Security Features

### 1. Authentication
- JWT with short-lived access tokens (1h)
- Long-lived refresh tokens (7d)
- Token blacklisting on logout
- Secure password hashing (bcrypt, 10 rounds)

### 2. Authorization
- Role-based access control (RBAC)
- Resource ownership verification
- Admin-only routes protected

### 3. Input Validation
- Express-validator on all inputs
- Mongoose schema validation
- File type and size restrictions
- Coordinate bounds checking

### 4. Rate Limiting
- IP-based throttling
- Different limits for different routes
- Disabled in test environment

### 5. Security Headers
- Helmet.js for HTTP headers
- CORS with origin whitelist
- Content Security Policy (CSP)
- Cross-Origin Resource Policy

### 6. Data Protection
- Passwords never returned in responses
- Sensitive fields excluded (`select: false`)
- MongoDB injection prevention
- XSS sanitization

## Configuration

### Environment Variables

See [Environment Variables](Environment-Variables) for complete list.

**Critical Variables**:
- `MONGODB_URI` - Database connection string
- `JWT_SECRET` - Access token secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `CLOUDINARY_URL` - Image CDN credentials
- `CORS_ORIGIN` - Allowed frontend origins

### Application Constants

**Observation Types**: 27 predefined UFO phenomenon codes
**Pagination**: Default 10, max 100 per page
**Image Limits**: Max 10MB, 1920x1920px, 85% quality
**Token Expiry**: 1h access, 7d refresh

## Testing

### Test Suite
- **Framework**: Jest 29
- **HTTP Testing**: Supertest
- **Coverage**: ~80% target
- **Environment**: Separate test database

### Test Files
- `auth.test.js` - Authentication flows
- `user.test.js` - User CRUD
- `observation.test.js` - Observation CRUD and search
- `comment.test.js` - Comment operations
- `admin.test.js` - Admin features
- `websocket.test.js` - WebSocket events

### Running Tests
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

## Deployment

### Docker
- **Development**: `Dockerfile` with hot reload
- **Production**: `Dockerfile.prod` with multi-stage build
- **Base Image**: `node:20-alpine`
- **User**: Non-root user `phenom`
- **Health Check**: `/health` endpoint

### Production Considerations
- Set `NODE_ENV=production`
- Use strong JWT secrets (32+ characters)
- Configure `CORS_ORIGIN` to frontend domain
- Use MongoDB Atlas (not local)
- Enable MongoDB auth and whitelist IPs
- Set appropriate rate limits
- Monitor error logs

## API Documentation

### Swagger/OpenAPI
- **URL**: `/api-docs`
- **Spec**: OpenAPI 3.0.4
- **Interactive**: Swagger UI
- **Export**: `/openapi.json`

### AsyncAPI (WebSocket)
- **URL**: `/api-docs/websocket`
- **Spec**: AsyncAPI 2.6.0
- **Viewer**: AsyncAPI Studio (iframe)
- **Export**: `/api-docs/websocket/spec`

## Related Documentation

- [API Reference](API-Reference) - Complete endpoint documentation
- [Database Schema](Database-Schema) - MongoDB models
- [WebSocket Integration](WebSocket-Integration) - Real-time features
- [Environment Variables](Environment-Variables) - Configuration reference
