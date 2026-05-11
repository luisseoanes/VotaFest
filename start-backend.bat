@echo off
echo ====================================
echo   VOTAFEST - Iniciando Backend
echo ====================================
cd /d "%~dp0backend"

if not exist ".venv" (
    echo Creando entorno virtual...
    python -m venv .venv
)

call .venv\Scripts\activate.bat

echo Instalando dependencias...
pip install -r requirements.txt --quiet

echo.
echo Backend corriendo en: http://localhost:8000
echo Documentacion API:    http://localhost:8000/docs
echo.
uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
