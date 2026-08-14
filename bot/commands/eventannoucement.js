const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');
const { getOverride } = require('../commandConfig');

// Static default description for dashboard editing
const DEFAULT_DESCRIPTION = 'Staff resources and event information. Please check the event link for more details.';

// Helper to format ISO date as Discord timestamp
function toDiscordTimestamp(iso, style = 'F') {
    if (!iso) return 'N/A';
    const unix = Math.floor(new Date(iso).getTime() / 1000);
    return `<t:${unix}:${style}>`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('staff-resources')
        .setDescription('Post staff resources and event information')
        .addStringOption(opt =>
            opt.setName('event_link')
                .setDescription('TruckerMP event link')
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName('spreadsheet_link')
                .setDescription('Google Sheet or Attendance Spreadsheet link')
                .setRequired(false)
        )
        .addStringOption(opt =>
            opt.setName('profile_link')
                .setDescription('Custom profile/registration link')
                .setRequired(false)
        )
        .addStringOption(opt =>
            opt.setName('dlc')
                .setDescription('DLC requirement (e.g. None or Scandinavia)')
                .setRequired(false)
        )
        .addRoleOption(opt =>
            opt.setName('tag_role_1')
                .setDescription('First role to mention')
                .setRequired(false)
        )
        .addRoleOption(opt =>
            opt.setName('tag_role_2')
                .setDescription('Second role to mention')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageThreads),

    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        const eventLink = interaction.options.getString('event_link');
        const spreadsheetLink = interaction.options.getString('spreadsheet_link');
        const profileLink = interaction.options.getString('profile_link');
        const dlc = interaction.options.getString('dlc');
        const role1 = interaction.options.getRole('tag_role_1');
        const role2 = interaction.options.getRole('tag_role_2');

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
            return interaction.editReply('Could not fetch event data. Make sure the link is correct!');
        }

        if (!eventData) return interaction.editReply('Event not found!');

        const lines = [
            `**Server:** ${eventData.server?.name ?? 'N/A'}`,
            `**Game:** ${eventData.game ?? 'N/A'}`
        ];

        if (eventData.departure?.city) lines.push(`**Departure:** ${eventData.departure.city}`);
        if (eventData.arrive?.city) lines.push(`**Arrival:** ${eventData.arrive.city}`);
        if (eventData.meetup_at) lines.push(`**Meetup Time:** ${toDiscordTimestamp(eventData.meetup_at, 'F')}`);
        if (eventData.start_at) lines.push(`**Start Time:** ${toDiscordTimestamp(eventData.start_at, 'F')}`);

        lines.push(`**Event Link:** [View on TruckerMP](https://truckersmp.com/events/${eventId})`);

        if (spreadsheetLink) lines.push(`**Spreadsheet Link:** [Open Sheet](${spreadsheetLink})`);
        if (profileLink) lines.push(`**Profile Link:** [Open Profile](${profileLink})`);
        if (dlc) lines.push(`\n# DLC: ${dlc}`);

        const embed = new EmbedBuilder()
            .setTitle(getOverride('staff-resources', 'title', `${eventData.name}`))
            .setDescription(lines.join('\n'))
            .setURL(`https://truckersmp.com/events/${eventId}`)
            .setColor(getOverride('staff-resources', 'color', '#3498db'));

        if (eventData.map) embed.setImage(eventData.map);

        // Build the role mention string if roles were provided
        let mentionContent = '';
        if (role1) mentionContent += `<@&${role1.id}> `;
        if (role2) mentionContent += `<@&${role2.id}>`;

        // Send embed message with optional mentions
        await interaction.channel.send({
            content: mentionContent || null,
            embeds: [embed]
        });

        await interaction.editReply('✅ Staff resources posted.');
    }
};
