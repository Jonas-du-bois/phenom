#!/bin/bash
# Script pour vérifier si Render a déployé la nouvelle version

echo "🔍 Vérification du déploiement Render..."
echo ""

# Récupérer le hash actuel du fichier HomeView
CURRENT_HASH=$(curl -s https://phenom-frontend.onrender.com/ | grep -o 'HomeView-[^.]*\.js' | head -1)

echo "📦 Hash actuel: $CURRENT_HASH"
echo ""
