const { SlashCommandBuilder, ChannelType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');
const { getOverride } = require('../commandConfig');

// Static default description for dashboard editing
const DEFAULT_DESCRIPTION = 'Event details and information. Please check the event link for more details.';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eventforum')
        .setDescription('Create a forum post for a TruckerMP event')
        .addStringOption(opt =>
            opt.setName('event_link')
               .setDescription('TruckerMP event link')
               .setRequired(true)
        )
        // You can restrict to specific roles if you want
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        // 1. Get event link and extract event ID
        const eventLink = interaction.options.getString('event_link');
        const match = eventLink.match(/events\/(\d+)/);
        if (!match) {
            return interaction.editReply('❌ Please provide a valid TruckerMP event link!');
        }
        const eventId = match[1];

        // 2. Fetch event details
        let eventData;
        try {
            const { data } = await axios.get(`https://api.truckersmp.com/v2/events/${eventId}`);
            eventData = data.response;
        } catch {
            return interaction.editReply('❌ Could not fetch event data. Make sure the link is correct!');
        }
        if (!eventData) return interaction.editReply('❌ Event not found!');

        // Helper to convert ISO 8601 UTC string to Discord timestamp
        function toDiscordTimestamp(isoString) {
            if (!isoString) return 'N/A';
            const unix = Math.floor(new Date(isoString).getTime() / 1000);
            return `<t:${unix}:F>`; // F = full date/time, you can use other formats if you want
        }

        // 3. Prepare embed for event details (with map image, no banner)
        const embed = new EmbedBuilder()
            .setTitle(getOverride('eventforum', 'title', `📅 ${eventData.name}`))
            .setDescription(getOverride('eventforum', 'description', DEFAULT_DESCRIPTION))
            .setURL(`https://truckersmp.com/events/${eventId}`)
            .setColor(getOverride('eventforum', 'color', '#3498db'))
            .addFields(
                { name: 'Server', value: eventData.server?.name ?? 'N/A', inline: true },
                { name: 'Game', value: eventData.game ?? 'N/A', inline: true },
            );
        if (eventData.departure?.city) embed.addFields({ name: 'Departure', value: eventData.departure.city, inline: true });
        if (eventData.arrive?.city) embed.addFields({ name: 'Arrival', value: eventData.arrive.city, inline: true });
        if (eventData.meetup_at) embed.addFields({ name: 'Meetup Time', value: toDiscordTimestamp(eventData.meetup_at), inline: false });
        if (eventData.start_at) embed.addFields({ name: 'Start Time', value: toDiscordTimestamp(eventData.start_at), inline: false });
        embed.addFields({ name: 'Event Link', value: `[View on TruckerMP](https://truckersmp.com/events/${eventId})` });
        // Only add map image (not banner)
        if (eventData.map) embed.setImage(eventData.map);

        // 4. Create forum post (thread) in your forum channel
        const forumChannelId = '1291819418443317349'; // Replace with your forum channel ID
        const forumChannel = interaction.guild.channels.cache.get(forumChannelId);
        if (!forumChannel || forumChannel.type !== ChannelType.GuildForum)
            return interaction.editReply('❌ Forum channel not found or not a forum!');

        // Title suggestion: use event name
        const thread = await forumChannel.threads.create({
            name: eventData.name.slice(0, 90),
            message: { embeds: [embed] }
        });

        await interaction.editReply(`✅ Forum post created: ${thread.toString()}`);
    }
};
