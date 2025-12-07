# RealOps - Stop All Services Script

$Host.UI.RawUI.WindowTitle = "RealOps - Stopping Services"
Write-Host "========================================" -ForegroundColor Red
Write-Host "   RealOps - Stopping All Services" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

Write-Host "[INFO] Searching for Node.js processes..." -ForegroundColor Cyan
Write-Host ""

# Get all node processes
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "[FOUND] $($nodeProcesses.Count) Node.js process(es) running" -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($process in $nodeProcesses) {
        try {
            $process | Stop-Process -Force
            Write-Host "[OK] Stopped process: $($process.Id)" -ForegroundColor Green
        } catch {
            Write-Host "[ERROR] Failed to stop process: $($process.Id)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "[OK] All Node.js processes stopped" -ForegroundColor Green
} else {
    Write-Host "[WARN] No Node.js processes found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "   All Services Stopped" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
