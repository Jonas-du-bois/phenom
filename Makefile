# Makefile pour Phenom App
.PHONY: help build start stop restart logs clean test

# Variables
COMPOSE_FILE = docker-compose.yml
COMPOSE_PROD_FILE = docker-compose.prod.yml

help: ## Afficher l'aide
	@echo "🛸 Phenom App - Commandes disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Configuration initiale du projet
	@echo "🔧 Configuration initiale..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅ Fichier .env créé (modifiez-le avec vos valeurs)"; \
	else \
		echo "ℹ️  Fichier .env existe déjà"; \
	fi

build: ## Build les images Docker
	@echo "🏗️  Building Docker images..."
	docker-compose -f $(COMPOSE_FILE) build --no-cache

start: setup ## Démarrer l'application en mode développement
	@echo "🚀 Démarrage de l'application..."
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo ""
	@echo "✅ Application démarrée avec succès!"
	@echo "🌐 Frontend: http://localhost"
	@echo "🔗 Backend API: http://localhost:3000"
	@echo "📊 MongoDB Express: http://localhost:8081 (admin/admin123)"

stop: ## Arrêter l'application
	@echo "🛑 Arrêt de l'application..."
	docker-compose -f $(COMPOSE_FILE) down

restart: stop start ## Redémarrer l'application

logs: ## Voir les logs de tous les services
	docker-compose -f $(COMPOSE_FILE) logs -f

logs-backend: ## Voir les logs du backend
	docker-compose -f $(COMPOSE_FILE) logs -f backend

logs-frontend: ## Voir les logs du frontend
	docker-compose -f $(COMPOSE_FILE) logs -f frontend

logs-mongodb: ## Voir les logs de MongoDB
	docker-compose -f $(COMPOSE_FILE) logs -f mongodb

status: ## Voir le statut des services
	docker-compose -f $(COMPOSE_FILE) ps

clean: ## Nettoyer les containers et volumes
	@echo "🧹 Nettoyage des containers et volumes..."
	docker-compose -f $(COMPOSE_FILE) down -v
	docker system prune -f
	@echo "✅ Nettoyage terminé"

shell-backend: ## Accéder au shell du backend
	docker-compose -f $(COMPOSE_FILE) exec backend sh

shell-frontend: ## Accéder au shell du frontend
	docker-compose -f $(COMPOSE_FILE) exec frontend sh

db-shell: ## Accéder au shell MongoDB
	docker-compose -f $(COMPOSE_FILE) exec mongodb mongosh -u admin -p passw0rdi2Tr0is

# Production
prod-build: ## Build pour production
	@echo "🏗️  Building production images..."
	docker-compose -f $(COMPOSE_PROD_FILE) build --no-cache

prod-start: ## Démarrer en production
	@echo "🚀 Démarrage en mode production..."
	docker-compose -f $(COMPOSE_PROD_FILE) up -d
	@echo "✅ Application en production démarrée"

prod-stop: ## Arrêter la production
	docker-compose -f $(COMPOSE_PROD_FILE) down

prod-logs: ## Voir les logs de production
	docker-compose -f $(COMPOSE_PROD_FILE) logs -f

# Installation des dépendances
install-backend: ## Installer les dépendances backend
	@echo "📦 Installation des dépendances backend..."
	cd backend && npm install

install-frontend: ## Installer les dépendances frontend
	@echo "📦 Installation des dépendances frontend..."
	cd frontend && npm install

install: install-backend install-frontend ## Installer toutes les dépendances
