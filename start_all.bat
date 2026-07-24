@echo off
title RealOps Local Environment
echo =========================================
echo Starting RealOps Local Environment...
echo =========================================
echo.

echo [1/3] Starting Dashboard Backend (Port 3001)...
start "RealOps Backend" cmd /k "cd /d d:\Bots\RealOps\dashboard\backend && node server.js"

echo [2/3] Starting Dashboard Frontend (Port 3000)...
start "RealOps Dashboard" cmd /k "cd /d d:\Bots\RealOps\dashboard\frontend && npm start"

echo [3/3] Starting Public Website (Port 5500)...
start "RealOps Website" cmd /k "cd /d d:\Bots\RealOps && npx -y serve ./website -l 5500"

echo.
echo All services have been launched in separate windows!
echo.
echo - Public Website:  http://localhost:5500
echo - Dashboard:       http://localhost:3000
echo - Backend API:     http://localhost:3001
echo.
echo You can close this window now. The servers will keep running in their new windows.
pause
