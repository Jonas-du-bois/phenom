# frontend/Dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances (sans --silent pour voir les erreurs)
RUN npm ci

# Copier le code source
COPY . .

# Arguments de build
ARG VITE_API_BASE_URL
ARG VITE_API_PREFIX="/api/v1"
ARG VITE_WS_URL
ARG VITE_APP_NAME="Phenom"
ARG VITE_MAP_TILES_URL="https://tile.openstreetmap.org/{z}/{x}/{y}.png"

# Variables d'environnement pour le build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_PREFIX=$VITE_API_PREFIX
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_MAP_TILES_URL=$VITE_MAP_TILES_URL

# Build de l'application
RUN npm run build

# Stage 2: Production
FROM nginx:1.25-alpine

# Installer dumb-init
RUN apk add --no-cache dumb-init

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés depuis le stage précédent
COPY --from=builder /app/dist /usr/share/nginx/html

# Créer un utilisateur non-root
RUN adduser -D -u 1001 appuser

# Ajuster les permissions
RUN chown -R appuser:appuser /var/cache/nginx && \
    chown -R appuser:appuser /var/log/nginx && \
    chown -R appuser:appuser /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R appuser:appuser /var/run/nginx.pid

# Changer vers l'utilisateur non-root
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Exposer le port
EXPOSE 80

# Utiliser dumb-init
ENTRYPOINT ["dumb-init", "--"]

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
