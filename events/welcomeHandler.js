const { Events, EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const channel = member.guild.channels.cache.get(config.WELCOME_CHANNEL_ID);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setAuthor({ name: 'The Real Ops Group', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' })
            .setTitle(`Welcome to ${member.guild.name}!`)
            .setDescription(`
We're excited to have you join our community!  
Please check out the rules and introduce yourself.

If you have any questions, feel free to ask our staff!

Enjoy your stay! 🚀
            `)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setImage('https://i.imgur.com/e5L7I2b.png')
            .setColor('#FDBA2C')
            .setFooter({ text: 'The Real Ops Group', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' });

        // Mention the user outside the embed
        channel.send({
            content: `<@${member.id}>`,
            embeds: [embed]
        });
    }
};