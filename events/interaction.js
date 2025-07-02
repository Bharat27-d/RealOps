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
            // --- PANEL SETUP COMMANDS ---
            if (interaction.isCommand() || interaction.isChatInputCommand()) {
                const commandName = interaction.commandName;

                if (commandName === 'setup-jointeam') {
                    if (!jointeampanel) {
                        return await interaction.reply({ content: 'Join Team panel module not found!', ephemeral: true });
                    }
                    await jointeampanel.sendPanel(interaction.channel);
                    return await interaction.reply({ content: 'Join Team panel has been set up!', ephemeral: true });
                } else if (commandName === 'setup-bookus') {
                    if (!bookuspanel) {
                        return await interaction.reply({ content: 'Book Us panel module not found!', ephemeral: true });
                    }
                    await bookuspanel.sendPanel(interaction.channel);
                    return await interaction.reply({ content: 'Book Us panel has been set up!', ephemeral: true });
                } else if (commandName === 'setup-support') {
                    if (!supportpanel) {
                        return await interaction.reply({ content: 'Support panel module not found!', ephemeral: true });
                    }
                    await supportpanel.sendPanel(interaction.channel);
                    return await interaction.reply({ content: 'Support panel has been set up!', ephemeral: true });
                } else if (commandName === 'setup-partnership') {
                    if (!partnershippanel) {
                        return await interaction.reply({ content: 'Partnership panel module not found!', ephemeral: true });
                    }
                    await partnershippanel.sendPanel(interaction.channel);
                    return await interaction.reply({ content: 'Partnership panel has been set up!', ephemeral: true });
                } else if (commandName === 'setup-founders') {
                    if (!founderpanel) {
                        return await interaction.reply({ content: 'Founders panel module not found!', ephemeral: true });
                    }
                    await founderpanel.sendPanel(interaction.channel);
                    return await interaction.reply({ content: 'Founders panel has been set up!', ephemeral: true });
                } else if (commandName === 'setup-hr') {
                    if (!hrpanel) {
                        return await interaction.reply({ content: 'HR panel module not found!', ephemeral: true });
                    }
                    await hrpanel.sendPanel(interaction.channel);
                    return await interaction.reply({ content: 'HR panel has been set up!', ephemeral: true });
                }

                // Handle regular dynamically loaded commands
                const command = interaction.client.commands.get(commandName);
                if (!command) {
                    return await interaction.reply({ content: 'Command not found!', ephemeral: true });
                }

                console.log(`[COMMAND] ${commandName} executed by ${interaction.user.tag} (${interaction.user.id})`);
                await command.execute(interaction);
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
                        ephemeral: false
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
                        ephemeral: true
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
                    ephemeral: true
                });
                return;
            }
        } catch (error) {
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: 'An error occurred while processing your interaction.', ephemeral: true });
                } else if (interaction.deferred && !interaction.replied) {
                    await interaction.editReply({ content: 'An error occurred while processing your interaction.' });
                }
            } catch (err) {}
            console.error('Error handling interaction:', error);
        }
    }
};