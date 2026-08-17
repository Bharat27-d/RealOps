const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getOverride } = require('../commandConfig');

// Static default description for dashboard editing
const DEFAULT_DESCRIPTION = `Hello this is to inform you that we have a new staff opening available.
If you are interested in this position please submit an application by clicking the button below.
Please note all applications are reviewed by our management team and we will get back to you as soon as possible.`;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staffopening')
    .setDescription('Show staff openings and recruitment information')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    try {
      const defaultTitle = 'The Real-Ops Group Recruitment';

      const embed = new EmbedBuilder()
        .setTitle(getOverride('staffopening', 'title', defaultTitle))
        .setDescription(getOverride('staffopening', 'description', DEFAULT_DESCRIPTION))
        .setImage(getOverride('staffopening', 'image', 'https://i.imgur.com/GUywUAQ.png'))
        .setColor(getOverride('staffopening', 'color', '#00b894'))
        .setThumbnail(getOverride('staffopening', 'thumbnail', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'))
        .setFooter({
          text: getOverride('staffopening', 'footerText', 'The Real Ops Group'),
          iconURL: getOverride('staffopening', 'footerIcon', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in /staffopening:', error);
      // Defensive: only reply if not already replied/deferred
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'An error occurred while displaying the staff openings.', flags: 64 });
      } else if (interaction.deferred && !interaction.replied) {
        await interaction.editReply({ content: 'An error occurred while displaying the staff openings.' });
      }
    }
  }
};
