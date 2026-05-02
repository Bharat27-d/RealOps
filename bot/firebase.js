const admin = require('firebase-admin');
require('dotenv').config();

// Check for required Firebase environment variables
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  console.warn('⚠️  Firebase not configured - bot will use local config.js');
  module.exports = null;
} else {
  // Initialize Firebase Admin (shared with dashboard backend if needed)
  let app;
  try {
    app = admin.app(); // Try to get existing app
  } catch (e) {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    };

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://realops-777-default-rtdb.europe-west1.firebasedatabase.app"
    }, 'bot-instance');
  }

  const db = admin.firestore(app);

  // Bot Configuration Collection
  const collections = {
    botConfig: db.collection('botConfig'),
    staffRoles: db.collection('staffRoles'),
    ticketCategories: db.collection('ticketCategories'),
    channels: db.collection('channels'),
    roles: db.collection('roles'),
    tickets: db.collection('tickets'),
    events: db.collection('events'),
    suggestions: db.collection('suggestions'),
    customCommands: db.collection('customCommands')
  };

  module.exports = { admin, db, collections };
}
