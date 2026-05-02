const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getOverride } = require('../commandConfig');

// Static default description for dashboard editing (placeholder for dynamic user mention)
const DEFAULT_DESCRIPTION = 'Thank you for your application to join the team, after our staff have done their checks and found you are a member of one of our partners and as such can bypass the application process. Your roles have been added!';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joinpartner')
    .setDescription('Accept a user as a partner and send them a special welcome message.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to add as a partner')
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

      const dynamicDescription = `Thank you for your application to join the team, after our staff have done their checks and found you are a member of one of our partners and as such can bypass the application process. Your roles have been added, <@${user.id}>!`;

      const embed = new EmbedBuilder()
        .setTitle(getOverride('joinpartner', 'title', 'Application Accepted'))
        .setDescription(dynamicDescription)
        .setColor(getOverride('joinpartner', 'color', '#00b894'))
        .setImage(getOverride('joinpartner', 'image', 'https://i.postimg.cc/5t3m40Nn/simple.png'))
        .setThumbnail(getOverride('joinpartner', 'thumbnail', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'))
        .setFooter({
          text: getOverride('joinpartner', 'footerText', 'The Real Ops Group'),
          iconURL: getOverride('joinpartner', 'footerIcon', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        });

      await interaction.editReply({ content: `✅ Partner application accepted for <@${user.id}>.` });
      // Tag the user outside the embed
      await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
    } catch (error) {
      console.error('Error in /joinpartner:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'An error occurred while processing the partner acceptance.', flags: 64 });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: 'An error occurred while processing the partner acceptance.' });
        }
      } catch (err) { }
    }
  }
};
