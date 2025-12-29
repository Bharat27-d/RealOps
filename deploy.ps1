# Deploy script for RealOps
# This syncs local changes to the server

$SERVER = "root@159.69.219.151"
$REMOTE_PATH = "/root/RealOps"

Write-Host "Deploying RealOps to server..." -ForegroundColor Green

# Deploy bot files
Write-Host "Deploying bot files..." -ForegroundColor Yellow
scp -r bot/.env "${SERVER}:${REMOTE_PATH}/bot/"
scp bot/index.js "${SERVER}:${REMOTE_PATH}/bot/"
scp bot/ticketSystem.js "${SERVER}:${REMOTE_PATH}/bot/"

# Deploy dashboard backend
Write-Host "Deploying dashboard backend..." -ForegroundColor Yellow
scp dashboard/backend/.env "${SERVER}:${REMOTE_PATH}/dashboard/backend/"
scp dashboard/backend/server.js "${SERVER}:${REMOTE_PATH}/dashboard/backend/"
scp dashboard/backend/discordManager.js "${SERVER}:${REMOTE_PATH}/dashboard/backend/"

# Deploy dashboard frontend
Write-Host "Deploying dashboard frontend..." -ForegroundColor Yellow
scp dashboard/frontend/src/pages/Embeds.js "${SERVER}:${REMOTE_PATH}/dashboard/frontend/src/pages/"

# Restart services
Write-Host "Restarting services..." -ForegroundColor Yellow
ssh $SERVER "cd ${REMOTE_PATH} && pm2 restart all && pm2 flush"

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Rebuilding frontend..." -ForegroundColor Yellow
ssh $SERVER "cd ${REMOTE_PATH}/dashboard/frontend && npm run build"

Write-Host "Done! Clear your browser cookies and log in again." -ForegroundColor Cyan
