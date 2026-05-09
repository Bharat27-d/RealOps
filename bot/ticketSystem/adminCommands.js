/**
 * adminCommands.js — Admin-only ticket commands (register-ticket, debug-tickets).
 */

const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const { activeTickets, saveActiveTickets, TICKETS_FILE, ensureTicketsLoaded } = require('./ticketStore');
const { formatTicketType, formatDateUTC, createTicketControlsRow, logTicketAction } = require('../utils/ticketUtils');
const { safeReply } = require('../utils/interactionWrapper');

async function registerExistingTicket(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return safeReply(interaction, { content: 'You need administrator permissions.', flags: MessageFlags.Ephemeral });
    }
    try { await interaction.deferReply({ flags: MessageFlags.Ephemeral }); } catch (e) { return; }

    try {
        ensureTicketsLoaded();
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const targetUser = interaction.options.getUser('user');
        const ticketType = interaction.options.getString('type');
        if (!['support', 'joinTeam', 'bookUs', 'partnership', 'founders', 'hr'].includes(ticketType)) {
            return safeReply(interaction, { content: 'Invalid ticket type.', flags: MessageFlags.Ephemeral }, true);
        }
        if (activeTickets.has(channel.id)) {
            return safeReply(interaction, { content: `Already registered as ${formatTicketType(activeTickets.get(channel.id).type)}.`, flags: MessageFlags.Ephemeral }, true);
        }

        activeTickets.set(channel.id, { channelId: channel.id, userId: targetUser.id, type: ticketType, createdAt: new Date(), manuallyRegistered: true });
        await saveActiveTickets(activeTickets);
        await channel.send({ content: `This channel has been registered as a ${formatTicketType(ticketType)} ticket for ${targetUser}.`, components: [createTicketControlsRow(true)] });
        logTicketAction(interaction.guild, interaction.user, ticketType, 'manually-registered', channel.id);
        await safeReply(interaction, { content: `Successfully registered ${channel} as a ${formatTicketType(ticketType)} ticket for ${targetUser}.`, flags: MessageFlags.Ephemeral }, true);
    } catch (error) {
        console.error('Error registering ticket:', error);
        await safeReply(interaction, { content: 'Error: ' + error.message, flags: MessageFlags.Ephemeral }, true);
    }
}

async function debugTickets(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return safeReply(interaction, { content: 'You need administrator permissions.', flags: MessageFlags.Ephemeral });
    }
    try { await interaction.deferReply({ flags: MessageFlags.Ephemeral }); } catch (e) { return; }

    try {
        ensureTicketsLoaded();
        const currentChannel = interaction.channel;
        const debugInfo = [];
        debugInfo.push(`**Current Channel**`);
        debugInfo.push(`- ID: ${currentChannel.id}`);
        debugInfo.push(`- Name: ${currentChannel.name}`);
        debugInfo.push(`- Is Ticket: ${activeTickets.has(currentChannel.id) ? 'Yes' : 'No'}`);
        if (activeTickets.has(currentChannel.id)) {
            const ticket = activeTickets.get(currentChannel.id);
            debugInfo.push(`- Type: ${formatTicketType(ticket.type)}`);
            debugInfo.push(`- User: <@${ticket.userId}>`);
            debugInfo.push(`- Created: ${ticket.createdAt ? formatDateUTC(ticket.createdAt) : 'Unknown'}`);
            debugInfo.push(`- Status: ${ticket.closed ? 'Closed' : 'Open'}`);
        }
        debugInfo.push(`\n**All Active Tickets** Total: ${activeTickets.size}`);
        let count = 0;
        for (const [id, ticket] of activeTickets.entries()) {
            if (count >= 10) { debugInfo.push(`... and ${activeTickets.size - 10} more`); break; }
            const ch = interaction.guild.channels.cache.get(id);
            debugInfo.push(`${count + 1}. ${ticket.type} - <#${id}> - Exists: ${ch ? 'Yes' : 'No'}`);
            count++;
        }
        debugInfo.push(`\n**System Information**`);
        debugInfo.push(`Current Date (UTC): ${formatDateUTC(new Date())}`);
        debugInfo.push(`Persistence File: ${TICKETS_FILE}`);
        debugInfo.push(`File Exists: ${fs.existsSync(TICKETS_FILE) ? 'Yes' : 'No'}`);
        if (fs.existsSync(TICKETS_FILE)) {
            const stats = fs.statSync(TICKETS_FILE);
            debugInfo.push(`File Size: ${stats.size} bytes`);
            debugInfo.push(`Last Modified: ${formatDateUTC(new Date(stats.mtime))}`);
        }
        await safeReply(interaction, { content: debugInfo.join('\n'), flags: MessageFlags.Ephemeral }, true);
    } catch (error) {
        console.error('Error debugging tickets:', error);
        await safeReply(interaction, { content: 'Error: ' + error.message, flags: MessageFlags.Ephemeral }, true);
    }
}

module.exports = { registerExistingTicket, debugTickets };
