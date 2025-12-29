const { 
    ActionRowBuilder, 
    ButtonBuilder, 
    EmbedBuilder, 
    ChannelType, 
    PermissionFlagsBits, 
    ButtonStyle,
    AttachmentBuilder,
    StringSelectMenuBuilder,
    Events,
    MessageFlags
} = require('discord.js');
const { createTranscript: generateTranscript } = require('discord-html-transcripts');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const firebase = require('./firebase');

// Ensure Firebase is initialized
if (!firebase) {
  console.error('❌ Firebase is not configured. Please check your configuration.');
  process.exit(1);
}

// Import all panel modules
const panelModules = {
    joinTeam: require('./panels/jointeampanel'),
    support: require('./panels/supportpanel'),
    hr: require('./panels/hrpanel'),
    partnership: require('./panels/partnershippanel'),
    bookUs: require('./panels/bookuspanel'),
    founders: require('./panels/founderpanel')
};

// File path for ticket persistence
const TICKETS_FILE = path.join(__dirname, 'active_tickets.json');

// Load active tickets from file with fault tolerance
function loadActiveTickets() {
    if (fs.existsSync(TICKETS_FILE)) {
        try {
            const data = fs.readFileSync(TICKETS_FILE, 'utf8');
            
            // Handle empty file
            if (!data || data.trim() === '') {
                console.log('Active tickets file is empty. Starting fresh.');
                saveActiveTickets(new Map()).catch(console.error);
                return new Map();
            }
            
            const tickets = JSON.parse(data);
            const ticketsMap = new Map();
            Object.entries(tickets).forEach(([key, value]) => {
                if (!value.channelId) value.channelId = key;
                if (value.createdAt) value.createdAt = new Date(value.createdAt);
                if (value.closedAt) value.closedAt = new Date(value.closedAt);
                if (value.reopenedAt) value.reopenedAt = new Date(value.reopenedAt);
                ticketsMap.set(key, value);
            });
            console.log(`✅ Loaded ${ticketsMap.size} tickets from persistence file`);
            return ticketsMap;
        } catch (error) {
            console.error('⚠️ Error loading active tickets (corrupted file):', error.message);
            console.log('Creating backup and starting fresh...');
            
            // Create backup of corrupted file
            try {
                const timestamp = Date.now();
                const backupPath = path.join(__dirname, `active_tickets.backup.${timestamp}.json`);
                if (fs.existsSync(TICKETS_FILE)) {
                    fs.copyFileSync(TICKETS_FILE, backupPath);
                    console.log(`Corrupted file backed up to: ${backupPath}`);
                }
            } catch (backupError) {
                console.error('Could not create backup:', backupError.message);
            }
            
            // Start with empty map and save it
            const freshMap = new Map();
            saveActiveTickets(freshMap).catch(console.error);
            return freshMap;
        }
    } else {
        console.log('📝 No active_tickets.json file found. Creating new one.');
        const freshMap = new Map();
        saveActiveTickets(freshMap).catch(console.error);
        return freshMap;
    }
}

// Save active tickets with queue to prevent race conditions
const saveQueue = [];
let isSaving = false;

function saveActiveTickets(tickets) {
    return new Promise((resolve, reject) => {
        saveQueue.push({ tickets: new Map(tickets), resolve, reject });
        
        if (!isSaving) {
            processNextSave();
        }
    });
}

async function processNextSave() {
    if (saveQueue.length === 0) {
        isSaving = false;
        return;
    }
    
    isSaving = true;
    const { tickets, resolve, reject } = saveQueue.shift();
    
    try {
        const ticketsObj = {};
        tickets.forEach((value, key) => {
            ticketsObj[key] = value;
        });
        
        await fs.promises.writeFile(TICKETS_FILE, JSON.stringify(ticketsObj, null, 2));
        
        // Sync to Firebase if available
        if (firebase && firebase.collections && firebase.collections.tickets) {
            await syncTicketsToFirebase(tickets);
        }
        
        resolve();
    } catch (error) {
        console.error('Error saving active tickets:', error);
        reject(error);
    } finally {
        // Process the next save operation in the queue
        setTimeout(processNextSave, 10);
    }
}

// Sync tickets to Firebase for dashboard access
async function syncTicketsToFirebase(tickets) {
  if (!firebase || !firebase.collections) return;

  try {
    const batch = firebase.db.batch();
    tickets.forEach((ticket, channelId) => {
      const ticketRef = firebase.collections.tickets.doc(channelId);
      batch.set(ticketRef, ticket);
    });
    await batch.commit();
    console.log(`✅ Synced ${tickets.size} tickets to Firebase`);
  } catch (error) {
    console.error('Error syncing tickets to Firebase:', error);
  }
}

// Sync single ticket to Firebase
async function syncSingleTicketToFirebase(channelId, ticketData) {
  console.log(`🔄 Attempting to sync ticket ${channelId} to Firebase...`);

  if (!firebase || !firebase.collections) {
    console.error('❌ Firebase is not configured. Cannot sync ticket.');
    return;
  }

  try {
    const ticketRef = firebase.collections.tickets.doc(channelId);
    await ticketRef.set(ticketData, { merge: true });
    console.log(`✅ Synced ticket ${channelId} to Firebase`);
  } catch (error) {
    console.error(`Error syncing ticket ${channelId} to Firebase:`, error);
  }
}

const activeTickets = loadActiveTickets();
const buttonToPanel = {};

// Helper for safe interaction replies
async function safeReply(interaction, options, isEdit = false) {
    try {
        if (isEdit) {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.deferReply({ ephemeral: true }).catch(() => {});
            }
            return await interaction.editReply(options);
        } else {
            if (!interaction.replied && !interaction.deferred) {
                return await interaction.reply(options);
            } else {
                return await interaction.editReply(options);
            }
        }
    } catch (error) {
        console.error(`Error ${isEdit ? 'editing' : 'sending'} reply:`, error);
        return null;
    }
}

// Safely handle interactions to prevent unknown interaction errors
async function safeInteractionHandler(interaction, handler) {
    try {
        await handler(interaction);
    } catch (error) {
        console.error(`Error handling ${interaction.type} interaction:`, error);
        if (!interaction.replied && !interaction.deferred) {
            try {
                await interaction.reply({ 
                    content: 'An error occurred while processing your request.',
                    flags: MessageFlags.Ephemeral
                });
            } catch (replyError) {
                console.error('Failed to send error reply:', replyError);
            }
        }
    }
}

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

// Memory optimization - ensure tickets are loaded when needed
let ticketsLoaded = false;

function ensureTicketsLoaded() {
    if (!ticketsLoaded) {
        const loadedTickets = loadActiveTickets();
        activeTickets.clear();
        loadedTickets.forEach((value, key) => {
            activeTickets.set(key, value);
        });
        ticketsLoaded = true;
        console.log(`Loaded ${activeTickets.size} tickets on demand`);
    }
}

// Rebuild tickets from Discord channels if file was lost/corrupted
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

function setupTicketSystem(client) {
    Object.values(panelModules).forEach(panel => {
        buttonToPanel[panel.buttonId] = panel;
    });
    
    // Check Firebase connection immediately
    if (firebase && firebase.collections && firebase.collections.tickets) {
        console.log('✅ Firebase connected - closed tickets will sync to dashboard');
        console.log('📝 Open tickets stay local until closed');
    } else {
        console.warn('⚠️ Firebase not configured - tickets will only save locally');
    }

    client.once('clientReady', async () => {
        console.log(`Bot is ready. Current date (UTC): ${formatDateUTC(new Date())}`);
        
        // Check if we need to rebuild tickets (file was corrupted/empty)
        if (activeTickets.size === 0) {
            console.log('⚠️ No tickets loaded - checking Discord for existing ticket channels...');
            await rebuildTicketsFromDiscord(client);
        }
        
        // Clean up invalid entries
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
        
        if (removedCount > 0) {
            await saveActiveTickets(activeTickets);
        }
        
        console.log(`✅ Loaded ${activeTickets.size} active tickets (removed ${removedCount} invalid entries)`);
    });

    // Main interaction handler with improved error handling
    client.on(Events.InteractionCreate, (interaction) => {
        safeInteractionHandler(interaction, async (interaction) => {
            // --- PANEL SETUP COMMANDS ---
            if (interaction.isCommand() || interaction.isChatInputCommand()) {
                const commandName = interaction.commandName;
                
                // Only defer for setup commands that need it
                // Regular commands handle their own deferral
                const setupCommands = ['setup-jointeam', 'setup-bookus', 'setup-support', 'setup-partnership', 'setup-founders', 'setup-hr', 'register-ticket', 'debug-tickets'];
                if (setupCommands.includes(commandName) && !interaction.replied && !interaction.deferred) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});
                }

                if (commandName === 'setup-jointeam') {
                    if (!panelModules.joinTeam) {
                        return await safeReply(interaction, { content: 'Join Team panel module not found!' }, true);
                    }
                    await panelModules.joinTeam.sendPanel(interaction.channel);
                    return await safeReply(interaction, { content: 'Join Team panel has been set up!' }, true);
                } else if (commandName === 'setup-bookus') {
                    if (!panelModules.bookUs) {
                        return await safeReply(interaction, { content: 'Book Us panel module not found!' }, true);
                    }
                    await panelModules.bookUs.sendPanel(interaction.channel);
                    return await safeReply(interaction, { content: 'Book Us panel has been set up!' }, true);
                } else if (commandName === 'setup-support') {
                    if (!panelModules.support) {
                        return await safeReply(interaction, { content: 'Support panel module not found!' }, true);
                    }
                    await panelModules.support.sendPanel(interaction.channel);
                    return await safeReply(interaction, { content: 'Support panel has been set up!' }, true);
                } else if (commandName === 'setup-partnership') {
                    if (!panelModules.partnership) {
                        return await safeReply(interaction, { content: 'Partnership panel module not found!' }, true);
                    }
                    await panelModules.partnership.sendPanel(interaction.channel);
                    return await safeReply(interaction, { content: 'Partnership panel has been set up!' }, true);
                } else if (commandName === 'setup-founders') {
                    if (!panelModules.founders) {
                        return await safeReply(interaction, { content: 'Founders panel module not found!' }, true);
                    }
                    await panelModules.founders.sendPanel(interaction.channel);
                    return await safeReply(interaction, { content: 'Founders panel has been set up!' }, true);
                } else if (commandName === 'setup-hr') {
                    if (!panelModules.hr) {
                        return await safeReply(interaction, { content: 'HR panel module not found!' }, true);
                    }
                    await panelModules.hr.sendPanel(interaction.channel);
                    return await safeReply(interaction, { content: 'HR panel has been set up!' }, true);
                } else if (commandName === 'register-ticket') {
                    await registerExistingTicket(interaction);
                    return;
                } else if (commandName === 'debug-tickets') {
                    await debugTickets(interaction);
                    return;
                }

                // Handle regular dynamically loaded commands
                const command = interaction.client.commands.get(commandName);
                if (!command) {
                    return await safeReply(interaction, { content: 'Command not found!' }, true);
                }

                console.log(`[COMMAND] ${commandName} executed by ${interaction.user.tag} (${interaction.user.id})`);
                await command.execute(interaction);
                return;
            }

            // --- BUTTON INTERACTIONS ---
            if (interaction.isButton()) {
                const { customId } = interaction;

                // Handle panel button clicks FIRST (before any other checks)
                // These need immediate modal response without any acknowledgment
                if (buttonToPanel[customId]) {
                    await interaction.showModal(buttonToPanel[customId].createModal());
                    return;
                }

                // Handle ticket management buttons
                if (
                    customId === 'ticket_close' ||
                    customId === 'ticket_reopen' ||
                    customId === 'ticket_transcript'
                ) {
                    ensureTicketsLoaded(); // Ensure tickets are loaded
                    
                    if (!activeTickets.has(interaction.channel.id)) {
                        await safeReply(interaction, {
                            content: 'This channel is not set up as a ticket. If this is an error, please contact an administrator.',
                            flags: MessageFlags.Ephemeral
                        });
                        return;
                    }
                    // --- STAFF CHECK for sensitive actions ---
                    if (
                        customId === 'ticket_close' ||
                        customId === 'ticket_delete' ||
                        customId === 'ticket_reopen' ||
                        customId === 'ticket_transcript'
                    ) {
                        // Only staff or admins may proceed
                        const ticketData = activeTickets.get(interaction.channel.id);
                        const staffRoleIds = getTicketRoles(ticketData.type);
                        const isStaff = interaction.member.permissions.has(PermissionFlagsBits.Administrator) ||
                            staffRoleIds.some(roleId => interaction.member.roles.cache.has(roleId));
                        if (!isStaff) {
                            await safeReply(interaction, {
                                content: "Only staff members can use ticket management buttons.",
                                flags: MessageFlags.Ephemeral
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

                // Handle ticket close confirmation
                if (customId === 'ticket_close_confirm') {
                    await closeTicketConfirmed(interaction);
                    return;
                }
                if (customId === 'ticket_close_cancel') {
                    await closeTicketCancelled(interaction);
                    return;
                }

                // Handle ticket creation buttons
                if (customId.startsWith('ticket_create_')) {
                    const ticketType = customId.split('_')[2];
                    await createTicket(interaction, ticketType);
                    return;
                }

                // --- ACCEPT/DECLINE EVENT BUTTONS ---
                if (customId === 'event_accept' || customId === 'event_decline') {
                    ensureTicketsLoaded(); // Ensure tickets are loaded
                    
                    // Get ticket creator from activeTickets
                    let ticketCreatorId = null;
                    const ticketData = activeTickets.get(interaction.channel.id);
                    if (ticketData && ticketData.userId) {
                        ticketCreatorId = ticketData.userId;
                    }

                    // Fallback to button clicker if not found (shouldn't happen)
                    if (!ticketCreatorId) ticketCreatorId = interaction.user.id;

                    if (customId === 'event_accept') {
                        const acceptedEmbed = new EmbedBuilder()
                            .setTitle('Real Ops Request Accepted')
                            .setDescription(`Hello <@${ticketCreatorId}>,\n\nThank you for requesting our services at your event. Your request has been **accepted** and forwarded to our planning department.\n\nWe will contact you again before finalizing documents. Please be patient.`)
                            .setImage('https://i.postimg.cc/J0v07zL4/Accepted-event.png')
                            .setColor('#00b894')
                            .setFooter({ text: `The RealOps Group`, iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' })
                            .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png');

                        try {
                            await interaction.update({
                                embeds: interaction.message.embeds,
                                components: [],
                            });

                            await interaction.followUp({
                                content: `✅ <@${ticketCreatorId}>`,
                                embeds: [acceptedEmbed],
                                ephemeral: false
                            });
                        } catch (error) {
                            console.error('Error handling event accept:', error);
                            // Try to send a new message if update fails
                            await interaction.channel.send({
                                content: `✅ <@${ticketCreatorId}>`,
                                embeds: [acceptedEmbed]
                            }).catch(console.error);
                        }
                        return;
                    }

                    if (customId === 'event_decline') {
                        try {
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

                            await safeReply(interaction, {
                                content: 'Please select the reason for declining this event booking:',
                                components: [actionRow],
                                flags: MessageFlags.Ephemeral
                            });
                        } catch (error) {
                            console.error('Error showing decline reasons:', error);
                        }
                        return;
                    }
                }
            }

            // --- REASON SELECTED FROM DROPDOWN ---
            if (interaction.isStringSelectMenu() && interaction.customId === 'decline_reason_select') {
                ensureTicketsLoaded(); // Ensure tickets are loaded
                
                // Get ticket creator from activeTickets
                let ticketCreatorId = null;
                const ticketData = activeTickets.get(interaction.channel.id);
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
                        reasonText = "We have a partner's event scheduled on this date.";
                        break;
                    case 'short_notice':
                        reasonText = 'The event is scheduled less than 4 weeks from the date of this ticket.';
                        break;
                    default:
                        reasonText = 'No specific reason provided.';
                }

                try {
                    const declinedEmbed = new EmbedBuilder()
                        .setTitle('Real Ops Request Declined')
                        .setDescription(`Hello <@${ticketCreatorId}>,\n\nThank you for requesting our services. Unfortunately, we have **declined** your request for the following reason:\n\n• ${reasonText}\n\nWe encourage you to consider us again in the future.`)
                        .setImage('https://i.imgur.com/K51VLvn.png')
                        .setColor('#e74c3c')
                        .setFooter({ text: `The RealOps Group`, iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' })
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
                        flags: MessageFlags.Ephemeral
                    });
                } catch (error) {
                    console.error('Error processing decline reason:', error);
                    try {
                        // Try to send just the message if updating the interaction fails
                        await interaction.message.channel.send({
                            content: `❌ <@${ticketCreatorId}>, your event booking has been **declined** due to: ${reasonText}`
                        });
                    } catch (err) {
                        console.error('Failed to send decline fallback message:', err);
                    }
                }
                return;
            }

            // --- MODAL SUBMISSIONS ---
            if (interaction.isModalSubmit()) {
                const { customId } = interaction;
                
                // CRITICAL: Defer IMMEDIATELY before any processing to prevent timeout
                // Discord requires response within 3 seconds
                const panelModule = Object.values(panelModules).find(panel => panel.modalId === customId);
                if (panelModule) {
                    try {
                        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
                    } catch (deferError) {
                        console.error('Failed to defer reply:', deferError);
                        return; // Can't proceed without deferring
                    }

                    try {
                        const submittedData = panelModule.processSubmittedData(interaction);

                        // Lead-time enforcement for Book Us using TruckerMP event date (no manual date entry)
                        if (panelModule.ticketType === 'bookUs') {
                            try {
                                if (typeof panelModule.getEventTimeInfo !== 'function') {
                                    throw new Error('bookuspanel.getEventTimeInfo is not available. Please update panels/bookuspanel.js as instructed.');
                                }
                                const info = await panelModule.getEventTimeInfo(submittedData.eventLink);
                                if (!info || (!info.startTs && !info.meetupTs)) {
                                    await safeReply(interaction, { 
                                        content: 'We could not read your event date from the TruckerMP page. Please check the event link and try again.',
                                        flags: MessageFlags.Ephemeral
                                    }, true);
                                    return;
                                }

                                // Choose start time first, fallback to meetup time
                                const eventTs = info.startTs ?? info.meetupTs;
                                const nowTs = Math.floor(Date.now() / 1000);
                                const daysUntilEvent = Math.ceil((eventTs - nowTs) / 86400);

                                if (daysUntilEvent <= 35) {
                                    await safeReply(interaction, { 
                                        content: '❌ Sorry, your request is denied because your event date is past the deadline set by TMP Event Management.',
                                        flags: MessageFlags.Ephemeral
                                    }, true);
                                    return; // do not create ticket
                                }

                                // Attach fetched dates to formData so they can be shown later
                                submittedData.eventStartAt = info.start_at || null;
                                submittedData.eventMeetupAt = info.meetup_at || null;
                                submittedData.eventStartTs = info.startTs || null;
                                submittedData.eventMeetupTs = info.meetupTs || null;
                                submittedData.daysUntilEvent = daysUntilEvent;
                                submittedData.eventId = info.eventId || submittedData.eventId || null;
                            } catch (leadErr) {
                                console.error('Lead-time check failed:', leadErr);
                                await safeReply(interaction, { 
                                    content: 'We could not validate your event date at this time. Please try again later or verify the event link.',
                                    flags: MessageFlags.Ephemeral
                                }, true);
                                return;
                            }
                        }

                        // Proceed with normal ticket creation
                        await createTicketWithFormData(interaction, panelModule.ticketType, submittedData, panelModule);
                    } catch (error) {
                        console.error('Error handling modal submission:', error);
                        await safeReply(interaction, { 
                            content: 'An error occurred while processing your submission. Please try again later.'
                        }, true);
                    }
                }
            }
        });
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
        return safeReply(interaction, {
            content: 'You need administrator permissions to register tickets.',
            flags: MessageFlags.Ephemeral
        });
    }
    
    try {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    } catch (error) {
        console.error('Error deferring reply for register-ticket:', error);
        return;
    }
    
    try {
        ensureTicketsLoaded(); // Ensure tickets are loaded
        
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const targetUser = interaction.options.getUser('user');
        const ticketType = interaction.options.getString('type');
        
        // Validate ticket type
        if (!['support', 'joinTeam', 'bookUs', 'partnership', 'founders', 'hr'].includes(ticketType)) {
            return safeReply(interaction, {
                content: 'Invalid ticket type. Valid types: support, joinTeam, bookUs, partnership, founders, hr',
                flags: MessageFlags.Ephemeral
            }, true);
        }
        
        // Check if channel is already registered
        if (activeTickets.has(channel.id)) {
            return safeReply(interaction, {
                content: `This channel is already registered as a ${formatTicketType(activeTickets.get(channel.id).type)} ticket.`,
                flags: MessageFlags.Ephemeral
            }, true);
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
        await saveActiveTickets(activeTickets);
        
        // Add ticket controls
        const ticketControls = createTicketControlsRow(true);
        
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
        
        await safeReply(interaction, {
            content: `Successfully registered ${channel} as a ${formatTicketType(ticketType)} ticket for ${targetUser}.`,
            flags: MessageFlags.Ephemeral
        }, true);
    } catch (error) {
        console.error('Error registering ticket:', error);
        await safeReply(interaction, {
            content: 'An error occurred while registering the ticket: ' + error.message,
            flags: MessageFlags.Ephemeral
        }, true);
    }
}

/**
 * Debug ticket system - for admins only
 * Usage: /debug-tickets
 */
async function debugTickets(interaction) {
    // Check if user has admin permissions
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return safeReply(interaction, {
            content: 'You need administrator permissions to debug tickets.',
            flags: MessageFlags.Ephemeral
        });
    }
    
    try {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    } catch (error) {
        console.error('Error deferring reply for debug-tickets:', error);
        return;
    }
    
    try {
        ensureTicketsLoaded(); // Ensure tickets are loaded
        
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
        
        await safeReply(interaction, {
            content: debugInfo.join('\n'),
            flags: MessageFlags.Ephemeral
        }, true);
    } catch (error) {
        console.error('Error debugging tickets:', error);
        await safeReply(interaction, {
            content: 'An error occurred while debugging tickets: ' + error.message,
            flags: MessageFlags.Ephemeral
        }, true);
    }
}

// Create a ticket with form data
async function createTicketWithFormData(interaction, ticketType, formData, panelModule) {
    ensureTicketsLoaded(); // Ensure tickets are loaded
    
    const { guild, user } = interaction;
    
    // Get ticket limits from config (with fallbacks if not defined)
    const maxTotal = config.ticketOptions?.maxTicketsPerUser ?? 999999;
    const maxPerType = config.ticketOptions?.maxTicketsPerUserPerType ?? 999999;
    
    // Get user's open tickets
    const userTickets = Array.from(activeTickets.values())
        .filter(ticket => ticket.userId === user.id && !ticket.closed);
    
    // Get user's open tickets of the current type
    const userTicketsOfType = userTickets
        .filter(ticket => ticket.type === ticketType);
    
    // Check total ticket limit
    if (userTickets.length >= maxTotal) {
        return safeReply(interaction, { 
            content: `You have reached the maximum limit of ${maxTotal} open tickets. Please close some of your existing tickets before creating more.`,
            flags: MessageFlags.Ephemeral 
        }, true);
    }
    
    // Check per-type ticket limit
    if (userTicketsOfType.length >= maxPerType) {
        return safeReply(interaction, { 
            content: `You can only have ${maxPerType} open ${formatTicketType(ticketType)} tickets at once. Please close some of your existing ${formatTicketType(ticketType)} tickets before creating more.`,
            flags: MessageFlags.Ephemeral 
        }, true);
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
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.AddReactions,
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
        let ticketName = sanitizeChannelName(`${ticketType}-${user.username}`);
        if (userTicketsOfType.length > 0) {
            ticketName = sanitizeChannelName(`${ticketType}-${user.username}-${userTicketsOfType.length + 1}`);
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
        const ticketData = {
            channelId: ticketChannel.id,
            userId: user.id,
            username: user.tag,
            type: ticketType,
            createdAt: new Date(),
            formData: formData,
            transcript: []
        };
        
        activeTickets.set(ticketChannel.id, ticketData);
        
        // Save active tickets to file (local only, not synced to Firebase until closed)
        await saveActiveTickets(activeTickets);
        
        console.log(`📝 Ticket created locally: ${ticketChannel.id} (will sync to Firebase when closed)`);
        
        // Create ticket management buttons
        const ticketControls = createTicketControlsRow(true);
        
        // Create welcome embed
        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`${formatTicketType(ticketType)} Ticket`)
            .setDescription(`Thank you for your submission, ${user}!\nOur team will assist you shortly.`)
            .setColor(getTicketColor(ticketType))
            .setFooter({ 
                text: `The RealOps Group`, 
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
            content: `<@${user.id}>`,
            embeds: [welcomeEmbed, responseEmbed]
        });
        
        // Then send controls only for staff/admins
        if (validRoleMentions) {
            await ticketChannel.send({
                content: `Staff controls: ${validRoleMentions}`,  // Staff mentions only here
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
                    try {
                        // Try to send event details from TruckerMP API
                        await panelModule.sendEventDetails(ticketChannel, formData, user);
                    } catch (innerError) {
                        console.error('Error in delayed event details sending:', innerError);
                        ticketChannel.send('There was an error fetching event details. Please provide the event details manually.').catch(console.error);
                    }
                }, 1500);
            } catch (eventError) {
                console.error('Error queuing event details send:', eventError);
            }
        }
        
        // Log ticket creation
        logTicketAction(guild, user, ticketType, 'created', ticketChannel.id, formData);
        
        // Reply to the user
        await safeReply(interaction, { 
            content: `Your ${formatTicketType(ticketType)} ticket has been created: <#${ticketChannel.id}>`,
            flags: MessageFlags.Ephemeral 
        }, true);
    } catch (error) {
        console.error('Error creating ticket:', error);
        await safeReply(interaction, {
            content: 'An error occurred while creating your ticket. Please contact an administrator.',
            flags: MessageFlags.Ephemeral
        }, true);
    }
}

// Create a standard ticket (legacy support)
async function createTicket(interaction, ticketType) {
    try {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    } catch (error) {
        console.error('Error deferring reply for createTicket:', error);
        return;
    }
    
    ensureTicketsLoaded(); // Ensure tickets are loaded
    
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
        return safeReply(interaction, { 
            content: `You have reached the maximum limit of ${maxTotal} open tickets. Please close some of your existing tickets before creating more.`,
            flags: MessageFlags.Ephemeral 
        }, true);
    }
    
    // Check per-type ticket limit
    if (userTicketsOfType.length >= maxPerType) {
        return safeReply(interaction, { 
            content: `You can only have ${maxPerType} open ${formatTicketType(ticketType)} tickets at once. Please close some of your existing ${formatTicketType(ticketType)} tickets before creating more.`,
            flags: MessageFlags.Ephemeral 
        }, true);
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
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.AddReactions
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
        let ticketName = sanitizeChannelName(`${ticketType}-${user.username}`);
        if (userTicketsOfType.length > 0) {
            ticketName = sanitizeChannelName(`${ticketType}-${user.username}-${userTicketsOfType.length + 1}`);
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
        await saveActiveTickets(activeTickets);
        
        // Create ticket management buttons
        const ticketControls = createTicketControlsRow(true);
        
        // Create welcome embed
        const welcomeEmbed = new EmbedBuilder()
            .setTitle(`${formatTicketType(ticketType)} Ticket`)
            .setDescription(`Hello ${user}, thank you for creating a ${formatTicketType(ticketType)} ticket!\nOur staff will assist you shortly.`)
            .addFields(
                { name: 'User', value: `<@${user.id}>`, inline: true },
                { name: 'Type', value: formatTicketType(ticketType), inline: true },
                { name: 'Created', value: `<t:${getUnixTimestamp()}:F>`, inline: true }
            )
            .setColor(getTicketColor(ticketType))
            .setFooter({ 
                text: `The RealOps Group`, 
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
            content: `<@${user.id}>`,
            embeds: [welcomeEmbed],
            components: [ticketControls]
        });
        
        // Add separate staff notification message
        if (validRoleMentions) {
            await ticketChannel.send({
                content: `Staff: ${validRoleMentions}`
            });
        }
        
        // Log ticket creation
        logTicketAction(guild, user, ticketType, 'created', ticketChannel.id);
        
        // Reply to the user
        await safeReply(interaction, { 
            content: `Your ticket has been created: <#${ticketChannel.id}>`,
            flags: MessageFlags.Ephemeral 
        }, true);
    } catch (error) {
        console.error('Error creating ticket:', error);
        await safeReply(interaction, {
            content: 'An error occurred while creating your ticket. Please contact an administrator.',
            flags: MessageFlags.Ephemeral
        }, true);
    }
}

// Close a ticket
async function closeTicket(interaction) {
    ensureTicketsLoaded(); // Ensure tickets are loaded
    
    try {
        const { channel, user } = interaction;
        
        // We already validated this is a ticket channel in the main handler
        if (!activeTickets.has(channel.id)) {
            return await safeReply(interaction, {
                content: 'This channel is not set up as a ticket. If this is an error, please contact an administrator.',
                flags: MessageFlags.Ephemeral
            });
        }
        
        // Instead of closing immediately, send a confirmation message
        const confirmationEmbed = new EmbedBuilder()
            .setTitle('Confirm Ticket Closure')
            .setDescription(`${user}, are you sure you want to close this ticket?`)
            .setColor('#f39c12')
            .setFooter({ 
                text: `The RealOps Group`,
                iconURL: user.displayAvatarURL()
            })
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
        
        await safeReply(interaction, {
            embeds: [confirmationEmbed],
            components: [confirmationRow]
        });
    } catch (error) {
        console.error('Error initiating ticket closure:', error);
        try {
            await safeReply(interaction, {
                content: 'An error occurred while processing your request.',
                flags: MessageFlags.Ephemeral
            });
        } catch (replyError) {
            console.error('Error sending error message:', replyError);
        }
    }
}

// Confirmed ticket closing (actual closing process)
async function closeTicketConfirmed(interaction) {
    ensureTicketsLoaded(); // Ensure tickets are loaded
    
    try {
        const { channel, user } = interaction;
        
        try {
            await interaction.deferUpdate(); // Update the original message
        } catch (error) {
            console.error('Error deferring update for closeTicketConfirmed:', error);
            // Continue even if this fails
        }
        
        // Send closing message
        const closedEmbed = new EmbedBuilder()
            .setTitle('Ticket Closed')
            .setDescription(`This ticket was closed by <@${user.id}>\n\n⏳ Generating transcript and deleting channel in 5 seconds...`)
            .setColor('#f39c12')
            .setFooter({ 
                text: `The RealOps Group`,
                iconURL: user.displayAvatarURL()
            })
            .setTimestamp();
        
        await channel.send({ embeds: [closedEmbed] });
        
        // Log ticket closing
        const ticketData = activeTickets.get(channel.id);
        logTicketAction(interaction.guild, user, ticketData.type, 'closed', channel.id);
        
        // Generate HTML transcript before closing
        try {
            const transcript = await generateTranscript(channel, {
                limit: -1, // All messages
                returnType: 'buffer',
                filename: `ticket-${channel.id}-${Date.now()}.html`,
                saveImages: true,
                poweredBy: false
            });
            
            // Convert buffer to base64 for storage in Firebase
            const transcriptBase64 = transcript.toString('base64');
            ticketData.transcriptHtml = transcriptBase64;
            ticketData.transcriptGenerated = new Date().toISOString();
            
            console.log(`✅ Generated HTML transcript for ${channel.id} (${(transcriptBase64.length / 1024).toFixed(2)} KB)`);
        } catch (transcriptError) {
            console.error('Error generating HTML transcript on close:', transcriptError);
            // Fallback to simple text transcript
            try {
                const messages = await channel.messages.fetch({ limit: 100 });
                const transcriptMessages = messages
                    .filter(m => !m.author.bot || m.content)
                    .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
                    .map(m => ({
                        author: m.author.tag,
                        authorId: m.author.id,
                        message: m.content || '[Embed/Attachment]',
                        timestamp: m.createdAt.toISOString()
                    }));
                
                ticketData.transcript = transcriptMessages;
            } catch (fallbackError) {
                console.error('Error with fallback transcript:', fallbackError);
            }
        }
        
        // Update ticket data but don't remove from active tickets
        const updatedTicketData = {
            ...ticketData,
            closed: true,
            closedAt: new Date(),
            closedBy: user.id
        };
        activeTickets.set(channel.id, updatedTicketData);
        await saveActiveTickets(activeTickets);
        
        // NOW sync to Firebase (only when closed)
        console.log(`🔄 Syncing closed ticket to Firebase: ${channel.id}`);
        await syncSingleTicketToFirebase(channel.id, updatedTicketData);
        
        // Save transcript to transcript channel if configured
        const transcriptChannel = interaction.guild.channels.cache.get(config.transcriptChannel);
        if (transcriptChannel && ticketData.transcriptHtml) {
            try {
                const transcriptBuffer = Buffer.from(ticketData.transcriptHtml, 'base64');
                const attachment = new AttachmentBuilder(transcriptBuffer, { 
                    name: `ticket-${channel.id}-${Date.now()}.html` 
                });
                
                const logEmbed = new EmbedBuilder()
                    .setTitle('Ticket Closed - Transcript Saved')
                    .addFields(
                        { name: 'Ticket', value: channel.name, inline: true },
                        { name: 'User', value: `<@${ticketData.userId}>`, inline: true },
                        { name: 'Type', value: formatTicketType(ticketData.type), inline: true },
                        { name: 'Closed By', value: `<@${user.id}>`, inline: true },
                        { name: 'Closed At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                    )
                    .setColor('#f39c12')
                    .setFooter({ text: 'The RealOps Group' })
                    .setTimestamp();
                
                await transcriptChannel.send({
                    embeds: [logEmbed],
                    files: [attachment]
                });
                console.log(`📋 Transcript sent to transcript channel: ${transcriptChannel.name}`);
            } catch (transcriptError) {
                console.error('Error sending transcript to channel:', transcriptError);
            }
        }
        
        // Edit the original confirmation message
        try {
            await interaction.editReply({
                content: '✅ Ticket closed, transcript saved to dashboard. Deleting channel...',
                embeds: [],
                components: []
            });
        } catch (error) {
            console.error('Error updating confirmation message:', error);
        }
        
        // Remove from active tickets
        activeTickets.delete(channel.id);
        await saveActiveTickets(activeTickets);
        
        // Delete channel after 5 seconds
        setTimeout(async () => {
            try {
                const channelExists = await interaction.guild.channels.fetch(channel.id).catch(() => null);
                if (channelExists) {
                    await channel.delete('Ticket closed and archived');
                    console.log(`🗑️ Deleted ticket channel: ${channel.id}`);
                }
            } catch (deleteError) {
                console.error('Error deleting channel:', deleteError);
            }
        }, 5000);
        
    } catch (error) {
        console.error('Error closing ticket:', error);
        try {
            await channel.send({
                content: 'An error occurred while closing the ticket: ' + error.message
            });
        } catch (err) {
            console.error('Failed to send error message to channel:', err);
        }
    }
}

// Cancel ticket closing
async function closeTicketCancelled(interaction) {
    try {
        await interaction.update({
            content: 'Ticket closure cancelled.',
            embeds: [],
            components: []
        });
    } catch (error) {
        console.error('Error cancelling ticket closure:', error);
    }
}

// Reopen a ticket
async function reopenTicket(interaction) {
    ensureTicketsLoaded(); // Ensure tickets are loaded
    
    try {
        const { channel, user } = interaction;
        
        // We already validated this is a ticket channel in the main handler
        if (!activeTickets.has(channel.id)) {
            return await safeReply(interaction, {
                content: 'This channel is not set up as a ticket. If this is an error, please contact an administrator.',
                flags: MessageFlags.Ephemeral
            });
        }
        
        try {
            await interaction.deferReply(); // Non-ephemeral for actual action
        } catch (error) {
            console.error('Error deferring reply for reopenTicket:', error);
            // Continue even if this fails
        }
        
        // Update channel permissions
        await channel.permissionOverwrites.edit(activeTickets.get(channel.id).userId, {
            SendMessages: true
        });
        
        // Create standard ticket controls
        const ticketControls = createTicketControlsRow(true);
        
        const reopenedEmbed = new EmbedBuilder()
            .setTitle('Ticket Reopened')
            .setDescription(`This ticket was reopened by <@${user.id}>`)
            .setColor('#2ecc71')
            .setFooter({ 
                text: `The RealOps Group`,
                iconURL: user.displayAvatarURL()
            })
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
        await saveActiveTickets(activeTickets);
        
        // Delete from Firebase when reopened (no longer closed)
        console.log(`🗑️ Removing reopened ticket from Firebase: ${channel.id}`);
        await deleteTicketFromFirebase(channel.id);
        
        // Edit the deferred reply
        try {
            await safeReply(interaction, {
                content: `Ticket has been reopened.`
            }, true);
        } catch (error) {
            console.error('Error editing reopened reply:', error);
        }
    } catch (error) {
        console.error('Error reopening ticket:', error);
        try {
            await channel.send({
                content: 'An error occurred while reopening the ticket: ' + error.message
            });
        } catch (err) {
            console.error('Failed to send error message to channel:', err);
        }
    }
}

// Delete a ticket
async function deleteTicket(interaction) {
    ensureTicketsLoaded(); // Ensure tickets are loaded
    
    try {
        const { channel, user } = interaction;
        
        // We already validated this is a ticket channel in the main handler
        if (!activeTickets.has(channel.id)) {
            return await safeReply(interaction, {
                content: 'This channel is not set up as a ticket. If this is an error, please contact an administrator.',
                flags: MessageFlags.Ephemeral
            });
        }
        
        try {
            await interaction.deferReply(); // Non-ephemeral for actual action
        } catch (error) {
            console.error('Error deferring reply for deleteTicket:', error);
            // Continue even if this fails
        }
        
        // Generate a transcript before deleting
        const ticketData = activeTickets.get(channel.id);
        
        try {
            // Try to create a transcript before deleting
            await createTranscriptForDeletion(channel, user, ticketData);
            await safeReply(interaction, { content: `Transcript saved. Ticket will be deleted in 5 seconds...` }, true);
        } catch (transcriptError) {
            console.error('Failed to create transcript before deletion:', transcriptError);
            await safeReply(interaction, { content: `Failed to save transcript. Ticket will be deleted in 5 seconds...` }, true);
        }
        
        // Log ticket deletion
        logTicketAction(interaction.guild, user, ticketData.type, 'deleted', channel.id);
        
        // Remove from active tickets (local only)
        activeTickets.delete(channel.id);
        await saveActiveTickets(activeTickets);
        
        // Do NOT delete from Firebase - keep closed tickets as permanent log in dashboard
        console.log(`📋 Keeping closed ticket in Firebase dashboard: ${channel.id}`);
        
        // Delete after delay
        setTimeout(async () => {
            try {
                // Verify channel still exists before attempting to delete
                const channelExists = await interaction.guild.channels.fetch(channel.id).catch(() => null);
                if (channelExists) {
                    await channel.delete();
                }
            } catch (err) {
                console.error('Error deleting channel:', err);
            }
        }, 5000);
    } catch (error) {
        console.error('Error deleting ticket:', error);
        try {
            await channel.send({
                content: 'An error occurred while deleting the ticket: ' + error.message
            });
        } catch (err) {
            console.error('Failed to send error message to channel:', err);
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
        footerText: `Transcript saved before deletion by ${user.tag} | 2025-07-09 10:32:02`,
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
                { name: 'Deleted At', value: `<t:${getUnixTimestamp()}:F>`, inline: true }
            )
            .setColor('#e74c3c')
            .setFooter({ 
                text: `The RealOps Group`,
                iconURL: user.displayAvatarURL()
            })
            .setTimestamp();
        
        await transcriptChannel.send({
            embeds: [logEmbed],
            files: [transcript]
        });
    }
}

// Create transcript
async function createTranscript(interaction) {
    ensureTicketsLoaded(); // Ensure tickets are loaded
    
    try {
        const { channel, user } = interaction;
        
        // We already validated this is a ticket channel in the main handler
        if (!activeTickets.has(channel.id)) {
            return await safeReply(interaction, {
                content: 'This channel is not set up as a ticket. If this is an error, please contact an administrator.',
                flags: MessageFlags.Ephemeral
            });
        }
        
        try {
            await interaction.deferReply();
        } catch (error) {
            console.error('Error deferring reply for createTranscript:', error);
            // Continue even if this fails
        }
        
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
            footerText: `Transcript saved by ${user.tag} | 2025-07-09 10:32:02`,
            headerText: `Ticket Transcript - ${formatTicketType(ticketData.type)}`
        });
        
        // Send the transcript as an attachment in the channel
        await channel.send({
            content: `Transcript saved by ${user}`,
            files: [transcript]
        });
        
        // Collect message transcript for Firebase
        try {
            const messages = await channel.messages.fetch({ limit: 100 });
            const transcriptMessages = messages
                .filter(m => !m.author.bot || m.content) // Include bot messages with content
                .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
                .map(m => ({
                    author: m.author.tag,
                    message: m.content || '[Embed/Attachment]',
                    timestamp: m.createdAt.toISOString()
                }));
            
            // Update ticket with transcript
            ticketData.transcript = transcriptMessages;
            activeTickets.set(channel.id, ticketData);
            await saveActiveTickets(activeTickets);
            await syncSingleTicketToFirebase(channel.id, ticketData);
        } catch (transcriptError) {
            console.error('Error collecting transcript messages:', transcriptError);
        }
        
        // Log transcript creation
        logTicketAction(interaction.guild, user, ticketData.type, 'transcript', channel.id);
        
        // Reply to the interaction
        await safeReply(interaction, {
            content: 'Transcript has been created and saved!',
        }, true);
        
        // Send transcript to dedicated transcript channel if configured
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
                .setColor('#3498db')
                .setFooter({ 
                    text: `The RealOps Group`,
                    iconURL: user.displayAvatarURL()
                })
                .setTimestamp();
            
            await transcriptChannel.send({
                embeds: [logEmbed],
                files: [transcript]
            });
        }
    } catch (error) {
        console.error('Error creating transcript:', error);
        try {
            await channel.send({
                content: 'An error occurred while creating the transcript: ' + error.message
            });
        } catch (err) {
            console.error('Failed to send error message to channel:', err);
        }
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

// Get roles that should see a specific ticket type
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
// Log ticket actions to a designated channel
function logTicketAction(guild, user, ticketType, action, ticketId, formData = null) {
    const logChannel = guild.channels.cache.get(config.logChannel);
    if (!logChannel) return;
    
    // Use current time
    const currentTime = '2025-07-09 10:36:02'; // Current UTC time
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
    
    // If we have form data and it's a creation action, add a summary
    if (formData && action === 'created') {
        // Add a summary based on the ticket type
        let summary = '';
        switch(ticketType) {
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
    setupTicketSystem,
    createTicket,
    closeTicket,
    reopenTicket,
    deleteTicket,
    createTranscript,
    registerExistingTicket,
    debugTickets,
    activeTickets, // Export activeTickets for other modules to use
    formatDateUTC,  // Exporting utility functions for use elsewhere
    formatTicketType
};
