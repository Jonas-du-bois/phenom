@echo off
REM ============================================================================
REM Phenom App - Démarrage (Windows Batch)
REM ============================================================================

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    🛸 Phenom App Manager 🛸                    ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Démarrage de l'application Phenom...
echo.

REM Vérifier si .env existe, sinon le créer
if not exist ".env" (
    echo ⚠️  Fichier .env introuvable
    if exist ".env.example" (
        copy .env.example .env
        echo ✅ Fichier .env créé depuis .env.example
        echo.
        echo 📝 N'oubliez pas de le configurer avec vos vraies valeurs!
        echo.
    ) else (
        echo ❌ Fichier .env.example introuvable
        pause
        exit /b 1
    )
)

REM Démarrer les services
docker-compose up -d

if %errorlevel% equ 0 (
    echo.
    echo ✅ Application démarrée avec succès!
    echo.
    echo 🌐 URLs d'accès:
    echo 📍 Frontend:         http://localhost
    echo 📍 Backend API:      http://localhost:3000
    echo 📍 API Documentation: http://localhost:3000/api-docs
    echo 📍 MongoDB Express:  http://localhost:8081 (admin/admin123)
    echo.
) else (
    echo.
    echo ❌ Erreur lors du démarrage
    echo.
)

pause
