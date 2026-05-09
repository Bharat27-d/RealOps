/**
 * ticketSystem/index.js — Entry point & interaction router.
 *
 * This replaces the monolithic ticketSystem.js (2,100+ lines).
 * All logic is delegated to focused sub-modules:
 *
 *   ticketStore.js        — Shared state (activeTickets Map), persistence, Firebase sync
 *   ticketCRUD.js         — Create / Close / Reopen / Delete ticket operations
 *   transcripts.js        — Transcript generation
 *   recovery.js           — Auto-recover tickets from Discord channel metadata
 *   eventAcceptDecline.js — Accept/Decline booking flow
 *   adminCommands.js      — /register-ticket, /debug-tickets
 *   ../utils/ticketUtils.js — Formatting, logging, button builders
 */

const { Events, MessageFlags, PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const firebase = require('../firebase');

// ── Sub-modules ──
const { activeTickets, saveActiveTickets, ensureTicketsLoaded, initFirestoreSync, removeTicketFromStore } = require('./ticketStore');
const { createTicketWithFormData, createTicket, closeTicket, closeTicketConfirmed, closeTicketCancelled, reopenTicket, deleteTicket } = require('./ticketCRUD');
const { createTranscript } = require('./transcripts');
const { rebuildTicketsFromDiscord, tryRecoverTicket } = require('./recovery');
const { handleEventAccept, handleEventDecline, handleDeclineReasonSelect } = require('./eventAcceptDecline');
const { registerExistingTicket, debugTickets } = require('./adminCommands');
const { getTicketRoles, formatDateUTC, formatTicketType } = require('../utils/ticketUtils');
const { safeReply, safeInteractionHandler, safeCommandExecute } = require('../utils/interactionWrapper');

// ── Panel modules ──
const panelModules = {
    joinTeam: require('../panels/jointeampanel'),
    support: require('../panels/supportpanel'),
    hr: require('../panels/hrpanel'),
    partnership: require('../panels/partnershippanel'),
    bookUs: require('../panels/bookuspanel'),
    founders: require('../panels/founderpanel')
};
const buttonToPanel = {};

// ────────────────────────────────────────────────────────────
//  setupTicketSystem — called once from bot/index.js
// ────────────────────────────────────────────────────────────

function setupTicketSystem(client) {
    // Map panel buttonIds for fast lookup
    Object.values(panelModules).forEach(panel => { buttonToPanel[panel.buttonId] = panel; });

    if (firebase && firebase.collections?.tickets) {
        console.log('✅ Firebase connected — closed tickets will sync to dashboard');
    } else {
        console.warn('⚠️ Firebase not configured — tickets will only save locally');
    }

    // ── On ready: sync from Firestore, validate, rebuild ──
    client.once('ready', async () => {
        console.log(`Bot is ready. Current date (UTC): ${formatDateUTC(new Date())}`);

        // Sync tickets from Firestore (migrates JSON → Firestore on first run)
        await initFirestoreSync();

        if (activeTickets.size === 0) {
            console.log('⚠️ No tickets loaded — checking Discord for existing ticket channels...');
            await rebuildTicketsFromDiscord(client);
        }

        // Clean up tickets for channels that no longer exist
        let removedCount = 0;
        for (const [channelId] of activeTickets.entries()) {
            if (!client.channels.cache.get(channelId)) {
                activeTickets.delete(channelId);
                await removeTicketFromStore(channelId).catch(() => {});
                removedCount++;
            }
        }
        if (removedCount > 0) await saveActiveTickets(activeTickets);
        console.log(`✅ Loaded ${activeTickets.size} active tickets (removed ${removedCount} invalid entries)`);
    });

    // ── Main interaction router ──
    client.on(Events.InteractionCreate, (interaction) => {
        safeInteractionHandler(interaction, async (interaction) => {

            // ─── SLASH COMMANDS ───
            if (interaction.isCommand() || interaction.isChatInputCommand()) {
                const cmd = interaction.commandName;
                const setupCmds = ['setup-jointeam', 'setup-bookus', 'setup-support', 'setup-partnership', 'setup-founders', 'setup-hr', 'register-ticket', 'debug-tickets'];
                if (setupCmds.includes(cmd) && !interaction.replied && !interaction.deferred) {
                    await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});
                }

                // Panel setup commands
                const panelMap = { 'setup-jointeam': 'joinTeam', 'setup-bookus': 'bookUs', 'setup-support': 'support', 'setup-partnership': 'partnership', 'setup-founders': 'founders', 'setup-hr': 'hr' };
                if (panelMap[cmd]) {
                    const panel = panelModules[panelMap[cmd]];
                    if (!panel) return await safeReply(interaction, { content: 'Panel module not found!' }, true);
                    await panel.sendPanel(interaction.channel);
                    return await safeReply(interaction, { content: `${panelMap[cmd]} panel has been set up!` }, true);
                }
                if (cmd === 'register-ticket') return await registerExistingTicket(interaction);
                if (cmd === 'debug-tickets') return await debugTickets(interaction);

                // Dynamic commands
                const command = interaction.client.commands.get(cmd);
                if (!command) return await safeReply(interaction, { content: 'Command not found!' }, true);
                console.log(`[COMMAND] ${cmd} executed by ${interaction.user.tag} (${interaction.user.id})`);
                return await safeCommandExecute(interaction, command);
            }

            // ─── BUTTON INTERACTIONS ───
            if (interaction.isButton()) {
                const { customId } = interaction;

                // Panel buttons → show modal (no deferral!)
                if (buttonToPanel[customId]) {
                    try {
                        await interaction.showModal(buttonToPanel[customId].createModal());
                    } catch (error) {
                        console.error(`Error showing modal for ${customId}:`, error);
                        if (!interaction.replied && !interaction.deferred) await interaction.reply({ content: '❌ Error opening form.', ephemeral: true }).catch(console.error);
                    }
                    return;
                }

                // Ticket management buttons
                if (['ticket_close', 'ticket_reopen', 'ticket_transcript'].includes(customId)) {
                    try { await interaction.deferReply({ flags: MessageFlags.Ephemeral }); } catch (e) { return; }
                    ensureTicketsLoaded();

                    // Auto-recovery
                    if (!activeTickets.has(interaction.channel.id)) {
                        const recovered = await tryRecoverTicket(interaction.channel);
                        if (!recovered) return await interaction.editReply({ content: 'This channel is not set up as a ticket. Use `/register-ticket` if needed.' });
                    }

                    // Staff check
                    const ticketData = activeTickets.get(interaction.channel.id);
                    const staffRoleIds = getTicketRoles(ticketData.type);
                    const isStaff = interaction.member.permissions.has(PermissionFlagsBits.Administrator) || staffRoleIds.some(r => interaction.member.roles.cache.has(r));
                    if (!isStaff) return await interaction.editReply({ content: 'Only staff members can use ticket management buttons.' });

                    if (customId === 'ticket_close') return await closeTicket(interaction);
                    if (customId === 'ticket_delete') return await deleteTicket(interaction);
                    if (customId === 'ticket_reopen') return await reopenTicket(interaction);
                    if (customId === 'ticket_transcript') return await createTranscript(interaction);
                }

                // Close confirm/cancel
                if (customId === 'ticket_close_confirm') {
                    ensureTicketsLoaded();
                    if (!activeTickets.has(interaction.channel.id)) await tryRecoverTicket(interaction.channel);
                    return await closeTicketConfirmed(interaction);
                }
                if (customId === 'ticket_close_cancel') return await closeTicketCancelled(interaction);

                // Legacy ticket create buttons
                if (customId.startsWith('ticket_create_')) return await createTicket(interaction, customId.split('_')[2]);

                // Event accept/decline
                if (customId === 'event_accept') return await handleEventAccept(interaction);
                if (customId === 'event_decline') return await handleEventDecline(interaction);
            }

            // ─── SELECT MENUS ───
            if (interaction.isStringSelectMenu() && interaction.customId === 'decline_reason_select') {
                return await handleDeclineReasonSelect(interaction);
            }

            // ─── MODAL SUBMISSIONS ───
            if (interaction.isModalSubmit()) {
                const panelModule = Object.values(panelModules).find(p => p.modalId === interaction.customId);
                if (panelModule) {
                    try { await interaction.deferReply({ flags: MessageFlags.Ephemeral }); } catch (e) { return; }
                    try {
                        const submittedData = panelModule.processSubmittedData(interaction);

                        // Lead-time enforcement for Book Us
                        if (panelModule.ticketType === 'bookUs') {
                            try {
                                if (typeof panelModule.getEventTimeInfo !== 'function') throw new Error('bookuspanel.getEventTimeInfo not available');
                                const info = await panelModule.getEventTimeInfo(submittedData.eventLink);
                                if (!info || (!info.startTs && !info.meetupTs)) {
                                    return await safeReply(interaction, { content: 'Could not read event date from the TruckerMP page.', flags: MessageFlags.Ephemeral }, true);
                                }
                                const eventTs = info.startTs ?? info.meetupTs;
                                const daysUntil = Math.ceil((eventTs - Math.floor(Date.now() / 1000)) / 86400);
                                if (daysUntil <= 35) {
                                    return await safeReply(interaction, { content: '❌ Sorry, your event date is past the deadline set by TMP Event Management.', flags: MessageFlags.Ephemeral }, true);
                                }
                                Object.assign(submittedData, { eventStartAt: info.start_at || null, eventMeetupAt: info.meetup_at || null, eventStartTs: info.startTs || null, eventMeetupTs: info.meetupTs || null, daysUntilEvent: daysUntil, eventId: info.eventId || submittedData.eventId || null });
                            } catch (e) {
                                console.error('Lead-time check failed:', e);
                                return await safeReply(interaction, { content: 'Could not validate your event date. Please try again later.', flags: MessageFlags.Ephemeral }, true);
                            }
                        }

                        await createTicketWithFormData(interaction, panelModule.ticketType, submittedData, panelModule);
                    } catch (error) {
                        console.error('Error handling modal submission:', error);
                        await safeReply(interaction, { content: 'An error occurred processing your submission.' }, true);
                    }
                }
            }
        });
    });

    console.log('Ticket system initialized');
}

// ────────────────────────────────────────────────────────────
//  Exports — backwards compatible with old ticketSystem.js
// ────────────────────────────────────────────────────────────

module.exports = {
    setupTicketSystem,
    createTicket,
    closeTicket,
    reopenTicket,
    deleteTicket,
    createTranscript,
    registerExistingTicket,
    debugTickets,
    activeTickets,
    formatDateUTC,
    formatTicketType
};
