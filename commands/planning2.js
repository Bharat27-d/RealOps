const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('planning2')
        .setDescription('Send a planning stage 2 notification embed'),

    async execute(interaction) {
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

        await interaction.reply({ embeds: [embed] });
    }
};
