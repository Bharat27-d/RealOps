const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');
const { getOverride } = require('../commandConfig');

// Static default description for dashboard editing (placeholder for dynamic event data)
const DEFAULT_DESCRIPTION = 'Staff availability check for the event. Please respond with your availability by reacting with the emojis below.';

// Helper function to format as Discord timestamp
function toDiscordTimestamp(iso, style = 'F') {
    if (!iso) return 'N/A';
    const unix = Math.floor(new Date(iso).getTime() / 1000);
    return `<t:${unix}:${style}>`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staff-availability')
        .setDescription('Check staff availability for a TruckerMP event')
        .addStringOption(opt =>
            opt.setName('event_link')
                .setDescription('TruckerMP event link')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        const eventLink = interaction.options.getString('event_link');
        const match = eventLink.match(/events\/(\d+)/);
        if (!match) {
            return interaction.editReply('❌ Please provide a valid TruckerMP event link!');
        }
        const eventId = match[1];

        let eventData;
        try {
            const { data } = await axios.get(`https://api.truckersmp.com/v2/events/${eventId}`);
            eventData = data.response;
        } catch {
            return interaction.editReply('❌ Could not fetch event data. Make sure the link is correct!');
        }

        if (!eventData) return interaction.editReply('❌ Event not found!');

        const embed = new EmbedBuilder()
            .setTitle(getOverride('staff-availability', 'title', `📅 ${eventData.name}`))
            .setDescription(getOverride('staff-availability', 'description', DEFAULT_DESCRIPTION))
            .setURL(`https://truckersmp.com/events/${eventId}`)
            .setColor(getOverride('staff-availability', 'color', '#3498db'))
            .addFields(
                { name: 'Server', value: eventData.server?.name ?? 'N/A', inline: true },
                { name: 'Game', value: eventData.game ?? 'N/A', inline: true }
            );

        if (eventData.departure?.city) embed.addFields({ name: 'Departure', value: eventData.departure.city, inline: true });
        if (eventData.arrive?.city) embed.addFields({ name: 'Arrival', value: eventData.arrive.city, inline: true });
        if (eventData.meetup_at) embed.addFields({ name: 'Meetup Time', value: toDiscordTimestamp(eventData.meetup_at, 'F'), inline: false });
        if (eventData.start_at) embed.addFields({ name: 'Start Time', value: toDiscordTimestamp(eventData.start_at, 'F'), inline: false });

        embed.addFields({ name: 'Event Link', value: `[View on TruckerMP](https://truckersmp.com/events/${eventId})` });

        if (eventData.map) embed.setImage(eventData.map);

        // 🔁 Two role IDs — replace with actual IDs
        const roleId1 = '1291122795190812774';
        const roleId2 = '1350155100462514237';

        // 📨 Send embed with two role mentions
        const sentMessage = await interaction.channel.send({
            content: `<@&${roleId1}> <@&${roleId2}>`,
            embeds: [embed]
        });

        // ✅ Add reactions
        try {
            await sentMessage.react('✅');
            await sentMessage.react('❌');
            await sentMessage.react('⏳');
            await sentMessage.react('🚓');
        } catch (err) {
            console.error('❌ Failed to add reactions:', err);
        }

        await interaction.editReply('✅ Staff availability embed posted with role mentions and reactions.');
    }
};
