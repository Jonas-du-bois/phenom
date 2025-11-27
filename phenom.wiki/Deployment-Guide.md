# Deployment Guide

This guide covers how to deploy the Phenom application to a production environment.

## Docker Deployment (Recommended)

The easiest way to deploy is using Docker Compose.

### Production Docker Compose

We provide a `docker-compose.prod.yml` file optimized for production.

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    env_file: .env
    ports:
      - "3000:3000"
    restart: always

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
    restart: always
```

### Steps to Deploy

1.  **Clone the repository** on your server.
2.  **Create `.env` file** with production variables:
    ```bash
    NODE_ENV=production
    PORT=3000
    MONGODB_URI=mongodb+srv://...  # Your Atlas URI
    JWT_SECRET=...                 # Strong random string
    JWT_REFRESH_SECRET=...         # Strong random string
    CLOUDINARY_URL=...             # Cloudinary credentials
    CORS_ORIGIN=https://your-domain.com
    ```
3.  **Build and Run**:
    ```bash
    docker-compose -f docker-compose.prod.yml up -d --build
    ```

## Cloud Platforms (Render, Railway, Heroku)

### Render.com

#### Backend
1.  Create a **Web Service**.
2.  Connect your GitHub repo.
3.  Root Directory: `backend`.
4.  Build Command: `npm install`.
5.  Start Command: `npm start`.
6.  Add Environment Variables from your `.env`.

#### Frontend
1.  Create a **Static Site**.
2.  Connect your GitHub repo.
3.  Root Directory: `frontend`.
4.  Build Command: `npm install && npm run build`.
5.  Publish Directory: `dist`.
6.  Add Environment Variable: `VITE_API_BASE_URL` pointing to your Backend URL.

## Environment Variables

| Variable | Description | Required |
|:---|:---|:---|
| `NODE_ENV` | Environment mode (`production`) | Yes |
| `PORT` | Server port (default 3000) | No |
| `MONGODB_URI` | MongoDB Connection String | Yes |
| `JWT_SECRET` | Secret for Access Token | Yes |
| `JWT_REFRESH_SECRET` | Secret for Refresh Token | Yes |
| `CLOUDINARY_URL` | Cloudinary URL | Yes |
| `CORS_ORIGIN` | Allowed Frontend Origin | Yes (in prod) |
| `VITE_API_BASE_URL` | Backend URL for Frontend | Yes (frontend) |
