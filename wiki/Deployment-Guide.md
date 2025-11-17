# Deployment Guide

This guide covers deploying Phenom to production environments, with specific instructions for Render.com and general deployment best practices.

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All tests pass locally (`npm test`)
- [ ] Application builds without errors (`npm run build`)
- [ ] MongoDB Atlas cluster is created and configured
- [ ] Cloudinary account is set up
- [ ] Environment variables are prepared
- [ ] CORS origins are configured for production domain
- [ ] JWT secrets are cryptographically strong (32+ characters)
- [ ] `.env` file is **not** committed to git
- [ ] Production database is separate from development

## Deployment Options

Phenom can be deployed to various platforms:

1. **Render.com** (Recommended - Free tier available)
2. **Vercel** (Frontend) + **Railway** (Backend)
3. **Netlify** (Frontend) + **Heroku** (Backend)
4. **Docker** on any VPS (DigitalOcean, AWS, GCP, Azure)
5. **Kubernetes** cluster

This guide focuses on **Render.com** deployment.

## MongoDB Atlas Setup

### 1. Create MongoDB Atlas Cluster

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free account
3. Create new Project: "Phenom"
4. Build Database → Free (M0) tier
5. Choose cloud provider and region (closest to your users)
6. Cluster name: `phenom-cluster`

### 2. Configure Database Access

1. Database Access → Add Database User
2. Authentication: Password
3. Username: `phenom_user`
4. Password: Generate secure password (save it!)
5. Database User Privileges: Read and write to any database
6. Add User

### 3. Configure Network Access

1. Network Access → Add IP Address
2. Allow Access from Anywhere: `0.0.0.0/0`
   - Required for Render.com and other cloud platforms
   - Or add specific Render IP ranges for better security
3. Add Entry

### 4. Get Connection String

1. Database → Connect → Drivers
2. Driver: Node.js, Version: 5.5 or later
3. Copy connection string:
   ```
   mongodb+srv://phenom_user:<password>@phenom-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Add database name: `/phenom_production`
   ```
   mongodb+srv://phenom_user:YOUR_PASSWORD@phenom-cluster.xxxxx.mongodb.net/phenom_production?retryWrites=true&w=majority
   ```

## Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Dashboard → Account Details
3. Copy "API Environment variable":
   ```
   CLOUDINARY_URL=cloudinary://123456:AbCdEf@your-cloud-name
   ```
4. Save for later use in environment variables

## Deploying to Render.com

### Architecture

```
┌─────────────────────┐
│  Frontend Service   │  (Static Site)
│  phenom-frontend    │  → dist/ folder
│  Port: 80           │
└──────────┬──────────┘
           │
           │ API Calls (HTTPS)
           │
┌──────────▼──────────┐
│  Backend Service    │  (Web Service)
│  phenom-backend     │  → Node.js server
│  Port: 3000         │
└──────────┬──────────┘
           │
           │ Connection
           │
┌──────────▼──────────┐
│  MongoDB Atlas      │  (External)
│  Cloud Database     │
└─────────────────────┘
```

### Step 1: Prepare Repository

Ensure your repository is on GitHub:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy Backend

1. **Sign up/Login to Render.com**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Dashboard → New → Web Service
   - Connect GitHub repository: `Jonas-du-bois/phenom`
   - Give Render permission to access repository

3. **Configure Backend Service**
   - **Name**: `phenom-backend`
   - **Region**: Choose closest to users (e.g., Frankfurt for Europe)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or Starter for better performance)

4. **Add Environment Variables**

   Click "Advanced" → Add Environment Variables:

   ```bash
   NODE_ENV=production
   PORT=3000
   
   # MongoDB (from Atlas setup)
   MONGODB_URI=mongodb+srv://phenom_user:YOUR_PASSWORD@phenom-cluster.xxxxx.mongodb.net/phenom_production?retryWrites=true&w=majority
   
   # JWT Secrets (generate strong random values)
   JWT_SECRET=<64-char-random-string>
   JWT_REFRESH_SECRET=<64-char-random-string>
   
   # Cloudinary (from Cloudinary dashboard)
   CLOUDINARY_URL=cloudinary://123456:AbCdEf@your-cloud-name
   
   # CORS (add frontend URL after frontend deployment)
   CORS_ORIGIN=https://phenom-frontend.onrender.com
   
   # Optional
   JWT_EXPIRE=1h
   JWT_REFRESH_EXPIRE=7d
   RATE_LIMIT_MAX_REQUESTS=50
   IMAGE_QUALITY=85
   ```

   **Generate JWT Secrets**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

5. **Create Web Service**
   - Click "Create Web Service"
   - Wait for build and deployment (5-10 minutes)
   - Note the URL: `https://phenom-backend.onrender.com`

6. **Verify Backend**
   - Visit: `https://phenom-backend.onrender.com/health`
   - Should see: `{"success":true,"status":"ok",...}`
   - Visit: `https://phenom-backend.onrender.com/api-docs`
   - Should see API documentation

### Step 3: Deploy Frontend

1. **Create New Static Site**
   - Dashboard → New → Static Site
   - Connect same GitHub repository
   - Give permission if needed

2. **Configure Frontend Service**
   - **Name**: `phenom-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Add Environment Variables**

   ```bash
   # Backend API URL (from Step 2)
   VITE_API_BASE_URL=https://phenom-backend.onrender.com
   
   # App name
   VITE_APP_NAME=Phenom
   
   # Map tiles (optional)
   VITE_MAP_TILES_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
   ```

4. **Create Static Site**
   - Click "Create Static Site"
   - Wait for build (3-5 minutes)
   - Note the URL: `https://phenom-frontend.onrender.com`

### Step 4: Update CORS

1. Go back to backend service
2. Environment → Edit
3. Update `CORS_ORIGIN`:
   ```bash
   CORS_ORIGIN=https://phenom-frontend.onrender.com
   ```
4. Save Changes
5. Backend will auto-redeploy

### Step 5: Create Admin User

1. Backend service → Shell (or use local terminal)
2. Connect to backend shell
3. Run admin creation script:
   ```bash
   npm run create-admin
   ```
4. Follow prompts to create admin account

### Step 6: Test Deployment

1. **Visit Frontend**: `https://phenom-frontend.onrender.com`
2. **Register**: Create a new user account
3. **Login**: Sign in with credentials
4. **Create Observation**: Test full workflow
5. **Upload Image**: Verify Cloudinary integration
6. **Check Map**: Verify observations display on map
7. **Add Comment**: Test comments system
8. **Check WebSocket**: Create observation, should appear in real-time

## Custom Domain (Optional)

### Add Custom Domain to Frontend

1. Purchase domain (e.g., from Namecheap, Google Domains)
2. Render → Frontend Service → Settings → Custom Domains
3. Add domain: `phenom-app.com`
4. Add www subdomain: `www.phenom-app.com`
5. Update DNS records at your domain registrar:

   **A Record**:
   ```
   @ → 216.24.57.1
   ```

   **CNAME Record**:
   ```
   www → phenom-frontend.onrender.com
   ```

6. Wait for DNS propagation (5 minutes - 48 hours)
7. Render automatically provisions SSL certificate

### Update Environment Variables

After adding custom domain, update:

**Backend CORS_ORIGIN**:
```bash
CORS_ORIGIN=https://phenom-app.com,https://www.phenom-app.com
```

**Frontend VITE_API_BASE_URL**:
- Keep as `https://phenom-backend.onrender.com`
- Or use custom backend domain if configured

## Alternative Deployment: Docker on VPS

### Requirements

- VPS with Docker and Docker Compose
- Domain pointed to VPS IP
- SSL certificate (Let's Encrypt)

### Deployment Steps

1. **SSH into VPS**
   ```bash
   ssh user@your-vps-ip
   ```

2. **Install Docker**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo apt install docker-compose
   ```

3. **Clone Repository**
   ```bash
   git clone https://github.com/Jonas-du-bois/phenom.git
   cd phenom
   ```

4. **Create .env file**
   ```bash
   cp .env.example .env
   nano .env
   # Add production values
   ```

5. **Build and Start**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

6. **Setup Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name phenom-app.com;
       
       location / {
           proxy_pass http://localhost:80;
       }
       
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
       }
   }
   ```

7. **Setup SSL with Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d phenom-app.com -d www.phenom-app.com
   ```

## Production Optimizations

### Backend

1. **Enable Production Mode**
   ```bash
   NODE_ENV=production
   ```

2. **Disable Auto-Indexing**
   - Mongoose auto-indexing disabled in production
   - Create indexes manually if needed

3. **Rate Limiting**
   ```bash
   RATE_LIMIT_MAX_REQUESTS=50  # Stricter than dev
   ```

4. **Logging**
   - Morgan uses `combined` format in production
   - Consider external logging service (Papertrail, Loggly)

5. **Database Connection Pool**
   - Configured automatically: 5-10 connections

### Frontend

1. **Minification**
   - Vite automatically minifies in production build

2. **Code Splitting**
   - Routes are lazy-loaded automatically

3. **Asset Optimization**
   - Images optimized via Cloudinary CDN
   - CSS purged by Tailwind

4. **Service Worker**
   - PWA manifest included
   - Offline support enabled

### Security

1. **Strong Secrets**
   ```bash
   JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
   ```

2. **HTTPS Only**
   - Render provides free SSL
   - Force HTTPS redirects

3. **CORS Whitelist**
   ```bash
   CORS_ORIGIN=https://phenom-app.com  # Specific domains only
   ```

4. **Rate Limiting**
   - Keep strict limits in production

5. **MongoDB Security**
   - Use MongoDB Atlas (managed security)
   - Enable authentication
   - Whitelist IPs
   - Regular backups

## Monitoring

### Health Checks

Render automatically monitors:
- `/health` endpoint
- Service uptime
- Response times

### Manual Monitoring

```bash
# Check backend health
curl https://phenom-backend.onrender.com/health

# Check API
curl https://phenom-backend.onrender.com/api/v1/observations
```

### Logs

**View Logs on Render**:
1. Dashboard → Service → Logs
2. Real-time log streaming
3. Filter by severity

**Download Logs**:
1. Click "Download" in logs view
2. Analyze offline

## Scaling

### Render.com Scaling

1. **Vertical Scaling**
   - Upgrade instance type (Free → Starter → Standard)
   - More CPU and RAM

2. **Horizontal Scaling** (Standard plan+)
   - Multiple instances
   - Auto-scaling based on traffic

3. **Database Scaling**
   - MongoDB Atlas: M0 (Free) → M10 (Dedicated)
   - Automatic backups
   - Point-in-time recovery

### Performance Tips

1. **CDN for Static Assets**
   - Cloudinary for images (already configured)
   - Consider Cloudflare for frontend

2. **Database Optimization**
   - Ensure indexes are created
   - Monitor slow queries
   - Use aggregation pipelines efficiently

3. **Caching**
   - Consider Redis for session storage
   - Cache frequent queries

## Troubleshooting Deployment

### Build Fails

**Check**:
- Logs in Render dashboard
- Ensure `package.json` has correct scripts
- Verify Node version compatibility

**Solution**:
```json
// package.json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

### Backend Crashes on Start

**Check**:
- Environment variables are set
- MongoDB URI is correct
- Cloudinary URL is valid

**Solution**: Review logs for specific error message

### Frontend Shows Blank Page

**Check**:
- `VITE_API_BASE_URL` is correct
- Backend is accessible
- Browser console for errors

**Solution**:
```bash
# Rebuild with correct API URL
VITE_API_BASE_URL=https://phenom-backend.onrender.com
npm run build
```

### CORS Errors

**Check**:
- `CORS_ORIGIN` includes frontend URL
- Frontend URL is HTTPS (not HTTP)

**Solution**:
```bash
# Backend .env
CORS_ORIGIN=https://phenom-frontend.onrender.com
```

### WebSocket Not Connecting

**Check**:
- Backend supports WebSocket
- Use `wss://` for HTTPS sites

**Solution**:
```javascript
// Frontend
const wsUrl = import.meta.env.PROD
  ? 'wss://phenom-backend.onrender.com'  // Use wss://
  : 'ws://localhost:3000'
```

## Backup and Recovery

### MongoDB Backups

**MongoDB Atlas**:
- Free tier: Daily snapshots (limited retention)
- Paid tiers: Point-in-time recovery

**Manual Backup**:
```bash
mongodump --uri="mongodb+srv://..." --out=./backup
```

**Restore**:
```bash
mongorestore --uri="mongodb+srv://..." ./backup
```

### Application Backup

- Repository is backed up on GitHub
- Environment variables documented separately
- Cloudinary images backed up automatically

## Rollback

### Render.com Rollback

1. Dashboard → Service → Events
2. Find previous successful deploy
3. Click "Rollback"
4. Confirm

### Manual Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard COMMIT_HASH
git push origin main --force
```

## Related Documentation

- [Getting Started](Getting-Started) - Local setup
- [Environment Variables](Environment-Variables) - Configuration reference
- [Backend Architecture](Backend-Architecture) - Backend details
- [Frontend Architecture](Frontend-Architecture) - Frontend details
- [Troubleshooting](Troubleshooting) - Common issues
