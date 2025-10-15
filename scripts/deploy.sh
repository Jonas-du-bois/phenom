#!/bin/bash
# scripts/deploy.sh - Script de déploiement automatique

set -e

echo "🚀 Déploiement de Phenom App"
echo "=============================="

# Variables
ENV_FILE=".env.prod"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"

# Vérifier que le fichier .env.prod existe
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Fichier .env.prod manquant. Création à partir de .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example $ENV_FILE
        echo "⚠️  Veuillez configurer les valeurs dans $ENV_FILE avant de déployer"
        exit 1
    else
        echo "❌ Fichier .env.example manquant"
        exit 1
    fi
fi

# Charger les variables d'environnement
export $(cat $ENV_FILE | grep -v '^#' | xargs)

echo "📦 Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🛑 Arrêt des services existants..."
docker-compose -f docker-compose.prod.yml down

echo "🚀 Démarrage des nouveaux services..."
docker-compose -f docker-compose.prod.yml --env-file $ENV_FILE up -d

echo "⏳ Attente du démarrage des services (45s)..."
sleep 45

echo "🏥 Vérification de l'état des services..."

# Vérifier que les services sont healthy
services=("backend" "frontend" "mongodb")
all_healthy=true

for service in "${services[@]}"; do
    container_id=$(docker-compose -f docker-compose.prod.yml ps -q $service)
    if [ -z "$container_id" ]; then
        echo "❌ Service $service n'est pas démarré"
        all_healthy=false
        continue
    fi
    
    health=$(docker inspect --format='{{.State.Health.Status}}' $container_id 2>/dev/null || echo "no-health")
    
    if [ "$health" = "healthy" ] || [ "$health" = "no-health" ]; then
        echo "✅ Service $service est opérationnel"
    else
        echo "⚠️  Service $service: statut = $health"
        all_healthy=false
    fi
done

if [ "$all_healthy" = true ]; then
    echo ""
    echo "✅ Déploiement terminé avec succès!"
    echo "🌐 Frontend: http://localhost"
    echo "🔗 Backend API: http://localhost:3000"
    
    echo "🧹 Nettoyage des anciennes images..."
    docker image prune -f
else
    echo ""
    echo "⚠️  Déploiement terminé avec des avertissements"
    echo "📝 Consultez les logs avec: docker-compose -f docker-compose.prod.yml logs"
fi
