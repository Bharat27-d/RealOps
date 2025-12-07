@echo off
title RealOps - Stopping All Services
color 0C

echo ========================================
echo    RealOps - Stopping All Services
echo ========================================
echo.

echo [INFO] Stopping Node.js processes...
echo.

:: Kill all node processes (be careful with this!)
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo [OK] All Node.js processes stopped
) else (
    echo [WARN] No Node.js processes found
)

echo.
echo ========================================
echo    All Services Stopped
echo ========================================
echo.
pause
