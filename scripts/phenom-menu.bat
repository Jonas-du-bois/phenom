@echo off
REM ============================================================================
REM Phenom App - Menu Principal (Windows Batch)
REM ============================================================================

:menu
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    🛸 Phenom App Manager 🛸                    ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 📋 Menu principal:
echo.
echo  [1] 🚀 Démarrer l'application
echo  [2] 🛑 Arrêter l'application
echo  [3] 🔄 Redémarrer l'application
echo  [4] 📊 Voir le statut
echo  [5] 📊 Voir les logs
echo  [6] 🧹 Nettoyer
echo  [7] 🌱 Peupler la base de données
echo  [8] 👑 Créer un admin
echo  [9] ℹ️  Afficher les URLs
echo  [0] ❌ Quitter
echo.
set /p choice="Votre choix: "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto status
if "%choice%"=="5" goto logs
if "%choice%"=="6" goto clean
if "%choice%"=="7" goto seed
if "%choice%"=="8" goto admin
if "%choice%"=="9" goto urls
if "%choice%"=="0" goto end
goto menu

:start
echo.
echo 🚀 Démarrage...
call start.bat
goto menu

:stop
echo.
echo 🛑 Arrêt...
docker-compose down
echo.
pause
goto menu

:restart
echo.
echo 🔄 Redémarrage...
docker-compose restart
echo ✅ Redémarré!
pause
goto menu

:status
echo.
echo 📊 Statut:
docker-compose ps
pause
goto menu

:logs
echo.
echo 📊 Logs (Ctrl+C pour quitter):
echo.
docker-compose logs -f
goto menu

:clean
echo.
echo 🧹 Nettoyage...
docker-compose down -v
echo ✅ Nettoyé!
pause
goto menu

:seed
echo.
echo 🌱 Peuplement de la base...
docker-compose exec backend npm run seed
pause
goto menu

:admin
echo.
echo 👑 Création admin...
docker-compose exec backend npm run create-admin
pause
goto menu

:urls
echo.
echo 🌐 URLs d'accès:
echo.
echo 📍 Frontend:         http://localhost
echo 📍 Backend API:      http://localhost:3000
echo 📍 API Documentation: http://localhost:3000/api-docs
echo 📍 MongoDB Express:  http://localhost:8081
echo.
pause
goto menu

:end
echo.
echo 👋 Au revoir!
echo.
exit
