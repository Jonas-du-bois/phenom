# Getting Started with Phenom

This guide will help you get Phenom up and running on your local machine in minutes.

## Prerequisites

Before you begin, ensure you have:

- **Docker Desktop** - Installed and running ([Download](https://www.docker.com/products/docker-desktop))
- **Git** - For cloning the repository
- **MongoDB Atlas** account - Free tier available ([Sign up](https://www.mongodb.com/cloud/atlas))

### Optional (for non-Docker development)
- **Node.js 18+** and **npm 9+**

## Step 1: Clone the Repository

```bash
git clone https://github.com/Jonas-du-bois/phenom.git
cd phenom
```

## Step 2: Configure MongoDB Atlas

1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free Tier M0)
3. Create a database user with username and password
4. Add `0.0.0.0/0` to Network Access (allows access from anywhere)
5. Get your connection string:
   ```
   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/phenom_dev?retryWrites=true&w=majority
   ```

## Step 3: Create Environment File

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your values
nano .env  # or use your preferred editor
```

### Minimal Required Configuration

```bash
NODE_ENV=development
PORT=3000

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/phenom_dev?retryWrites=true&w=majority

# JWT Secrets (generate strong random keys)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Frontend API URL
VITE_API_BASE_URL=http://localhost:3000
```

> **Tip**: Generate secure JWT secrets with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

## Step 4: Start the Application with Docker

### Using Management Scripts (Recommended)

**On Linux/Mac:**
```bash
chmod +x phenom.sh
./phenom.sh start
```

**On Windows (PowerShell):**
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
.\phenom.ps1 start
```

### Using Docker Compose Directly

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Step 5: Verify Installation

Once started, verify that all services are running:

```bash
# Check service status
docker-compose ps
```

Access the following URLs:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | [http://localhost](http://localhost) | Vue.js application |
| **Backend API** | [http://localhost:3000](http://localhost:3000) | Express API |
| **API Docs** | [http://localhost:3000/api-docs](http://localhost:3000/api-docs) | Swagger documentation |
| **MongoDB Express** | [http://localhost:8081](http://localhost:8081) | Database admin (admin/admin123) |

## Step 6: Initialize Database (Optional)

### Create Admin User

```bash
# Using scripts
./phenom.sh create-admin

# Using Docker Compose
docker-compose exec backend npm run create-admin
```

### Seed Sample Data

```bash
# Using scripts
./phenom.sh seed

# Using Docker Compose
docker-compose exec backend npm run seed
```

### Verify Database Connection

```bash
# Using scripts
./phenom.sh check-db

# Using Docker Compose
docker-compose exec backend npm run check-db
```

## Step 7: Create Your First User

1. Open [http://localhost](http://localhost)
2. Click "S'inscrire" (Register)
3. Fill in the registration form:
   - Name: Your name
   - Email: your.email@example.com
   - Password: At least 6 characters
4. Click "S'inscrire"
5. You'll be redirected to the login page
6. Log in with your credentials

## Step 8: Explore the Application

Once logged in, you can:

- 🏠 **Home** - View hero section and recent observations
- 📋 **Feed** - Browse all observations with infinite scroll
- 🗺️ **Map** - View observations on an interactive map
- ➕ **Create** - Add a new observation with photo and location
- 👤 **Profile** - View and edit your profile

## Common Commands

### View Logs

```bash
# All services
./phenom.sh logs

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services

```bash
# Using scripts
./phenom.sh stop

# Using Docker Compose
docker-compose down
```

### Restart Services

```bash
# Using scripts
./phenom.sh restart

# Using Docker Compose
docker-compose restart
```

## Next Steps

- Read the [Development Guide](Development-Guide) to set up your development environment
- Explore the [API Reference](API-Reference) to understand available endpoints
- Check out the [Architecture Overview](Architecture-Overview) to understand the system design

## Troubleshooting

If you encounter issues, check the [Troubleshooting Guide](Troubleshooting) or:

1. **Backend won't start**
   - Verify MongoDB connection string in `.env`
   - Check logs: `docker-compose logs backend`
   - Ensure MongoDB Atlas allows connections from 0.0.0.0/0

2. **Frontend shows blank page**
   - Check `VITE_API_BASE_URL` in `.env`
   - Verify backend is running: `curl http://localhost:3000/health`
   - Check browser console for errors

3. **Port already in use**
   - Stop conflicting services using ports 80, 3000, or 27017
   - Or change ports in `docker-compose.yml`

For more help, see the [Troubleshooting](Troubleshooting) page.
