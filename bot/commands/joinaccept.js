const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getOverride } = require('../commandConfig');

// Static default description for dashboard editing (placeholder for dynamic user mention)
const DEFAULT_DESCRIPTION = 'Thank you for your application to join the team, I am pleased to say your application has been accepted and welcome to the team!';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joinaccept')
    .setDescription('Accept a user\'s team application and send them a welcome message.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to accept')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Adjust permission as needed

  async execute(interaction) {
    try {
      // Only defer if not already acknowledged
      if (!interaction.deferred && !interaction.replied) {
        console.log("About to defer reply");
        await interaction.deferReply({ flags: 64 });
        console.log("Deferred reply");
      }

      const user = interaction.options.getUser('user');
      if (!user) {
        if (!interaction.replied) {
          await interaction.editReply({ content: 'User not found.' });
        }
        return;
      }

      const dynamicDescription = `Thank you for your application to join the team, I am pleased to say your application has been accepted and welcome to the team, <@${user.id}>!`;

      const embed = new EmbedBuilder()
        .setTitle(getOverride('joinaccept', 'title', 'Team Application Accepted'))
        .setDescription(dynamicDescription)
        .setColor(getOverride('joinaccept', 'color', '#00b894'))
        .setImage(getOverride('joinaccept', 'image', 'https://i.postimg.cc/5t3m40Nn/simple.png'))
        .setThumbnail(getOverride('joinaccept', 'thumbnail', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'))
        .setFooter({
          text: getOverride('joinaccept', 'footerText', 'The Real Ops Group'),
          iconURL: getOverride('joinaccept', 'footerIcon', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        });

      if (!interaction.replied) {
        await interaction.editReply({ content: `✅ Application accepted for <@${user.id}>.` });
      }
      await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
    } catch (error) {
      console.error('Error in /joinaccept:', error);
      try {
        if (!interaction.deferred && !interaction.replied) {
          await interaction.reply({ content: 'An error occurred while processing the acceptance.', flags: 64 });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: 'An error occurred while processing the acceptance.' });
        }
      } catch (err) { }
    }
  }
};
