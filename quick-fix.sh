#!/bin/bash
# Quick fix for authentication issues

echo "Fixing authentication issues..."

# Navigate to backend directory
cd /root/RealOps/dashboard/backend

# Update server.js session configuration
cat > session-fix.txt << 'EOF'
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'RealOps_Secure_Session_Key_2024_a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    path: '/'
  }
}));
EOF

# Update CORS
sed -i "s|'http://159.69.219.151'|'http://159.69.219.151', 'http://159.69.219.151:3000'|g" server.js

# Ensure SESSION_SECRET is set
if ! grep -q "SESSION_SECRET=" .env; then
    echo "SESSION_SECRET=RealOps_Secure_Session_Key_2024_a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8" >> .env
fi

# Restart PM2
cd /root/RealOps
pm2 restart all
pm2 flush

echo "Done! Now clear your browser cookies and refresh the page."
