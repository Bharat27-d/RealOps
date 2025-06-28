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

        const addedRoles = newMember.roles.cache.filter(
            role => !oldMember.roles.cache.has(role.id) && STAFF_ROLE_IDS.includes(role.id)
        );
        const removedRoles = oldMember.roles.cache.filter(
            role => !newMember.roles.cache.has(role.id) && STAFF_ROLE_IDS.includes(role.id)
        );

        if (addedRoles.size === 0 && removedRoles.size === 0) return;

        const now = new Date();
        const dateStr = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        if (addedRoles.size > 0) {
            for (const [roleId, role] of addedRoles) {
                const roleName = ROLE_DISPLAY_NAMES[roleId] || role.name;
                const embed = new EmbedBuilder()
                    .setColor('#00ff99')
                    .setTitle('Staff Team Update')
                    .setDescription(`✅ <@${newMember.id}> **joined** the **${roleName}** team! Congratulations and good luck with your training ❤️`)
                    .setFooter({ text: `The Real Ops Group • ${dateStr}`, iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' })
                    .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
                    .setImage('https://imgur.com/VGlcbY3.png');
                await channel.send({ embeds: [embed] });
            }
        }

        if (removedRoles.size > 0) {
            for (const [roleId, role] of removedRoles) {
                const roleName = ROLE_DISPLAY_NAMES[roleId] || role.name;
                const embed = new EmbedBuilder()
                    .setColor('#ED4245')
                    .setTitle('Staff Team Update')
                    .setDescription(`❌ <@${newMember.id}> **left** the **${roleName}** team.\nThank you for your contributions! 💙`)
                    .setFooter({ text: `The Real Ops Group • ${dateStr}`, iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' })
                    .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
                    .setImage('https://imgur.com/VGlcbY3.png');
                await channel.send({ embeds: [embed] });
            }
        }
    }
};