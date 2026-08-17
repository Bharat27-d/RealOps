const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getOverride } = require('../commandConfig');

// Static default description for dashboard editing
const DEFAULT_DESCRIPTION = `Hello this is just to let you know your event is the next one our planners will be working on.
If there are any scenarios you would like to see included then please let us know in this ticket within the next 24hr.
We will contact you again once this stage is completed`;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('planning2')
        .setDescription('Send a planning stage 2 notification embed')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Tag a user outside the embed')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: 64 });

            // Get the optional user to tag
            const user = interaction.options.getUser('user');

            const defaultTitle = 'Planning stage now commencing';

            const embed = new EmbedBuilder()
                .setTitle(getOverride('planning2', 'title', defaultTitle))
                .setDescription(getOverride('planning2', 'description', DEFAULT_DESCRIPTION))
                .setThumbnail(getOverride('planning2', 'thumbnail', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'))
                .setImage(getOverride('planning2', 'image', 'https://i.imgur.com/wLwstVS.png'))
                .setFooter({
                    text: getOverride('planning2', 'footerText', 'The Real Ops Group'),
                    iconURL: getOverride('planning2', 'footerIcon', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
                });

            await interaction.editReply({ content: '✅ Planning stage 2 notification sent.' });

            const content = user ? `<@${user.id}>` : undefined;

            await interaction.channel.send({ content, embeds: [embed] });

        } catch (error) {
            console.error('Error in /planning2:', error);
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: 'An error occurred while sending the notification.', flags: 64 });
                } else if (interaction.deferred && !interaction.replied) {
                    await interaction.editReply({ content: 'An error occurred while sending the notification.' });
                }
            } catch (err) {
                console.error('Error sending error message:', err);
            }
        }
    }
};
