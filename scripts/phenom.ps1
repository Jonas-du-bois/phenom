<#
.SYNOPSIS
    Phenom App - Script de gestion pour Windows
.DESCRIPTION
    Script PowerShell pour gérer l'application Phenom sur Windows
    Remplace le Makefile pour une meilleure compatibilité Windows
.PARAMETER Command
    La commande à exécuter (help pour voir toutes les commandes)
.EXAMPLE
    .\phenom.ps1 start
    .\phenom.ps1 logs
    .\phenom.ps1 help
#>

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

# ============================================================================
# Configuration
# ============================================================================

# Aller à la racine du projet
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir "..")

$ErrorActionPreference = "Stop"
$ComposeFile = "docker-compose.atlas.yml"
$ComposeProdFile = "docker-compose.prod.yml"
$ProjectName = "phenom"

# ============================================================================
# Fonctions utilitaires
# ============================================================================

function Print-Header {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                    🛸 Phenom App Manager 🛸                   ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Print-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Print-Section {
    param([string]$Title)
    Write-Host "`n$Title" -ForegroundColor Magenta -BackgroundColor Black
}

function Check-Docker {
    try {
        $null = docker --version
        $null = docker info 2>$null
    } catch {
        Print-Error "Docker n'est pas installé ou n'est pas démarré."
        Write-Host "Installez Docker Desktop depuis https://docker.com" -ForegroundColor Yellow
        exit 1
    }
}

function Check-EnvFile {
    if (-not (Test-Path ".env")) {
        Print-Warning "Fichier .env introuvable. Création depuis .env.example..."
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Print-Success "Fichier .env créé. N'oubliez pas de le configurer!"
            Print-Info "Éditez le fichier .env avec vos vraies valeurs (MongoDB, JWT secrets, etc.)"
        } else {
            Print-Error "Fichier .env.example introuvable!"
            exit 1
        }
    }
}

# ============================================================================
# Commandes principales
# ============================================================================

function Show-Help {
    Print-Header
    Write-Host "📋 Commandes disponibles:" -ForegroundColor Cyan
    Write-Host ""
    
    Print-Section "🚀 Démarrage et arrêt:"
    Write-Host "  start              Démarrer tous les services"
    Write-Host "  stop               Arrêter tous les services"
    Write-Host "  restart            Redémarrer tous les services"
    Write-Host "  status             Afficher le statut des services"
    Write-Host ""
    
    Print-Section "🏗️  Build et installation:"
    Write-Host "  build              Build les images Docker"
    Write-Host "  rebuild            Rebuild sans cache"
    Write-Host "  install            Installer toutes les dépendances"
    Write-Host "  install-backend    Installer dépendances backend uniquement"
    Write-Host "  install-frontend   Installer dépendances frontend uniquement"
    Write-Host ""
    
    Print-Section "📊 Logs et monitoring:"
    Write-Host "  logs               Voir tous les logs en temps réel"
    Write-Host "  logs-backend       Logs du backend uniquement"
    Write-Host "  logs-frontend      Logs du frontend uniquement"
    Write-Host "  logs-mongodb       Logs MongoDB uniquement"
    Write-Host ""
    
    Print-Section "🔧 Shell et debug:"
    Write-Host "  shell-backend      Accéder au shell du container backend"
    Write-Host "  shell-frontend     Accéder au shell du container frontend"
    Write-Host "  db-shell           Accéder au MongoDB shell"
    Write-Host ""
    
    Print-Section "🗄️  Base de données:"
    Write-Host "  seed               Peupler la base avec des données de test"
    Write-Host "  create-admin       Créer un compte administrateur"
    Write-Host "  check-db           Vérifier la connexion MongoDB"
    Write-Host ""
    
    Print-Section "🧪 Tests:"
    Write-Host "  test               Lancer tous les tests"
    Write-Host "  test-backend       Tests backend uniquement"
    Write-Host "  test-frontend      Tests frontend uniquement"
    Write-Host "  test-coverage      Tests avec rapport de couverture"
    Write-Host ""
    
    Print-Section "🚢 Production:"
    Write-Host "  prod-build         Build pour production"
    Write-Host "  prod-start         Démarrer en production"
    Write-Host "  prod-stop          Arrêter production"
    Write-Host "  prod-logs          Logs de production"
    Write-Host "  prod-restart       Redémarrer production"
    Write-Host ""
    
    Print-Section "🧹 Nettoyage:"
    Write-Host "  clean              Nettoyer containers et volumes"
    Write-Host "  clean-all          Nettoyage complet (+ images)"
    Write-Host "  prune              Nettoyer le système Docker"
    Write-Host ""
    
    Print-Section "ℹ️  Informations:"
    Write-Host "  info               Afficher les informations système"
    Write-Host "  health             Vérifier la santé de l'application"
    Write-Host "  urls               Afficher les URLs d'accès"
    Write-Host "  help               Afficher cette aide"
    Write-Host ""
    
    Write-Host "💡 Exemples:" -ForegroundColor Cyan
    Write-Host "  .\phenom.ps1 start"
    Write-Host "  .\phenom.ps1 logs-backend"
    Write-Host "  .\phenom.ps1 seed"
    Write-Host ""
}

function Start-App {
    Print-Header
    Write-Host "🚀 Démarrage de l'application Phenom..." -ForegroundColor Green
    Write-Host ""
    
    Check-Docker
    Check-EnvFile
    
    docker-compose -f $ComposeFile up -d
    
    Write-Host ""
    Print-Success "Application démarrée avec succès!"
    Write-Host ""
    Show-URLs
}

function Stop-App {
    Print-Header
    Write-Host "🛑 Arrêt de l'application..." -ForegroundColor Yellow
    Write-Host ""
    
    docker-compose -f $ComposeFile down
    
    Print-Success "Application arrêtée!"
}

function Restart-App {
    Print-Header
    Write-Host "🔄 Redémarrage de l'application..." -ForegroundColor Yellow
    Write-Host ""
    
    docker-compose -f $ComposeFile restart
    
    Print-Success "Application redémarrée!"
}

function Show-Status {
    Print-Header
    Write-Host "📊 Statut des services:" -ForegroundColor Cyan
    Write-Host ""
    
    docker-compose -f $ComposeFile ps
}

function Build-App {
    Print-Header
    Write-Host "🏗️  Build des images Docker..." -ForegroundColor Blue
    Write-Host ""
    
    Check-Docker
    
    docker-compose -f $ComposeFile build
    
    Print-Success "Images buildées avec succès!"
}

function Update-AppNoCache {
    Print-Header
    Write-Host "🏗️  Rebuild complet (sans cache)..." -ForegroundColor Blue
    Write-Host ""
    
    Check-Docker
    
    docker-compose -f $ComposeFile build --no-cache
    
    Print-Success "Rebuild terminé!"
}

function Show-Logs {
    Print-Header
    Write-Host "📊 Logs de tous les services (Ctrl+C pour quitter):" -ForegroundColor Cyan
    Write-Host ""
    
    docker-compose -f $ComposeFile logs -f
}

function Show-LogsBackend {
    Print-Header
    Write-Host "📊 Logs du backend (Ctrl+C pour quitter):" -ForegroundColor Cyan
    Write-Host ""
    
    docker-compose -f $ComposeFile logs -f backend
}

function Show-LogsFrontend {
    Print-Header
    Write-Host "📊 Logs du frontend (Ctrl+C pour quitter):" -ForegroundColor Cyan
    Write-Host ""
    
    docker-compose -f $ComposeFile logs -f frontend
}

function Show-LogsMongoDB {
    Print-Header
    Write-Host "⚠️  MongoDB local n'est pas disponible (utilise MongoDB Atlas)" -ForegroundColor Yellow
    Write-Host ""
    Print-Info "Pour voir les logs MongoDB, connectez-vous à MongoDB Atlas:"
    Write-Host "  https://cloud.mongodb.com" -ForegroundColor Cyan
}

function Open-ShellBackend {
    Print-Header
    Write-Host "🔧 Ouverture du shell backend..." -ForegroundColor Cyan
    Write-Host ""
    
    docker-compose -f $ComposeFile exec backend sh
}

function Open-ShellFrontend {
    Print-Header
    Write-Host "🔧 Ouverture du shell frontend..." -ForegroundColor Cyan
    Write-Host ""
    
    docker-compose -f $ComposeFile exec frontend sh
}

function Open-DbShell {
    Print-Header
    Write-Host "⚠️  MongoDB local n'est pas disponible (utilise MongoDB Atlas)" -ForegroundColor Yellow
    Write-Host ""
    Print-Info "Pour accéder à MongoDB, utilisez:"
    Write-Host "  1. MongoDB Atlas UI: https://cloud.mongodb.com" -ForegroundColor Cyan
    Write-Host "  2. MongoDB Compass avec votre connection string" -ForegroundColor Cyan
    Write-Host "  3. mongosh avec: mongosh `"$env:MONGODB_URI`"" -ForegroundColor Cyan
}

function Seed-Database {
    Print-Header
    Write-Host "🌱 Peuplement de la base de données..." -ForegroundColor Green
    Write-Host ""
    
    docker-compose -f $ComposeFile exec backend npm run seed
    
    Print-Success "Base de données peuplée!"
}

function Create-Admin {
    Print-Header
    Write-Host "👑 Création d'un compte administrateur..." -ForegroundColor Green
    Write-Host ""
    
    docker-compose -f $ComposeFile exec backend npm run create-admin
}

function Check-Database {
    Print-Header
    Write-Host "🔍 Vérification de la connexion MongoDB..." -ForegroundColor Cyan
    Write-Host ""
    
    docker-compose -f $ComposeFile exec backend npm run check-db
}

function Run-Tests {
    Print-Header
    Write-Host "🧪 Lancement de tous les tests..." -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Tests Backend:" -ForegroundColor Yellow
    docker-compose -f $ComposeFile exec backend npm test
    
    Write-Host "`nTests Frontend:" -ForegroundColor Yellow
    docker-compose -f $ComposeFile exec frontend npm test
    
    Print-Success "Tous les tests terminés!"
}

function Run-TestsBackend {
    Print-Header
    Write-Host "🧪 Tests backend..." -ForegroundColor Cyan
    Write-Host ""
    
    docker-compose -f $ComposeFile exec backend npm test
}

function Run-TestsFrontend {
    Print-Header
    Write-Host "🧪 Tests frontend..." -ForegroundColor Cyan
    Write-Host ""
    
    docker-compose -f $ComposeFile exec frontend npm test
}

function Run-TestsCoverage {
    Print-Header
    Write-Host "🧪 Tests avec couverture..." -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Coverage Backend:" -ForegroundColor Yellow
    docker-compose -f $ComposeFile exec backend npm run test:coverage
    
    Write-Host "`nCoverage Frontend:" -ForegroundColor Yellow
    docker-compose -f $ComposeFile exec frontend npm run test:coverage
    
    Print-Success "Rapports de couverture générés!"
}

function Install-Dependencies {
    Print-Header
    Write-Host "📦 Installation de toutes les dépendances..." -ForegroundColor Blue
    Write-Host ""
    
    Write-Host "Installation Backend..." -ForegroundColor Yellow
    Push-Location backend
    npm install
    Pop-Location
    
    Write-Host "`nInstallation Frontend..." -ForegroundColor Yellow
    Push-Location frontend
    npm install
    Pop-Location
    
    Print-Success "Toutes les dépendances installées!"
}

function Install-BackendDependencies {
    Print-Header
    Write-Host "📦 Installation des dépendances backend..." -ForegroundColor Blue
    Write-Host ""
    
    Push-Location backend
    npm install
    Pop-Location
    
    Print-Success "Dépendances backend installées!"
}

function Install-FrontendDependencies {
    Print-Header
    Write-Host "📦 Installation des dépendances frontend..." -ForegroundColor Blue
    Write-Host ""
    
    Push-Location frontend
    npm install
    Pop-Location
    
    Print-Success "Dépendances frontend installées!"
}

function Clear-App {
    Print-Header
    Write-Host "🧹 Nettoyage des containers et volumes..." -ForegroundColor Yellow
    Write-Host ""
    
    docker-compose -f $ComposeFile down -v
    
    Print-Success "Nettoyage terminé!"
}

function Clear-All {
    Print-Header
    Write-Host "🧹 Nettoyage complet (containers, volumes, images)..." -ForegroundColor Red
    Write-Host ""
    
    $confirmation = Read-Host "⚠️  Cela va supprimer tous les containers, volumes et images. Continuer? (y/N)"
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        docker-compose -f $ComposeFile down -v --rmi all
        Print-Success "Nettoyage complet terminé!"
    } else {
        Print-Warning "Nettoyage annulé"
    }
}

function Clear-DockerSystem {
    Print-Header
    Write-Host "🧹 Nettoyage du système Docker..." -ForegroundColor Yellow
    Write-Host ""
    
    docker system prune -f
    
    Print-Success "Système Docker nettoyé!"
}

function New-ProductionBuild {
    Print-Header
    Write-Host "🏗️  Build des images de production..." -ForegroundColor Blue
    Write-Host ""
    
    Check-Docker
    
    docker-compose -f $ComposeProdFile build --no-cache
    
    Print-Success "Images de production buildées!"
}

function Start-Production {
    Print-Header
    Write-Host "🚀 Démarrage en mode production..." -ForegroundColor Green
    Write-Host ""
    
    Check-Docker
    Check-EnvFile
    
    docker-compose -f $ComposeProdFile up -d
    
    Print-Success "Application en production démarrée!"
}

function Stop-Production {
    Print-Header
    Write-Host "🛑 Arrêt de la production..." -ForegroundColor Yellow
    Write-Host ""
    
    docker-compose -f $ComposeProdFile down
    
    Print-Success "Production arrêtée!"
}

function Show-ProductionLogs {
    Print-Header
    Write-Host "📊 Logs de production (Ctrl+C pour quitter):" -ForegroundColor Cyan
    Write-Host ""
    
    docker-compose -f $ComposeProdFile logs -f
}

function Restart-Production {
    Print-Header
    Write-Host "🔄 Redémarrage de la production..." -ForegroundColor Yellow
    Write-Host ""
    
    docker-compose -f $ComposeProdFile restart
    
    Print-Success "Production redémarrée!"
}

function Show-Info {
    Print-Header
    Write-Host "ℹ️  Informations système:" -ForegroundColor Cyan
    Write-Host ""
    
    Print-Section "📦 Versions installées:"
    Write-Host "Docker: $(docker --version)"
    Write-Host "Docker Compose: $(docker-compose --version)"
    if (Get-Command node -ErrorAction SilentlyContinue) {
        Write-Host "Node.js: $(node --version)"
        Write-Host "npm: $(npm --version)"
    }
    
    Write-Host ""
    Print-Section "🐳 Containers Docker:"
    docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"
    
    Write-Host ""
    Print-Section "💾 Utilisation disque Docker:"
    docker system df
}

function Test-Health {
    Print-Header
    Write-Host "🏥 Vérification de la santé de l'application..." -ForegroundColor Cyan
    Write-Host ""
    
    # Vérifier Docker
    try {
        $null = docker info 2>$null
        Print-Success "Docker est opérationnel"
    } catch {
        Print-Error "Docker n'est pas accessible"
        exit 1
    }
    
    # Vérifier les containers
    $running = (docker-compose -f $ComposeFile ps --services --filter "status=running" | Measure-Object).Count
    $total = (docker-compose -f $ComposeFile ps --services | Measure-Object).Count
    
    if ($running -eq $total -and $total -gt 0) {
        Print-Success "Tous les services sont en cours d'exécution ($running/$total)"
    } else {
        Print-Warning "Certains services ne sont pas démarrés ($running/$total)"
    }
    
    # Test de connectivité
    Write-Host ""
    Print-Section "🌐 Tests de connectivité:"
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        Print-Success "Backend API accessible"
    } catch {
        Print-Warning "Backend API non accessible"
    }
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        Print-Success "Frontend accessible"
    } catch {
        Print-Warning "Frontend non accessible"
    }
}

function Show-URLs {
    Write-Host "🌐 URLs d'accès:" -ForegroundColor Cyan
    Write-Host "📍 Frontend:         " -NoNewline -ForegroundColor Green
    Write-Host "http://localhost"
    Write-Host "📍 Backend API:      " -NoNewline -ForegroundColor Green
    Write-Host "http://localhost:3000"
    Write-Host "📍 API Documentation:" -NoNewline -ForegroundColor Green
    Write-Host " http://localhost:3000/api-docs"
    Write-Host "📍 MongoDB Atlas:    " -NoNewline -ForegroundColor Green
    Write-Host "https://cloud.mongodb.com"
}

# ============================================================================
# Router principal
# ============================================================================

switch ($Command.ToLower()) {
    "start" { Start-App }
    "stop" { Stop-App }
    "restart" { Restart-App }
    "status" { Show-Status }
    "build" { Build-App }
    "rebuild" { Update-AppNoCache }
    "logs" { Show-Logs }
    "logs-backend" { Show-LogsBackend }
    "logs-frontend" { Show-LogsFrontend }
    "logs-mongodb" { Show-LogsMongoDB }
    "shell-backend" { Open-ShellBackend }
    "shell-frontend" { Open-ShellFrontend }
    "db-shell" { Open-DbShell }
    "seed" { Seed-Database }
    "create-admin" { Create-Admin }
    "check-db" { Check-Database }
    "test" { Run-Tests }
    "test-backend" { Run-TestsBackend }
    "test-frontend" { Run-TestsFrontend }
    "test-coverage" { Run-TestsCoverage }
    "install" { Install-Dependencies }
    "install-backend" { Install-BackendDependencies }
    "install-frontend" { Install-FrontendDependencies }
    "clean" { Clear-App }
    "clean-all" { Clear-All }
    "prune" { Clear-DockerSystem }
    "prod-build" { New-ProductionBuild }
    "prod-start" { Start-Production }
    "prod-stop" { Stop-Production }
    "prod-logs" { Show-ProductionLogs }
    "prod-restart" { Restart-Production }
    "info" { Show-Info }
    "health" { Check-Health }
    "urls" { 
        Print-Header
        Show-URLs 
    }
    "help" { Show-Help }
    default {
        Print-Error "Commande inconnue: $Command"
        Write-Host ""
        Show-Help
        exit 1
    }
}
