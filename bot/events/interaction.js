/**
 * Interaction Event Handler
 * 
 * All interaction routing is handled centrally by ticketSystem.js to prevent
 * duplicate handler execution. This file is kept as a no-op to maintain the
 * event file loading pattern without causing double-fire issues.
 * 
 * Previously, this file duplicated event_accept/event_decline/decline_reason_select
 * handling that already existed in ticketSystem.js, causing race conditions and
 * "interaction already acknowledged" errors.
 */

const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // All interaction routing is handled by ticketSystem.js
        // This handler intentionally does nothing to prevent duplicate execution.
        return;
    }
};
