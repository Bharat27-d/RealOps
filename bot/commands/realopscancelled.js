const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getOverride } = require('../commandConfig');

// Static default description for dashboard editing
const DEFAULT_DESCRIPTION = `Thank you for letting us know you wish to cancel your real ops request. This is to confirm your real ops request has been cancelled and will be removed from our system within 48hrs.`;

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
      await interaction.deferReply({ flags: 64 });

      const user = interaction.options.getUser('user');
      if (!user) {
        return await interaction.editReply({ content: 'User not found.' });
      }

      const defaultTitle = 'Real Ops Request Cancelled';

      const embed = new EmbedBuilder()
        .setTitle(getOverride('realopscancelled', 'title', defaultTitle))
        .setDescription(getOverride('realopscancelled', 'description', DEFAULT_DESCRIPTION))
        .setColor(getOverride('realopscancelled', 'color', '#e74c3c'))
        .setThumbnail(getOverride('realopscancelled', 'thumbnail', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'))
        .setFooter({
          text: getOverride('realopscancelled', 'footerText', 'The Real Ops Group'),
          iconURL: getOverride('realopscancelled', 'footerIcon', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        });

      await interaction.editReply({ content: `❌ Real Ops cancellation confirmed for <@${user.id}>.` });
      await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
    } catch (error) {
      console.error('Error in /realopscancelled:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'An error occurred while confirming the cancellation.', flags: 64 });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: 'An error occurred while confirming the cancellation.' });
        }
      } catch (err) {}
    }
  }
};
