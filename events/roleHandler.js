const { Events, EmbedBuilder } = require('discord.js');
const config = require('../config');

const ROLE_DISPLAY_NAMES = {
    [config.ROLES.JNR_PLANNER]: "Jnr Planner",
    [config.ROLES.DEVELOPER]: "Developer",
    [config.ROLES.PM]: "Project Manager",
    [config.ROLES.PMM]: "Partnership Manager",
    [config.ROLES.EM]: "Event Manager",
    [config.ROLES.MM]: "Media Manager",
    [config.ROLES.HRD]: "Human Resource Department",
    [config.ROLES.DM]: "Discord Moderator",
    [config.ROLES.SSM]: "Social Media Manager",
    [config.ROLES.SS]: "Support Staff",
    [config.ROLES.ES]: "Event Supervisor",
    [config.ROLES.PL]: "Planner Team",
    [config.ROLES.M]: "Media Team",
    [config.ROLES.STAFF]: "Realops Staff"
};

const STAFF_ROLE_IDS = Object.values(config.ROLES);

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        if (newMember.user?.bot) return;

        const channel = newMember.guild.channels.cache.get(config.STAFF_CHANGES_CHANNEL_ID);
        if (!channel) {
            console.error('Staff changes channel not found! Check STAFF_CHANGES_CHANNEL_ID in config.js.');
            return;
        }

        // Roles that are in STAFF_ROLE_IDS and were added/removed
        const addedRoles = newMember.roles.cache.filter(
            role => !oldMember.roles.cache.has(role.id) && STAFF_ROLE_IDS.includes(role.id)
        );
        const removedRoles = oldMember.roles.cache.filter(
            role => !newMember.roles.cache.has(role.id) && STAFF_ROLE_IDS.includes(role.id)
        );

        if (addedRoles.size === 0 && removedRoles.size === 0) return;

        const now = new Date();
        const dateStr = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        // Build friendly names for changed roles
        const addedNames = addedRoles.map(role => ROLE_DISPLAY_NAMES[role.id] || role.name);
        const removedNames = removedRoles.map(role => ROLE_DISPLAY_NAMES[role.id] || role.name);

        // Aggregate into a single embed (prevents multiple embeds for simultaneous role changes)
        const descriptionParts = [];
        if (addedNames.length) {
            descriptionParts.push(`✅ <@${newMember.id}> **joined** the following team${addedNames.length > 1 ? 's' : ''}:\n${addedNames.map(n => `• **${n}**`).join('\n')}\n\nCongratulations and good luck with your training ❤️`);
        }
        if (removedNames.length) {
            descriptionParts.push(`❌ <@${newMember.id}> **left** the following team${removedNames.length > 1 ? 's' : ''}:\n${removedNames.map(n => `• **${n}**`).join('\n')}\n\nThank you for your contributions! 💙`);
        }

        // Color: green if only additions, red if only removals, gold if both
        const color = (addedNames.length && removedNames.length) ? '#FFD700' : (addedNames.length ? '#00ff99' : '#ED4245');

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('Staff Team Update')
            .setDescription(descriptionParts.join('\n\n'))
            .setFooter({ text: `The Real Ops Group • ${dateStr}`, iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' })
            .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
            // Use the direct image URL if you want reliable embed rendering; this was kept from original code
            .setImage('https://imgur.com/VGlcbY3.png');

        await channel.send({ embeds: [embed] });
    }
};