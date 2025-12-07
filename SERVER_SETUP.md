# Hetzner Server Setup Guide for RealOps

## Prerequisites
- Hetzner VPS (Ubuntu 22.04 LTS recommended)
- Domain name (optional but recommended)
- SSH access to your server

## Step 1: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (v18 or higher)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Create application directory
sudo mkdir -p /var/www/realops
sudo chown -R $USER:$USER /var/www/realops
```

## Step 2: Clone and Setup Application

```bash
# Clone your repository (or upload files via SCP/SFTP)
cd /var/www/realops
git clone <your-repo-url> .

# Or upload files manually:
# scp -r D:\Bots\RealOps/* user@your-server-ip:/var/www/realops/

# Install bot dependencies
cd /var/www/realops/bot
npm install --production

# Install backend dependencies
cd /var/www/realops/dashboard/backend
npm install --production

# Install frontend dependencies and build
cd /var/www/realops/dashboard/frontend
npm install
npm run build
```

## Step 3: Configure Environment Variables

```bash
# Create .env file in backend
cd /var/www/realops/dashboard/backend
nano .env

# Add your environment variables (see .env.example)
# Save with Ctrl+O, Exit with Ctrl+X
```

## Step 4: Setup PM2 Process Manager

```bash
# Start all services using PM2
cd /var/www/realops
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd
# Follow the command output instructions

# Check status
pm2 status
pm2 logs

# Useful PM2 commands:
# pm2 restart all        - Restart all services
# pm2 stop all          - Stop all services
# pm2 logs realops-bot  - View bot logs
# pm2 monit             - Monitor resources
```

## Step 5: Configure Nginx

```bash
# Copy nginx configuration
sudo cp /var/www/realops/nginx.conf /etc/nginx/sites-available/realops

# Edit configuration with your domain/IP
sudo nano /etc/nginx/sites-available/realops
# Replace 'your-domain.com' with your actual domain or server IP

# Enable the site
sudo ln -s /etc/nginx/sites-available/realops /etc/nginx/sites-enabled/

# Remove default nginx site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## Step 6: Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## Step 7: Setup SSL (Optional but Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Certbot will automatically configure nginx
# Certificates auto-renew via cron
```

## Step 8: Update Frontend Configuration

```bash
# Update API URL in frontend
cd /var/www/realops/dashboard/frontend
nano .env

# Add:
# REACT_APP_API_URL=https://your-domain.com
# or
# REACT_APP_API_URL=http://your-server-ip

# Rebuild frontend
npm run build

# Restart backend to apply changes
pm2 restart realops-dashboard-backend
```

## Step 9: Security Hardening

```bash
# Change SSH port (optional)
sudo nano /etc/ssh/sshd_config
# Change Port 22 to something else
sudo systemctl restart sshd

# Install fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Setup automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## Monitoring and Maintenance

### View Logs
```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs (from ecosystem.config.js)
tail -f /var/www/realops/logs/bot-error.log
tail -f /var/www/realops/logs/backend-error.log
```

### Restart Services
```bash
# Restart bot only
pm2 restart realops-bot

# Restart backend only
pm2 restart realops-dashboard-backend

# Restart all
pm2 restart all

# Restart nginx
sudo systemctl restart nginx
```

### Update Application
```bash
cd /var/www/realops

# Pull latest changes
git pull

# Update dependencies if needed
cd bot && npm install --production
cd ../dashboard/backend && npm install --production
cd ../frontend && npm install && npm run build

# Restart services
pm2 restart all
```

## Troubleshooting

### Bot not starting
```bash
pm2 logs realops-bot
# Check for errors in bot configuration or Discord token
```

### Dashboard not accessible
```bash
# Check nginx status
sudo systemctl status nginx

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check backend is running
pm2 status
```

### Port already in use
```bash
# Find what's using port 3001
sudo lsof -i :3001

# Kill the process
sudo kill -9 <PID>

# Restart PM2
pm2 restart all
```

## Backup Strategy

```bash
# Create backup script
nano /var/www/realops/backup.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/realops"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/realops_$DATE.tar.gz /var/www/realops

# Keep only last 7 backups
find $BACKUP_DIR -name "realops_*.tar.gz" -mtime +7 -delete
```

Make executable and add to crontab:
```bash
chmod +x /var/www/realops/backup.sh

# Run daily at 2 AM
crontab -e
# Add: 0 2 * * * /var/www/realops/backup.sh
```

## Accessing Your Application

- Frontend: http://your-domain.com (or http://your-server-ip)
- Backend API: http://your-domain.com/api
- PM2 Web Dashboard: `pm2 web` (runs on port 9615)

## Important Notes

1. **Never commit .env files** - Keep sensitive data secure
2. **Regular updates** - Keep Node.js, npm, and packages updated
3. **Monitor resources** - Use `pm2 monit` to watch CPU/Memory
4. **Setup alerts** - Configure PM2 to notify you of crashes
5. **Database backups** - If using Firebase, enable automatic backups
6. **Review logs regularly** - Check for errors and security issues

## Production Checklist

- [ ] Environment variables configured
- [ ] Frontend built with production API URL
- [ ] PM2 processes running and saved
- [ ] Nginx configured and running
- [ ] Firewall enabled and configured
- [ ] SSL certificate installed (if using domain)
- [ ] Automatic backups scheduled
- [ ] Monitoring setup
- [ ] Security hardening applied
- [ ] DNS records updated (if using domain)
