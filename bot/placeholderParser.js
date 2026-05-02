/**
 * Global Placeholder Parser
 * 
 * Resolves ${variable} placeholders in any string using interaction data.
 * Works universally — no per-command logic required.
 * 
 * Supported syntax:
 *   ${optionName}            → direct value (string/number/boolean)
 *   ${optionName.property}   → resolved object property (user.id, role.name, etc.)
 *   ${interaction.user.id}   → command invoker info
 *   ${interaction.guild.name}→ server info
 *   <@${user.id}>            → user mention
 *   <@&${role.id}>           → role mention
 *   <#${channel.id}>         → channel mention
 * 
 * Discord option type mapping (ApplicationCommandOptionType):
 *   3=STRING, 4=INTEGER, 5=BOOLEAN, 6=USER, 7=CHANNEL, 8=ROLE,
 *   9=MENTIONABLE, 10=NUMBER, 11=ATTACHMENT
 */

// Discord.js ApplicationCommandOptionType values
const TYPE_STRING = 3;
const TYPE_INTEGER = 4;
const TYPE_BOOLEAN = 5;
const TYPE_USER = 6;
const TYPE_CHANNEL = 7;
const TYPE_ROLE = 8;
const TYPE_MENTIONABLE = 9;
const TYPE_NUMBER = 10;
const TYPE_ATTACHMENT = 11;

/**
 * Build a flat options map from interaction.options.data
 * Each option name maps to a resolved value or object with properties.
 */
function buildOptionsMap(interaction) {
    const map = {};

    // Context variables — always available
    const user = interaction.user || interaction.member?.user;
    if (user) {
        map['interaction.user'] = {
            id: user.id,
            username: user.username,
            tag: user.tag || `${user.username}#${user.discriminator || '0'}`,
            displayName: user.displayName || user.username,
            avatar: user.displayAvatarURL?.({ dynamic: true }) || '',
            mention: `<@${user.id}>`
        };
    }
    if (interaction.guild) {
        map['interaction.guild'] = {
            id: interaction.guild.id,
            name: interaction.guild.name,
            icon: interaction.guild.iconURL?.({ dynamic: true }) || '',
            memberCount: String(interaction.guild.memberCount || 0),
            mention: interaction.guild.name
        };
    }
    if (interaction.channel) {
        map['interaction.channel'] = {
            id: interaction.channel.id,
            name: interaction.channel.name || '',
            mention: `<#${interaction.channel.id}>`
        };
    }

    // Shorthand aliases — always available, point to interaction context.
    // These get overridden below if a command option shares the same name.
    if (map['interaction.user'])    map['user']    = map['interaction.user'];
    if (map['interaction.guild'])   map['guild']   = map['interaction.guild'];
    if (map['interaction.guild'])   map['server']  = map['interaction.guild'];
    if (map['interaction.channel']) map['channel'] = map['interaction.channel'];

    // Parse all command options dynamically
    const options = interaction.options?.data;
    if (!Array.isArray(options)) return map;

    for (const opt of options) {
        // Handle subcommands — flatten their options
        if (opt.type === 1 || opt.type === 2) {
            // Subcommand / SubcommandGroup
            map['subcommand'] = opt.name;
            if (Array.isArray(opt.options)) {
                for (const sub of opt.options) {
                    resolveOption(sub, map);
                }
            }
            continue;
        }
        resolveOption(opt, map);
    }

    return map;
}

/**
 * Resolve a single option into the map based on its type.
 */
function resolveOption(opt, map) {
    const name = opt.name;

    switch (opt.type) {
        case TYPE_USER: {
            const u = opt.user || opt.member?.user;
            if (u) {
                map[name] = {
                    id: u.id,
                    username: u.username,
                    tag: u.tag || `${u.username}#${u.discriminator || '0'}`,
                    displayName: u.displayName || u.username,
                    avatar: u.user?.displayAvatarURL?.({ dynamic: true }) || '',
                    mention: `<@${u.id}>`
                };
            } else {
                map[name] = String(opt.value || '');
            }
            break;
        }
        case TYPE_ROLE: {
            const r = opt.role;
            if (r) {
                map[name] = {
                    id: r.id,
                    name: r.name,
                    color: r.hexColor || '',
                    mention: `<@&${r.id}>`
                };
            } else {
                map[name] = String(opt.value || '');
            }
            break;
        }
        case TYPE_CHANNEL: {
            const c = opt.channel;
            if (c) {
                map[name] = {
                    id: c.id,
                    name: c.name || '',
                    mention: `<#${c.id}>`
                };
            } else {
                map[name] = String(opt.value || '');
            }
            break;
        }
        case TYPE_MENTIONABLE: {
            // Could be user or role
            const u = opt.user;
            const r = opt.role;
            if (u) {
                map[name] = { id: u.id, username: u.username, mention: `<@${u.id}>` };
            } else if (r) {
                map[name] = { id: r.id, name: r.name, mention: `<@&${r.id}>` };
            } else {
                map[name] = String(opt.value || '');
            }
            break;
        }
        case TYPE_ATTACHMENT: {
            const a = opt.attachment;
            if (a) {
                map[name] = {
                    url: a.url || '',
                    name: a.name || '',
                    size: String(a.size || 0)
                };
            } else {
                map[name] = String(opt.value || '');
            }
            break;
        }
        // STRING, INTEGER, NUMBER, BOOLEAN
        default: {
            map[name] = String(opt.value ?? '');
            break;
        }
    }
}

/**
 * Replace all ${...} placeholders in a string using the options map.
 * Unknown variables are left as-is.
 */
function parsePlaceholders(content, interaction) {
    if (!content || typeof content !== 'string') return content || '';

    const map = interaction.__optionsMap || buildOptionsMap(interaction);
    // Cache on interaction to avoid rebuilding for every field
    if (!interaction.__optionsMap) interaction.__optionsMap = map;

    return content.replace(/\$\{([^}]+)\}/g, (match, key) => {
        const trimmed = key.trim();

        // Direct key match (e.g. ${reason}, ${amount})
        if (map[trimmed] !== undefined) {
            const val = map[trimmed];
            return typeof val === 'object' ? (val.mention || val.name || val.username || val.id || match) : val;
        }

        // Dotted property access (e.g. ${user.id}, ${interaction.user.username})
        const dotIdx = trimmed.indexOf('.');
        if (dotIdx !== -1) {
            const base = trimmed.substring(0, dotIdx);
            const prop = trimmed.substring(dotIdx + 1);

            // Try full dotted base first: "interaction.user" + "id"
            // Check for compound bases like "interaction.user.id"
            for (const [mapKey, mapVal] of Object.entries(map)) {
                if (trimmed.startsWith(mapKey + '.') && typeof mapVal === 'object') {
                    const subProp = trimmed.substring(mapKey.length + 1);
                    if (mapVal[subProp] !== undefined) return String(mapVal[subProp]);
                }
            }

            // Simple base.prop
            const baseVal = map[base];
            if (baseVal !== undefined && typeof baseVal === 'object' && baseVal[prop] !== undefined) {
                return String(baseVal[prop]);
            }
        }

        // Unknown variable — return as-is
        return match;
    });
}

/**
 * Apply placeholder parsing to an entire embed data object.
 * Mutates and returns a new object with all string fields resolved.
 */
function parseEmbedPlaceholders(embedData, interaction) {
    if (!embedData) return embedData;

    const p = (s) => parsePlaceholders(s, interaction);
    const result = { ...embedData };

    // All top-level string fields
    if (result.title) result.title = p(result.title);
    if (result.text) result.text = p(result.text);
    if (result.description) result.description = p(result.description);
    if (result.url) result.url = p(result.url);
    if (result.image) result.image = p(result.image);
    if (result.thumbnail) result.thumbnail = p(result.thumbnail);
    if (result.color) result.color = p(result.color);

    // Author
    if (result.authorName) result.authorName = p(result.authorName);
    if (result.authorIcon) result.authorIcon = p(result.authorIcon);
    if (result.authorUrl) result.authorUrl = p(result.authorUrl);

    // Footer
    if (result.footerText) result.footerText = p(result.footerText);
    if (result.footerIcon) result.footerIcon = p(result.footerIcon);

    // Fields array
    if (Array.isArray(result.fields)) {
        result.fields = result.fields.map(f => ({
            ...f,
            name: p(f.name || ''),
            value: p(f.value || '')
        }));
    }

    return result;
}

module.exports = { parsePlaceholders, parseEmbedPlaceholders, buildOptionsMap };
