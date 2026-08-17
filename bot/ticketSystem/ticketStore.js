/**
 * ticketStore.js — Shared in-memory ticket store with Firestore persistence.
 *
 * Architecture:
 *   • In-memory Map for instant lookups (Discord needs sub-3s responses)
 *   • Firestore as the primary persistent store (replaces active_tickets.json)
 *   • Local JSON file kept as a hot-standby cache in case Firestore is unreachable
 *
 * On startup:  Firestore → memory (fallback to JSON if Firestore fails)
 * On save:     memory → Firestore + JSON cache (dual-write for safety)
 */

const fs = require('fs');
const path = require('path');
const firebase = require('../firebase');

// Local cache file (kept as fallback, no longer the primary store)
const TICKETS_FILE = path.join(__dirname, '..', 'active_tickets.json');

// Firestore collection name for active (open) tickets
const ACTIVE_TICKETS_COLLECTION = 'activeTickets';

// ───────────────────────── Helpers ─────────────────────────

/** Serialize a ticket for Firestore (Dates → ISO strings). */
function serializeTicket(ticket) {
    const data = { ...ticket };
    if (data.createdAt instanceof Date) data.createdAt = data.createdAt.toISOString();
    if (data.closedAt instanceof Date) data.closedAt = data.closedAt.toISOString();
    if (data.reopenedAt instanceof Date) data.reopenedAt = data.reopenedAt.toISOString();
    
    // Firestore max document size is 1MB. Strip large transcripts to prevent crash loop.
    if (data.transcriptHtml && data.transcriptHtml.length > 850000) {
        delete data.transcriptHtml;
    }
    
    return data;
}

/** Deserialize a ticket from Firestore (ISO strings → Dates). */
function deserializeTicket(data) {
    if (data.createdAt) data.createdAt = new Date(data.createdAt);
    if (data.closedAt) data.closedAt = new Date(data.closedAt);
    if (data.reopenedAt) data.reopenedAt = new Date(data.reopenedAt);
    if (!data.channelId && data._channelId) data.channelId = data._channelId;
    
    // Strip large transcripts loaded from cache to recover from crash loops
    if (data.transcriptHtml && data.transcriptHtml.length > 850000) {
        delete data.transcriptHtml;
    }
    
    return data;
}

// ───────────────────────── Load ─────────────────────────

/**
 * Load tickets from Firestore (primary) or JSON file (fallback).
 * This runs synchronously at module init — Firestore load is async
 * so we start with JSON and then upgrade in the background.
 */
function loadFromJsonFile() {
    if (!fs.existsSync(TICKETS_FILE)) return new Map();
    try {
        const data = fs.readFileSync(TICKETS_FILE, 'utf8');
        if (!data || data.trim() === '') return new Map();
        const tickets = JSON.parse(data);
        const ticketsMap = new Map();
        Object.entries(tickets).forEach(([key, value]) => {
            if (!value.channelId) value.channelId = key;
            deserializeTicket(value);
            ticketsMap.set(key, value);
        });
        return ticketsMap;
    } catch (error) {
        console.error('⚠️ Error loading tickets from JSON cache:', error.message);
        // Backup corrupted file
        try {
            const backupPath = path.join(__dirname, '..', `active_tickets.backup.${Date.now()}.json`);
            fs.copyFileSync(TICKETS_FILE, backupPath);
            console.log(`Corrupted file backed up to: ${backupPath}`);
        } catch (e) { /* ignore */ }
        return new Map();
    }
}

/**
 * Load all active tickets from Firestore. Called once after bot connects.
 */
async function loadFromFirestore() {
    if (!firebase?.db) return null;
    try {
        const snapshot = await firebase.db.collection(ACTIVE_TICKETS_COLLECTION).get();
        if (snapshot.empty) return new Map();
        const ticketsMap = new Map();
        snapshot.forEach(doc => {
            const data = deserializeTicket(doc.data());
            data.channelId = data.channelId || doc.id;
            ticketsMap.set(doc.id, data);
        });
        console.log(`✅ Loaded ${ticketsMap.size} tickets from Firestore`);
        return ticketsMap;
    } catch (error) {
        console.error('⚠️ Failed to load from Firestore, using JSON cache:', error.message);
        return null;
    }
}

// ───────────────────────── Save ─────────────────────────

const saveQueue = [];
let isSaving = false;
let consecutiveErrors = 0;
const MAX_RETRY_DELAY = 30000; // Cap backoff at 30 seconds

/**
 * Queue a save operation. Writes to both Firestore and local JSON cache.
 */
function saveActiveTickets(tickets) {
    return new Promise((resolve, reject) => {
        saveQueue.push({ tickets: new Map(tickets), resolve, reject });
        if (!isSaving) processNextSave();
    });
}

async function processNextSave() {
    if (saveQueue.length === 0) { isSaving = false; return; }
    isSaving = true;
    const { tickets, resolve, reject } = saveQueue.shift();

    try {
        // 1) Write to local JSON cache (fast, synchronous-ish)
        const ticketsObj = {};
        tickets.forEach((value, key) => { ticketsObj[key] = value; });
        const tempPath = TICKETS_FILE + '.tmp';
        await fs.promises.writeFile(tempPath, JSON.stringify(ticketsObj, null, 2));
        await fs.promises.rename(tempPath, TICKETS_FILE);

        // 2) Write changed tickets to Firestore (async, non-blocking)
        if (firebase?.db) {
            try {
                // Use batched writes (max 500 per batch)
                const entries = Array.from(tickets.entries());
                for (let i = 0; i < entries.length; i += 450) {
                    const batch = firebase.db.batch();
                    const chunk = entries.slice(i, i + 450);
                    for (const [channelId, ticket] of chunk) {
                        const ref = firebase.db.collection(ACTIVE_TICKETS_COLLECTION).doc(channelId);
                        batch.set(ref, serializeTicket(ticket), { merge: true });
                    }
                    await batch.commit();
                }
            } catch (fbError) {
                console.error('⚠️ Firestore save failed (JSON cache is up to date):', fbError.message);
            }
        }

        consecutiveErrors = 0; // Reset on success
        resolve();
    } catch (error) {
        console.error('Error saving active tickets:', error);
        consecutiveErrors++;
        reject(error);
    } finally {
        // Exponential backoff on repeated failures to avoid tight error loops
        const delay = consecutiveErrors > 0
            ? Math.min(10 * Math.pow(2, consecutiveErrors), MAX_RETRY_DELAY)
            : 10;
        setTimeout(processNextSave, delay);
    }
}

/**
 * Remove a single ticket from the activeTickets Firestore collection.
 */
async function removeTicketFromStore(channelId) {
    if (!firebase?.db) return;
    try {
        await firebase.db.collection(ACTIVE_TICKETS_COLLECTION).doc(channelId).delete();
    } catch (error) {
        console.error(`⚠️ Failed to remove ticket ${channelId} from Firestore:`, error.message);
    }
}

// ───────────────────────── Firebase sync (closed tickets) ─────────────────────────

async function syncSingleTicketToFirebase(channelId, ticketData) {
    if (!firebase?.collections) { console.error('❌ Firebase is not configured.'); return; }
    try {
        await firebase.collections.tickets.doc(channelId).set(serializeTicket(ticketData), { merge: true });
        console.log(`✅ Synced closed ticket ${channelId} to Firebase`);
    } catch (error) { console.error(`Error syncing ticket ${channelId}:`, error); }
}

async function deleteTicketFromFirebase(channelId) {
    if (!firebase?.collections) return;
    try {
        await firebase.collections.tickets.doc(channelId).delete();
        console.log(`🗑️ Deleted ticket ${channelId} from Firebase (tickets collection)`);
    } catch (error) { console.error(`Error deleting ticket ${channelId}:`, error); }
}

// ───────────────────────── The shared Map ─────────────────────────

// Start with JSON file (synchronous), then upgrade from Firestore (async)
const activeTickets = loadFromJsonFile();
console.log(`📦 Loaded ${activeTickets.size} tickets from JSON cache (will sync from Firestore shortly)`);

let _firestoreReady = false;

/**
 * Called once after the bot is ready. Migrates data to Firestore
 * and makes Firestore the authoritative source going forward.
 */
async function initFirestoreSync() {
    const firestoreTickets = await loadFromFirestore();
    if (firestoreTickets !== null) {
        if (firestoreTickets.size > 0) {
            // Firestore has data — use it as the source of truth
            activeTickets.clear();
            firestoreTickets.forEach((v, k) => activeTickets.set(k, v));
            console.log(`🔄 Synced ${activeTickets.size} tickets from Firestore (authoritative)`);
        } else if (activeTickets.size > 0) {
            // Firestore is empty but JSON has data — migrate JSON → Firestore
            console.log(`📤 Migrating ${activeTickets.size} tickets from JSON to Firestore...`);
            await saveActiveTickets(activeTickets);
            console.log(`✅ Migration complete — Firestore is now the primary store`);
        }
        _firestoreReady = true;
    } else {
        console.warn('⚠️ Firestore unavailable — running on JSON cache only');
    }
    // Also update the local JSON to stay in sync
    await saveActiveTickets(activeTickets).catch(console.error);
}

function ensureTicketsLoaded() {
    // Tickets are always loaded at module init — this is now a no-op
    // Kept for backward compatibility with callers
}

// ───────────────────────── Exports ─────────────────────────

module.exports = {
    activeTickets,
    TICKETS_FILE,
    loadActiveTickets: loadFromJsonFile,
    saveActiveTickets,
    removeTicketFromStore,
    syncSingleTicketToFirebase,
    deleteTicketFromFirebase,
    ensureTicketsLoaded,
    initFirestoreSync
};
