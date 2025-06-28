const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');

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
        await interaction.deferReply({ ephemeral: true });

        const eventLink = interaction.options.getString('event_link');
        const spreadsheetLink = interaction.options.getString('spreadsheet_link');
        const profileLink = interaction.options.getString('profile_link');
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
            return interaction.editReply('❌ Could not fetch event data. Make sure the link is correct!');
        }

        if (!eventData) return interaction.editReply('❌ Event not found!');

        const embed = new EmbedBuilder()
            .setTitle(`📅 ${eventData.name}`)
            .setURL(`https://truckersmp.com/events/${eventId}`)
            .setColor('#3498db')
            .addFields(
                { name: 'Server', value: eventData.server?.name ?? 'N/A', inline: true },
                { name: 'Game', value: eventData.game ?? 'N/A', inline: true }
            );

        if (eventData.departure?.city) embed.addFields({ name: 'Departure', value: eventData.departure.city, inline: true });
        if (eventData.arrive?.city) embed.addFields({ name: 'Arrival', value: eventData.arrive.city, inline: true });
        if (eventData.meetup_at) embed.addFields({ name: 'Meetup Time (UTC)', value: `\`${eventData.meetup_at}\``, inline: false });
        if (eventData.start_at) embed.addFields({ name: 'Start Time (UTC)', value: `\`${eventData.start_at}\``, inline: false });

        embed.addFields({ name: 'Event Link', value: `[View on TruckerMP](https://truckersmp.com/events/${eventId})` });

        if (spreadsheetLink) embed.addFields({ name: 'Spreadsheet Link', value: `[Open Sheet](${spreadsheetLink})` });
        if (profileLink) embed.addFields({ name: 'Profile Link', value: `[Open Profile](${profileLink})` });

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
