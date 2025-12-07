#!/bin/bash
# Deployment script for RealOps on Hetzner server

echo "🚀 Starting deployment..."

# Navigate to application directory
cd /var/www/realops

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install/Update bot dependencies
echo "📦 Installing bot dependencies..."
cd bot
npm install --production

# Install/Update backend dependencies
echo "📦 Installing backend dependencies..."
cd ../dashboard/backend
npm install --production

# Install/Update frontend dependencies and build
echo "🏗️  Building frontend..."
cd ../frontend
npm install
npm run build

# Restart all PM2 processes
echo "🔄 Restarting services..."
cd /var/www/realops
pm2 restart all

# Show status
echo "✅ Deployment complete!"
pm2 status

echo ""
echo "📊 Viewing logs (Ctrl+C to exit)..."
pm2 logs --lines 50
