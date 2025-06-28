const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

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
      await interaction.deferReply({ ephemeral: true });

      const user = interaction.options.getUser('user');
      if (!user) {
        return await interaction.editReply({ content: 'User not found.' });
      }

      const embed = new EmbedBuilder()
        .setTitle('Partnership Accepted')
        .setDescription(
`Thank you for requesting a partnership with the Real Ops Group. I can confirm that your request has been accepted.

Could you please let us have your "about us" text and any links to your Discord server channels for our partner channels?

I will post our text below for your partner channels.`
        )
        .setImage('https://i.imgur.com/58wgkaF.png')
        .setColor('#00b894')
        .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        .setFooter({
          text: 'The Real Ops Group',
          iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        });

      await interaction.editReply({ content: `🤝 Partnership accepted and information request sent for <@${user.id}>.` });
      await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
    } catch (error) {
      console.error('Error in /partnershipaccept:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'An error occurred while sending the partnership acceptance.', ephemeral: true });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: 'An error occurred while sending the partnership acceptance.' });
        }
      } catch (err) {}
    }
  }
};