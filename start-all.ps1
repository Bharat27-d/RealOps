# RealOps System Startup Script
# Starts Discord Bot, Backend API, and Frontend Dashboard

$Host.UI.RawUI.WindowTitle = "RealOps - System Startup"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RealOps System Startup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[INFO] Node.js found: $nodeVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Function to start a service in a new window
function Start-Service {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [string]$Color = "Green"
    )
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   Starting $Name..." -ForegroundColor $Color
    Write-Host "========================================" -ForegroundColor Cyan
    
    $fullPath = Join-Path $rootDir $Path
    
    # Check if node_modules exists, install if not
    if (-not (Test-Path (Join-Path $fullPath "node_modules"))) {
        Write-Host "[INFO] Installing dependencies for $Name..." -ForegroundColor Yellow
        Push-Location $fullPath
        npm install
        Pop-Location
    }
    
    # Start the service in a new PowerShell window
    $startCommand = "Set-Location '$fullPath'; $Command; Read-Host 'Press Enter to close'"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $startCommand -WindowStyle Normal
    
    Write-Host "[OK] $Name started in new window" -ForegroundColor Green
    Write-Host ""
}

# Start Discord Bot
Start-Service -Name "Discord Bot" -Path "bot" -Command "node index.js" -Color "Magenta"
Start-Sleep -Seconds 2

# Start Backend API
Start-Service -Name "Backend API" -Path "dashboard\backend" -Command "npm start" -Color "Blue"
Start-Sleep -Seconds 3

# Start Frontend Dashboard
Start-Service -Name "Dashboard Frontend" -Path "dashboard\frontend" -Command "npm start" -Color "Cyan"
Start-Sleep -Seconds 2

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   All Services Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Discord Bot:      " -NoNewline; Write-Host "Running on new terminal" -ForegroundColor Green
Write-Host "Backend API:      " -NoNewline; Write-Host "http://localhost:3001" -ForegroundColor Blue
Write-Host "Dashboard:        " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to open dashboard in browser..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open dashboard in default browser
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "[INFO] Dashboard opened in browser" -ForegroundColor Green
Write-Host ""
Write-Host "To stop all services:" -ForegroundColor Yellow
Write-Host "- Close all PowerShell windows" -ForegroundColor Yellow
Write-Host "- Or press Ctrl+C in each terminal" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
