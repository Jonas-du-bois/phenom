#!/bin/bash
# Script d'initialisation du Wiki GitHub pour Phenom

echo "🚀 Initialisation du Wiki GitHub Phenom..."
echo ""

# Étape 1: Vérifier que le wiki existe
echo "📋 Étape 1: Vérifier l'activation du wiki"
echo "   ➡️  Allez sur: https://github.com/Jonas-du-bois/phenom/settings"
echo "   ➡️  Section 'Features' → Cochez 'Wikis'"
echo ""
read -p "✅ Wiki activé ? (Entrée pour continuer) " -n 1 -r
echo ""

# Étape 2: Cloner le wiki
echo "📥 Étape 2: Clonage du wiki..."
cd ..
if [ -d "phenom.wiki" ]; then
    echo "⚠️  Le dossier phenom.wiki existe déjà"
    read -p "Voulez-vous le supprimer ? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf phenom.wiki
        git clone https://github.com/Jonas-du-bois/phenom.wiki.git
    fi
else
    git clone https://github.com/Jonas-du-bois/phenom.wiki.git
fi

# Étape 3: Copier la documentation
echo "📂 Étape 3: Copie de la documentation..."
cd phenom.wiki

# Copier tous les fichiers markdown principaux
cp ../phenom/docs/Home.md .
cp ../phenom/docs/_Sidebar.md .
cp ../phenom/docs/_Footer.md .

# Copier les dossiers
cp -r ../phenom/docs/api .
cp -r ../phenom/docs/architecture .
cp -r ../phenom/docs/design .
cp -r ../phenom/docs/guides .

echo "✅ Documentation copiée"

# Étape 4: Commit et push
echo "📤 Étape 4: Publication sur GitHub..."
git add .
git status

echo ""
read -p "🚀 Voulez-vous publier maintenant ? (y/N) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "docs: Initialize wiki with complete documentation

- Add Home page with navigation
- Add sidebar and footer
- Organize documentation in categories:
  - api/ - REST API endpoints
  - architecture/ - Backend, Frontend, Database
  - design/ - Design system
  - guides/ - Quick start, deployment, git workflow
- Remove redundant files
- Optimize for GitHub Wiki format"
    
    git push origin master
    
    echo ""
    echo "✅ Wiki publié avec succès !"
    echo "🌐 Visitez: https://github.com/Jonas-du-bois/phenom/wiki"
else
    echo "ℹ️  Pour publier plus tard, utilisez:"
    echo "   cd phenom.wiki"
    echo "   git push origin master"
fi

echo ""
echo "🎉 Configuration terminée !"
