const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnershipterms')
    .setDescription('Send partnership terms from the specified Discord message link to a user.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to send the partnership terms to')
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

      const termsLink = 'https://discord.com/channels/1291110532837015584/1291118998137606237/1370079524955488306';

      const embed = new EmbedBuilder()
        .setTitle('Partnership Terms')
        .setDescription(
`Please review the partnership terms at the following link:

[View Partnership Terms](${termsLink})

If you have any questions or concerns about the terms, feel free to reply here.`
        )
        .setImage('https://i.imgur.com/58wgkaF.png')
        .setColor('#00b894')
        .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        .setFooter({
          text: 'The Real Ops Group',
          iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        });

      await interaction.editReply({ content: `📄 Partnership terms sent for <@${user.id}>.` });
      await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
    } catch (error) {
      console.error('Error in /partnershipterms:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'An error occurred while sending the partnership terms.', ephemeral: true });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: 'An error occurred while sending the partnership terms.' });
        }
      } catch (err) {}
    }
  }
};