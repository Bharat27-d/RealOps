const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

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
      await interaction.deferReply({ ephemeral: true });

      const user = interaction.options.getUser('user');
      if (!user) {
        return await interaction.editReply({ content: 'User not found.' });
      }

      const embed = new EmbedBuilder()
        .setTitle('Team Application Accepted')
        .setDescription(`Thank you for your application to join the team, I am pleased to say your application has been accepted and welcome to the team, <@${user.id}>!`)
        .setColor('#00b894')
        .setImage('https://i.postimg.cc/5t3m40Nn/simple.png')
        .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        .setFooter({
          text: 'The Real Ops Group',
          iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        });

      await interaction.editReply({ content: `✅ Application accepted for <@${user.id}>.` });
      // Tag the user outside the embed
      await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
    } catch (error) {
      console.error('Error in /joinaccept:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'An error occurred while processing the acceptance.', ephemeral: true });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: 'An error occurred while processing the acceptance.' });
        }
      } catch (err) {}
    }
  }
};