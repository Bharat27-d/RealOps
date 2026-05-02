const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');
const { getOverride } = require('../commandConfig');

// Static default description for dashboard editing (placeholder for dynamic event data)
const DEFAULT_DESCRIPTION = 'This event is starting in 30 minutes!';

// Helper to format ISO date as Discord timestamp
function toDiscordTimestamp(iso, style = 'F') {
    if (!iso) return 'N/A';
    const unix = Math.floor(new Date(iso).getTime() / 1000);
    return `<t:${unix}:${style}>`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('event-reminder')
        .setDescription('Send a 30-minute event reminder to a specific channel')
        .addStringOption(opt =>
            opt.setName('event_link')
                .setDescription('TruckerMP event link')
                .setRequired(true)
        )
        .addChannelOption(opt =>
            opt.setName('send_to')
                .setDescription('Channel to send the reminder to')
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName('message')
                .setDescription('Custom message to include in the reminder')
                .setRequired(false)
        )
        .addChannelOption(opt =>
            opt.setName('mention_channel')
                .setDescription('Channel to mention in the message (e.g., voice channel to join)')
                .setRequired(false)
        )
        .addRoleOption(opt =>
            opt.setName('tag_role')
                .setDescription('Role to tag in the reminder')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        const eventLink = interaction.options.getString('event_link');
        const sendToChannel = interaction.options.getChannel('send_to');
        const customMessage = interaction.options.getString('message');
        const mentionChannel = interaction.options.getChannel('mention_channel');
        const role = interaction.options.getRole('tag_role');

        // Validate channel is a text channel
        if (!sendToChannel.isTextBased()) {
            return interaction.editReply('❌ Please select a text channel!');
        }

        // Extract event ID from link
        const match = eventLink.match(/events\/(\d+)/);
        if (!match) {
            return interaction.editReply('❌ Please provide a valid TruckerMP event link!');
        }
        const eventId = match[1];

        // Fetch event data from TruckerMP API
        let eventData;
        try {
            const { data } = await axios.get(`https://api.truckersmp.com/v2/events/${eventId}`);
            eventData = data.response;
        } catch {
            return interaction.editReply('❌ Could not fetch event data. Make sure the link is correct!');
        }

        if (!eventData) return interaction.editReply('❌ Event not found!');

        // Build description with custom message and channel mention
        let description = `**This event is starting in 30 minutes!**\n\n`;
        
        if (customMessage) {
            // Replace {channel} placeholder with the mentioned channel if provided
            let messageText = customMessage;
            if (mentionChannel) {
                messageText = messageText.replace('{channel}', `<#${mentionChannel.id}>`);
            }
            description += messageText;
        } else {
            description += eventData.description || 'Get ready for the event!';
            if (mentionChannel) {
                description += `\n\n**Join us in <#${mentionChannel.id}>!**`;
            }
        }

        // Build the reminder embed
        const embed = new EmbedBuilder()
            .setTitle(getOverride('eventreminder', 'title', `🔔 Event Reminder: ${eventData.name}`))
            .setDescription(getOverride('eventreminder', 'description', description))
            .setURL(`https://truckersmp.com/events/${eventId}`)
            .setColor(getOverride('eventreminder', 'color', 0xFFD700)) // Golden color
            .setTimestamp()
            .setFooter({
                text: getOverride('eventreminder', 'footerText', 'The Real Ops Group'),
                iconURL: getOverride('eventreminder', 'footerIcon', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
            });

        // Add event details
        if (eventData.server?.name) {
            embed.addFields({ name: '🖥️ Server', value: eventData.server.name, inline: true });
        }
        if (eventData.game) {
            embed.addFields({ name: '🎮 Game', value: eventData.game, inline: true });
        }
        if (eventData.departure?.city) {
            embed.addFields({ name: '📍 Departure', value: eventData.departure.city, inline: true });
        }
        if (eventData.arrive?.city) {
            embed.addFields({ name: '🏁 Arrival', value: eventData.arrive.city, inline: true });
        }
        if (eventData.start_at) {
            embed.addFields({ 
                name: '⏰ Event Time', 
                value: `${toDiscordTimestamp(eventData.start_at, 'F')} (${toDiscordTimestamp(eventData.start_at, 'R')})`, 
                inline: false 
            });
        }

        // Add event link
        embed.addFields({ 
            name: '🔗 Event Link', 
            value: `[View on TruckerMP](https://truckersmp.com/events/${eventId})`,
            inline: false
        });

        // Add event banner if available
        if (eventData.banner) {
            embed.setImage(eventData.banner);
        } else if (eventData.map) {
            embed.setImage(eventData.map);
        }

        // Build role mention
        const mentionContent = role ? `<@&${role.id}>` : null;

        // Send the reminder to the specified channel
        try {
            await sendToChannel.send({
                content: mentionContent,
                embeds: [embed]
            });

            await interaction.editReply(`✅ Event reminder sent to ${sendToChannel}!`);
        } catch (error) {
            console.error('Error sending reminder:', error);
            await interaction.editReply(`❌ Failed to send reminder to ${sendToChannel}. Make sure I have permission to send messages there!`);
        }
    }
};
