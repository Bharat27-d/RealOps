const express = require('express');
const cors = require('cors');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');
const { passport, isAuthenticated } = require('./auth');
const botManager = require('./discordManager');
const reminderScheduler = require('./reminderScheduler');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:3000',
      'http://159.69.219.151',
      'http://159.69.219.151:3000'
    ];
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(null, true); // Allow all for now
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically with proper caching headers
app.use('/uploads', (req, res, next) => {
  // Set headers for better Discord embed compatibility
  res.set({
    'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    'Access-Control-Allow-Origin': '*',
    'Cross-Origin-Resource-Policy': 'cross-origin'
  });
  next();
}, express.static(path.join(__dirname, 'uploads')));


// Session must be before Redis
app.use(session({
  secret: process.env.SESSION_SECRET || 'RealOps_Secure_Session_Key_2024_a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: false,
    secure: false,
    sameSite: 'lax'
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Initialize Discord Bot
botManager.initialize(process.env.DISCORD_BOT_TOKEN);

// Auth routes
app.post('/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ error: info.message || 'Invalid credentials' });
    }
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json({ success: true, user });
    });
  })(req, res, next);
});

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get('/auth/user', isAuthenticated, (req, res) => {
  res.json(req.user);
});

// Change password route
app.post('/auth/change-password', isAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Only allow admin to change password
    if (req.user.id !== 'admin') {
      return res.status(403).json({ error: 'Only admin can change password' });
    }

    // Verify current password
    if (currentPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    // Update .env file
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    const updatedContent = envContent.replace(
      /ADMIN_PASSWORD=.*/,
      `ADMIN_PASSWORD=${newPassword}`
    );
    fs.writeFileSync(envPath, updatedContent, 'utf8');
    
    // Update the environment variable in memory
    process.env.ADMIN_PASSWORD = newPassword;

    res.json({ 
      success: true, 
      message: 'Password updated successfully! You can now login with your new password.',
      newPassword: newPassword
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// API Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/embeds', require('./routes/embeds'));
app.use('/api/panels', require('./routes/panels'));
app.use('/api/discord', require('./routes/discord'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/partnerships', require('./routes/partnerships'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/bot', require('./routes/bot'));
app.use('/api/upload', require('./routes/upload'));
const { router: announcementsRouter, initializeScheduledMessages } = require('./routes/announcements');
app.use('/api/announcements', announcementsRouter);
app.use('/api/config', require('./routes/config'));

// Initialize scheduled messages
initializeScheduledMessages();

// Initialize event reminder scheduler
reminderScheduler.initializeReminderScheduler();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', bot: botManager.client?.user?.tag || 'Not connected' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Dashboard: ${process.env.FRONTEND_URL}`);
});
