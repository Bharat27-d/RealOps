# Deploy script for RealOps
# This syncs local changes to the server

$SERVER = "root@159.69.219.151"
$REMOTE_PATH = "/root/RealOps"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploying RealOps to server..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# ---- BOT FILES ----
Write-Host "`n[1/5] Deploying bot core files..." -ForegroundColor Yellow
scp bot/.env "${SERVER}:${REMOTE_PATH}/bot/"
scp bot/index.js "${SERVER}:${REMOTE_PATH}/bot/"
scp bot/ticketSystem.js "${SERVER}:${REMOTE_PATH}/bot/"
scp bot/customCommandsHandler.js "${SERVER}:${REMOTE_PATH}/bot/"
scp bot/firebase.js "${SERVER}:${REMOTE_PATH}/bot/"
scp bot/config.js "${SERVER}:${REMOTE_PATH}/bot/"
scp bot/dynamicConfig.js "${SERVER}:${REMOTE_PATH}/bot/"
scp bot/package.json "${SERVER}:${REMOTE_PATH}/bot/"

Write-Host "[2/5] Deploying bot commands, events, panels..." -ForegroundColor Yellow
# Ensure remote directories exist
ssh $SERVER "mkdir -p ${REMOTE_PATH}/bot/commands ${REMOTE_PATH}/bot/events ${REMOTE_PATH}/bot/panels ${REMOTE_PATH}/bot/utils"
scp -r bot/commands/* "${SERVER}:${REMOTE_PATH}/bot/commands/"
scp -r bot/events/* "${SERVER}:${REMOTE_PATH}/bot/events/"
scp -r bot/panels/* "${SERVER}:${REMOTE_PATH}/bot/panels/"
# Only copy utils if it has files
if (Test-Path "bot/utils/*") {
    scp -r bot/utils/* "${SERVER}:${REMOTE_PATH}/bot/utils/"
}

# ---- DASHBOARD BACKEND ----
Write-Host "[3/5] Deploying dashboard backend..." -ForegroundColor Yellow
scp dashboard/backend/.env "${SERVER}:${REMOTE_PATH}/dashboard/backend/"
scp dashboard/backend/server.js "${SERVER}:${REMOTE_PATH}/dashboard/backend/"
scp dashboard/backend/discordManager.js "${SERVER}:${REMOTE_PATH}/dashboard/backend/"
scp dashboard/backend/firebase.js "${SERVER}:${REMOTE_PATH}/dashboard/backend/"
scp dashboard/backend/auth.js "${SERVER}:${REMOTE_PATH}/dashboard/backend/"
scp dashboard/backend/package.json "${SERVER}:${REMOTE_PATH}/dashboard/backend/"
# Sync all route files
ssh $SERVER "mkdir -p ${REMOTE_PATH}/dashboard/backend/routes"
scp -r dashboard/backend/routes/* "${SERVER}:${REMOTE_PATH}/dashboard/backend/routes/"

# ---- DASHBOARD FRONTEND ----
Write-Host "[4/5] Deploying dashboard frontend source..." -ForegroundColor Yellow
ssh $SERVER "mkdir -p ${REMOTE_PATH}/dashboard/frontend/src/pages ${REMOTE_PATH}/dashboard/frontend/src/services ${REMOTE_PATH}/dashboard/frontend/src/components ${REMOTE_PATH}/dashboard/frontend/src/utils"
scp dashboard/frontend/src/App.js "${SERVER}:${REMOTE_PATH}/dashboard/frontend/src/"
scp dashboard/frontend/src/App.css "${SERVER}:${REMOTE_PATH}/dashboard/frontend/src/"
scp dashboard/frontend/src/index.js "${SERVER}:${REMOTE_PATH}/dashboard/frontend/src/"
scp dashboard/frontend/src/theme.css "${SERVER}:${REMOTE_PATH}/dashboard/frontend/src/"
scp -r dashboard/frontend/src/pages/* "${SERVER}:${REMOTE_PATH}/dashboard/frontend/src/pages/"
scp -r dashboard/frontend/src/services/* "${SERVER}:${REMOTE_PATH}/dashboard/frontend/src/services/"
# Copy components and utils if they have files
if (Test-Path "dashboard/frontend/src/components/*") {
    scp -r dashboard/frontend/src/components/* "${SERVER}:${REMOTE_PATH}/dashboard/frontend/src/components/"
}
if (Test-Path "dashboard/frontend/src/utils/*") {
    scp -r dashboard/frontend/src/utils/* "${SERVER}:${REMOTE_PATH}/dashboard/frontend/src/utils/"
}
scp dashboard/frontend/package.json "${SERVER}:${REMOTE_PATH}/dashboard/frontend/"

# ---- RESTART SERVICES ----
Write-Host "[5/5] Restarting services on server..." -ForegroundColor Yellow
ssh $SERVER "cd ${REMOTE_PATH} && pm2 restart all && pm2 flush"

Write-Host "`nRebuilding frontend on server..." -ForegroundColor Yellow
ssh $SERVER "cd ${REMOTE_PATH}/dashboard/frontend && npm run build"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Deployment complete!" -ForegroundColor Green
Write-Host "  Clear browser cache and refresh." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
