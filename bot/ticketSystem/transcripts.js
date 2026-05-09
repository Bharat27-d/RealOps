/**
 * transcripts.js — Transcript generation for tickets.
 */

const { EmbedBuilder } = require('discord.js');
const { createTranscript: generateTranscript } = require('discord-html-transcripts');
const config = require('../config');
const { activeTickets, saveActiveTickets, syncSingleTicketToFirebase, ensureTicketsLoaded } = require('./ticketStore');
const { formatTicketType, formatDateUTC, getUnixTimestamp, logTicketAction } = require('../utils/ticketUtils');
const { safeReply } = require('../utils/interactionWrapper');

async function createTranscript(interaction) {
    ensureTicketsLoaded();
    try {
        const { channel, user } = interaction;
        if (!activeTickets.has(channel.id)) {
            return await interaction.editReply({ content: 'This channel is not set up as a ticket.' });
        }
        const ticketData = activeTickets.get(channel.id);
        const fileName = `transcript-${channel.name}-${Date.now()}.html`;
        const transcript = await generateTranscript(channel, {
            limit: -1, fileName, poweredBy: false, saveImages: true,
            footerText: `Transcript saved by ${user.tag} | ${formatDateUTC(new Date())}`,
            headerText: `Ticket Transcript - ${formatTicketType(ticketData.type)}`
        });
        await channel.send({ content: `Transcript saved by ${user}`, files: [transcript] });
        try {
            const messages = await channel.messages.fetch({ limit: 100 });
            ticketData.transcript = messages
                .filter(m => !m.author.bot || m.content)
                .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
                .map(m => ({ author: m.author.tag, message: m.content || '[Embed/Attachment]', timestamp: m.createdAt.toISOString() }));
            activeTickets.set(channel.id, ticketData);
            await saveActiveTickets(activeTickets);
            await syncSingleTicketToFirebase(channel.id, ticketData);
        } catch (e) { console.error('Error collecting transcript messages:', e); }
        logTicketAction(interaction.guild, user, ticketData.type, 'transcript', channel.id);
        await safeReply(interaction, { content: 'Transcript has been created and saved!' }, true);
        const transcriptChannel = interaction.guild.channels.cache.get(config.transcriptChannel);
        if (transcriptChannel) {
            const logEmbed = new EmbedBuilder()
                .setTitle('Ticket Transcript Created')
                .addFields(
                    { name: 'Ticket', value: channel.name, inline: true },
                    { name: 'User', value: `<@${user.id}> (${user.tag})`, inline: true },
                    { name: 'Type', value: formatTicketType(ticketData.type), inline: true },
                    { name: 'Created At', value: `<t:${getUnixTimestamp()}:F>`, inline: true }
                )
                .setColor('#3498db').setFooter({ text: 'The RealOps Group', iconURL: user.displayAvatarURL() }).setTimestamp();
            await transcriptChannel.send({ embeds: [logEmbed], files: [transcript] });
        }
    } catch (error) {
        console.error('Error creating transcript:', error);
        try { await interaction.channel.send({ content: 'An error occurred while creating the transcript: ' + error.message }); } catch (err) { console.error('Failed to send error message:', err); }
    }
}

async function createTranscriptForDeletion(channel, user, ticketData) {
    const fileName = `transcript-${channel.name}-${Date.now()}.html`;
    const transcript = await generateTranscript(channel, {
        limit: -1, fileName, poweredBy: false, saveImages: true,
        footerText: `Transcript saved before deletion by ${user.tag} | ${formatDateUTC(new Date())}`,
        headerText: `Ticket Transcript - ${formatTicketType(ticketData.type)} (Deleted)`
    });
    const transcriptChannel = channel.guild.channels.cache.get(config.transcriptChannel);
    if (transcriptChannel) {
        const logEmbed = new EmbedBuilder()
            .setTitle('Ticket Deleted - Transcript')
            .addFields(
                { name: 'Ticket', value: channel.name, inline: true },
                { name: 'User', value: `<@${user.id}> (${user.tag})`, inline: true },
                { name: 'Type', value: formatTicketType(ticketData.type), inline: true },
                { name: 'Deleted At', value: `<t:${getUnixTimestamp()}:F>`, inline: true }
            )
            .setColor('#e74c3c').setFooter({ text: 'The RealOps Group', iconURL: user.displayAvatarURL() }).setTimestamp();
        await transcriptChannel.send({ embeds: [logEmbed], files: [transcript] });
    }
}

module.exports = { createTranscript, createTranscriptForDeletion };
