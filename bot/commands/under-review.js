const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('under-review')
    .setDescription('Post an "Under Review" embed for your application with custom details.')
    .addStringOption(option =>
      option.setName('application_text')
        .setDescription('Enter what your application is for (e.g., Support Staff, Event Team, etc.)')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    try {
      // Only defer if not already acknowledged
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ flags: 64 });
      }

      const applicationText = interaction.options.getString('application_text');

      const embed = new EmbedBuilder()
        .setTitle('⏳ Application Under Review')
        .setDescription(
          `Thank you for submitting your application for **${applicationText}**.\n\nOur team is reviewing your submission to ensure it meets our standards and requirements. We appreciate your interest and the time you've invested in applying to join us.\n\nYou will receive a response shortly once the review is complete. If you have any questions in the meantime, feel free to reach out to our staff team.\n\nBest of luck!`
        )
        .setColor('#e67e22')
        .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        .setFooter({ text: 'The Real Ops Group', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' });

      // Only edit reply if not already replied
      if (!interaction.replied) {
        await interaction.editReply({ content: '✅ Under Review message posted.' });
      }
      await interaction.channel.send({ embeds: [embed] });
    } catch (error) {
      // If interaction is not acknowledged, reply with error
      if (!interaction.deferred && !interaction.replied) {
        await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true }).catch(() => {});
      }
      console.error('Error in under-review command:', error);
    }
  }
};
