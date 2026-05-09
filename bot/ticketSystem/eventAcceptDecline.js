/**
 * eventAcceptDecline.js — Accept/Decline event booking flow.
 */

const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');
const { activeTickets, ensureTicketsLoaded } = require('./ticketStore');
const { safeReply } = require('../utils/interactionWrapper');

async function handleEventAccept(interaction) {
    ensureTicketsLoaded();
    let ticketCreatorId = null;
    const ticketData = activeTickets.get(interaction.channel.id);
    if (ticketData?.userId) ticketCreatorId = ticketData.userId;
    if (!ticketCreatorId) ticketCreatorId = interaction.user.id;

    const acceptedEmbed = new EmbedBuilder()
        .setTitle('Real Ops Request Accepted')
        .setDescription(`Hello <@${ticketCreatorId}>,\n\nThank you for requesting our services at your event. Your request has been **accepted** and forwarded to our planning department.\n\nWe will contact you again before finalizing documents. Please be patient.`)
        .setImage('https://i.postimg.cc/J0v07zL4/Accepted-event.png')
        .setColor('#00b894')
        .setFooter({ text: 'The RealOps Group', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' })
        .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png');

    try {
        await interaction.update({ embeds: interaction.message.embeds, components: [] });
        await interaction.followUp({ content: `✅ <@${ticketCreatorId}>`, embeds: [acceptedEmbed], ephemeral: false });
    } catch (error) {
        console.error('Error handling event accept:', error);
        await interaction.channel.send({ content: `✅ <@${ticketCreatorId}>`, embeds: [acceptedEmbed] }).catch(console.error);
    }
}

async function handleEventDecline(interaction) {
    try {
        const reasonSelect = new StringSelectMenuBuilder()
            .setCustomId('decline_reason_select')
            .setPlaceholder('Select a reason for declining')
            .addOptions([
                { label: 'Fully booked for that month', value: 'full_month' },
                { label: 'We are not available on this date', value: 'not_available' },
                { label: 'Requirements not met', description: 'You do not meet the requirements for Real Ops at your event', value: 'not_requirements' },
                { label: 'Partners event on this date', value: 'partner_event' },
                { label: 'Less than 4 weeks from now', value: 'short_notice' }
            ]);
        const actionRow = new ActionRowBuilder().addComponents(reasonSelect);
        await safeReply(interaction, { content: 'Please select the reason for declining this event booking:', components: [actionRow], flags: MessageFlags.Ephemeral });
    } catch (error) {
        console.error('Error showing decline reasons:', error);
    }
}

async function handleDeclineReasonSelect(interaction) {
    ensureTicketsLoaded();
    let ticketCreatorId = null;
    const ticketData = activeTickets.get(interaction.channel.id);
    if (ticketData?.userId) ticketCreatorId = ticketData.userId;
    if (!ticketCreatorId) ticketCreatorId = interaction.user.id;

    const selected = interaction.values[0];
    const reasonMap = {
        'full_month': 'We are fully booked for that month.',
        'not_available': 'We are not available on this date.',
        'not_requirements': 'You do not meet the requirements to secure Real Ops at your event.',
        'partner_event': "We have a partner's event scheduled on this date.",
        'short_notice': 'The event is scheduled less than 4 weeks from the date of this ticket.'
    };
    const reasonText = reasonMap[selected] || 'No specific reason provided.';

    try {
        const declinedEmbed = new EmbedBuilder()
            .setTitle('Real Ops Request Declined')
            .setDescription(`Hello <@${ticketCreatorId}>,\n\nThank you for requesting our services. Unfortunately, we have **declined** your request for the following reason:\n\n• ${reasonText}\n\nWe encourage you to consider us again in the future.`)
            .setImage('https://i.imgur.com/K51VLvn.png')
            .setColor('#e74c3c')
            .setFooter({ text: 'The RealOps Group', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' })
            .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png');

        await interaction.message.channel.send({ content: `❌ <@${ticketCreatorId}>, your event booking has been **declined**.`, embeds: [declinedEmbed] });
        await interaction.update({ content: '✅ Decline reason has been posted in the channel.', components: [], flags: MessageFlags.Ephemeral });
    } catch (error) {
        console.error('Error processing decline reason:', error);
        try { await interaction.message.channel.send({ content: `❌ <@${ticketCreatorId}>, your event booking has been **declined** due to: ${reasonText}` }); } catch (e) {}
    }
}

module.exports = { handleEventAccept, handleEventDecline, handleDeclineReasonSelect };
