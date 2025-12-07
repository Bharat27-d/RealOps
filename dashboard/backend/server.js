const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { passport, isAuthenticated } = require('./auth');
const botManager = require('./discordManager');
const reminderScheduler = require('./reminderScheduler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
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

// API Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/embeds', require('./routes/embeds'));
app.use('/api/panels', require('./routes/panels'));
app.use('/api/panels/sync', require('./routes/panelSync'));
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
