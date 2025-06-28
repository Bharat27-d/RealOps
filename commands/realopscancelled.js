const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('realopscancelled')
    .setDescription('Confirm to a user that their Real Ops request has been cancelled.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user whose request was cancelled')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Adjust as needed

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const user = interaction.options.getUser('user');
      if (!user) {
        return await interaction.editReply({ content: 'User not found.' });
      }

      const embed = new EmbedBuilder()
        .setTitle('Real Ops Request Cancelled')
        .setDescription(
`Thank you for letting us know you wish to cancel your real ops request. This is to confirm your real ops request has been cancelled and will be removed from our system within 48hrs.`
        )
        .setColor('#e74c3c')
        .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        .setFooter({
          text: 'The Real Ops Group',
          iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        });

      await interaction.editReply({ content: `❌ Real Ops cancellation confirmed for <@${user.id}>.` });
      await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
    } catch (error) {
      console.error('Error in /realopscancelled:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'An error occurred while confirming the cancellation.', ephemeral: true });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: 'An error occurred while confirming the cancellation.' });
        }
      } catch (err) {}
    }
  }
};