const {
    SlashCommandBuilder,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    SectionBuilder,
    SeparatorBuilder,
    ThumbnailBuilder
} = require('discord.js');
const { collections } = require('./firebase') || {};
const { parseEmbedPlaceholders } = require('./placeholderParser');

let unsubscribe = null;
let registerDebounceTimer = null;

/**
 * Build a Components V2 Container from a dynamic command data object.
 * Matches the panel visual style: Container > Section(title+thumbnail) > Separator > Text > MediaGallery > Footer
 */
function buildContainer(data) {
    const accentColor = data.color && data.color.trim()
        ? parseInt(data.color.trim().replace('#', ''), 16)
        : 0x00b894;

    const container = new ContainerBuilder().setAccentColor(accentColor);

    // ── Header Section: Title + Thumbnail ──
    const hasTitle = data.title && data.title.trim();
    const hasThumbnail = data.thumbnail && data.thumbnail.trim();
    const hasAuthor = data.authorName && data.authorName.trim();

    if (hasTitle || hasAuthor) {
        let headerText = '';
        if (hasAuthor) {
            const authorLine = data.authorUrl && data.authorUrl.trim()
                ? `[${data.authorName.trim()}](${data.authorUrl.trim()})`
                : data.authorName.trim();
            headerText += authorLine + '\n';
        }
        if (hasTitle) {
            const titleLine = data.url && data.url.trim()
                ? `## [${data.title.trim()}](${data.url.trim()})`
                : `## ${data.title.trim()}`;
            headerText += titleLine;
        }

        // SectionBuilder REQUIRES an accessory — only use it when there's a thumbnail
        if (hasThumbnail) {
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(headerText.trim())
                    )
                    .setThumbnailAccessory(
                        new ThumbnailBuilder({ media: { url: data.thumbnail.trim() } })
                    )
            );
        } else {
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(headerText.trim())
            );
        }

        container.addSeparatorComponents(new SeparatorBuilder().setDivider(true));
    }

    // ── Description / Body Text ──
    if (data.text && data.text.trim()) {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(data.text.trim())
        );
    }

    // ── Fields ──
    if (Array.isArray(data.fields) && data.fields.length > 0) {
        const validFields = data.fields.filter(f => f.name?.trim() && f.value?.trim());
        if (validFields.length > 0) {
            container.addSeparatorComponents(new SeparatorBuilder().setDivider(true));
            let fieldText = '';
            for (const field of validFields) {
                fieldText += `**${field.name.trim()}**\n${field.value.trim()}\n\n`;
            }
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(fieldText.trim())
            );
        }
    }

    // ── Main Image (Media Gallery) ──
    if (data.image && data.image.trim()) {
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder({ media: { url: data.image.trim() } })
            )
        );
    }

    // ── Footer ──
    const hasFooter = data.footerText && data.footerText.trim();
    const hasTimestamp = data.timestamp && data.timestamp.trim();

    if (hasFooter || hasTimestamp) {
        container.addSeparatorComponents(new SeparatorBuilder().setDivider(true));

        let footerText = '';
        if (hasFooter) footerText += data.footerText.trim();
        if (hasFooter && hasTimestamp) footerText += ' • ';
        if (hasTimestamp) {
            const ts = data.timestamp.trim();
            if (ts === 'auto' || ts === 'now') {
                footerText += `<t:${Math.floor(Date.now() / 1000)}:F>`;
            } else {
                const parsed = new Date(ts);
                if (!isNaN(parsed.getTime())) {
                    footerText += `<t:${Math.floor(parsed.getTime() / 1000)}:F>`;
                }
            }
        }

        if (footerText) {
            if (data.footerIcon && data.footerIcon.trim()) {
                container.addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(`-# ${footerText}`)
                        )
                        .setThumbnailAccessory(
                            new ThumbnailBuilder({ media: { url: data.footerIcon.trim() } })
                        )
                );
            } else {
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`-# ${footerText}`)
                );
            }
        }
    }

    // Fallback if completely empty
    if (!hasTitle && !hasAuthor && (!data.text || !data.text.trim()) && (!data.image || !data.image.trim())) {
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent('*No content provided for this command.*')
        );
    }

    return container;
}

let reconnectTimer = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 30000;
let _client = null;
let _triggerRegisterCallback = null;

/**
 * Mounts a Firebase real-time listener to automatically load and execute newly created Custom Commands
 * from the Dashboard. Does not require bot restart. Auto-reconnects on failure.
 */
function setupCustomCommandsListener(client, triggerRegisterCallback) {
    if (!collections || !collections.customCommands) {
        console.error('❌ Firebase collections.customCommands is not defined!');
        return;
    }

    // Store references for reconnection
    _client = client;
    _triggerRegisterCallback = triggerRegisterCallback;

    startCustomCommandsListener();
}

function startCustomCommandsListener() {
    if (!_client) return;

    if (unsubscribe) {
        try { unsubscribe(); } catch (_) {}
        unsubscribe = null;
    }

    console.log('[Custom Commands] Setting up real-time listener...');

    try {
        unsubscribe = collections.customCommands.onSnapshot((snapshot) => {
            reconnectAttempts = 0; // Reset backoff on success

            const commands = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.enabled !== false) {
                    commands.push({ id: doc.id, ...data });
                }
            });

            // 1. Clean up old custom commands from client.commands
            for (const [name, cmd] of _client.commands.entries()) {
                if (cmd.isCustomCommand) {
                    _client.commands.delete(name);
                }
            }

            // 2. Load the new custom commands into client.commands
            for (const cmdData of commands) {
                // Safety check: Discord slash command names must be lowercase, alphanumeric/dash/underscore, 1-32 chars
                const cleanName = (cmdData.name || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').substring(0, 32);
                const cleanDescription = (cmdData.description || 'Custom command').substring(0, 100);

                if (!cleanName) continue;

                const builder = new SlashCommandBuilder()
                    .setName(cleanName)
                    .setDescription(cleanDescription);

                // Dynamically register command options from dashboard config
                if (Array.isArray(cmdData.options)) {
                    for (const opt of cmdData.options) {
                        const optName = (opt.name || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').substring(0, 32);
                        const optDesc = (opt.description || 'No description').substring(0, 100);
                        if (!optName) continue;

                        switch (opt.type) {
                            case 'user':
                                builder.addUserOption(o => o.setName(optName).setDescription(optDesc).setRequired(!!opt.required));
                                break;
                            case 'role':
                                builder.addRoleOption(o => o.setName(optName).setDescription(optDesc).setRequired(!!opt.required));
                                break;
                            case 'channel':
                                builder.addChannelOption(o => o.setName(optName).setDescription(optDesc).setRequired(!!opt.required));
                                break;
                            case 'number':
                                builder.addNumberOption(o => o.setName(optName).setDescription(optDesc).setRequired(!!opt.required));
                                break;
                            case 'boolean':
                                builder.addBooleanOption(o => o.setName(optName).setDescription(optDesc).setRequired(!!opt.required));
                                break;
                            default: // string
                                builder.addStringOption(o => o.setName(optName).setDescription(optDesc).setRequired(!!opt.required));
                                break;
                        }
                    }
                }

                const commandObj = {
                    isCustomCommand: true,
                    data: builder,
                    
                    async execute(interaction) {
                        try {
                            // Resolve all ${...} placeholders using interaction options
                            const resolvedData = parseEmbedPlaceholders(cmdData, interaction);
                            const container = buildContainer(resolvedData);
                            
                            // Defer ephemerally so no public "User used /command" message appears
                            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

                            // Send the container as a regular channel message (no user attribution)
                            if (resolvedData.content && resolvedData.content.trim()) {
                                await interaction.channel.send({ content: resolvedData.content.trim() });
                            }
                            
                            await interaction.channel.send({
                                components: [container],
                                flags: MessageFlags.IsComponentsV2
                            });

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
                
                _client.commands.set(cleanName, commandObj);
            }
            
            console.log(`[Custom Commands] ✅ Loaded ${commands.length} dynamic commands.`);
            
            // 3. Debounced Discord slash command registration — prevents rapid-fire API calls
            //    when multiple Firebase docs change in quick succession
            if (_triggerRegisterCallback && typeof _triggerRegisterCallback === 'function') {
                if (registerDebounceTimer) clearTimeout(registerDebounceTimer);
                registerDebounceTimer = setTimeout(() => {
                    _triggerRegisterCallback();
                }, 2000); // Wait 2 seconds of inactivity before re-registering with Discord
            }
        }, (error) => {
            console.error('[Custom Commands] Listener error:', error.message);
            scheduleCustomCommandsReconnect();
        });
    } catch (error) {
        console.error('[Custom Commands] Failed to start listener:', error.message);
        scheduleCustomCommandsReconnect();
    }
}

function scheduleCustomCommandsReconnect() {
    if (reconnectTimer) clearTimeout(reconnectTimer);

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);
    reconnectAttempts++;

    console.log(`[Custom Commands] Reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts})...`);
    reconnectTimer = setTimeout(() => {
        startCustomCommandsListener();
    }, delay);
}

module.exports = { setupCustomCommandsListener, buildContainer };
