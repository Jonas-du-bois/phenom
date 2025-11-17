# Environment Variables

Phenom uses environment variables for configuration. This document lists all available variables for both backend and frontend.

## Configuration Files

### `.env` (Root Directory)

Main configuration file for both backend and frontend.

**Location**: `/phenom/.env`

**Template**: `.env.example` (copy and modify)

```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env  # or your preferred editor
```

## Backend Variables

### Required Variables

These variables **must** be set for the backend to function:

#### Database

```bash
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/phenom_dev?retryWrites=true&w=majority

# MongoDB Test database (for testing)
MONGODB_TEST_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/phenom_test?retryWrites=true&w=majority
```

**Format**: `mongodb+srv://` for Atlas, `mongodb://` for local

**Getting MongoDB Atlas URI**:
1. Create account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create cluster (M0 Free tier)
3. Database Access: Create user
4. Network Access: Add `0.0.0.0/0` (or specific IPs)
5. Connect → Drivers → Copy connection string
6. Replace `<password>` and database name

#### JWT Secrets

```bash
# JWT access token secret (for authentication)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# JWT refresh token secret (for token refresh)
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
```

**Security Requirements**:
- **Development**: Any string (min 6 chars)
- **Production**: 32+ characters, cryptographically random

**Generate Secure Secrets**:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -base64 64
```

#### Cloudinary

```bash
# Cloudinary CDN for image storage
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

**Format**: `cloudinary://API_KEY:API_SECRET@CLOUD_NAME`

**Getting Cloudinary URL**:
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Dashboard → Account Details
3. Copy "API Environment variable" (entire `CLOUDINARY_URL=...`)

### Optional Variables (with defaults)

#### Server Configuration

```bash
# Environment: development | production | test
NODE_ENV=development
# Default: development

# Server port
PORT=3000
# Default: 3000
```

#### JWT Configuration

```bash
# Access token expiration
JWT_EXPIRE=1h
# Default: 1h
# Format: "1h", "30m", "7d"

# Refresh token expiration
JWT_REFRESH_EXPIRE=7d
# Default: 7d
# Format: "1h", "30m", "7d"
```

#### CORS Configuration

```bash
# Allowed origins (comma-separated)
CORS_ORIGIN=http://localhost:5173,http://localhost:80,http://localhost:3000
# Default: *
# Production: Specific frontend URLs
```

**Examples**:
- Development: `http://localhost:5173,http://localhost:80`
- Production: `https://phenom-app.com,https://www.phenom-app.com`

#### Rate Limiting

```bash
# Rate limit window (milliseconds)
RATE_LIMIT_WINDOW_MS=900000
# Default: 900000 (15 minutes)

# Max requests per window
RATE_LIMIT_MAX_REQUESTS=100
# Default: 100
```

**Recommendations**:
- Development: 100-1000 requests
- Production: 50-100 requests (tighter)

#### File Upload

```bash
# Max file size (bytes)
MAX_FILE_SIZE=10485760
# Default: 10485760 (10MB)

# Allowed image types (comma-separated)
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
# Default: image/jpeg,image/png,image/webp

# Upload directory (legacy, not used with Cloudinary)
UPLOAD_DIR=uploads
# Default: uploads
```

#### Pagination

```bash
# Default page size
DEFAULT_PAGE_SIZE=10
# Default: 10

# Maximum page size
MAX_PAGE_SIZE=100
# Default: 100
```

#### Image Processing

```bash
# Image quality (0-100)
IMAGE_QUALITY=85
# Default: 85

# Max image width (pixels)
IMAGE_MAX_WIDTH=1920
# Default: 1920

# Max image height (pixels)
IMAGE_MAX_HEIGHT=1920
# Default: 1920

# Max image size (bytes)
IMAGE_MAX_SIZE=10485760
# Default: 10485760 (10MB)
```

**Format-Specific Quality**:
```bash
# JPEG quality (0-100)
JPEG_QUALITY=85
# Default: 85

# PNG quality (0-100)
PNG_QUALITY=85
# Default: 85

# WebP quality (0-100)
WEBP_QUALITY=85
# Default: 85
```

#### Debugging

```bash
# Image processing verbose logs
IMAGE_VERBOSE=false
# Default: false
# Set to 'true' for detailed image processing logs
```

#### API Configuration

```bash
# API prefix
API_PREFIX=/api/v1
# Default: /api/v1
```

## Frontend Variables

All frontend variables must be prefixed with `VITE_`.

### Required Variables

```bash
# Backend API base URL
VITE_API_BASE_URL=http://localhost:3000
# Development: http://localhost:3000
# Production: https://phenom-backend.onrender.com
```

### Optional Variables

```bash
# Application name
VITE_APP_NAME=Phenom
# Default: Phenom

# OpenStreetMap tiles URL
VITE_MAP_TILES_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
# Default: https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

**Alternative Map Tiles**:
- **OpenStreetMap**: `https://tile.openstreetmap.org/{z}/{x}/{y}.png` (default)
- **CartoDB**: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png`
- **Stamen Terrain**: `https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg`

## Docker Compose Variables

Additional variables for Docker Compose (local MongoDB):

```bash
# MongoDB root username (Docker only)
MONGO_ROOT_USERNAME=admin
# Default: admin

# MongoDB root password (Docker only)
MONGO_ROOT_PASSWORD=passw0rdi2Tr0is
# Default: passw0rdi2Tr0is

# MongoDB database name (Docker only)
MONGO_DB_NAME=phenom_dev
# Default: phenom_dev
```

**Note**: These are only used when running MongoDB in Docker (not MongoDB Atlas).

## Environment-Specific Configurations

### Development (.env.development)

```bash
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://...phenom_dev
JWT_SECRET=dev-secret-key
JWT_REFRESH_SECRET=dev-refresh-key
CORS_ORIGIN=http://localhost:5173,http://localhost:80
VITE_API_BASE_URL=http://localhost:3000
CLOUDINARY_URL=cloudinary://...
RATE_LIMIT_MAX_REQUESTS=1000
IMAGE_VERBOSE=true
```

### Testing (.env.test)

```bash
NODE_ENV=test
MONGODB_URI=mongodb+srv://...phenom_test
MONGODB_TEST_URI=mongodb+srv://...phenom_test
JWT_SECRET=test-secret-key
JWT_REFRESH_SECRET=test-refresh-key
RATE_LIMIT_MAX_REQUESTS=10000  # Higher for tests
```

### Production (.env.production)

```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://...phenom_production
JWT_SECRET=<64-char-random-string>
JWT_REFRESH_SECRET=<64-char-random-string>
CORS_ORIGIN=https://phenom-app.com
VITE_API_BASE_URL=https://phenom-backend.onrender.com
CLOUDINARY_URL=cloudinary://...
RATE_LIMIT_MAX_REQUESTS=50
IMAGE_VERBOSE=false
```

## Accessing Variables

### Backend (Node.js)

```javascript
// Load variables
import dotenv from 'dotenv'
dotenv.config()

// Access variables
const mongoUri = process.env.MONGODB_URI
const jwtSecret = process.env.JWT_SECRET
const port = process.env.PORT || 3000

// Check if variable exists
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined')
}
```

### Frontend (Vue.js/Vite)

```javascript
// Access VITE_ prefixed variables
const apiUrl = import.meta.env.VITE_API_BASE_URL
const appName = import.meta.env.VITE_APP_NAME

// Built-in Vite variables
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD
const mode = import.meta.env.MODE
```

**Important**: Only `VITE_` prefixed variables are exposed to the frontend.

## Security Best Practices

### DO

✅ **Use strong secrets in production**
```bash
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
```

✅ **Different secrets for different environments**
```bash
# Development
JWT_SECRET=dev-secret-123

# Production
JWT_SECRET=a1b2c3d4e5f6...
```

✅ **Restrict CORS in production**
```bash
# Development
CORS_ORIGIN=*

# Production
CORS_ORIGIN=https://phenom-app.com
```

✅ **Keep .env files out of git**
```bash
# .gitignore
.env
.env.local
.env.*.local
```

✅ **Use environment-specific files**
```
.env                 # Default values
.env.development     # Development overrides
.env.production      # Production overrides
.env.test            # Test overrides
```

### DON'T

❌ **Don't commit secrets to git**
```bash
# NEVER do this
git add .env
```

❌ **Don't use weak secrets in production**
```bash
# Too weak
JWT_SECRET=secret123
```

❌ **Don't expose backend variables to frontend**
```bash
# Won't work (no VITE_ prefix)
API_SECRET=xxx

# Use VITE_ prefix for frontend
VITE_API_URL=xxx
```

❌ **Don't hardcode secrets in code**
```javascript
// Bad
const jwtSecret = 'hardcoded-secret'

// Good
const jwtSecret = process.env.JWT_SECRET
```

## Validation

### Backend Validation

The app validates required variables on startup:

```javascript
// backend/src/config/jwt.js
export const validateJwtConfig = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not defined in .env')
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET not defined in .env')
  }
  
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET.length < 32) {
      console.warn('⚠️ JWT_SECRET should be at least 32 characters in production')
    }
  }
}
```

## Troubleshooting

### "MONGODB_URI not defined"

**Problem**: Missing MongoDB connection string.

**Solution**:
1. Check `.env` file exists
2. Verify `MONGODB_URI` is set
3. Ensure `.env` is in root directory (not `backend/` or `frontend/`)

### "JWT_SECRET not defined"

**Problem**: Missing JWT secret.

**Solution**:
1. Add `JWT_SECRET` to `.env`
2. Add `JWT_REFRESH_SECRET` to `.env`
3. Restart the server

### "CLOUDINARY_URL not defined"

**Problem**: Missing Cloudinary configuration.

**Solution**:
1. Sign up at cloudinary.com
2. Copy API Environment variable
3. Add to `.env`: `CLOUDINARY_URL=cloudinary://...`

### Frontend can't connect to API

**Problem**: Wrong API URL.

**Solution**:
1. Check `VITE_API_BASE_URL` in `.env`
2. Ensure it matches backend URL
3. Rebuild frontend: `npm run build`

### Environment variables not updating

**Problem**: Cached or not reloaded.

**Solution**:
1. Restart backend server
2. Rebuild frontend (Vite bundles at build time)
3. Clear Docker containers: `docker-compose down && docker-compose up`

## Variable Summary Table

| Variable | Required | Default | Environment |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | development | Backend |
| `PORT` | No | 3000 | Backend |
| `MONGODB_URI` | **Yes** | - | Backend |
| `MONGODB_TEST_URI` | For tests | - | Backend |
| `JWT_SECRET` | **Yes** | - | Backend |
| `JWT_REFRESH_SECRET` | **Yes** | - | Backend |
| `JWT_EXPIRE` | No | 1h | Backend |
| `JWT_REFRESH_EXPIRE` | No | 7d | Backend |
| `CLOUDINARY_URL` | **Yes** | - | Backend |
| `CORS_ORIGIN` | No | * | Backend |
| `RATE_LIMIT_WINDOW_MS` | No | 900000 | Backend |
| `RATE_LIMIT_MAX_REQUESTS` | No | 100 | Backend |
| `IMAGE_QUALITY` | No | 85 | Backend |
| `IMAGE_MAX_WIDTH` | No | 1920 | Backend |
| `IMAGE_MAX_HEIGHT` | No | 1920 | Backend |
| `MAX_FILE_SIZE` | No | 10485760 | Backend |
| `VITE_API_BASE_URL` | **Yes** | - | Frontend |
| `VITE_APP_NAME` | No | Phenom | Frontend |
| `VITE_MAP_TILES_URL` | No | OpenStreetMap | Frontend |

## Related Documentation

- [Getting Started](Getting-Started) - Initial setup
- [Backend Architecture](Backend-Architecture) - Backend configuration
- [Frontend Architecture](Frontend-Architecture) - Frontend configuration
- [Deployment Guide](Deployment-Guide) - Production deployment
- [Troubleshooting](Troubleshooting) - Common issues
