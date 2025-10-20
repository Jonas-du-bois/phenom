@echo off
REM ============================================================================
REM Phenom App - Arrêt (Windows Batch)
REM ============================================================================

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    🛸 Phenom App Manager 🛸                    ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 🛑 Arrêt de l'application...
echo.

docker-compose down

if %errorlevel% equ 0 (
    echo.
    echo ✅ Application arrêtée avec succès!
    echo.
) else (
    echo.
    echo ❌ Erreur lors de l'arrêt
    echo.
)

pause
