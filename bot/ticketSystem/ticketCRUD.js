/**
 * ticketCRUD.js — Create / Close / Reopen / Delete ticket operations.
 */

const { EmbedBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { createTranscript: generateTranscript } = require('discord-html-transcripts');
const config = require('../config');
const { activeTickets, saveActiveTickets, syncSingleTicketToFirebase, deleteTicketFromFirebase, removeTicketFromStore, ensureTicketsLoaded } = require('./ticketStore');
const { sanitizeChannelName, formatTicketType, getTicketColor, getTicketRoles, isValidSnowflake, getUnixTimestamp, formatDateUTC, createTicketControlsRow, logTicketAction } = require('../utils/ticketUtils');
const { safeReply } = require('../utils/interactionWrapper');
const { createTranscriptForDeletion } = require('./transcripts');

// ─── Create ticket with form data (from modal) ───
async function createTicketWithFormData(interaction, ticketType, formData, panelModule) {
    ensureTicketsLoaded();
    const { guild, user } = interaction;
    const maxTotal = config.ticketOptions?.maxTicketsPerUser ?? 999999;
    const maxPerType = config.ticketOptions?.maxTicketsPerUserPerType ?? 999999;
    const userTickets = Array.from(activeTickets.values()).filter(t => t.userId === user.id && !t.closed);
    const userTicketsOfType = userTickets.filter(t => t.type === ticketType);

    if (userTickets.length >= maxTotal) {
        return safeReply(interaction, { content: `You have reached the maximum limit of ${maxTotal} open tickets.`, flags: MessageFlags.Ephemeral }, true);
    }
    if (userTicketsOfType.length >= maxPerType) {
        return safeReply(interaction, { content: `You can only have ${maxPerType} open ${formatTicketType(ticketType)} tickets at once.`, flags: MessageFlags.Ephemeral }, true);
    }

    try {
        const categoryId = config.ticketCategories[ticketType] || config.ticketCategories.support;
        const visibleRoles = getTicketRoles(ticketType).filter(r => isValidSnowflake(r));
        const permissionOverwrites = [
            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.AddReactions, PermissionFlagsBits.EmbedLinks] }
        ];
        for (const roleId of visibleRoles) {
            if (guild.roles.cache.get(roleId)) {
                permissionOverwrites.push({ id: roleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
            }
        }

        let ticketName = sanitizeChannelName(`${ticketType}-${user.username}`);
        if (userTicketsOfType.length > 0) ticketName = sanitizeChannelName(`${ticketType}-${user.username}-${userTicketsOfType.length + 1}`);

        const ticketChannel = await guild.channels.create({
            name: ticketName, type: ChannelType.GuildText, parent: categoryId,
            permissionOverwrites, topic: `${formatTicketType(ticketType)} ticket for ${user.tag} | ID: ${user.id}`
        });
        await new Promise(r => setTimeout(r, 500));
        const verifiedChannel = await guild.channels.fetch(ticketChannel.id).catch(() => null);
        if (!verifiedChannel) return safeReply(interaction, { content: 'There was an issue creating your ticket. Please try again.', flags: MessageFlags.Ephemeral }, true);

        const ticketData = { channelId: ticketChannel.id, userId: user.id, username: user.tag, type: ticketType, createdAt: new Date(), formData, transcript: [] };
        activeTickets.set(ticketChannel.id, ticketData);
        await saveActiveTickets(activeTickets);

        const ticketControls = createTicketControlsRow(true);
        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`${formatTicketType(ticketType)} Ticket`)
            .setDescription(`Thank you for your submission, ${user}!\nOur team will assist you shortly.`)
            .setColor(getTicketColor(ticketType))
            .setFooter({ text: 'The RealOps Group', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' })
            .setTimestamp();

        const responseEmbed = panelModule.createResponseEmbed(user, formData, ticketChannel.id);
        const validRoleMentions = [...new Set(visibleRoles)].filter(r => guild.roles.cache.has(r)).map(r => `<@&${r}>`).join(' ');

        await verifiedChannel.send({ content: `<@${user.id}>`, embeds: [welcomeEmbed, responseEmbed] });
        await verifiedChannel.send({ content: validRoleMentions ? `Staff controls: ${validRoleMentions}` : 'Staff controls: (Admins only)', components: [ticketControls] });

        if (ticketType === 'bookUs' && formData?.eventLink) {
            setTimeout(async () => {
                try { await panelModule.sendEventDetails(verifiedChannel, formData, user); }
                catch (e) { console.error('Error sending event details:', e); verifiedChannel.send('Error fetching event details.').catch(console.error); }
            }, 1500);
        }

        logTicketAction(guild, user, ticketType, 'created', verifiedChannel.id, formData);
        await safeReply(interaction, { content: `Your ${formatTicketType(ticketType)} ticket has been created: <#${verifiedChannel.id}>`, flags: MessageFlags.Ephemeral }, true);
    } catch (error) {
        console.error('Error creating ticket:', error);
        await safeReply(interaction, { content: 'An error occurred while creating your ticket.', flags: MessageFlags.Ephemeral }, true);
    }
}

// ─── Create a standard ticket (legacy) ───
async function createTicket(interaction, ticketType) {
    try { await interaction.deferReply({ flags: MessageFlags.Ephemeral }); } catch (e) { console.error('Error deferring:', e); return; }
    ensureTicketsLoaded();
    const { guild, user } = interaction;
    const maxTotal = config.ticketOptions?.maxTicketsPerUser ?? 10;
    const maxPerType = config.ticketOptions?.maxTicketsPerUserPerType ?? 3;
    const userTickets = Array.from(activeTickets.values()).filter(t => t.userId === user.id && !t.closed);
    const userTicketsOfType = userTickets.filter(t => t.type === ticketType);
    if (userTickets.length >= maxTotal) return safeReply(interaction, { content: `Max ${maxTotal} open tickets reached.`, flags: MessageFlags.Ephemeral }, true);
    if (userTicketsOfType.length >= maxPerType) return safeReply(interaction, { content: `Max ${maxPerType} open ${formatTicketType(ticketType)} tickets reached.`, flags: MessageFlags.Ephemeral }, true);

    try {
        const categoryId = config.ticketCategories[ticketType] || config.ticketCategories.support;
        const visibleRoles = getTicketRoles(ticketType).filter(r => isValidSnowflake(r));
        const permissionOverwrites = [
            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.AddReactions] }
        ];
        for (const roleId of visibleRoles) { if (guild.roles.cache.get(roleId)) permissionOverwrites.push({ id: roleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }); }

        let ticketName = sanitizeChannelName(`${ticketType}-${user.username}`);
        if (userTicketsOfType.length > 0) ticketName = sanitizeChannelName(`${ticketType}-${user.username}-${userTicketsOfType.length + 1}`);

        const ticketChannel = await guild.channels.create({ name: ticketName, type: ChannelType.GuildText, parent: categoryId, permissionOverwrites, topic: `${formatTicketType(ticketType)} ticket for ${user.tag} | ID: ${user.id}` });
        activeTickets.set(ticketChannel.id, { channelId: ticketChannel.id, userId: user.id, type: ticketType, createdAt: new Date() });
        await saveActiveTickets(activeTickets);

        const ticketControls = createTicketControlsRow(true);
        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`${formatTicketType(ticketType)} Ticket`)
            .setDescription(`Hello ${user}, thank you for creating a ${formatTicketType(ticketType)} ticket!\nOur staff will assist you shortly.`)
            .addFields({ name: 'User', value: `<@${user.id}>`, inline: true }, { name: 'Type', value: formatTicketType(ticketType), inline: true }, { name: 'Created', value: `<t:${getUnixTimestamp()}:F>`, inline: true })
            .setColor(getTicketColor(ticketType)).setFooter({ text: 'The RealOps Group', iconURL: guild.iconURL() }).setTimestamp();

        const validRoleMentions = [...new Set(visibleRoles)].filter(r => guild.roles.cache.has(r)).map(r => `<@&${r}>`).join(' ');
        await ticketChannel.send({ content: `<@${user.id}>`, embeds: [welcomeEmbed], components: [ticketControls] });
        if (validRoleMentions) await ticketChannel.send({ content: `Staff: ${validRoleMentions}` });

        logTicketAction(guild, user, ticketType, 'created', ticketChannel.id);
        await safeReply(interaction, { content: `Your ticket has been created: <#${ticketChannel.id}>`, flags: MessageFlags.Ephemeral }, true);
    } catch (error) {
        console.error('Error creating ticket:', error);
        await safeReply(interaction, { content: 'An error occurred while creating your ticket.', flags: MessageFlags.Ephemeral }, true);
    }
}

// ─── Close ticket (show confirmation) ───
async function closeTicket(interaction) {
    ensureTicketsLoaded();
    try {
        const { channel, user } = interaction;
        if (!activeTickets.has(channel.id)) return await interaction.editReply({ content: 'This channel is not set up as a ticket.' });
        const confirmEmbed = new EmbedBuilder().setTitle('Confirm Ticket Closure').setDescription(`${user}, are you sure you want to close this ticket?`).setColor('#f39c12').setFooter({ text: 'The RealOps Group', iconURL: user.displayAvatarURL() }).setTimestamp();
        const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_close_confirm').setLabel('Yes, Close It').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('ticket_close_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
        );
        await interaction.editReply({ embeds: [confirmEmbed], components: [confirmRow] });
    } catch (error) {
        console.error('Error initiating ticket closure:', error);
        try { await interaction.editReply({ content: 'An error occurred.' }); } catch (e) { console.error('Error sending error:', e); }
    }
}

// ─── Close confirmed ───
async function closeTicketConfirmed(interaction) {
    ensureTicketsLoaded();
    try {
        const { channel, user } = interaction;
        try { await interaction.deferUpdate(); } catch (e) { console.error('Error deferring:', e); }

        const closedEmbed = new EmbedBuilder()
            .setTitle('Ticket Closed')
            .setDescription(`This ticket was closed by <@${user.id}>\n\n⏳ Generating transcript and deleting channel in 5 seconds...`)
            .setColor('#f39c12').setFooter({ text: 'The RealOps Group', iconURL: user.displayAvatarURL() }).setTimestamp();
        await channel.send({ embeds: [closedEmbed] });

        let ticketData = activeTickets.get(channel.id);
        if (!ticketData) {
            ticketData = { channelId: channel.id, userId: 'unknown', type: 'support', createdAt: new Date(channel.createdTimestamp || Date.now()), recoveredFromChannel: true };
            const topic = channel.topic || '';
            const topicMatch = topic.match(/ID:\s*(\d{17,19})/);
            if (topicMatch) ticketData.userId = topicMatch[1];
            const nameOrCategory = ((channel.name || '') + ' ' + (channel.parent?.name || '')).toLowerCase();
            if (nameOrCategory.includes('join')) ticketData.type = 'joinTeam';
            else if (nameOrCategory.includes('book')) ticketData.type = 'bookUs';
            else if (nameOrCategory.includes('hr') && !nameOrCategory.includes('partner')) ticketData.type = 'hr';
            else if (nameOrCategory.includes('partner')) ticketData.type = 'partnership';
            else if (nameOrCategory.includes('founder')) ticketData.type = 'founders';
            activeTickets.set(channel.id, ticketData);
        }

        logTicketAction(interaction.guild, user, ticketData.type, 'closed', channel.id);

        // Generate HTML transcript
        try {
            const transcript = await generateTranscript(channel, { limit: -1, returnType: 'buffer', filename: `ticket-${channel.id}-${Date.now()}.html`, saveImages: true, poweredBy: false });
            ticketData.transcriptHtml = transcript.toString('base64');
            ticketData.transcriptGenerated = new Date().toISOString();
        } catch (transcriptError) {
            console.error('Error generating HTML transcript:', transcriptError);
        }

        // Always generate text fallback transcript in case HTML is too large for Firestore
        try {
            const messages = await channel.messages.fetch({ limit: 100 });
            ticketData.transcript = messages.filter(m => !m.author.bot || m.content).sort((a, b) => a.createdTimestamp - b.createdTimestamp)
                .map(m => ({ author: m.author.tag, authorId: m.author.id, message: m.content || '[Embed/Attachment]', timestamp: m.createdAt.toISOString() }));
        } catch (e) { console.error('Fallback transcript error:', e); }

        const updatedTicketData = { ...ticketData, closed: true, status: 'closed', closedAt: new Date(), closedBy: user.id };
        activeTickets.set(channel.id, updatedTicketData);
        await saveActiveTickets(activeTickets);
        await syncSingleTicketToFirebase(channel.id, updatedTicketData);

        // Send transcript to transcript channel
        const transcriptChannel = interaction.guild.channels.cache.get(config.transcriptChannel);
        if (transcriptChannel && ticketData.transcriptHtml) {
            try {
                const { AttachmentBuilder } = require('discord.js');
                const attachment = new AttachmentBuilder(Buffer.from(ticketData.transcriptHtml, 'base64'), { name: `ticket-${channel.id}-${Date.now()}.html` });
                const logEmbed = new EmbedBuilder().setTitle('Ticket Closed - Transcript Saved')
                    .addFields({ name: 'Ticket', value: channel.name, inline: true }, { name: 'User', value: `<@${ticketData.userId}>`, inline: true }, { name: 'Type', value: formatTicketType(ticketData.type), inline: true }, { name: 'Closed By', value: `<@${user.id}>`, inline: true }, { name: 'Closed At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false })
                    .setColor('#f39c12').setFooter({ text: 'The RealOps Group' }).setTimestamp();
                await transcriptChannel.send({ embeds: [logEmbed], files: [attachment] });
            } catch (e) { console.error('Error sending transcript:', e); }
        }

        try { await interaction.editReply({ content: '✅ Ticket closed, transcript saved. Deleting channel...', embeds: [], components: [] }); } catch (e) { console.error('Error updating message:', e); }

        activeTickets.delete(channel.id);
        await saveActiveTickets(activeTickets);
        await removeTicketFromStore(channel.id).catch(() => {});

        const channelId = channel.id;
        const guild = interaction.guild;
        setTimeout(async () => {
            try { const ch = await guild.channels.fetch(channelId).catch(() => null); if (ch) await ch.delete('Ticket closed and archived'); } catch (e) { console.error('Error deleting channel:', e); }
        }, 5000);
    } catch (error) {
        console.error('Error closing ticket:', error);
        try { await interaction.channel.send({ content: 'An error occurred: ' + error.message }); } catch (e) {}
    }
}

async function closeTicketCancelled(interaction) {
    try { await interaction.update({ content: 'Ticket closure cancelled.', embeds: [], components: [] }); }
    catch (e) { console.error('Error cancelling:', e); }
}

// ─── Reopen ───
async function reopenTicket(interaction) {
    ensureTicketsLoaded();
    try {
        const { channel, user } = interaction;
        if (!activeTickets.has(channel.id)) return await interaction.editReply({ content: 'This channel is not set up as a ticket.' });
        await channel.permissionOverwrites.edit(activeTickets.get(channel.id).userId, { SendMessages: true });
        const ticketControls = createTicketControlsRow(true);
        const reopenedEmbed = new EmbedBuilder().setTitle('Ticket Reopened').setDescription(`This ticket was reopened by <@${user.id}>`).setColor('#2ecc71').setFooter({ text: 'The RealOps Group', iconURL: user.displayAvatarURL() }).setTimestamp();
        await channel.send({ embeds: [reopenedEmbed], components: [ticketControls] });
        const ticketData = activeTickets.get(channel.id);
        logTicketAction(interaction.guild, user, ticketData.type, 'reopened', channel.id);
        activeTickets.set(channel.id, { ...ticketData, closed: false, reopenedAt: new Date(), reopenedBy: user.id });
        await saveActiveTickets(activeTickets);
        await deleteTicketFromFirebase(channel.id);
        try { await safeReply(interaction, { content: 'Ticket has been reopened.' }, true); } catch (e) { console.error('Error editing reply:', e); }
    } catch (error) {
        console.error('Error reopening ticket:', error);
        try { await interaction.channel.send({ content: 'An error occurred: ' + error.message }); } catch (e) {}
    }
}

// ─── Delete ───
async function deleteTicket(interaction) {
    ensureTicketsLoaded();
    try {
        const { channel, user } = interaction;
        if (!activeTickets.has(channel.id)) return await interaction.editReply({ content: 'This channel is not set up as a ticket.' });
        const ticketData = activeTickets.get(channel.id);
        try { await createTranscriptForDeletion(channel, user, ticketData); await safeReply(interaction, { content: 'Transcript saved. Deleting in 5 seconds...' }, true); }
        catch (e) { console.error('Transcript before deletion failed:', e); await safeReply(interaction, { content: 'Failed to save transcript. Deleting in 5 seconds...' }, true); }

        logTicketAction(interaction.guild, user, ticketData.type, 'deleted', channel.id);
        activeTickets.delete(channel.id);
        await saveActiveTickets(activeTickets);
        await removeTicketFromStore(channel.id).catch(() => {});

        const channelId = channel.id;
        const guild = interaction.guild;
        setTimeout(async () => {
            try { const ch = await guild.channels.fetch(channelId).catch(() => null); if (ch) await ch.delete('Ticket deleted'); } catch (e) { console.error('Error deleting channel:', e); }
        }, 5000);
    } catch (error) {
        console.error('Error deleting ticket:', error);
        try { await interaction.channel.send({ content: 'An error occurred: ' + error.message }); } catch (e) {}
    }
}

module.exports = { createTicketWithFormData, createTicket, closeTicket, closeTicketConfirmed, closeTicketCancelled, reopenTicket, deleteTicket };
