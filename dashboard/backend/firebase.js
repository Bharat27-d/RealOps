const admin = require('firebase-admin');
require('dotenv').config();

// Check for required Firebase environment variables
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  console.error('❌ Missing Firebase configuration in .env file!');
  console.error('Please copy .env.example to .env and fill in your Firebase credentials.');
  console.error('Required variables: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL || `https://realops-777-default-rtdb.europe-west1.firebasedatabase.app`
});

const db = admin.firestore();
const realtimeDb = admin.database();

// Collections
const collections = {
  tickets: db.collection('tickets'),
  events: db.collection('events'),
  staff: db.collection('staff'),
  partnerships: db.collection('partnerships'),
  feedback: db.collection('feedback'),
  panels: db.collection('panels'),
  roles: db.collection('roles'),
  announcements: db.collection('announcements'),
  embedTemplates: db.collection('embedTemplates'),
  analytics: db.collection('analytics'),
  scheduledMessages: db.collection('scheduledMessages'),
  staffAvailability: db.collection('staffAvailability'),
  documentation: db.collection('documentation'),
  botConfig: db.collection('botConfig'),
  embeds: db.collection('embeds'),
  settings: db.collection('settings'),
  customCommands: db.collection('customCommands'),
  commandOverrides: db.collection('commandOverrides')
};

// Realtime Database references (if you want to use both)
const realtimeRefs = {
  tickets: realtimeDb.ref('tickets'),
  events: realtimeDb.ref('events'),
  staff: realtimeDb.ref('staff'),
  // Add more as needed
};

module.exports = { admin, db, realtimeDb, collections, realtimeRefs };
