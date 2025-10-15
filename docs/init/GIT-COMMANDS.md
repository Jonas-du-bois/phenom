# 🚀 Commandes Git Essentielles - Phenom App

## 📋 Configuration Initiale

### 1. Configurer Git (si ce n'est pas déjà fait)

```bash
# Configuration de votre identité
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"

# Vérifier la configuration
git config --list
```

### 2. Initialiser le Repository

```bash
# Initialiser Git (déjà fait si vous avez exécuté init-git.sh)
git init

# Vérifier le statut
git status
```

## 📦 Premier Commit (Déjà Fait)

Le premier commit a déjà été créé avec tous les fichiers du projet :

```bash
# Voir l'historique
git log --oneline

# Devrait afficher:
# xxxxxxx 🎉 Initial commit - Phenom App
```

## 🔗 Lier à GitHub

### 1. Créer un repository sur GitHub

1. Aller sur https://github.com/new
2. Remplir les informations :
   - **Repository name** : `phenom-app`
   - **Description** : `🛸 Application d'observation de phénomènes OVNI avec géolocalisation et capture photo`
   - **Visibility** : Public (recommandé) ou Private
   - **❌ Ne PAS** cocher "Initialize this repository with a README" (on l'a déjà)
3. Cliquer "Create repository"

### 2. Lier le repository local à GitHub

```bash
# Remplacer VOTRE_USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/VOTRE_USERNAME/phenom-app.git

# Vérifier le remote
git remote -v

# Pousser le code
git branch -M main
git push -u origin main
```

## 🌿 Workflow de Développement

### Stratégie de Branches

```
main (production)
  └── develop (développement)
       ├── feature/auth (authentification)
       ├── feature/observations (CRUD observations)
       ├── feature/map (carte interactive)
       └── feature/admin (interface admin)
```

### Créer une Branche de Développement

```bash
# Créer et basculer sur la branche develop
git checkout -b develop

# Pousser la branche develop
git push -u origin develop

# Définir develop comme branche par défaut pour le développement
git branch --set-upstream-to=origin/develop develop
```

### Créer une Feature Branch

```bash
# Depuis develop, créer une nouvelle feature
git checkout develop
git checkout -b feature/auth

# Travailler sur la feature...
# Faire des commits réguliers

# Pousser la feature branch
git push -u origin feature/auth
```

### Workflow Standard

```bash
# 1. Créer une branche pour votre feature
git checkout -b feature/nom-de-la-feature

# 2. Faire des modifications
# ... éditer les fichiers ...

# 3. Ajouter les modifications
git add .

# 4. Commiter avec un message descriptif
git commit -m "✨ Add: Description de la feature"

# 5. Pousser vers GitHub
git push origin feature/nom-de-la-feature

# 6. Sur GitHub, créer une Pull Request
# develop ← feature/nom-de-la-feature

# 7. Après merge, supprimer la branche
git checkout develop
git pull origin develop
git branch -d feature/nom-de-la-feature
git push origin --delete feature/nom-de-la-feature
```

## 📝 Convention de Messages de Commit

Utiliser des emojis et des préfixes clairs :

```bash
# Nouvelles fonctionnalités
git commit -m "✨ Add: Authentification JWT"
git commit -m "✨ Add: Upload de photos"

# Corrections de bugs
git commit -m "🐛 Fix: Problème de connexion MongoDB"
git commit -m "🐛 Fix: Validation du formulaire"

# Documentation
git commit -m "📚 Docs: Mise à jour du README"
git commit -m "📚 Docs: Guide d'installation"

# Refactoring
git commit -m "♻️ Refactor: Restructuration des routes"
git commit -m "♻️ Refactor: Amélioration du code"

# Performance
git commit -m "⚡ Perf: Optimisation des requêtes DB"
git commit -m "⚡ Perf: Cache des images"

# Style
git commit -m "💄 Style: Design de la page d'accueil"
git commit -m "💄 Style: Responsive mobile"

# Tests
git commit -m "✅ Test: Tests unitaires auth"
git commit -m "✅ Test: Tests E2E observations"

# Configuration
git commit -m "🔧 Config: Variables d'environnement"
git commit -m "🔧 Config: Docker compose"

# Déploiement
git commit -m "🚀 Deploy: Configuration Render"
git commit -m "🚀 Deploy: Script de déploiement"

# Sécurité
git commit -m "🔒 Security: Validation des inputs"
git commit -m "🔒 Security: Rate limiting"
```

## 🔄 Commandes Quotidiennes

### Voir les modifications

```bash
# Statut des fichiers
git status

# Différences non staged
git diff

# Différences staged
git diff --staged

# Historique des commits
git log --oneline --graph --all
```

### Gérer les modifications

```bash
# Ajouter des fichiers spécifiques
git add backend/src/routes/auth.js
git add frontend/src/views/LoginView.vue

# Ajouter tous les fichiers modifiés
git add .

# Annuler un ajout (unstage)
git reset backend/src/routes/auth.js

# Annuler les modifications d'un fichier
git checkout -- backend/src/routes/auth.js

# Supprimer un commit (attention !)
git reset --soft HEAD~1  # Garde les modifications
git reset --hard HEAD~1  # SUPPRIME les modifications !
```

### Synchroniser avec GitHub

```bash
# Récupérer les dernières modifications
git pull origin develop

# Pousser vos commits
git push origin develop

# Voir les branches distantes
git branch -r

# Mettre à jour toutes les branches
git fetch --all
```

## 🔀 Merge et Rebase

### Merger une feature dans develop

```bash
# Basculer sur develop
git checkout develop

# Récupérer les dernières modifications
git pull origin develop

# Merger la feature
git merge feature/auth

# Pousser le merge
git push origin develop
```

### Rebase (garder un historique propre)

```bash
# Depuis votre feature branch
git checkout feature/auth

# Rebase sur develop
git rebase develop

# Résoudre les conflits si nécessaire
# ... éditer les fichiers en conflit ...
git add .
git rebase --continue

# Force push (attention !)
git push -f origin feature/auth
```

## 🏷️ Tags et Releases

### Créer un tag de version

```bash
# Tag annoté (recommandé)
git tag -a v1.0.0 -m "🎉 Version 1.0.0 - First release"

# Lister les tags
git tag

# Pousser les tags
git push origin v1.0.0

# Pousser tous les tags
git push origin --tags
```

### Créer une release sur GitHub

1. Aller sur votre repository GitHub
2. Cliquer sur "Releases" → "Create a new release"
3. Sélectionner le tag (ex: v1.0.0)
4. Remplir les notes de release
5. Publier

## 🚨 Urgences et Hotfixes

### Créer un hotfix depuis main

```bash
# Créer une branche hotfix
git checkout main
git checkout -b hotfix/critical-bug

# Faire la correction
# ... éditer les fichiers ...

# Commiter
git commit -m "🚑 Hotfix: Correction bug critique"

# Merger dans main
git checkout main
git merge hotfix/critical-bug
git push origin main

# Merger aussi dans develop
git checkout develop
git merge hotfix/critical-bug
git push origin develop

# Supprimer la branche hotfix
git branch -d hotfix/critical-bug
```

## 🗑️ Nettoyage

### Nettoyer les branches

```bash
# Voir les branches locales
git branch

# Supprimer une branche locale
git branch -d feature/auth

# Supprimer une branche distante
git push origin --delete feature/auth

# Nettoyer les références distantes obsolètes
git fetch --prune

# Lister les branches mergées
git branch --merged
```

### Nettoyer l'historique

```bash
# Voir la taille du repository
du -sh .git

# Garbage collection
git gc --aggressive --prune=now

# Nettoyer les fichiers non trackés
git clean -fd
```

## 📚 Ressources

### Aide Git

```bash
# Aide générale
git help

# Aide pour une commande spécifique
git help commit
git help merge
```

### Alias Utiles

Ajouter dans `~/.gitconfig` :

```ini
[alias]
  st = status
  co = checkout
  br = branch
  ci = commit
  unstage = reset HEAD --
  last = log -1 HEAD
  visual = log --oneline --graph --all --decorate
  amend = commit --amend --no-edit
```

Utilisation :
```bash
git st        # au lieu de git status
git co main   # au lieu de git checkout main
git visual    # voir l'historique graphique
```

## 🎯 Checklist Avant de Pousser

- [ ] Code fonctionne localement
- [ ] Tests passent : `npm test`
- [ ] Lint OK : `npm run lint`
- [ ] Build OK : `docker-compose build`
- [ ] .env et secrets pas commitées
- [ ] Message de commit descriptif
- [ ] Branche à jour : `git pull origin develop`

## 🆘 En Cas de Problème

### "I accidentally committed to main"

```bash
# Annuler le dernier commit (garde les modifications)
git reset --soft HEAD~1

# Créer la bonne branche
git checkout -b feature/ma-feature

# Commiter à nouveau
git commit -m "✨ Add: Ma feature"
```

### "I have conflicts"

```bash
# Voir les fichiers en conflit
git status

# Éditer les fichiers et choisir les bonnes versions
# Chercher les marqueurs: <<<<<<<, =======, >>>>>>>

# Marquer comme résolu
git add fichier-resolu.js

# Continuer le merge/rebase
git merge --continue
# ou
git rebase --continue
```

### "I want to undo everything"

```bash
# Revenir au dernier commit (ATTENTION: perte de données)
git reset --hard HEAD

# Revenir à un commit spécifique
git reset --hard abc1234
```

---

**Dernière mise à jour** : 15 octobre 2025  
**Auteur** : Équipe Phenom
