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
  origin: [
    'http://localhost:3000',
    'http://159.69.219.151',
    'http://159.69.219.151:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Redis client setup
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.connect().catch(console.error);

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'realops-secret-key-change-in-production',
  resave: false,
  saveUninitialized: true, // Changed to true
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    path: '/'
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
