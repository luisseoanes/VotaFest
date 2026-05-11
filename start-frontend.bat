@echo off
echo ====================================
echo   VOTAFEST - Iniciando Frontend
echo ====================================
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo Instalando dependencias npm...
    npm install
)

echo.
echo Frontend corriendo en: http://localhost:3000
echo.
npm run dev
pause
