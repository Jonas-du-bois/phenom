# backend/Dockerfile
FROM node:20-alpine

# Metadata
LABEL maintainer="equipe-phenom@example.com"
LABEL version="1.0.0"
LABEL description="Phenom Backend API - OVNI Observation App"

# Arguments de build
ARG NODE_ENV=production
ARG PORT=3000

# Variables d'environnement
ENV NODE_ENV=$NODE_ENV
ENV PORT=$PORT

# Working directory
WORKDIR /app

# Installer les dépendances système
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production --silent && \
    npm cache clean --force --silent

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S phenom -u 1001

# Copier le code source
COPY --chown=phenom:nodejs src ./src
COPY --chown=phenom:nodejs scripts ./scripts

# Changer vers l'utilisateur non-root
USER phenom

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:$PORT/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Exposer le port
EXPOSE $PORT

# Utiliser dumb-init pour une meilleure gestion des signaux
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage
CMD ["node", "src/app.js"]
