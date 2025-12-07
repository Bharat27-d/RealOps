const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('realopsterms')
    .setDescription('Send terms and conditions to a user for Real Ops events.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to send the terms to')
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
        .setTitle('Real Ops Terms and Conditions')
        .setDescription(
`Thank you for requesting our services for your event. Before we supply you with the required document, please read the following and reply with **Accept** if you agree to the following terms and conditions.\n

1. All information within this ticket is not to be shared outside of this community except for the real-ops document.\n
2. You are not allowed to withdraw from this agreement once you have received your Real-ops document unless the event is cancelled.\n
3. You are not permitted to use our document to pass to another team to carry out the real operations.\n
   - If found doing this, then this will result in an instant ban from our services in the future.\n
4. All Real-ops must be passed by the TMP event management team and a clear screenshot of this must be posted in this ticket.\n
5. This ticket will remain open until 48hrs after your event so you may give any feedback on our services, good or bad.\n`
        )
        .setImage('https://i.imgur.com/thTwvxr.png')
        .setColor('#00b894')
        .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        .setFooter({
          text: 'The Real Ops Group',
          iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        });

      await interaction.editReply({ content: `📄 Terms and conditions sent for <@${user.id}>.` });
      await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
    } catch (error) {
      console.error('Error in /realopsterms:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'An error occurred while sending the terms and conditions.', flags: 64 });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: 'An error occurred while sending the terms and conditions.' });
        }
      } catch (err) {}
    }
  }
};
