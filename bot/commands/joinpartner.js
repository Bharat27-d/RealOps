const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

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

      const embed = new EmbedBuilder()
        .setTitle('Application Accepted')
        .setDescription(`Thank you for your application to join the team, after our staff have done their checks and found you are a member of one of our partners and as such can bypass the application process. Your roles have been added, <@${user.id}>!`)
        .setColor('#00b894')
        .setImage('https://i.postimg.cc/5t3m40Nn/simple.png')
        .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        .setFooter({
          text: 'The Real Ops Group',
          iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
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
      } catch (err) {}
    }
  }
};
