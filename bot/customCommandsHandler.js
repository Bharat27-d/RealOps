const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { collections } = require('./firebase');

let unsubscribe = null;
let registerDebounceTimer = null;

/**
 * Mounts a Firebase real-time listener to automatically load and execute newly created Custom Commands
 * from the Dashboard. Does not require bot restart.
 */
function setupCustomCommandsListener(client, triggerRegisterCallback) {
    if (!collections || !collections.customCommands) {
        console.error('❌ Firebase collections.customCommands is not defined!');
        return;
    }

    if (unsubscribe) {
        unsubscribe();
    }

    console.log('[Custom Commands] Setting up real-time listener...');

    unsubscribe = collections.customCommands.onSnapshot((snapshot) => {
        const commands = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.enabled !== false) {
                commands.push({ id: doc.id, ...data });
            }
        });

        // 1. Clean up old custom commands from client.commands
        for (const [name, cmd] of client.commands.entries()) {
            if (cmd.isCustomCommand) {
                client.commands.delete(name);
            }
        }

        // 2. Load the new custom commands into client.commands
        for (const cmdData of commands) {
            // Safety check: Discord slash command names must be lowercase, alphanumeric/dash/underscore, 1-32 chars
            const cleanName = (cmdData.name || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').substring(0, 32);
            const cleanDescription = (cmdData.description || 'Custom command').substring(0, 100);

            if (!cleanName) continue;

            const commandObj = {
                isCustomCommand: true,
                data: new SlashCommandBuilder()
                    .setName(cleanName)
                    .setDescription(cleanDescription),
                
                async execute(interaction) {
                    try {
                        const embed = new EmbedBuilder()
                            .setColor('#00b894');
                            
                        let hasContent = false;
                        if (cmdData.title && cmdData.title.trim() !== '') { embed.setTitle(cmdData.title); hasContent = true; }
                        if (cmdData.text && cmdData.text.trim() !== '') { embed.setDescription(cmdData.text); hasContent = true; }
                        if (cmdData.image && cmdData.image.trim() !== '') { embed.setImage(cmdData.image); hasContent = true; }
                        if (cmdData.thumbnail && cmdData.thumbnail.trim() !== '') { embed.setThumbnail(cmdData.thumbnail); hasContent = true; }

                        if (!hasContent) {
                            embed.setDescription('*No content provided for this command.*');
                        }
                        
                        // Defer ephemerally so no public "User used /command" message appears
                        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

                        // Send the embed as a regular channel message (no user attribution)
                        await interaction.channel.send({ embeds: [embed] });

                        // Delete the ephemeral acknowledgment so nothing remains
                        await interaction.deleteReply();
                    } catch (error) {
                        // Silently ignore "already acknowledged" and "unknown interaction" errors
                        if (error.code === 40060 || error.code === 10062) return;

                        console.error(`Error executing custom command ${cmdData.name}:`, error);
                        try {
                            if (!interaction.replied && !interaction.deferred) {
                                await interaction.reply({ content: 'An error occurred while executing this command.', flags: MessageFlags.Ephemeral });
                            } else {
                                await interaction.followUp({ content: 'An error occurred while executing this command.', flags: MessageFlags.Ephemeral });
                            }
                        } catch (_) {
                            // Nothing more we can do
                        }
                    }
                }
            };
            
            client.commands.set(cleanName, commandObj);
        }
        
        console.log(`[Custom Commands] Actively loaded ${commands.length} dynamic commands.`);
        
        // 3. Debounced Discord slash command registration — prevents rapid-fire API calls
        //    when multiple Firebase docs change in quick succession
        if (triggerRegisterCallback && typeof triggerRegisterCallback === 'function') {
            if (registerDebounceTimer) clearTimeout(registerDebounceTimer);
            registerDebounceTimer = setTimeout(() => {
                triggerRegisterCallback();
            }, 2000); // Wait 2 seconds of inactivity before re-registering with Discord
        }
    }, (error) => {
        console.error('[Custom Commands] Real-time listener error:', error);
    });
}

module.exports = { setupCustomCommandsListener };
