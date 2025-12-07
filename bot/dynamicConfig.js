const firebase = require('./firebase');
const localConfig = require('./config');

class DynamicConfig {
    constructor() {
        this.cache = null;
        this.lastFetch = null;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        this.useFirebase = firebase !== null;
    }

    // Get configuration (from Firebase or local)
    async getConfig() {
        // If Firebase not configured, use local config
        if (!this.useFirebase) {
            return localConfig;
        }

        // Check cache
        if (this.cache && this.lastFetch && (Date.now() - this.lastFetch < this.CACHE_DURATION)) {
            return this.cache;
        }

        try {
            // Fetch from Firebase
            const configDoc = await firebase.collections.botConfig.doc('main').get();
            
            if (configDoc.exists) {
                this.cache = {
                    ...localConfig, // Fallback defaults
                    ...configDoc.data() // Override with Firebase data
                };
                this.lastFetch = Date.now();
                return this.cache;
            }
        } catch (error) {
            console.error('Error fetching config from Firebase, using local:', error.message);
        }

        // Fallback to local config
        return localConfig;
    }

    // Get staff roles
    async getStaffRoles() {
        const config = await this.getConfig();
        return config.staffRoles;
    }

    // Get ticket categories
    async getTicketCategories() {
        const config = await this.getConfig();
        return config.ticketCategories;
    }

    // Get channel IDs
    async getChannels() {
        const config = await this.getConfig();
        return {
            logChannel: config.logChannel,
            transcriptChannel: config.transcriptChannel,
            WELCOME_CHANNEL_ID: config.WELCOME_CHANNEL_ID,
            STAFF_CHANGES_CHANNEL_ID: config.STAFF_CHANGES_CHANNEL_ID,
            ...config.channels
        };
    }

    // Get role IDs
    async getRoles() {
        const config = await this.getConfig();
        return config.ROLES;
    }

    // Refresh cache (call this when config is updated from dashboard)
    refreshCache() {
        this.cache = null;
        this.lastFetch = null;
    }

    // Save configuration to Firebase (called from dashboard)
    async saveConfig(configData) {
        if (!this.useFirebase) {
            throw new Error('Firebase not configured');
        }

        await firebase.collections.botConfig.doc('main').set(configData, { merge: true });
        this.refreshCache();
        return true;
    }
}

// Export singleton instance
const dynamicConfig = new DynamicConfig();
module.exports = dynamicConfig;
