const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, Events } = require('discord.js');

// Directly require each panel module
const jointeampanel = require('../panels/jointeampanel');
const bookuspanel = require('../panels/bookuspanel');
const supportpanel = require('../panels/supportpanel');
const partnershippanel = require('../panels/partnershippanel');
const founderpanel = require('../panels/founderpanel');
const hrpanel = require('../panels/hrpanel');

// Import your ticket system where activeTickets is exported
const { activeTickets } = require('../ticketSystem'); // Update path as needed

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        try {
            // --- SLASH COMMANDS ---
            // Commands are handled by ticketSystem.js to avoid duplicate execution
            // This handler only processes buttons and select menus for event accept/decline
            if (interaction.isCommand() || interaction.isChatInputCommand()) {
                // Commands are fully handled in ticketSystem.js - skip here to prevent duplicates
                return;
            }

            // --- ACCEPT/DECLINE EVENT BUTTONS ---
            if (interaction.isButton()) {
                // Get ticket creator from activeTickets
                let ticketCreatorId = null;
                const ticketData = activeTickets && activeTickets.get
                    ? activeTickets.get(interaction.channel.id)
                    : null;
                if (ticketData && ticketData.userId) {
                    ticketCreatorId = ticketData.userId;
                }

                // Fallback to button clicker if not found (shouldn't happen)
                if (!ticketCreatorId) ticketCreatorId = interaction.user.id;

                if (interaction.customId === 'event_accept') {
                    const updatedEmbeds = interaction.message.embeds;

                    const acceptedEmbed = new EmbedBuilder()
                        .setTitle('Real Ops Request Accepted')
                        .setDescription(`Hello <@${ticketCreatorId}>,\n\nThank you for requesting our services at your event. Your request has been **accepted** and forwarded to our planning department.\n\nWe will contact you again before finalizing documents. Please be patient.`)
                        .setImage('https://i.postimg.cc/J0v07zL4/Accepted-event.png')
                        .setColor('#00b894')
                        .setFooter({ text: 'The Real Ops Group Project Management', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' })
                        .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png');

                    await interaction.update({
                        embeds: updatedEmbeds,
                        components: [],
                    });

                    await interaction.followUp({
                        content: `✅ <@${ticketCreatorId}>`,
                        embeds: [acceptedEmbed],
                        flags: 0
                    });
                    return;
                }

                if (interaction.customId === 'event_decline') {
                    // Show reason dropdown
                    const reasonSelect = new StringSelectMenuBuilder()
                        .setCustomId('decline_reason_select')
                        .setPlaceholder('Select a reason for declining')
                        .addOptions([
                            {
                                label: 'Fully booked for that month',
                                value: 'full_month'
                            },
                            {
                                label: 'We are not available on this date',
                                value: 'not_available'
                            },
                            {
                                label: 'Requirements not met',
                                description: 'You do not meet the requirements for Real Ops at your event',
                                value: 'not_requirements'
                            },
                            {
                                label: 'Partners event on this date',
                                value: 'partner_event'
                            },
                            {
                                label: 'Less than 4 weeks from now',
                                value: 'short_notice'
                            }
                        ]);

                    const actionRow = new ActionRowBuilder().addComponents(reasonSelect);

                    await interaction.reply({
                        content: 'Please select the reason for declining this event booking:',
                        components: [actionRow],
                        flags: 64
                    });
                    return;
                }
            }

            // --- REASON SELECTED FROM DROPDOWN ---
            if (interaction.isStringSelectMenu() && interaction.customId === 'decline_reason_select') {
                // Get ticket creator from activeTickets
                let ticketCreatorId = null;
                const ticketData = activeTickets && activeTickets.get
                    ? activeTickets.get(interaction.channel.id)
                    : null;
                if (ticketData && ticketData.userId) {
                    ticketCreatorId = ticketData.userId;
                }
                // Fallback to selector if not found (shouldn't happen)
                if (!ticketCreatorId) ticketCreatorId = interaction.user.id;

                const selected = interaction.values[0];
                let reasonText = '';
                switch (selected) {
                    case 'full_month':
                        reasonText = 'We are fully booked for that month.';
                        break;
                    case 'not_available':
                        reasonText = 'We are not available on this date.';
                        break;
                    case 'not_requirements':
                        reasonText = 'You do not meet the requirements to secure Real Ops at your event.';
                        break;
                    case 'partner_event':
                        reasonText = 'We have a partner’s event on this date.';
                        break;
                    case 'short_notice':
                        reasonText = 'The event is scheduled less than 4 weeks from the date of this ticket.';
                        break;
                    default:
                        reasonText = 'No specific reason provided.';
                }

                const declinedEmbed = new EmbedBuilder()
                    .setTitle('Real Ops Request Declined')
                    .setDescription(`Hello <@${ticketCreatorId}>,\n\nThank you for requesting our services. Unfortunately, we have **declined** your request for the following reason:\n\n• ${reasonText}\n\nWe encourage you to consider us again in the future.`)
                    .setImage('https://i.imgur.com/K51VLvn.png')
                    .setColor('#e74c3c')
                    .setFooter({ text: 'The Real Ops Group Project Management', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' })
                    .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png');

                // Public message to channel
                await interaction.message.channel.send({
                    content: `❌ <@${ticketCreatorId}>, your event booking has been **declined**.`,
                    embeds: [declinedEmbed]
                });

                // Private confirmation to selector
                await interaction.update({
                    content: '✅ Decline reason has been posted in the channel.',
                    components: [],
                    flags: 64
                });
                return;
            }
        } catch (error) {
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: 'An error occurred while processing your interaction.', flags: 64 });
                } else if (interaction.deferred && !interaction.replied) {
                    await interaction.editReply({ content: 'An error occurred while processing your interaction.' });
                }
            } catch (err) {}
            console.error('Error handling interaction:', error);
        }
    }
};
