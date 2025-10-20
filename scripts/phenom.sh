#!/bin/bash

# ============================================================================
# Phenom App - Script de gestion (Linux/Mac)
# ============================================================================
# Usage: ./phenom.sh [commande]
# Pour voir toutes les commandes: ./phenom.sh help
# ============================================================================

set -e  # Arrêter en cas d'erreur

# Aller à la racine du projet
cd "$(dirname "$0")/.."

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Variables
COMPOSE_FILE="docker-compose.atlas.yml"
COMPOSE_PROD_FILE="docker-compose.prod.yml"
PROJECT_NAME="phenom"

# ============================================================================
# Fonctions utilitaires
# ============================================================================

print_header() {
    echo -e "${CYAN}${BOLD}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                    🛸 Phenom App Manager 🛸                   ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_section() {
    echo -e "${MAGENTA}${BOLD}$1${NC}"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker n'est pas installé. Installez-le depuis https://docker.com"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker n'est pas démarré. Veuillez démarrer Docker Desktop."
        exit 1
    fi
}

check_env_file() {
    if [ ! -f .env ]; then
        print_warning "Fichier .env introuvable. Création depuis .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Fichier .env créé. N'oubliez pas de le configurer!"
            print_info "Éditez le fichier .env avec vos vraies valeurs (MongoDB, JWT secrets, etc.)"
        else
            print_error "Fichier .env.example introuvable!"
            exit 1
        fi
    fi
}

# ============================================================================
# Commandes principales
# ============================================================================

cmd_help() {
    print_header
    echo -e "${CYAN}📋 Commandes disponibles:${NC}\n"
    
    print_section "🚀 Démarrage et arrêt:"
    echo "  start              Démarrer tous les services"
    echo "  stop               Arrêter tous les services"
    echo "  restart            Redémarrer tous les services"
    echo "  status             Afficher le statut des services"
    echo ""
    
    print_section "🏗️  Build et installation:"
    echo "  build              Build les images Docker"
    echo "  rebuild            Rebuild sans cache"
    echo "  install            Installer toutes les dépendances"
    echo "  install-backend    Installer dépendances backend uniquement"
    echo "  install-frontend   Installer dépendances frontend uniquement"
    echo ""
    
    print_section "📊 Logs et monitoring:"
    echo "  logs               Voir tous les logs en temps réel"
    echo "  logs-backend       Logs du backend uniquement"
    echo "  logs-frontend      Logs du frontend uniquement"
    echo "  logs-mongodb       Logs MongoDB uniquement"
    echo ""
    
    print_section "🔧 Shell et debug:"
    echo "  shell-backend      Accéder au shell du container backend"
    echo "  shell-frontend     Accéder au shell du container frontend"
    echo "  db-shell           Accéder au MongoDB shell"
    echo ""
    
    print_section "🗄️  Base de données:"
    echo "  seed               Peupler la base avec des données de test"
    echo "  create-admin       Créer un compte administrateur"
    echo "  check-db           Vérifier la connexion MongoDB"
    echo ""
    
    print_section "🧪 Tests:"
    echo "  test               Lancer tous les tests"
    echo "  test-backend       Tests backend uniquement"
    echo "  test-frontend      Tests frontend uniquement"
    echo "  test-coverage      Tests avec rapport de couverture"
    echo ""
    
    print_section "🚢 Production:"
    echo "  prod-build         Build pour production"
    echo "  prod-start         Démarrer en production"
    echo "  prod-stop          Arrêter production"
    echo "  prod-logs          Logs de production"
    echo "  prod-restart       Redémarrer production"
    echo ""
    
    print_section "🧹 Nettoyage:"
    echo "  clean              Nettoyer containers et volumes"
    echo "  clean-all          Nettoyage complet (+ images)"
    echo "  prune              Nettoyer le système Docker"
    echo ""
    
    print_section "ℹ️  Informations:"
    echo "  info               Afficher les informations système"
    echo "  health             Vérifier la santé de l'application"
    echo "  urls               Afficher les URLs d'accès"
    echo "  help               Afficher cette aide"
    echo ""
    
    echo -e "${CYAN}💡 Exemples:${NC}"
    echo "  ./phenom.sh start"
    echo "  ./phenom.sh logs-backend"
    echo "  ./phenom.sh seed"
    echo ""
}

cmd_start() {
    print_header
    echo -e "${GREEN}🚀 Démarrage de l'application Phenom...${NC}\n"
    
    check_docker
    check_env_file
    
    docker-compose -f $COMPOSE_FILE up -d
    
    echo ""
    print_success "Application démarrée avec succès!"
    echo ""
    cmd_urls
}

cmd_stop() {
    print_header
    echo -e "${YELLOW}🛑 Arrêt de l'application...${NC}\n"
    
    docker-compose -f $COMPOSE_FILE down
    
    print_success "Application arrêtée!"
}

cmd_restart() {
    print_header
    echo -e "${YELLOW}🔄 Redémarrage de l'application...${NC}\n"
    
    docker-compose -f $COMPOSE_FILE restart
    
    print_success "Application redémarrée!"
}

cmd_status() {
    print_header
    echo -e "${CYAN}📊 Statut des services:${NC}\n"
    
    docker-compose -f $COMPOSE_FILE ps
}

cmd_build() {
    print_header
    echo -e "${BLUE}🏗️  Build des images Docker...${NC}\n"
    
    check_docker
    
    docker-compose -f $COMPOSE_FILE build
    
    print_success "Images buildées avec succès!"
}

cmd_rebuild() {
    print_header
    echo -e "${BLUE}🏗️  Rebuild complet (sans cache)...${NC}\n"
    
    check_docker
    
    docker-compose -f $COMPOSE_FILE build --no-cache
    
    print_success "Rebuild terminé!"
}

cmd_logs() {
    print_header
    echo -e "${CYAN}📊 Logs de tous les services (Ctrl+C pour quitter):${NC}\n"
    
    docker-compose -f $COMPOSE_FILE logs -f
}

cmd_logs_backend() {
    print_header
    echo -e "${CYAN}📊 Logs du backend (Ctrl+C pour quitter):${NC}\n"
    
    docker-compose -f $COMPOSE_FILE logs -f backend
}

cmd_logs_frontend() {
    print_header
    echo -e "${CYAN}📊 Logs du frontend (Ctrl+C pour quitter):${NC}\n"
    
    docker-compose -f $COMPOSE_FILE logs -f frontend
}

cmd_logs_mongodb() {
    print_header
    echo -e "${YELLOW}⚠️  MongoDB local n'est pas disponible (utilise MongoDB Atlas)${NC}\n"
    
    print_info "Pour voir les logs MongoDB, connectez-vous à MongoDB Atlas:"
    echo -e "${CYAN}  https://cloud.mongodb.com${NC}"
}

cmd_shell_backend() {
    print_header
    echo -e "${CYAN}🔧 Ouverture du shell backend...${NC}\n"
    
    docker-compose -f $COMPOSE_FILE exec backend sh
}

cmd_shell_frontend() {
    print_header
    echo -e "${CYAN}🔧 Ouverture du shell frontend...${NC}\n"
    
    docker-compose -f $COMPOSE_FILE exec frontend sh
}

cmd_db_shell() {
    print_header
    echo -e "${YELLOW}⚠️  MongoDB local n'est pas disponible (utilise MongoDB Atlas)${NC}\n"
    
    print_info "Pour accéder à MongoDB, utilisez:"
    echo -e "${CYAN}  1. MongoDB Atlas UI: https://cloud.mongodb.com${NC}"
    echo -e "${CYAN}  2. MongoDB Compass avec votre connection string${NC}"
    echo -e "${CYAN}  3. mongosh avec: mongosh \"\$MONGODB_URI\"${NC}"
}

cmd_seed() {
    print_header
    echo -e "${GREEN}🌱 Peuplement de la base de données...${NC}\n"
    
    docker-compose -f $COMPOSE_FILE exec backend npm run seed
    
    print_success "Base de données peuplée!"
}

cmd_create_admin() {
    print_header
    echo -e "${GREEN}👑 Création d'un compte administrateur...${NC}\n"
    
    docker-compose -f $COMPOSE_FILE exec backend npm run create-admin
}

cmd_check_db() {
    print_header
    echo -e "${CYAN}🔍 Vérification de la connexion MongoDB...${NC}\n"
    
    docker-compose -f $COMPOSE_FILE exec backend npm run check-db
}

cmd_test() {
    print_header
    echo -e "${CYAN}🧪 Lancement de tous les tests...${NC}\n"
    
    echo "Tests Backend:"
    docker-compose -f $COMPOSE_FILE exec backend npm test
    
    echo ""
    echo "Tests Frontend:"
    docker-compose -f $COMPOSE_FILE exec frontend npm test
    
    print_success "Tous les tests terminés!"
}

cmd_test_backend() {
    print_header
    echo -e "${CYAN}🧪 Tests backend...${NC}\n"
    
    docker-compose -f $COMPOSE_FILE exec backend npm test
}

cmd_test_frontend() {
    print_header
    echo -e "${CYAN}🧪 Tests frontend...${NC}\n"
    
    docker-compose -f $COMPOSE_FILE exec frontend npm test
}

cmd_test_coverage() {
    print_header
    echo -e "${CYAN}🧪 Tests avec couverture...${NC}\n"
    
    echo "Coverage Backend:"
    docker-compose -f $COMPOSE_FILE exec backend npm run test:coverage
    
    echo ""
    echo "Coverage Frontend:"
    docker-compose -f $COMPOSE_FILE exec frontend npm run test:coverage
    
    print_success "Rapports de couverture générés!"
}

cmd_install() {
    print_header
    echo -e "${BLUE}📦 Installation de toutes les dépendances...${NC}\n"
    
    echo "Installation Backend..."
    cd backend && npm install && cd ..
    
    echo ""
    echo "Installation Frontend..."
    cd frontend && npm install && cd ..
    
    print_success "Toutes les dépendances installées!"
}

cmd_install_backend() {
    print_header
    echo -e "${BLUE}📦 Installation des dépendances backend...${NC}\n"
    
    cd backend && npm install && cd ..
    
    print_success "Dépendances backend installées!"
}

cmd_install_frontend() {
    print_header
    echo -e "${BLUE}📦 Installation des dépendances frontend...${NC}\n"
    
    cd frontend && npm install && cd ..
    
    print_success "Dépendances frontend installées!"
}

cmd_clean() {
    print_header
    echo -e "${YELLOW}🧹 Nettoyage des containers et volumes...${NC}\n"
    
    docker-compose -f $COMPOSE_FILE down -v
    
    print_success "Nettoyage terminé!"
}

cmd_clean_all() {
    print_header
    echo -e "${RED}🧹 Nettoyage complet (containers, volumes, images)...${NC}\n"
    
    read -p "⚠️  Cela va supprimer tous les containers, volumes et images. Continuer? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f $COMPOSE_FILE down -v --rmi all
        print_success "Nettoyage complet terminé!"
    else
        print_warning "Nettoyage annulé"
    fi
}

cmd_prune() {
    print_header
    echo -e "${YELLOW}🧹 Nettoyage du système Docker...${NC}\n"
    
    docker system prune -f
    
    print_success "Système Docker nettoyé!"
}

cmd_prod_build() {
    print_header
    echo -e "${BLUE}🏗️  Build des images de production...${NC}\n"
    
    check_docker
    
    docker-compose -f $COMPOSE_PROD_FILE build --no-cache
    
    print_success "Images de production buildées!"
}

cmd_prod_start() {
    print_header
    echo -e "${GREEN}🚀 Démarrage en mode production...${NC}\n"
    
    check_docker
    check_env_file
    
    docker-compose -f $COMPOSE_PROD_FILE up -d
    
    print_success "Application en production démarrée!"
}

cmd_prod_stop() {
    print_header
    echo -e "${YELLOW}🛑 Arrêt de la production...${NC}\n"
    
    docker-compose -f $COMPOSE_PROD_FILE down
    
    print_success "Production arrêtée!"
}

cmd_prod_logs() {
    print_header
    echo -e "${CYAN}📊 Logs de production (Ctrl+C pour quitter):${NC}\n"
    
    docker-compose -f $COMPOSE_PROD_FILE logs -f
}

cmd_prod_restart() {
    print_header
    echo -e "${YELLOW}🔄 Redémarrage de la production...${NC}\n"
    
    docker-compose -f $COMPOSE_PROD_FILE restart
    
    print_success "Production redémarrée!"
}

cmd_info() {
    print_header
    echo -e "${CYAN}ℹ️  Informations système:${NC}\n"
    
    print_section "📦 Versions installées:"
    echo "Docker: $(docker --version)"
    echo "Docker Compose: $(docker-compose --version)"
    if command -v node &> /dev/null; then
        echo "Node.js: $(node --version)"
        echo "npm: $(npm --version)"
    fi
    
    echo ""
    print_section "🐳 Containers Docker:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    print_section "💾 Utilisation disque Docker:"
    docker system df
}

cmd_health() {
    print_header
    echo -e "${CYAN}🏥 Vérification de la santé de l'application...${NC}\n"
    
    # Vérifier Docker
    if docker info &> /dev/null; then
        print_success "Docker est opérationnel"
    else
        print_error "Docker n'est pas accessible"
        exit 1
    fi
    
    # Vérifier les containers
    RUNNING=$(docker-compose -f $COMPOSE_FILE ps --services --filter "status=running" | wc -l)
    TOTAL=$(docker-compose -f $COMPOSE_FILE ps --services | wc -l)
    
    if [ "$RUNNING" -eq "$TOTAL" ] && [ "$TOTAL" -gt 0 ]; then
        print_success "Tous les services sont en cours d'exécution ($RUNNING/$TOTAL)"
    else
        print_warning "Certains services ne sont pas démarrés ($RUNNING/$TOTAL)"
    fi
    
    # Test de connectivité
    echo ""
    print_section "🌐 Tests de connectivité:"
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|404"; then
        print_success "Backend API accessible"
    else
        print_warning "Backend API non accessible"
    fi
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|404"; then
        print_success "Frontend accessible"
    else
        print_warning "Frontend non accessible"
    fi
}

cmd_urls() {
    echo -e "${CYAN}🌐 URLs d'accès:${NC}"
    echo -e "${GREEN}📍 Frontend:${NC}         http://localhost"
    echo -e "${GREEN}📍 Backend API:${NC}      http://localhost:3000"
    echo -e "${GREEN}📍 API Documentation:${NC} http://localhost:3000/api-docs"
    echo -e "${GREEN}📍 MongoDB Atlas:${NC}    https://cloud.mongodb.com"
}

# ============================================================================
# Router principal
# ============================================================================

main() {
    COMMAND=${1:-help}
    
    case "$COMMAND" in
        start)
            cmd_start
            ;;
        stop)
            cmd_stop
            ;;
        restart)
            cmd_restart
            ;;
        status)
            cmd_status
            ;;
        build)
            cmd_build
            ;;
        rebuild)
            cmd_rebuild
            ;;
        logs)
            cmd_logs
            ;;
        logs-backend)
            cmd_logs_backend
            ;;
        logs-frontend)
            cmd_logs_frontend
            ;;
        logs-mongodb)
            cmd_logs_mongodb
            ;;
        shell-backend)
            cmd_shell_backend
            ;;
        shell-frontend)
            cmd_shell_frontend
            ;;
        db-shell)
            cmd_db_shell
            ;;
        seed)
            cmd_seed
            ;;
        create-admin)
            cmd_create_admin
            ;;
        check-db)
            cmd_check_db
            ;;
        test)
            cmd_test
            ;;
        test-backend)
            cmd_test_backend
            ;;
        test-frontend)
            cmd_test_frontend
            ;;
        test-coverage)
            cmd_test_coverage
            ;;
        install)
            cmd_install
            ;;
        install-backend)
            cmd_install_backend
            ;;
        install-frontend)
            cmd_install_frontend
            ;;
        clean)
            cmd_clean
            ;;
        clean-all)
            cmd_clean_all
            ;;
        prune)
            cmd_prune
            ;;
        prod-build)
            cmd_prod_build
            ;;
        prod-start)
            cmd_prod_start
            ;;
        prod-stop)
            cmd_prod_stop
            ;;
        prod-logs)
            cmd_prod_logs
            ;;
        prod-restart)
            cmd_prod_restart
            ;;
        info)
            cmd_info
            ;;
        health)
            cmd_health
            ;;
        urls)
            print_header
            cmd_urls
            ;;
        help|--help|-h)
            cmd_help
            ;;
        *)
            print_error "Commande inconnue: $COMMAND"
            echo ""
            cmd_help
            exit 1
            ;;
    esac
}

# Lancer le script
main "$@"
