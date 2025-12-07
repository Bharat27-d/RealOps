const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joindecline')
    .setDescription('Decline a user\'s team application and send them a decline message.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user whose application is being declined')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for declining (e.g., requirements, ban history, AI application)')
        .setRequired(true)
        .addChoices(
          { name: "Doesn't meet our requirements", value: "does_not_meet_requirements" },
          { name: "Ban history on TMP", value: "ban_history_tmp" },
          { name: "AI was used for this application", value: "ai_used" }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    try {
      await interaction.deferReply({ flags: 64 });

      const user = interaction.options.getUser('user');
      const reasonValue = interaction.options.getString('reason');

      let reasonText;
      switch (reasonValue) {
        case 'does_not_meet_requirements':
          reasonText = "you don't meet our requirements";
          break;
        case 'ban_history_tmp':
          reasonText = "your ban history on TMP";
          break;
        case 'ai_used':
          reasonText = "we believe AI was used for this application";
          break;
        default:
          reasonText = "an unspecified reason";
      }

      const embed = new EmbedBuilder()
        .setTitle('Team Application Declined')
        .setDescription(
          `Thank you for your application to join the team, unfortunately on this occasion your application has been declined due to ${reasonText}.\n\nYou can reapply 30 days after the date of this application, <@${user.id}>.`
        )
        .setColor('#e74c3c')
        .setImage('https://i.postimg.cc/5t3m40Nn/simple.png')
        .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        .setFooter({
          text: 'The Real Ops Group',
          iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        });

      await interaction.editReply({ content: `❌ Application declined for <@${user.id}>.` });
      // Tag the user outside the embed
      await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
    } catch (error) {
      console.error('Error in /joindecline:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: 'An error occurred while processing the decline.', flags: 64 });
      }
    }
  }
};
