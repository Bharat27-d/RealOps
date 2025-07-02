const { 
    ActionRowBuilder, 
    ButtonBuilder, 
    EmbedBuilder, 
    ChannelType, 
    PermissionFlagsBits, 
    ButtonStyle,
    AttachmentBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const { createTranscript: generateTranscript } = require('discord-html-transcripts');
const fs = require('fs');
const path = require('path');
const config = require('./config');
// File path for ticket persistence
const TICKETS_FILE = path.join(__dirname, 'active_tickets.json');

// Import all panel modules
const panelModules = {
    joinTeam: require('./panels/jointeampanel'),
    support: require('./panels/supportpanel'),
    hr: require('./panels/hrpanel'),
    partnership: require('./panels/partnershippanel'),
    bookUs: require('./panels/bookuspanel'),
    founders: require('./panels/founderpanel')
};

// Load active tickets from file
function loadActiveTickets() {
    if (fs.existsSync(TICKETS_FILE)) {
        try {
            const data = fs.readFileSync(TICKETS_FILE, 'utf8');
            const tickets = JSON.parse(data);
            const ticketsMap = new Map();
            Object.entries(tickets).forEach(([key, value]) => {
                if (!value.channelId) value.channelId = key;
                if (value.createdAt) value.createdAt = new Date(value.createdAt);
                if (value.closedAt) value.closedAt = new Date(value.closedAt);
                if (value.reopenedAt) value.reopenedAt = new Date(value.reopenedAt);
                ticketsMap.set(key, value);
            });
            console.log(`Loaded ${ticketsMap.size} tickets from persistence file`);
            return ticketsMap;
        } catch (error) {
            console.error('Error loading active tickets:', error);
            return new Map();
        }
    } else {
        console.log('No active_tickets.json file found. Starting with empty tickets.');
        return new Map();
    }
}

// Save active tickets to file
function saveActiveTickets(tickets) {
    try {
        const ticketsObj = {};
        tickets.forEach((value, key) => {
            ticketsObj[key] = value;
        });
        fs.writeFileSync(TICKETS_FILE, JSON.stringify(ticketsObj, null, 2));
    } catch (error) {
        console.error('Error saving active tickets:', error);
    }
}

const activeTickets = loadActiveTickets();
const buttonToPanel = {};

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

function setupTicketSystem(client) {
    Object.values(panelModules).forEach(panel => {
        buttonToPanel[panel.buttonId] = panel;
    });

    client.once('ready', async () => {
        console.log(`Bot is ready. Current date (UTC): ${formatDateUTC(new Date())}`);
        let removedCount = 0;
        for (const [channelId, ticketData] of activeTickets.entries()) {
            const channel = client.channels.cache.get(channelId);
            if (!channel) {
                console.log(`Removing ticket for non-existent channel: ${channelId}`);
                activeTickets.delete(channelId);
                removedCount++;
            } else {
                console.log(`Found valid ticket channel: ${channel.name} (${channelId})`);
            }
        }
        saveActiveTickets(activeTickets);
        console.log(`Loaded ${activeTickets.size} active tickets (removed ${removedCount} invalid entries)`);
    });

    client.on('interactionCreate', async (interaction) => {
        try {
    if (interaction.isButton()) {
        const { customId } = interaction;
        if (buttonToPanel[customId]) {
            await interaction.showModal(buttonToPanel[customId].createModal());
            return;
        }
        if (customId === 'ticket_close_confirm') {
            await closeTicketConfirmed(interaction);
            return;
        }
        if (customId === 'ticket_close_cancel') {
            await closeTicketCancelled(interaction);
            return;
        }
        if (
            customId === 'ticket_close' || 
            customId === 'ticket_delete' || 
            customId === 'ticket_reopen' || 
            customId === 'ticket_transcript'
        ) {
            if (!activeTickets.has(interaction.channel.id)) {
                await interaction.reply({
                    content: 'This channel is not set up as a ticket. If this is an error, please contact an administrator.',
                    ephemeral: true
                });
                return;
            }
            // --- STAFF CHECK for sensitive actions ---
            if (
                customId === 'ticket_close' ||
                customId === 'ticket_delete' ||
                customId === 'ticket_reopen'
            ) {
                // Only staff or admins may proceed
                const ticketData = activeTickets.get(interaction.channel.id);
                const staffRoleIds = getTicketRoles(ticketData.type);
                const isStaff = interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
                    staffRoleIds.some(roleId => interaction.member.roles.cache.has(roleId));
                if (!isStaff) {
                    await interaction.reply({
                        content: "Only staff members can close, delete, or reopen tickets.",
                        ephemeral: true
                    });
                    return;
                }
            }
            if (customId === 'ticket_close') await closeTicket(interaction);
            if (customId === 'ticket_delete') await deleteTicket(interaction);
            if (customId === 'ticket_reopen') await reopenTicket(interaction);
            if (customId === 'ticket_transcript') await createTranscript(interaction);
            return;
        }
        if (customId.startsWith('ticket_create_')) {
            const ticketType = customId.split('_')[2];
            await createTicket(interaction, ticketType);
            return;
        }

                // --- Accept/Decline Button Logic ---
                if (customId === 'event_accept' || customId === 'event_decline') {
                    let ticketCreatorId = null;
                    const ticketData = activeTickets.get(interaction.channel.id);
                    if (ticketData && ticketData.userId) {
                        ticketCreatorId = ticketData.userId;
                    }
                    // Fallback to button clicker if not found
                    if (!ticketCreatorId) ticketCreatorId = interaction.user.id;

                    if (customId === 'event_accept') {
                        const acceptedEmbed = new EmbedBuilder()
                            .setTitle('Real Ops Request Accepted')
                            .setDescription(`Hello <@${ticketCreatorId}>,\n\nThank you for requesting our services at your event. Your request has been **accepted** and forwarded to our planning department.\n\nWe will contact you again before finalizing documents. Please be patient.`)
                            .setImage('https://i.postimg.cc/J0v07zL4/Accepted-event.png')
                            .setColor('#00b894')
                            .setFooter({ text: 'The Real Ops Group Project Management', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' })
                            .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png');
                        await interaction.update({
                            embeds: interaction.message.embeds,
                            components: [],
                        });
                        await interaction.followUp({
                            content: `✅ <@${ticketCreatorId}>`,
                            embeds: [acceptedEmbed],
                            ephemeral: false
                        });
                        return;
                    }

                    if (customId === 'event_decline') {
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
            }
            // --- Decline Reason Select Menu ---
            if (interaction.isStringSelectMenu() && interaction.customId === 'decline_reason_select') {
                let ticketCreatorId = null;
                const ticketData = activeTickets.get(interaction.channel.id);
                if (ticketData && ticketData.userId) {
                    ticketCreatorId = ticketData.userId;
                }
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
            if (interaction.isModalSubmit()) {
                const { customId } = interaction;
                const panelModule = Object.values(panelModules).find(panel => panel.modalId === customId);
                if (panelModule) {
                    if (!interaction.deferred && !interaction.replied) {
                        await interaction.deferReply({ ephemeral: true });
                    }
                    try {
                        const submittedData = panelModule.processSubmittedData(interaction);
                        await createTicketWithFormData(interaction, panelModule.ticketType, submittedData, panelModule);
                    } catch (error) {
                        console.error('Error handling modal submission:', error);
                        await interaction.editReply({ 
                            content: 'An error occurred while processing your submission. Please try again later.'
                        });
                    }
                }
            }
            if (interaction.isCommand()) {
                const { commandName } = interaction;
                if (commandName === 'register-ticket') {
                    await registerExistingTicket(interaction);
                } else if (commandName === 'debug-tickets') {
                    await debugTickets(interaction);
                }
            }
        } catch (error) {
            console.error('Error handling interaction:', error);
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ 
                        content: 'An error occurred while processing your request. Please try again later.',
                        ephemeral: true 
                    });
                } else if (interaction.deferred) {
                    await interaction.editReply({ 
                        content: 'An error occurred while processing your request. Please try again later.'
                    });
                }
            } catch (replyError) {
                console.error('Error sending error message:', replyError);
            }
        }
    });
    console.log('Ticket system initialized');
}
/**
 * Register an existing channel as a ticket
 * Usage: /register-ticket @user type:support
 */
async function registerExistingTicket(interaction) {
    // Check if user has admin permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
            content: 'You need administrator permissions to register tickets.',
            ephemeral: true
        });
    }
    
    await interaction.deferReply({ ephemeral: true });
    
    try {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const targetUser = interaction.options.getUser('user');
        const ticketType = interaction.options.getString('type');
        
        // Validate ticket type
        if (!['support', 'joinTeam', 'bookUs', 'partnership', 'founders', 'hr'].includes(ticketType)) {
            return interaction.editReply({
                content: 'Invalid ticket type. Valid types: support, joinTeam, bookUs, partnership, founders, hr',
                ephemeral: true
            });
        }
        
        // Check if channel is already registered
        if (activeTickets.has(channel.id)) {
            return interaction.editReply({
                content: `This channel is already registered as a ${formatTicketType(activeTickets.get(channel.id).type)} ticket.`,
                ephemeral: true
            });
        }
        
        // Register the channel as a ticket
        activeTickets.set(channel.id, {
            channelId: channel.id,
            userId: targetUser.id,
            type: ticketType,
            createdAt: new Date(),
            manuallyRegistered: true
        });
        
        // Save active tickets to file
        saveActiveTickets(activeTickets);
        
        // Add ticket controls
        const ticketControls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(config.emojis?.close || '🔒'),
                new ButtonBuilder()
                    .setCustomId('ticket_transcript')
                    .setLabel('Save Transcript')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📑'),
                new ButtonBuilder()
                    .setCustomId('ticket_delete')
                    .setLabel('Delete Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(config.emojis?.delete || '🗑️')
            );
        
        await channel.send({
            content: `This channel has been registered as a ${formatTicketType(ticketType)} ticket for ${targetUser}.`,
            components: [ticketControls]
        });
        
        // Log the action
        logTicketAction(
            interaction.guild, 
            interaction.user, 
            ticketType, 
            'manually-registered', 
            channel.id
        );
        
        await interaction.editReply({
            content: `Successfully registered ${channel} as a ${formatTicketType(ticketType)} ticket for ${targetUser}.`,
            ephemeral: true
        });
    } catch (error) {
        console.error('Error registering ticket:', error);
        await interaction.editReply({
            content: 'An error occurred while registering the ticket: ' + error.message,
            ephemeral: true
        });
    }
}

/**
 * Debug ticket system - for admins only
 * Usage: /debug-tickets
 */
async function debugTickets(interaction) {
    // Check if user has admin permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
            content: 'You need administrator permissions to debug tickets.',
            ephemeral: true
        });
    }
    
    await interaction.deferReply({ ephemeral: true });
    
    try {
        const currentChannel = interaction.channel;
        const debugInfo = [];
        
        // Current channel info
        debugInfo.push(`**Current Channel**`);
        debugInfo.push(`- ID: ${currentChannel.id}`);
        debugInfo.push(`- Name: ${currentChannel.name}`);
        debugInfo.push(`- Is Ticket: ${activeTickets.has(currentChannel.id) ? 'Yes' : 'No'}`);
        
        // If it's a ticket, show details
        if (activeTickets.has(currentChannel.id)) {
            const ticket = activeTickets.get(currentChannel.id);
            debugInfo.push(`- Type: ${formatTicketType(ticket.type)}`);
            debugInfo.push(`- User: <@${ticket.userId}>`);
            debugInfo.push(`- Created: ${ticket.createdAt ? formatDateUTC(ticket.createdAt) : 'Unknown'}`);
            debugInfo.push(`- Status: ${ticket.closed ? 'Closed' : 'Open'}`);
        }
        
        debugInfo.push(`\n**All Active Tickets**`);
        debugInfo.push(`Total: ${activeTickets.size}`);
        
        // Show first 10 tickets
        let count = 0;
        for (const [id, ticket] of activeTickets.entries()) {
            if (count >= 10) {
                debugInfo.push(`... and ${activeTickets.size - 10} more`);
                break;
            }
            
            const channel = interaction.guild.channels.cache.get(id);
            const channelExists = channel ? 'Yes' : 'No';
            debugInfo.push(`${count + 1}. ${ticket.type} - <#${id}> - Exists: ${channelExists}`);
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
        
        await interaction.editReply({
            content: debugInfo.join('\n'),
            ephemeral: true
        });
    } catch (error) {
        console.error('Error debugging tickets:', error);
        await interaction.editReply({
            content: 'An error occurred while debugging tickets: ' + error.message,
            ephemeral: true
        });
    }
}

// Handle panel modal submission
async function handlePanelModalSubmission(interaction, panelModule) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
        // Process the submitted data using panel's specific processor
        const submittedData = panelModule.processSubmittedData(interaction);
        
        // Create ticket with the processed data
        await createTicketWithFormData(interaction, panelModule.ticketType, submittedData, panelModule);
    } catch (error) {
        console.error('Error handling modal submission:', error);
        await interaction.editReply({ 
            content: 'An error occurred while processing your submission. Please try again later.'
        });
    }
}

// Validate if string is a valid Discord ID (Snowflake)
function isValidSnowflake(id) {
    if (!id) return false;
    if (typeof id !== 'string' || !/^\d+$/.test(id)) return false;
    try {
        return id.length >= 17 && id.length <= 19;
    } catch (error) {
        return false;
    }
}


// Create a ticket with form data
async function createTicketWithFormData(interaction, ticketType, formData, panelModule) {
    const { guild, user } = interaction;
    
    // Get ticket limits from config (with fallbacks if not defined)
    const maxTotal = config.ticketOptions?.maxTicketsPerUser ?? 10;
    const maxPerType = config.ticketOptions?.maxTicketsPerUserPerType ?? 3;
    
    // Get user's open tickets
    const userTickets = Array.from(activeTickets.values())
        .filter(ticket => ticket.userId === user.id && !ticket.closed);
    
    // Get user's open tickets of the current type
    const userTicketsOfType = userTickets
        .filter(ticket => ticket.type === ticketType);
    
    // Check total ticket limit
    if (userTickets.length >= maxTotal) {
        return interaction.editReply({ 
            content: `You have reached the maximum limit of ${maxTotal} open tickets. Please close some of your existing tickets before creating more.`,
            ephemeral: true 
        });
    }
    
    // Check per-type ticket limit
    if (userTicketsOfType.length >= maxPerType) {
        return interaction.editReply({ 
            content: `You can only have ${maxPerType} open ${formatTicketType(ticketType)} tickets at once. Please close some of your existing ${formatTicketType(ticketType)} tickets before creating more.`,
            ephemeral: true 
        });
    }
    
    try {
        // Get appropriate category and roles for this ticket type
        const categoryId = config.ticketCategories[ticketType] || config.ticketCategories.support;
        const visibleRoles = getTicketRoles(ticketType).filter(roleId => {
            // Filter out invalid role IDs
            if (!isValidSnowflake(roleId)) {
                console.warn(`Warning: Invalid role ID in config: ${roleId}`);
                return false;
            }
            return true;
        });
        
        // Create permissions array for the channel
        const permissionOverwrites = [
            {
                id: guild.id,
                deny: [PermissionFlagsBits.ViewChannel]
            },
            {
                id: user.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,   // <-- Allow sending images
            PermissionFlagsBits.AddReactions,  // <-- Allow adding reactions
            PermissionFlagsBits.EmbedLinks
                ]
            }
        ];
        
        // Add role permissions for valid roles only
        for (const roleId of visibleRoles) {
            // Validate that the role exists in the guild's cache
            const role = guild.roles.cache.get(roleId);
            if (role) {
                permissionOverwrites.push({
                    id: roleId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                });
            } else {
                console.warn(`Warning: Role ID ${roleId} not found in guild cache`);
            }
        }
        
        // Add counter for multiple tickets if needed
        let ticketName = `${ticketType}-${user.username}`;
        if (userTicketsOfType.length > 0) {
            ticketName = `${ticketType}-${user.username}-${userTicketsOfType.length + 1}`;
        }
        
        // Create the ticket channel
        const ticketChannel = await guild.channels.create({
            name: ticketName,
            type: ChannelType.GuildText,
            parent: categoryId,
            permissionOverwrites: permissionOverwrites,
            topic: `${formatTicketType(ticketType)} ticket for ${user.tag} | ID: ${user.id}`
        });
        
        // Track the ticket
        activeTickets.set(ticketChannel.id, {
            channelId: ticketChannel.id,
            userId: user.id,
            type: ticketType,
            createdAt: new Date(),
            formData: formData
        });
        
        // Save active tickets to file
        saveActiveTickets(activeTickets);
        
        // Create ticket management buttons
        const ticketControls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(config.emojis?.close || '🔒'),
                new ButtonBuilder()
                    .setCustomId('ticket_transcript')
                    .setLabel('Save Transcript')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📑'),
                new ButtonBuilder()
                    .setCustomId('ticket_delete')
                    .setLabel('Delete Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(config.emojis?.delete || '🗑️')
            );
        
        // Create welcome embed
        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`${formatTicketType(ticketType)} Ticket`)
            .setDescription(`Thank you for your submission, ${user}!\nOur team will assist you shortly.`)
            .setColor(getTicketColor(ticketType))
            .setFooter({ 
                text: 'The Real Ops Group', 
                iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
            })
            .setTimestamp();
        
        // Create response embed using the panel's formatter
        const responseEmbed = panelModule.createResponseEmbed(user, formData, ticketChannel.id);
        
        // Get valid mentions for roles (with duplicate removal)
        const validRoleMentions = [...new Set(visibleRoles)]
            .filter(roleId => guild.roles.cache.has(roleId))
            .map(roleId => `<@&${roleId}>`)
            .join(' ');
        
        // Send welcome message and form data to the ticket channel
        await ticketChannel.send({ 
    content: `<@${user.id}> ${validRoleMentions}`,
    embeds: [welcomeEmbed, responseEmbed]
});
// Then send controls only for staff/admins
if (validRoleMentions) {
    await ticketChannel.send({
        content: `Staff controls: ${validRoleMentions}`,
        components: [ticketControls]
    });
} else {
    await ticketChannel.send({
        content: `Staff controls: (Admins only)`,
        components: [ticketControls]
    });
}
        
        // If this is a "Book Us" ticket, fetch and send TruckerMP event details
        if (ticketType === 'bookUs' && formData && formData.eventLink) {
            try {
                // Wait a moment to ensure the first message is sent
                setTimeout(async () => {
                    // Try to send event details from TruckerMP API
                    await panelModule.sendEventDetails(ticketChannel, formData, user);
                }, 1000);
            } catch (eventError) {
                console.error('Error sending event details:', eventError);
            }
        }
        
        // Log ticket creation
        logTicketAction(guild, user, ticketType, 'created', ticketChannel.id, formData);
        
        // Reply to the user
        await interaction.editReply({ 
            content: `Your ${formatTicketType(ticketType)} ticket has been created: <#${ticketChannel.id}>`,
            ephemeral: true 
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        await interaction.editReply({
            content: 'An error occurred while creating your ticket. Please contact an administrator.',
            ephemeral: true
        });
    }
}

// Create a standard ticket (legacy support)
async function createTicket(interaction, ticketType) {
    await interaction.deferReply({ ephemeral: true });
    
    const { guild, user } = interaction;
    
    // Get ticket limits from config (with fallbacks if not defined)
    const maxTotal = config.ticketOptions?.maxTicketsPerUser ?? 10;
    const maxPerType = config.ticketOptions?.maxTicketsPerUserPerType ?? 3;
    
    // Get user's open tickets
    const userTickets = Array.from(activeTickets.values())
        .filter(ticket => ticket.userId === user.id && !ticket.closed);
    
    // Get user's open tickets of the current type
    const userTicketsOfType = userTickets
        .filter(ticket => ticket.type === ticketType);
    
    // Check total ticket limit
    if (userTickets.length >= maxTotal) {
        return interaction.editReply({ 
            content: `You have reached the maximum limit of ${maxTotal} open tickets. Please close some of your existing tickets before creating more.`,
            ephemeral: true 
        });
    }
    
    // Check per-type ticket limit
    if (userTicketsOfType.length >= maxPerType) {
        return interaction.editReply({ 
            content: `You can only have ${maxPerType} open ${formatTicketType(ticketType)} tickets at once. Please close some of your existing ${formatTicketType(ticketType)} tickets before creating more.`,
            ephemeral: true 
        });
    }
    
    try {
        // Get appropriate category and roles for this ticket type
        const categoryId = config.ticketCategories[ticketType] || config.ticketCategories.support;
        const visibleRoles = getTicketRoles(ticketType).filter(roleId => isValidSnowflake(roleId));
        
        // Create permissions array for the channel
        const permissionOverwrites = [
            {
                id: guild.id,
                deny: [PermissionFlagsBits.ViewChannel]
            },
            {
                id: user.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory
                ]
            }
        ];
        
        // Add role permissions for valid roles only
        for (const roleId of visibleRoles) {
            const role = guild.roles.cache.get(roleId);
            if (role) {
                permissionOverwrites.push({
                    id: roleId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                });
            }
        }
        
        // Add counter for multiple tickets if needed
        let ticketName = `${ticketType}-${user.username}`;
        if (userTicketsOfType.length > 0) {
            ticketName = `${ticketType}-${user.username}-${userTicketsOfType.length + 1}`;
        }
        
        // Create the ticket channel
        const ticketChannel = await guild.channels.create({
            name: ticketName,
            type: ChannelType.GuildText,
            parent: categoryId,
            permissionOverwrites: permissionOverwrites,
            topic: `${formatTicketType(ticketType)} ticket for ${user.tag} | ID: ${user.id}`
        });
        
        // Track the ticket
        activeTickets.set(ticketChannel.id, {
            channelId: ticketChannel.id,
            userId: user.id,
            type: ticketType,
            createdAt: new Date()
        });
        
        // Save active tickets to file
        saveActiveTickets(activeTickets);
        
        // Create ticket management buttons
        const ticketControls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(config.emojis?.close || '🔒'),
                new ButtonBuilder()
                    .setCustomId('ticket_transcript')
                    .setLabel('Save Transcript')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📑'),
                new ButtonBuilder()
                    .setCustomId('ticket_delete')
                    .setLabel('Delete Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(config.emojis?.delete || '🗑️')
            );
        
        // Create welcome embed
        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`${formatTicketType(ticketType)} Ticket`)
            .setDescription(`Hello ${user}, thank you for creating a ${formatTicketType(ticketType)} ticket!\nOur staff will assist you shortly.`)
            .addFields(
                { name: 'User', value: `<@${user.id}>`, inline: true },
                { name: 'Type', value: formatTicketType(ticketType), inline: true },
                { name: 'Created', value: formatDateUTC(new Date()), inline: true }
            )
            .setColor(getTicketColor(ticketType))
            .setFooter({ 
                text: `Ticket ID: ${ticketChannel.id}`, 
                iconURL: guild.iconURL() 
            })
            .setTimestamp();
        
        // Get valid mentions for roles (with duplicate removal)
        const validRoleMentions = [...new Set(visibleRoles)]
            .filter(roleId => guild.roles.cache.has(roleId))
            .map(roleId => `<@&${roleId}>`)
            .join(' ');
        
        // Send welcome message to the ticket channel
        await ticketChannel.send({ 
            content: `<@${user.id}> ${validRoleMentions}`,
            embeds: [welcomeEmbed],
            components: [ticketControls]
        });
        
        // Log ticket creation
        logTicketAction(guild, user, ticketType, 'created', ticketChannel.id);
        
        // Reply to the user
        await interaction.editReply({ 
            content: `Your ticket has been created: <#${ticketChannel.id}>`,
            ephemeral: true 
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        await interaction.editReply({
            content: 'An error occurred while creating your ticket. Please contact an administrator.',
            ephemeral: true
        });
    }
}

// Close a ticket
async function closeTicket(interaction) {
    try {
        const { channel, user } = interaction;
        
        // We already validated this is a ticket channel in the main handler
        if (!activeTickets.has(channel.id)) {
            return await interaction.reply({
                content: 'This channel is not set up as a ticket. If this is an error, please contact an administrator.',
                ephemeral: true
            });
        }
        
        // Instead of closing immediately, send a confirmation message
        const confirmationEmbed = new EmbedBuilder()
            .setTitle('Confirm Ticket Closure')
            .setDescription(`${user}, are you sure you want to close this ticket?`)
            .setColor('#f39c12')
            .setTimestamp();
        
        const confirmationRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close_confirm')
                    .setLabel('Yes, Close It')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('ticket_close_cancel')
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Secondary)
            );
        
        await interaction.reply({
            embeds: [confirmationEmbed],
            components: [confirmationRow]
        });
    } catch (error) {
        console.error('Error initiating ticket closure:', error);
        try {
            await interaction.reply({
                content: 'An error occurred while processing your request.',
                ephemeral: true
            });
        } catch (replyError) {
            console.error('Error sending error message:', replyError);
        }
    }
}

// Confirmed ticket closing (actual closing process)
async function closeTicketConfirmed(interaction) {
    try {
        const { channel, user } = interaction;
        
        await interaction.deferUpdate(); // Update the original message
        
        // Update channel permissions
        await channel.permissionOverwrites.edit(activeTickets.get(channel.id).userId, {
            SendMessages: false
        });
        
        // Create reopen button
        const reopenRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_reopen')
                    .setLabel('Reopen Ticket')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🔓'),
                new ButtonBuilder()
                    .setCustomId('ticket_delete')
                    .setLabel('Delete Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(config.emojis?.delete || '🗑️')
            );
        
        const closedEmbed = new EmbedBuilder()
            .setTitle('Ticket Closed')
            .setDescription(`This ticket was closed by <@${user.id}>`)
            .setColor('#f39c12')
            .setTimestamp();
        
        await channel.send({ embeds: [closedEmbed], components: [reopenRow] });
        
        // Log ticket closing
        const ticketData = activeTickets.get(channel.id);
        logTicketAction(interaction.guild, user, ticketData.type, 'closed', channel.id);
        
        // Update ticket data but don't remove from active tickets
        const updatedTicketData = {
            ...ticketData,
            closed: true,
            closedAt: new Date(),
            closedBy: user.id
        };
        activeTickets.set(channel.id, updatedTicketData);
        saveActiveTickets(activeTickets);
        
        // Edit the original confirmation message
        await interaction.editReply({
            content: 'Ticket has been closed.',
            embeds: [],
            components: []
        });
    } catch (error) {
        console.error('Error closing ticket:', error);
        try {
            await interaction.followUp({
                content: 'An error occurred while closing the ticket.',
                ephemeral: true
            });
        } catch (replyError) {
            console.error('Error sending error message:', replyError);
        }
    }
}

// Cancel ticket closing
async function closeTicketCancelled(interaction) {
    await interaction.update({
        content: 'Ticket closure cancelled.',
        embeds: [],
        components: []
    });
}

// Reopen a ticket
async function reopenTicket(interaction) {
    try {
        const { channel, user } = interaction;
        
        // We already validated this is a ticket channel in the main handler
        if (!activeTickets.has(channel.id)) {
            return await interaction.reply({
                content: 'This channel is not set up as a ticket. If this is an error, please contact an administrator.',
                ephemeral: true
            });
        }
        
        await interaction.deferReply(); // Non-ephemeral for actual action
        
        // Update channel permissions
        await channel.permissionOverwrites.edit(activeTickets.get(channel.id).userId, {
            SendMessages: true
        });
        
        // Create standard ticket controls
        const ticketControls = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(config.emojis?.close || '🔒'),
                new ButtonBuilder()
                    .setCustomId('ticket_transcript')
                    .setLabel('Save Transcript')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📑'),
                new ButtonBuilder()
                    .setCustomId('ticket_delete')
                    .setLabel('Delete Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(config.emojis?.delete || '🗑️')
            );
        
        const reopenedEmbed = new EmbedBuilder()
            .setTitle('Ticket Reopened')
            .setDescription(`This ticket was reopened by <@${user.id}>`)
            .setColor('#2ecc71')
            .setTimestamp();
        
        await channel.send({ embeds: [reopenedEmbed], components: [ticketControls] });
        
        // Log ticket reopening
        const ticketData = activeTickets.get(channel.id);
        logTicketAction(interaction.guild, user, ticketData.type, 'reopened', channel.id);
        
        // Update ticket data
        const updatedTicketData = {
            ...ticketData,
            closed: false,
            reopenedAt: new Date(),
            reopenedBy: user.id
        };
        activeTickets.set(channel.id, updatedTicketData);
        saveActiveTickets(activeTickets);
        
        // Edit the deferred reply
        await interaction.editReply({
            content: `Ticket has been reopened.`
        });
    } catch (error) {
        console.error('Error reopening ticket:', error);
        try {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'An error occurred while reopening the ticket.',
                    ephemeral: true
                });
            } else if (interaction.deferred) {
                await interaction.editReply({
                    content: 'An error occurred while reopening the ticket.'
                });
            }
        } catch (replyError) {
            console.error('Error sending error message:', replyError);
        }
    }
}

// Delete a ticket
async function deleteTicket(interaction) {
    try {
        const { channel, user } = interaction;
        
        // We already validated this is a ticket channel in the main handler
        if (!activeTickets.has(channel.id)) {
            return await interaction.reply({
                content: 'This channel is not set up as a ticket. If this is an error, please contact an administrator.',
                ephemeral: true
            });
        }
        
        await interaction.deferReply(); // Non-ephemeral for actual action
        
        // Generate a transcript before deleting
        const ticketData = activeTickets.get(channel.id);
        
        try {
            // Try to create a transcript before deleting
            await createTranscriptForDeletion(channel, user, ticketData);
            await interaction.editReply({ content: `Transcript saved. Ticket will be deleted in 5 seconds...` });
        } catch (transcriptError) {
            console.error('Failed to create transcript before deletion:', transcriptError);
            await interaction.editReply({ content: `Failed to save transcript. Ticket will be deleted in 5 seconds...` });
        }
        
        // Log ticket deletion
        logTicketAction(interaction.guild, user, ticketData.type, 'deleted', channel.id);
        
        // Remove from active tickets
        activeTickets.delete(channel.id);
        saveActiveTickets(activeTickets);
        
        // Delete after delay
        setTimeout(() => {
            channel.delete().catch(console.error);
        }, 5000);
    } catch (error) {
        console.error('Error deleting ticket:', error);
        try {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'An error occurred while deleting the ticket.',
                    ephemeral: true
                });
            } else if (interaction.deferred) {
                await interaction.editReply({
                    content: 'An error occurred while deleting the ticket.'
                });
            }
        } catch (replyError) {
            console.error('Error sending error message:', replyError);
        }
    }
}

// Create transcript for deletion
async function createTranscriptForDeletion(channel, user, ticketData) {
    const timestamp = Date.now();
    const fileName = `transcript-${channel.name}-${timestamp}.html`;
    
    // Create transcript
    const transcript = await generateTranscript(channel, {
        limit: -1,
        fileName: fileName,
        poweredBy: false,
        saveImages: true,
        footerText: `Transcript saved before deletion by ${user.tag} | ${formatDateUTC(new Date())}`,
        headerText: `Ticket Transcript - ${formatTicketType(ticketData.type)} (Deleted)`
    });
    
    // Send to transcript channel if configured
    const transcriptChannel = channel.guild.channels.cache.get(config.transcriptChannel);
    if (transcriptChannel) {
        const logEmbed = new EmbedBuilder()
            .setTitle('Ticket Deleted - Transcript')
            .addFields(
                { name: 'Ticket', value: channel.name, inline: true },
                { name: 'User', value: `<@${user.id}> (${user.tag})`, inline: true },
                { name: 'Type', value: formatTicketType(ticketData.type), inline: true },
                { name: 'Deleted At', value: formatDateUTC(new Date()), inline: true }
            )
            .setColor('#e74c3c')
            .setTimestamp();
        
        await transcriptChannel.send({
            embeds: [logEmbed],
            files: [transcript]
        });
    }
}

// Create transcript
async function createTranscript(interaction) {
    try {
        const { channel, user } = interaction;
        
        // We already validated this is a ticket channel in the main handler
        if (!activeTickets.has(channel.id)) {
            return await interaction.reply({
                content: 'This channel is not set up as a ticket. If this is an error, please contact an administrator.',
                ephemeral: true
            });
        }
        
        await interaction.deferReply();
        
        // Get ticket data
        const ticketData = activeTickets.get(channel.id);
        const timestamp = Date.now();
        const fileName = `transcript-${channel.name}-${timestamp}.html`;
        
        // Create transcript
        const transcript = await generateTranscript(channel, {
            limit: -1, // Fetch all messages
            fileName: fileName,
            poweredBy: false, // Remove the "Powered by discord-html-transcripts" text
            saveImages: true, // Save images
            footerText: `Transcript saved by ${user.tag} | ${formatDateUTC(new Date())}`,
            headerText: `Ticket Transcript - ${formatTicketType(ticketData.type)}`
        });
        
        // Send the transcript as an attachment in the channel
        await channel.send({
            content: `Transcript saved by ${user}`,
            files: [transcript]
        });
        
        // Log transcript creation
        logTicketAction(interaction.guild, user, ticketData.type, 'transcript', channel.id);
        
        // Reply to the interaction
        await interaction.editReply({
            content: 'Transcript has been created and saved!',
        });
        
        // Send transcript to dedicated transcript channel if configured
        const transcriptChannel = interaction.guild.channels.cache.get(config.transcriptChannel);
        if (transcriptChannel) {
            const logEmbed = new EmbedBuilder()
                .setTitle('Ticket Transcript Created')
                .addFields(
                    { name: 'Ticket', value: channel.name, inline: true },
                    { name: 'User', value: `<@${user.id}> (${user.tag})`, inline: true },
                    { name: 'Type', value: formatTicketType(ticketData.type), inline: true },
                    { name: 'Created At', value: formatDateUTC(new Date()), inline: true }
                )
                .setColor('#3498db')
                .setTimestamp();
            
            await transcriptChannel.send({
                embeds: [logEmbed],
                files: [transcript]
            });
        }
    } catch (error) {
        console.error('Error creating transcript:', error);
        try {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'An error occurred while creating the transcript: ' + error.message,
                    ephemeral: true
                });
            } else if (interaction.deferred) {
                await interaction.editReply({
                    content: 'An error occurred while creating the transcript: ' + error.message
                });
            }
        } catch (replyError) {
            console.error('Error sending error message:', replyError);
        }
    }
}

// Get roles that should see a specific ticket type
// Get roles that should see and be notified for a specific ticket type (tags only specific roles per type)
function getTicketRoles(ticketType) {
    const roles = [];
    switch(ticketType) {
        case 'joinTeam':
            if (Array.isArray(config.staffRoles.hr)) {
                roles.push(...config.staffRoles.hr);
            } else if (config.staffRoles.hr) {
                roles.push(config.staffRoles.hr);
            }
            break;
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
    switch(ticketType) {
        case 'joinTeam': return '#3498db';
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
    switch(ticketType) {
        case 'joinTeam': return 'Join the Team';
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
    
    // Use Discord timestamp for user's local time
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
        .setTimestamp();
    
    // If we have form data and it's a creation action, add a summary
    if (formData && action === 'created') {
        // Add a summary based on the ticket type
        let summary = '';
        switch(ticketType) {
            case 'joinTeam':
                summary = `Position: ${formData.position}`;
                break;
            case 'hr':
                summary = `Reason: ${formData.reason}`;
                break;
            case 'partnership':
                summary = `VTC: ${formData.vtcName}`;
                break;
            case 'support':
                summary = `Discord Name: ${formData.discordName}`;
                break;
            case 'bookUs':
                summary = `Discord Name: ${formData.discordName}, VTC Role: ${formData.vtcRole}`;
                break;
            case 'founders':
                summary = `Discord Name: ${formData.discordName}`;
                break;
        }
        
        if (summary) {
            logEmbed.addFields({ name: 'Summary', value: summary, inline: true });
        }
    }
    
    logChannel.send({ embeds: [logEmbed] }).catch(console.error);
}

module.exports = {
    setupTicketSystem,
    createTicket,
    closeTicket,
    reopenTicket,
    deleteTicket,
    createTranscript,
    registerExistingTicket,
    debugTickets
};