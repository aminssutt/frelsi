@echo off
echo ================================
echo FRELSI - Tests Pre-Deploiement
echo ================================
echo.

REM Verifier que Python est installe
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Python n'est pas installe ou n'est pas dans le PATH
    echo Telechargez Python depuis: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Installer les dependances si necessaire
echo [INFO] Verification des dependances...
python -m pip install requests --quiet

echo.
echo [INFO] Lancement des tests...
echo.

REM Executer les tests
python test-all.py

echo.
echo ================================
echo Tests termines
echo ================================
pause
