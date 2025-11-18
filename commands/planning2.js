const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('planning2')
        .setDescription('Send a planning stage 2 notification embed')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Tag a user outside the embed')
                .setRequired(false)
        ),

    async execute(interaction) {
        try {
<<<<<<< HEAD
            // Always defer immediately!
=======
>>>>>>> f2fd194637de26aa8b071c319ac6dd2cd0be6967
            await interaction.deferReply({ ephemeral: true });

            // Get the optional user to tag
            const user = interaction.options.getUser('user');

<<<<<<< HEAD
            // Build the embed
=======

>>>>>>> f2fd194637de26aa8b071c319ac6dd2cd0be6967
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

<<<<<<< HEAD
            // Notify the command user privately
            await interaction.editReply({ content: '✅ Planning stage 2 notification sent.' });

            // Prepare content to tag the user (if provided)
            const content = user ? `<@${user.id}>` : undefined;

            // Send the embed in the channel, tagging user if selected
=======
      
            await interaction.editReply({ content: '✅ Planning stage 2 notification sent.' });

            
            const content = user ? `<@${user.id}>` : undefined;

            
>>>>>>> f2fd194637de26aa8b071c319ac6dd2cd0be6967
            await interaction.channel.send({ content, embeds: [embed] });

        } catch (error) {
            console.error('Error in /planning2:', error);
<<<<<<< HEAD
            // Only reply if NOT already replied or deferred
            if (!interaction.replied && !interaction.deferred) {
                try {
                    await interaction.reply({ content: 'An error occurred while sending the notification.', ephemeral: true });
                } catch (err) {
                    console.error('Error sending error message (reply):', err);
                }
            } else if (!interaction.replied && interaction.deferred) {
                try {
                    await interaction.editReply({ content: 'An error occurred while sending the notification.' });
                } catch (err) {
                    console.error('Error sending error message (editReply):', err);
                }
            }
            // If already replied, do nothing
=======
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ content: 'An error occurred while sending the notification.', ephemeral: true });
                } else if (interaction.deferred && !interaction.replied) {
                    await interaction.editReply({ content: 'An error occurred while sending the notification.' });
                }
            } catch (err) {
                console.error('Error sending error message:', err);
            }
>>>>>>> f2fd194637de26aa8b071c319ac6dd2cd0be6967
        }
    }
};