@echo off
title RealOps - Starting Bot and Dashboard
color 0A

echo ========================================
echo    RealOps System Startup
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js found
echo.

:: Start Discord Bot
echo ========================================
echo    Starting Discord Bot...
echo ========================================
cd /d "%~dp0bot"
if not exist "node_modules" (
    echo [INFO] Installing bot dependencies...
    call npm install
)
start "RealOps Bot" cmd /k "node index.js"
echo [OK] Bot started in new window
echo.

:: Wait a moment for bot to initialize
timeout /t 2 /nobreak >nul

:: Start Dashboard Backend
echo ========================================
echo    Starting Dashboard Backend...
echo ========================================
cd /d "%~dp0dashboard\backend"
if not exist "node_modules" (
    echo [INFO] Installing backend dependencies...
    call npm install
)
start "RealOps Backend" cmd /k "npm start"
echo [OK] Backend started in new window
echo.

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

:: Start Dashboard Frontend
echo ========================================
echo    Starting Dashboard Frontend...
echo ========================================
cd /d "%~dp0dashboard\frontend"
if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies...
    call npm install
)
start "RealOps Dashboard" cmd /k "npm start"
echo [OK] Frontend started in new window
echo.

echo ========================================
echo    All Services Started!
echo ========================================
echo.
echo Discord Bot:      Running on new terminal
echo Backend API:      http://localhost:3001
echo Dashboard:        http://localhost:3000
echo.
echo Press any key to open dashboard in browser...
pause >nul

:: Open dashboard in default browser
start http://localhost:3000

echo.
echo [INFO] Dashboard opened in browser
echo.
echo To stop all services:
echo - Close all RealOps windows
echo - Or press Ctrl+C in each terminal
echo.
echo Press any key to exit this window...
pause >nul
