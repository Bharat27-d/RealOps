const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { runWeeklyAnnouncement } = require('../utils/weeklyAnnouncer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testweekly')
        .setDescription('Manually trigger the weekly event announcement (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        try {
            await runWeeklyAnnouncement(interaction.client);
            await interaction.editReply('✅ Weekly announcement triggered successfully! Check the designated announcement channel.');
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ An error occurred while trying to trigger the announcement.');
        }
    },
};
