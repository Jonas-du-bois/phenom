# Troubleshooting

Common issues and solutions for Phenom development and deployment.

## Quick Diagnostics

### Check System Status

```bash
# Check all services
docker-compose ps

# Check backend health
curl http://localhost:3000/health

# Check MongoDB connection
docker-compose exec backend npm run check-db

# View all logs
docker-compose logs

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Installation & Setup Issues

### Docker Won't Start

**Symptoms**:
- `docker-compose up` fails
- Services won't start
- Port conflicts

**Solutions**:

1. **Docker Desktop not running**
   ```bash
   # Start Docker Desktop
   # On Mac: Open Docker Desktop app
   # On Windows: Open Docker Desktop app
   # On Linux: sudo systemctl start docker
   ```

2. **Port already in use**
   ```bash
   # Check what's using port 3000
   lsof -i :3000          # Mac/Linux
   netstat -ano | findstr :3000  # Windows
   
   # Kill process or change port in docker-compose.yml
   ```

3. **Docker daemon not accessible**
   ```bash
   # Restart Docker
   # Mac/Windows: Restart Docker Desktop
   # Linux: sudo systemctl restart docker
   ```

### MongoDB Connection Fails

**Symptoms**:
- Backend crashes on startup
- `MongooseServerSelectionError`
- `Connection refused`

**Check**:

```bash
# View backend logs
docker-compose logs backend | grep -i mongo

# Test MongoDB URI format
echo $MONGODB_URI
```

**Solutions**:

1. **Invalid MongoDB URI**
   ```bash
   # Correct format for Atlas:
   MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/dbname?retryWrites=true&w=majority
   
   # Verify no special characters in password (URL encode if needed)
   # Replace @ with %40, # with %23, etc.
   ```

2. **MongoDB Atlas Network Access**
   - Atlas Dashboard → Network Access
   - Add IP: `0.0.0.0/0` (allow from anywhere)
   - Wait 1-2 minutes for changes to propagate

3. **Wrong database name**
   ```bash
   # Ensure database name is in URI
   mongodb+srv://...mongodb.net/phenom_dev  # ← database name
   ```

4. **Authentication failed**
   - Verify username and password
   - Check user has read/write permissions
   - Atlas Dashboard → Database Access → Edit User

### Frontend Shows Blank Page

**Symptoms**:
- White screen in browser
- No errors in terminal
- Or "Failed to fetch" errors

**Check**:

```bash
# View frontend logs
docker-compose logs frontend

# Check browser console (F12)
# Look for errors
```

**Solutions**:

1. **Wrong API URL**
   ```bash
   # Check .env
   VITE_API_BASE_URL=http://localhost:3000  # Should match backend
   
   # Rebuild frontend
   docker-compose up -d --build frontend
   ```

2. **Backend not accessible**
   ```bash
   # Test backend
   curl http://localhost:3000/health
   
   # If fails, start backend
   docker-compose up -d backend
   ```

3. **CORS issues**
   - Check browser console for CORS errors
   - Verify `CORS_ORIGIN` in backend `.env`
   ```bash
   CORS_ORIGIN=http://localhost:5173,http://localhost:80,http://localhost:3000
   ```

4. **Build errors**
   ```bash
   # Rebuild from scratch
   docker-compose down
   docker-compose build --no-cache frontend
   docker-compose up -d frontend
   ```

### JWT/Authentication Errors

**Symptoms**:
- "JWT_SECRET not defined"
- "Token invalid" on every request
- Login fails immediately

**Solutions**:

1. **Missing JWT secrets**
   ```bash
   # Add to .env
   JWT_SECRET=your-secret-key-at-least-32-chars
   JWT_REFRESH_SECRET=your-other-secret-key-different
   
   # Restart backend
   docker-compose restart backend
   ```

2. **JWT secrets too short** (production warning)
   ```bash
   # Generate strong secrets
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Token expired**
   - Normal behavior after 1 hour
   - Frontend should auto-refresh
   - Or logout and login again

### Cloudinary Errors

**Symptoms**:
- "CLOUDINARY_URL not defined"
- Image upload fails
- `401 Unauthorized` on upload

**Solutions**:

1. **Missing Cloudinary URL**
   ```bash
   # Get from cloudinary.com dashboard
   # Add to .env
   CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
   
   # Restart backend
   docker-compose restart backend
   ```

2. **Invalid credentials**
   - Verify format: `cloudinary://KEY:SECRET@NAME`
   - No spaces or extra characters
   - Copy from Cloudinary dashboard directly

3. **Upload fails**
   - Check file size (max 10MB)
   - Check file type (JPEG, PNG, WebP only)
   - Check Cloudinary quota (free tier limits)

## Runtime Issues

### Images Not Displaying

**Symptoms**:
- Image upload succeeds but image doesn't show
- Broken image icons
- 404 errors for images

**Check**:

```bash
# Check Cloudinary URL in database
docker-compose exec backend mongosh $MONGODB_URI
> db.observations.findOne()
> # Look at images[0].url - should be https://res.cloudinary.com/...
```

**Solutions**:

1. **Invalid Cloudinary URLs**
   - Should start with `https://res.cloudinary.com/`
   - Check publicId is stored correctly

2. **CORS issues with Cloudinary**
   - Cloudinary URLs should work cross-origin
   - Check browser console for errors

3. **Deleted images**
   - Images deleted from Cloudinary but references remain
   - Clean up orphaned references

### WebSocket Not Working

**Symptoms**:
- Real-time updates don't appear
- Connection errors in console
- "WebSocket connection failed"

**Check**:

```bash
# Test WebSocket endpoint
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  http://localhost:3000
```

**Solutions**:

1. **Wrong WebSocket URL**
   ```javascript
   // Development
   ws://localhost:3000
   
   // Production (HTTPS)
   wss://phenom-backend.onrender.com
   ```

2. **Backend not configured**
   - Ensure WebSocket server is initialized
   - Check backend logs for WebSocket startup messages

3. **Firewall blocking**
   - Some firewalls block WebSocket
   - Try from different network

### Slow Performance

**Symptoms**:
- Pages load slowly
- API requests timeout
- High CPU/RAM usage

**Check**:

```bash
# Check Docker resource usage
docker stats

# Check MongoDB performance
# Atlas Dashboard → Metrics

# Check backend logs for slow queries
docker-compose logs backend | grep -i "slow"
```

**Solutions**:

1. **Too many observations**
   - Implement pagination (already built-in)
   - Limit results per page

2. **Missing database indexes**
   ```bash
   # Recreate indexes
   docker-compose exec backend npm run create-indexes
   
   # Or manually in MongoDB
   db.observations.createIndex({ location: "2dsphere" })
   db.observations.createIndex({ createdAt: -1 })
   ```

3. **Docker resource limits**
   - Increase Docker memory limit
   - Docker Desktop → Settings → Resources

4. **Network latency**
   - Check MongoDB Atlas region (use closest)
   - Check Cloudinary performance

### Comments Not Showing

**Symptoms**:
- Comments posted but don't appear
- Comment count is zero
- 404 when fetching comments

**Check**:

```bash
# Check if comments exist in DB
docker-compose exec backend mongosh $MONGODB_URI
> db.comments.find().limit(5)
```

**Solutions**:

1. **ObservationId mismatch**
   - Verify observationId in comment matches observation _id
   - Check frontend is sending correct ID

2. **Population issue**
   - Backend should populate comments virtual field
   - Or fetch separately via `/observations/:id/comments`

3. **WebSocket not updating**
   - Comments created but UI not refreshed
   - Check WebSocket connection
   - Refresh page manually

## Deployment Issues

### Render Deployment Fails

**Symptoms**:
- Build fails on Render
- Service crashes immediately
- "Deploy failed" status

**Check Render Logs**:
1. Dashboard → Service → Logs
2. Look for error messages

**Common Solutions**:

1. **Build command incorrect**
   ```bash
   # Backend
   Build Command: npm install
   Start Command: npm start
   
   # Frontend  
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

2. **Missing environment variables**
   - Check all required variables are set
   - No typos in variable names

3. **Node version mismatch**
   ```json
   // package.json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

4. **Port configuration**
   ```javascript
   // Backend should use PORT from env
   const PORT = process.env.PORT || 3000
   ```

### Production CORS Errors

**Symptoms**:
- Frontend can't connect to backend in production
- "CORS policy" errors in browser

**Solutions**:

1. **Update CORS_ORIGIN**
   ```bash
   # Backend .env on Render
   CORS_ORIGIN=https://phenom-frontend.onrender.com
   
   # Multiple origins
   CORS_ORIGIN=https://phenom-app.com,https://www.phenom-app.com
   ```

2. **Check frontend URL**
   - Must be exact match (with https://)
   - No trailing slash

3. **Redeploy backend**
   - Environment changes require redeploy
   - Render → Manual Deploy

### MongoDB Atlas Production Issues

**Symptoms**:
- Can't connect from Render
- Authentication errors
- Network timeout

**Solutions**:

1. **Network Access**
   - Atlas → Network Access
   - Add `0.0.0.0/0` (all IPs)
   - Or add specific Render IP ranges

2. **Connection string**
   ```bash
   # Must include database name
   mongodb+srv://user:pass@cluster.mongodb.net/phenom_production
   ```

3. **User permissions**
   - Database Access → User permissions
   - Ensure user has readWrite to database

## Development Issues

### Hot Reload Not Working

**Symptoms**:
- Changes don't reflect in browser
- Need to restart server manually

**Solutions**:

1. **Frontend (Vite)**
   ```bash
   # Should work automatically
   # If not, check volumes in docker-compose.yml
   volumes:
     - ./frontend/src:/app/src
   ```

2. **Backend (Nodemon)**
   ```bash
   # Check nodemon is running
   npm run dev  # Should use nodemon
   
   # Verify nodemon.json config exists
   ```

### Tests Fail

**Symptoms**:
- `npm test` produces errors
- Tests pass locally but fail in CI

**Check**:

```bash
# Backend tests
cd backend
npm test -- --verbose

# Frontend tests
cd frontend
npm test
```

**Solutions**:

1. **MongoDB test database**
   ```bash
   # Ensure MONGODB_TEST_URI is set
   MONGODB_TEST_URI=mongodb+srv://...phenom_test
   ```

2. **Port conflicts**
   - Tests may need different ports
   - Check test configuration

3. **Clean test database**
   ```bash
   # Tests should clean up after themselves
   # Or manually clear test DB
   ```

### ESLint Errors

**Symptoms**:
- Linting fails
- Red squiggly lines everywhere

**Solutions**:

```bash
# Auto-fix lint issues
npm run lint:fix

# Check .eslintrc.json is present
# Install ESLint extension in VS Code
```

## Database Issues

### Data Not Persisting

**Symptoms**:
- Data disappears after restart
- Users/observations lost

**Check**:

```bash
# Check if using volumes
docker-compose ps
# Look for volume mounts

# Check MongoDB is using volume
docker volume ls | grep mongo
```

**Solutions**:

1. **Using local MongoDB without volumes**
   ```yaml
   # docker-compose.yml should have:
   volumes:
     - mongodb_data:/data/db
   ```

2. **Atlas connection lost**
   - Check MongoDB Atlas uptime
   - Verify connection string

### Duplicate Key Errors

**Symptoms**:
- "E11000 duplicate key error"
- Can't create user with existing email

**Solutions**:

1. **Email already exists**
   - Normal validation
   - User should try different email

2. **Corrupted indexes**
   ```bash
   # Rebuild indexes
   docker-compose exec backend mongosh $MONGODB_URI
   > db.users.dropIndexes()
   > db.users.createIndex({ email: 1 }, { unique: true })
   ```

## Getting Help

If you can't resolve an issue:

1. **Check Logs**
   ```bash
   docker-compose logs -f
   ```

2. **Search GitHub Issues**
   - [github.com/Jonas-du-bois/phenom/issues](https://github.com/Jonas-du-bois/phenom/issues)

3. **Create New Issue**
   - Include error messages
   - Include relevant logs
   - Describe steps to reproduce

4. **Community**
   - GitHub Discussions
   - Stack Overflow tag: `phenom-ufo`

## Debug Mode

### Enable Verbose Logging

**Backend**:
```bash
# .env
NODE_ENV=development
IMAGE_VERBOSE=true
```

**Frontend**:
```javascript
// Enable Vue devtools
// Automatically enabled in development
```

**MongoDB**:
```bash
# Log all queries
mongoose.set('debug', true)
```

## Health Checks

### Verify Everything Works

```bash
# 1. Backend health
curl http://localhost:3000/health
# Should return: {"success":true,"status":"ok"}

# 2. Database connection
docker-compose exec backend npm run check-db
# Should return: ✅ MongoDB connected

# 3. API test
curl http://localhost:3000/api/v1/observations
# Should return: {"success":true,"data":[...]}

# 4. Frontend accessible
curl http://localhost
# Should return HTML

# 5. WebSocket
# Open browser console on http://localhost
# Should see WebSocket connection in Network tab
```

## Related Documentation

- [Getting Started](Getting-Started) - Initial setup
- [Environment Variables](Environment-Variables) - Configuration
- [Deployment Guide](Deployment-Guide) - Production deployment
- [Backend Architecture](Backend-Architecture) - Backend details
- [Frontend Architecture](Frontend-Architecture) - Frontend details
