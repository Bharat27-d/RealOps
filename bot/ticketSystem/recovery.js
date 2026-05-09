/**
 * recovery.js — Ticket recovery and rebuild logic.
 *
 * Handles auto-recovering tickets from Discord channel metadata
 * when they're missing from activeTickets (e.g., after bot restart).
 */

const config = require('../config');
const { activeTickets, saveActiveTickets } = require('./ticketStore');

/**
 * Rebuild tickets from Discord channels if file was lost/corrupted.
 */
async function rebuildTicketsFromDiscord(client) {
    console.log('🔄 Rebuilding ticket list from Discord channels...');
    let rebuiltCount = 0;

    try {
        const guild = client.guilds.cache.first();
        if (!guild) {
            console.log('No guild found, cannot rebuild tickets');
            return;
        }

        // Fetch all channels
        await guild.channels.fetch();

        // Find ticket category channels
        const ticketCategories = guild.channels.cache.filter(c =>
            c.type === 4 && // Category type
            (c.name.toLowerCase().includes('ticket') ||
                c.name.toLowerCase().includes('support'))
        );

        for (const [, category] of ticketCategories) {
            const ticketChannels = category.children.cache.filter(c => c.type === 0); // Text channels

            for (const [, channel] of ticketChannels) {
                if (!activeTickets.has(channel.id)) {
                    // Try to determine ticket type from channel name or parent category
                    let ticketType = 'support';
                    if (category.name.toLowerCase().includes('join')) ticketType = 'joinTeam';
                    else if (category.name.toLowerCase().includes('book')) ticketType = 'bookUs';
                    else if (category.name.toLowerCase().includes('hr')) ticketType = 'hr';
                    else if (category.name.toLowerCase().includes('partner')) ticketType = 'partnership';
                    else if (category.name.toLowerCase().includes('founder')) ticketType = 'founders';

                    // Extract user ID from channel name (usually format: ticket-username-userid)
                    const userIdMatch = channel.name.match(/(\d{17,19})$/);
                    const userId = userIdMatch ? userIdMatch[1] : 'unknown';

                    activeTickets.set(channel.id, {
                        channelId: channel.id,
                        userId: userId,
                        type: ticketType,
                        createdAt: new Date(channel.createdTimestamp),
                        status: 'open',
                        rebuiltFromDiscord: true
                    });
                    rebuiltCount++;
                    console.log(`✅ Rebuilt ticket: ${channel.name} (${channel.id})`);
                }
            }
        }

        if (rebuiltCount > 0) {
            await saveActiveTickets(activeTickets);
            console.log(`🎉 Successfully rebuilt ${rebuiltCount} tickets from Discord`);
        } else {
            console.log('No tickets needed rebuilding');
        }
    } catch (error) {
        console.error('Error rebuilding tickets from Discord:', error);
    }
}

/**
 * Try to recover a ticket from channel metadata when it's missing from activeTickets.
 * This ensures ANY ticket can be closed even if the bot restarted since creation.
 */
async function tryRecoverTicket(channel) {
    try {
        const channelName = channel.name || '';
        const topic = channel.topic || '';
        const parent = channel.parent;

        // Try to determine ticket type from channel name or parent category
        let ticketType = 'support'; // default fallback
        const nameOrCategory = (channelName + ' ' + (parent?.name || '')).toLowerCase();

        if (nameOrCategory.includes('join') || nameOrCategory.includes('jointeam')) ticketType = 'joinTeam';
        else if (nameOrCategory.includes('book')) ticketType = 'bookUs';
        else if (nameOrCategory.includes('hr') && !nameOrCategory.includes('partner')) ticketType = 'hr';
        else if (nameOrCategory.includes('partner')) ticketType = 'partnership';
        else if (nameOrCategory.includes('founder')) ticketType = 'founders';
        else if (nameOrCategory.includes('support')) ticketType = 'support';

        // Also try matching parent category ID against configured ticket categories
        if (parent && config.ticketCategories) {
            for (const [type, categoryId] of Object.entries(config.ticketCategories)) {
                if (parent.id === categoryId) {
                    ticketType = type;
                    break;
                }
            }
        }

        // Try to extract user ID from channel topic (format: "... | ID: 123456789")
        let userId = 'unknown';
        const topicMatch = topic.match(/ID:\s*(\d{17,19})/);
        if (topicMatch) {
            userId = topicMatch[1];
        } else {
            // Try to extract from channel name (format: type-username or type-username-number)
            const nameMatch = channelName.match(/(\d{17,19})/);
            if (nameMatch) {
                userId = nameMatch[1];
            } else {
                // Try to find the ticket creator from channel permission overwrites
                try {
                    const overwrites = channel.permissionOverwrites?.cache;
                    if (overwrites) {
                        for (const [id, overwrite] of overwrites) {
                            // Skip @everyone role and bot roles
                            if (id === channel.guild?.id) continue;
                            if (overwrite.type === 1) { // type 1 = member
                                userId = id;
                                break;
                            }
                        }
                    }
                } catch (e) {
                    // ignore permission read errors
                }
            }
        }

        const recoveredData = {
            channelId: channel.id,
            userId: userId,
            type: ticketType,
            createdAt: new Date(channel.createdTimestamp || Date.now()),
            status: 'open',
            recoveredFromChannel: true
        };

        activeTickets.set(channel.id, recoveredData);
        await saveActiveTickets(activeTickets);
        console.log(`🔄 Auto-recovered ticket: ${channel.name} (${channel.id}) as ${ticketType} for user ${userId}`);
        return recoveredData;
    } catch (error) {
        console.error('Error trying to recover ticket:', error);
        return null;
    }
}

module.exports = { rebuildTicketsFromDiscord, tryRecoverTicket };
