/**
 * Command Configuration Override System
 * 
 * Loads overrides from Firebase so built-in commands can have their
 * images, text, colors, etc. updated from the dashboard without 
 * modifying source code or restarting the bot.
 */
const firebase = require('./firebase');

let overrides = {};
let initialized = false;
let unsubscribe = null;

/**
 * Sets up a real-time listener on the 'commandOverrides' collection.
 * Call this once during bot startup.
 */
function setupCommandConfig() {
    if (!firebase || !firebase.collections) {
        console.warn('[CommandConfig] Firebase not available, using defaults only.');
        return;
    }

    // Add the collection reference if it doesn't exist yet
    if (!firebase.collections.commandOverrides) {
        firebase.collections.commandOverrides = firebase.db.collection('commandOverrides');
    }

    if (unsubscribe) {
        unsubscribe();
    }

    console.log('[CommandConfig] Setting up real-time override listener...');

    unsubscribe = firebase.collections.commandOverrides.onSnapshot((snapshot) => {
        const newOverrides = {};
        snapshot.forEach(doc => {
            newOverrides[doc.id] = doc.data();
        });
        overrides = newOverrides;
        initialized = true;
        const count = Object.keys(overrides).length;
        if (count > 0) {
            console.log(`[CommandConfig] Loaded overrides for ${count} commands.`);
        }
    }, (error) => {
        console.error('[CommandConfig] Listener error:', error);
    });
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
    if (cmdOverrides && cmdOverrides[field] !== undefined && cmdOverrides[field] !== '') {
        return cmdOverrides[field];
    }
    return defaultValue;
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
        if (value !== undefined && value !== '') {
            result[key] = value;
        }
    }
    
    return result;
}

// Re-export placeholder parser for convenience in built-in commands
const { parsePlaceholders, parseEmbedPlaceholders } = require('./placeholderParser');

module.exports = { setupCommandConfig, getOverride, getConfig, parsePlaceholders, parseEmbedPlaceholders };
