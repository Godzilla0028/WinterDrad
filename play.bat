@echo off
REM Quick start script for WinterDrad browser game
REM This script starts a local web server and opens the game in your browser

echo.
echo ===========================================
echo    WinterDrad Voxel Game - Quick Start
echo ===========================================
echo.

cd /d "%~dp0"

REM Check for Python 3
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Found Python
    echo.
    echo Starting web server on http://localhost:8080
    echo.
    echo Controls:
    echo   - Click on the game canvas to start
    echo   - WASD to move
    echo   - Mouse to look around  
    echo   - ESC to release mouse
    echo.
    echo Opening browser...
    echo Press Ctrl+C to stop the server
    echo -------------------------------------------
    echo.
    
    REM Open browser after 2 seconds
    start "" timeout /t 2 /nobreak >nul && start http://localhost:8080
    
    REM Start server
    python -m http.server 8080
    
) else (
    echo [ERROR] Python not found!
    echo.
    echo Please install Python from https://www.python.org/downloads/
    echo or manually start a web server and open index.html
    echo.
    pause
    exit /b 1
)
