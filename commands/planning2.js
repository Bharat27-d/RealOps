const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('planning2')
        .setDescription('Send a planning stage 2 notification embed'),

    async execute(interaction) {
        try {
            // Defer the reply so you can safely edit it later
            await interaction.deferReply({ ephemeral: true });

            // Build the embed
            const embed = new EmbedBuilder()
                .setTitle('Planning stage now commencing')
                .setDescription(
                    `Hello this is just to let you know your event is the next one our planners will be working on.
If there are any scenarios you would like to see included then please let us know in this ticket within the next 24hr.
We will contact you again once this stage is completed`
                )
                .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
                .setImage('https://i.imgur.com/wLwstVS.png')
                .setFooter({
                    text: 'The Real Ops Group',
                    iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
                });

            // Confirm to command user (ephemeral)
            await interaction.editReply({ content: `✅ Planning stage 2 notification sent.` });

            // Send the embed publicly in the channel
            await interaction.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error in /planning2:', error);
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: 'An error occurred while sending the notification.', ephemeral: true });
                } else if (interaction.deferred && !interaction.replied) {
                    await interaction.editReply({ content: 'An error occurred while sending the notification.' });
                }
            } catch (err) {
                console.error('Error sending error message:', err);
            }
        }
    }
};