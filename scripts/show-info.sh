#!/bin/bash
# show-info.sh - Affiche les informations du projet

clear

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat CONGRATULATIONS.txt
echo -e "${NC}"

echo ""
echo -e "${GREEN}🌐 Accédez maintenant à votre application :${NC}"
echo ""
echo -e "  Frontend  : ${YELLOW}http://localhost${NC}"
echo -e "  Backend   : ${YELLOW}http://localhost:3000${NC}"
echo -e "  Admin DB  : ${YELLOW}http://localhost:8081${NC} (admin/admin123)"
echo ""
echo -e "${GREEN}📚 Documentation disponible :${NC}"
echo ""
echo -e "  ACCES-RAPIDE.md         - Accès rapide"
echo -e "  QUICKSTART.md           - Guide de démarrage"
echo -e "  INSTALLATION-SUCCESS.md - Rapport d'installation"
echo ""
echo -e "${GREEN}⚡ Commandes essentielles :${NC}"
echo ""
echo -e "  docker-compose up -d    - Démarrer"
echo -e "  docker-compose down     - Arrêter"
echo -e "  docker-compose logs -f  - Voir les logs"
echo -e "  docker-compose ps       - Statut"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}              Bon développement ! 🚀🛸${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
