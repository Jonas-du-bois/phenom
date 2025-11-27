# Quick Start Guide

This guide will help you set up the Phenom application on your local machine for development.

## Prerequisites

- **Docker Desktop** installed and running
- **Git** to clone the repository
- **Node.js 18+** (for local development without Docker)
- **MongoDB Atlas** account (free tier)

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Jonas-du-bois/phenom.git
cd phenom
```

### 2. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Edit the `.env` file with your credentials:
```bash
NODE_ENV=development
PORT=3000

# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/phenom_dev?retryWrites=true&w=majority

# Security Keys (Generate random strings)
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Cloudinary (for image uploads)
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### 3. Run with Docker (Recommended)

Start the application using the provided helper script:

**Linux/Mac:**
```bash
./phenom.sh start
```

**Windows (PowerShell):**
```powershell
.\phenom.ps1 start
```

Or using Docker Compose directly:
```bash
docker-compose up -d
```

### 4. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs

## Development Scripts

### Backend
```bash
cd backend
npm install
npm run dev     # Start with hot-reload
npm test        # Run tests
npm run lint    # Check code style
```

### Frontend
```bash
cd frontend
npm install
npm run dev     # Start Vite dev server
npm run build   # Build for production
```
