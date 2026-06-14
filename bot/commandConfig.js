/**
 * Command Configuration Override System
 * 
 * Loads overrides from Firebase so built-in commands can have their
 * images, text, colors, etc. updated from the dashboard without 
 * modifying source code or restarting the bot.
 * 
 * Features:
 *   - Real-time listener with auto-reconnect on failure
 *   - Ready-state tracking to avoid race conditions on startup
 *   - Graceful fallback to defaults if Firebase is unavailable
 *   - Change logging for debugging
 */
const firebase = require('./firebase');

let overrides = {};
let initialized = false;
let unsubscribe = null;
let reconnectTimer = null;
const MAX_RECONNECT_DELAY = 30000; // 30 seconds max backoff
let reconnectAttempts = 0;

/**
 * Sets up a real-time listener on the 'commandOverrides' collection.
 * Call this once during bot startup. Auto-reconnects on failure.
 */
function setupCommandConfig() {
    if (!firebase || !firebase.collections) {
        console.warn('[CommandConfig] Firebase not available, using defaults only.');
        initialized = true; // Mark as initialized so commands don't hang waiting
        return;
    }

    // Add the collection reference if it doesn't exist yet
    if (!firebase.collections.commandOverrides) {
        firebase.collections.commandOverrides = firebase.db.collection('commandOverrides');
    }

    startListener();
}

function startListener() {
    // Clean up existing listener
    if (unsubscribe) {
        try { unsubscribe(); } catch (_) {}
        unsubscribe = null;
    }

    console.log('[CommandConfig] Setting up real-time override listener...');

    try {
        unsubscribe = firebase.collections.commandOverrides.onSnapshot((snapshot) => {
            const newOverrides = {};
            const changes = [];

            snapshot.forEach(doc => {
                newOverrides[doc.id] = doc.data();
            });

            // Log what changed (only after initial load)
            if (initialized) {
                // Find new/updated overrides
                for (const [cmdName, data] of Object.entries(newOverrides)) {
                    const oldData = overrides[cmdName];
                    if (!oldData) {
                        changes.push(`  + /${cmdName} (new override)`);
                    } else {
                        const changedFields = [];
                        for (const [field, value] of Object.entries(data)) {
                            if (JSON.stringify(oldData[field]) !== JSON.stringify(value)) {
                                changedFields.push(field);
                            }
                        }
                        if (changedFields.length > 0) {
                            changes.push(`  ~ /${cmdName} (${changedFields.join(', ')})`);
                        }
                    }
                }
                // Find removed overrides
                for (const cmdName of Object.keys(overrides)) {
                    if (!newOverrides[cmdName]) {
                        changes.push(`  - /${cmdName} (override removed)`);
                    }
                }
            }

            overrides = newOverrides;
            initialized = true;
            reconnectAttempts = 0; // Reset backoff on success

            const count = Object.keys(overrides).length;
            if (changes.length > 0) {
                console.log(`[CommandConfig] Override update detected (${count} total):`);
                changes.forEach(c => console.log(c));
            } else if (count > 0) {
                console.log(`[CommandConfig] ✅ Loaded overrides for ${count} commands.`);
            } else {
                console.log('[CommandConfig] ✅ Listener active (no overrides set yet).');
            }
        }, (error) => {
            console.error('[CommandConfig] Listener error:', error.message);
            // Mark as initialized even on error so commands don't hang
            initialized = true;
            scheduleReconnect();
        });
    } catch (error) {
        console.error('[CommandConfig] Failed to start listener:', error.message);
        initialized = true;
        scheduleReconnect();
    }
}

/**
 * Schedule a reconnection attempt with exponential backoff.
 */
function scheduleReconnect() {
    if (reconnectTimer) clearTimeout(reconnectTimer);

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);
    reconnectAttempts++;

    console.log(`[CommandConfig] Reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts})...`);
    reconnectTimer = setTimeout(() => {
        startListener();
    }, delay);
}

/**
 * Get an override value for a command field, falling back to the default.
 * 
 * @param {string} commandName - The slash command name (e.g. 'joinaccept')
 * @param {string} field - The field to get (e.g. 'image', 'thumbnail', 'title', 'description', 'color', 'footerText', 'footerIcon')
 * @param {*} defaultValue - The fallback value if no override exists
 * @returns {*} The override value or the default
 */
function getOverride(commandName, field, defaultValue) {
    const cmdOverrides = overrides[commandName];
    if (!cmdOverrides) return defaultValue;

    const value = cmdOverrides[field];

    // Only use the override if it's a real, non-empty value
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }

    return value;
}

/**
 * Get all overrides for a command at once.
 * Returns an object with the override values merged over the defaults.
 * 
 * @param {string} commandName 
 * @param {Object} defaults - Object with default values { image: '...', title: '...', etc. }
 * @returns {Object} Merged config object
 */
function getConfig(commandName, defaults = {}) {
    const cmdOverrides = overrides[commandName] || {};
    const result = { ...defaults };
    
    for (const [key, value] of Object.entries(cmdOverrides)) {
        // Skip internal metadata fields (e.g. _updatedAt)
        if (key.startsWith('_')) continue;
        if (value !== undefined && value !== null && value !== '') {
            result[key] = value;
        }
    }
    
    return result;
}

/**
 * Check if the override system has finished initial load.
 * Useful for ensuring commands wait for overrides on first startup.
 */
function isReady() {
    return initialized;
}

/**
 * Get the current override count (for health checks / debugging).
 */
function getStats() {
    return {
        initialized,
        overrideCount: Object.keys(overrides).length,
        commands: Object.keys(overrides)
    };
}

// Re-export placeholder parser for convenience in built-in commands
const { parsePlaceholders, parseEmbedPlaceholders } = require('./placeholderParser');

module.exports = { setupCommandConfig, getOverride, getConfig, isReady, getStats, parsePlaceholders, parseEmbedPlaceholders };
