const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getOverride } = require('../commandConfig');

// Static default description for dashboard editing
const DEFAULT_DESCRIPTION = 'Thank you for your request to become partners with us, could you please tell us more about this request and how you feel this would benefit us both?\nIf you have any terms/conditions to this partnership then please post them below.';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnership1')
    .setDescription('Request more information about a partnership from a user.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to request more information from')
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

      const defaultTitle = 'Partnership Request - More Information Needed';
      const defaultDescription = `Thank you for your request to become partners with us, could you please tell us more about this request and how you feel this would benefit us both?
If you have any terms/conditions to this partnership then please post them below.`;

      const embed = new EmbedBuilder()
        .setTitle(getOverride('partnership1', 'title', defaultTitle))
        .setDescription(DEFAULT_DESCRIPTION)
        .setImage(getOverride('partnership1', 'image', 'https://i.imgur.com/58wgkaF.png'))
        .setColor(getOverride('partnership1', 'color', '#00b894'))
        .setThumbnail(getOverride('partnership1', 'thumbnail', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'))
        .setFooter({
          text: getOverride('partnership1', 'footerText', 'The Real Ops Group'),
          iconURL: getOverride('partnership1', 'footerIcon', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        });

      await interaction.editReply({ content: `🤝 Partnership info request sent for <@${user.id}>.` });
      await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
    } catch (error) {
      console.error('Error in /partnership1:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'An error occurred while sending the partnership request.', flags: 64 });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: 'An error occurred while sending the partnership request.' });
        }
      } catch (err) { }
    }
  }
};
