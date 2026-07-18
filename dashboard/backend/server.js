require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const { passport, isAuthenticated, verifyAdminPassword } = require('./auth');
const botManager = require('./discordManager');
const reminderScheduler = require('./reminderScheduler');
const fs = require('fs');
const path = require('path');

// Rate limiter for auth endpoints — prevents brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' }
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: true,
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

// Trust proxy (required for nginx reverse proxy)
app.set('trust proxy', 1);

// Session configuration — persistent file-based store (survives restarts)
const FileStore = require('session-file-store')(session);
const sessionsDir = path.join(__dirname, 'sessions');

// Ensure sessions directory exists
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

console.log('ℹ️ Using FileStore for persistent sessions');

app.use(session({
  store: new FileStore({
    path: sessionsDir,
    ttl: 86400,              // 24 hours (matches cookie maxAge)
    retries: 2,              // Retry failed reads twice
    reapInterval: 3600,      // Clean up expired sessions every hour
    logFn: () => {}          // Suppress verbose session-file-store logs
  }),
  secret: process.env.SESSION_SECRET || (() => { console.warn('⚠️ SESSION_SECRET not set in .env — using random secret (sessions will not persist across restarts)'); return require('crypto').randomBytes(64).toString('hex'); })(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Initialize Discord Bot
botManager.initialize(process.env.DISCORD_BOT_TOKEN);

// Auth routes (rate-limited to prevent brute-force)
app.post('/auth/login', authLimiter, (req, res, next) => {
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

// Change password route (also rate-limited)
app.post('/auth/change-password', authLimiter, isAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Only allow admin to change password
    if (req.user.id !== 'admin') {
      return res.status(403).json({ error: 'Only admin can change password' });
    }

    // Verify current password using bcrypt-aware verifier
    const isValid = await verifyAdminPassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    // Hash the new password before storing
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update .env file with the hashed password
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    const updatedContent = envContent.replace(
      /ADMIN_PASSWORD=.*/,
      `ADMIN_PASSWORD=${hashedPassword}`
    );
    fs.writeFileSync(envPath, updatedContent, 'utf8');
    
    // Update the environment variable in memory
    process.env.ADMIN_PASSWORD = hashedPassword;

    res.json({ 
      success: true, 
      message: 'Password updated successfully! You can now login with your new password.'
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
app.use('/api/custom-commands', require('./routes/customCommands'));
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
  if (res.headersSent) {
    console.error('Error occurred after headers sent:', err.message);
    return next(err);
  }
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Dashboard: ${process.env.FRONTEND_URL}`);
});
