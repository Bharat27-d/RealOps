const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { collections } = require('./firebase');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Admin login
    if (id === 'admin') {
      done(null, {
        id: 'admin',
        email: process.env.ADMIN_EMAIL,
        username: 'Admin',
        avatar: null,
        isAdmin: true,
        isStaff: true
      });
      return;
    }
    
    done(null, false);
  } catch (error) {
    done(error, null);
  }
});

/**
 * Compare a plaintext password against the stored ADMIN_PASSWORD.
 * Supports both bcrypt hashed passwords ($2b$...) and legacy plaintext.
 */
async function verifyAdminPassword(inputPassword) {
  const stored = process.env.ADMIN_PASSWORD;
  if (!stored) return false;

  // If the stored password looks like a bcrypt hash, use bcrypt.compare
  if (stored.startsWith('$2b$') || stored.startsWith('$2a$')) {
    return bcrypt.compare(inputPassword, stored);
  }

  // Legacy plaintext fallback — compare directly
  // (log a warning so the admin knows to upgrade)
  console.warn('⚠️  ADMIN_PASSWORD is stored in plaintext. Run the hash-password script to upgrade.');
  return inputPassword === stored;
}

// Local Strategy for email/password login
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // Check admin credentials
      if (email === process.env.ADMIN_EMAIL) {
        const isValid = await verifyAdminPassword(password);
        if (isValid) {
          const adminUser = {
            id: 'admin',
            email: process.env.ADMIN_EMAIL,
            username: 'Admin',
            isAdmin: true,
            isStaff: true,
            lastLogin: new Date().toISOString()
          };
          return done(null, adminUser);
        } else {
          return done(null, false, { message: 'Invalid password' });
        }
      }

      return done(null, false, { message: 'Invalid credentials' });
    } catch (error) {
      return done(error);
    }
  }
));

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Middleware to check if user is staff
const isStaff = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Admin user always has staff access
  if (req.user.id === 'admin' || req.user.isStaff) {
    return next();
  }

  // Check Firestore only if not admin
  try {
    const userDoc = await collections.staff.doc(req.user.id).get();
    if (userDoc.exists && userDoc.data().isStaff) {
      return next();
    }
  } catch (error) {
    // If Firestore is not available, deny access for non-admin users
    console.error('Firestore check failed:', error.message);
  }

  res.status(403).json({ error: 'Insufficient permissions' });
};

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Check if user is the admin account
  if (req.user.id === 'admin' || req.user.isAdmin) {
    return next();
  }

  // Check if user ID is in admin list
  const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || [];
  if (adminIds.includes(req.user.id)) {
    return next();
  }

  res.status(403).json({ error: 'Admin access required' });
};

module.exports = { passport, isAuthenticated, isStaff, isAdmin, verifyAdminPassword };
