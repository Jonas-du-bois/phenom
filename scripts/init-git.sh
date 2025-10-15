#!/bin/bash
# init-git.sh - Script d'initialisation Git

echo "🎯 Initialisation du repository Git pour Phenom App"
echo "=================================================="
echo ""

# Vérifier si Git est installé
if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé. Installez Git d'abord."
    exit 1
fi

# Initialiser le repository
echo "📦 Initialisation du repository Git..."
git init

# Ajouter tous les fichiers
echo "📝 Ajout des fichiers au staging..."
git add .

# Premier commit
echo "💾 Premier commit..."
git commit -m "🎉 Initial commit - Phenom App

✨ Features:
- Backend Node.js + Express + MongoDB
- Frontend Vue.js + Vite + TailwindCSS
- Docker & Docker Compose configuration
- Complete documentation
- Development and production setups

📦 Structure:
- backend/ - API server with health checks
- frontend/ - Vue.js PWA application
- docs/ - Complete documentation
- scripts/ - Deployment and monitoring scripts

🐳 Docker:
- Multi-stage builds for optimization
- Health checks for all services
- MongoDB with initialization script
- Nginx for frontend serving

📚 Documentation:
- README.md - Project overview
- QUICKSTART.md - Quick start guide
- INSTALLATION-SUCCESS.md - Installation success report
- ARCHITECTURE-DIAGRAMS.md - System architecture diagrams

🔧 Configuration:
- Environment variables setup
- Makefile for easy commands
- Scripts for deployment and monitoring

✅ Status: Ready for development"

echo ""
echo "✅ Git repository initialisé avec succès!"
echo ""
echo "📋 Prochaines étapes:"
echo ""
echo "1. Créer un repository sur GitHub:"
echo "   - Aller sur https://github.com/new"
echo "   - Nom: phenom-app"
echo "   - Description: Application d'observation de phénomènes OVNI"
echo "   - Visibilité: Public ou Private"
echo ""
echo "2. Lier votre repository local au repository GitHub:"
echo "   git remote add origin https://github.com/VOTRE_USERNAME/phenom-app.git"
echo ""
echo "3. Pousser votre code:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. (Optionnel) Créer une branche de développement:"
echo "   git checkout -b develop"
echo "   git push -u origin develop"
echo ""
echo "🎊 Votre projet est maintenant versionné!"
