const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const config = require('../config');

// Utility function to sanitize channel names
function sanitizeChannelName(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-') // Replace invalid chars with dash
        .replace(/-+/g, '-') // Replace multiple dashes with single dash
        .replace(/^-|-$/g, ''); // Trim dashes from start/end
}

// Utility function to format bytes as human-readable string
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Utility function to truncate long strings with ellipsis
function truncateString(str, maxLength = 100) {
    if (typeof str !== 'string') return '';
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
}

function formatDateUTC(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function getUnixTimestamp() {
    return Math.floor(Date.now() / 1000);
}

// Create standardized ticket control buttons
function createTicketControlsRow(includeDelete = true) {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('ticket_close')
                .setLabel('Close Ticket')
                .setStyle(ButtonStyle.Danger)
                .setEmoji(config.emojis?.close || '🔒')
        );

    row.addComponents(
        new ButtonBuilder()
            .setCustomId('ticket_transcript')
            .setLabel('Save Transcript')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📑')
    );

    return row;
}

function isValidSnowflake(id) {
    return /^\d{17,19}$/.test(id);
}

// Get roles that should see a specific ticket type
function getTicketRoles(ticketType) {
    const roles = [];
    switch (ticketType) {
        case 'joinTeam':
            if (Array.isArray(config.staffRoles.hr)) {
                roles.push(...config.staffRoles.hr);
            } else if (config.staffRoles.hr) {
                roles.push(config.staffRoles.hr);
            }
            break;
        case 'bookSlot':
        case 'bookUs':
            if (Array.isArray(config.staffRoles.bookings)) {
                roles.push(...config.staffRoles.bookings);
            } else if (config.staffRoles.bookings) {
                roles.push(config.staffRoles.bookings);
            }
            break;
        case 'support':
            if (Array.isArray(config.staffRoles.support)) {
                roles.push(...config.staffRoles.support);
            } else if (config.staffRoles.support) {
                roles.push(config.staffRoles.support);
            }
            break;
        case 'partnership':
            if (Array.isArray(config.staffRoles.partnership)) {
                roles.push(...config.staffRoles.partnership);
            } else if (config.staffRoles.partnership) {
                roles.push(config.staffRoles.partnership);
            }
            break;
        case 'founders':
            if (Array.isArray(config.staffRoles.founders)) {
                roles.push(...config.staffRoles.founders);
            } else if (config.staffRoles.founders) {
                roles.push(config.staffRoles.founders);
            }
            break;
        case 'hr':
            if (Array.isArray(config.staffRoles.hr)) {
                roles.push(...config.staffRoles.hr);
            } else if (config.staffRoles.hr) {
                roles.push(config.staffRoles.hr);
            }
            break;
    }
    return [...new Set(roles.filter(Boolean))];
}

function getTicketColor(ticketType) {
    switch (ticketType) {
        case 'joinTeam': return '#3498db';
        case 'bookSlot': return '#FFD700';
        case 'bookUs': return '#e74c3c';
        case 'support': return '#2ecc71';
        case 'partnership': return '#9b59b6';
        case 'founders': return '#f1c40f';
        case 'hr': return '#E74C3C';
        default: return '#95a5a6';
    }
}

// Format ticket type for display
function formatTicketType(ticketType) {
    switch (ticketType) {
        case 'joinTeam': return 'Join the Team';
        case 'bookSlot': return 'Book Slot';
        case 'bookUs': return 'Book Us';
        case 'support': return 'Support';
        case 'partnership': return 'Partnership';
        case 'founders': return 'Founders Manager';
        case 'hr': return 'HR Department';
        default: return ticketType.charAt(0).toUpperCase() + ticketType.slice(1);
    }
}

// Log ticket actions to a designated channel
function logTicketAction(guild, user, ticketType, action, ticketId, formData = null) {
    const logChannel = guild.channels.cache.get(config.logChannel);
    if (!logChannel) return;

    const timestamp = getUnixTimestamp();

    const logEmbed = new EmbedBuilder()
        .setTitle(`Ticket ${action.charAt(0).toUpperCase() + action.slice(1)}`)
        .addFields(
            { name: 'User', value: `<@${user.id}> (${user.tag})`, inline: true },
            { name: 'Type', value: formatTicketType(ticketType), inline: true },
            { name: 'Ticket ID', value: ticketId, inline: true },
            { name: 'Action', value: action, inline: true },
            { name: 'Time', value: `<t:${timestamp}:F>`, inline: true }
        )
        .setColor(action === 'created' ? '#2ecc71' : action === 'closed' ? '#f39c12' : '#e74c3c')
        .setFooter({
            text: `The RealOps Group`,
            iconURL: user.displayAvatarURL()
        })
        .setTimestamp();

    if (formData && action === 'created') {
        let summary = '';
        switch (ticketType) {
            case 'joinTeam':
                summary = `Position: ${formData.position || 'N/A'}`;
                break;
            case 'hr':
                summary = `Reason: ${formData.reason || 'N/A'}`;
                break;
            case 'partnership':
                summary = `VTC: ${formData.vtcName || 'N/A'}`;
                break;
            case 'support':
                summary = `Discord Name: ${formData.discordName || 'N/A'}`;
                break;
            case 'bookUs':
                summary = `Discord Name: ${formData.discordName || 'N/A'}, VTC Role: ${formData.vtcRole || 'N/A'}`;
                break;
            case 'bookSlot':
                summary = `Name: ${formData.name || 'N/A'}, Slot No: ${formData.slotNo || 'N/A'}`;
                break;
            case 'founders':
                summary = `Discord Name: ${formData.discordName || 'N/A'}`;
                break;
        }

        if (summary) {
            logEmbed.addFields({ name: 'Summary', value: summary, inline: true });
        }
    }

    logChannel.send({ embeds: [logEmbed] }).catch(error => {
        console.error('Failed to send log message:', error);
    });
}

module.exports = {
    sanitizeChannelName,
    formatBytes,
    truncateString,
    formatDateUTC,
    getUnixTimestamp,
    createTicketControlsRow,
    isValidSnowflake,
    getTicketRoles,
    getTicketColor,
    formatTicketType,
    logTicketAction
};
