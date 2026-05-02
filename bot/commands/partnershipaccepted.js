const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getOverride } = require('../commandConfig');

// Static default description for dashboard editing
const DEFAULT_DESCRIPTION = 'Thank you for requesting a partnership with the Real Ops Group. I can confirm that your request has been accepted.\n\nCould you please let us have your "about us" text and any links to your Discord server channels for our partner channels?\n\nI will post our text below for your partner channels.';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnershipaccept')
    .setDescription('Confirm acceptance of a partnership and request partner information.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user whose partnership request was accepted')
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

      const defaultTitle = 'Partnership Accepted';

      const embed = new EmbedBuilder()
        .setTitle(getOverride('partnershipaccept', 'title', defaultTitle))
        .setDescription(getOverride('partnershipaccept', 'description', DEFAULT_DESCRIPTION))
        .setImage(getOverride('partnershipaccept', 'image', 'https://i.imgur.com/58wgkaF.png'))
        .setColor(getOverride('partnershipaccept', 'color', '#00b894'))
        .setThumbnail(getOverride('partnershipaccept', 'thumbnail', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'))
        .setFooter({
          text: getOverride('partnershipaccept', 'footerText', 'The Real Ops Group'),
          iconURL: getOverride('partnershipaccept', 'footerIcon', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        });

      await interaction.editReply({ content: `🤝 Partnership accepted and information request sent for <@${user.id}>.` });
      await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
    } catch (error) {
      console.error('Error in /partnershipaccept:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'An error occurred while sending the partnership acceptance.', flags: 64 });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: 'An error occurred while sending the partnership acceptance.' });
        }
      } catch (err) { }
    }
  }
};
