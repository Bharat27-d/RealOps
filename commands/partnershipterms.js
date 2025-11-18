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

      const embed = new EmbedBuilder()
        .setTitle('Partnership Terms & Conditions')
        .setDescription(
`**Partnership terms and conditions**

**1.** As partners you will receive priority bookings over non partners.
**1.1** Partner bookings are accepted on a first come first served basis. ( with no exceptions )

**2.** As partners you are allowed to request bookings for a full year in advance.

**3.** We request that you are polite and respectful to our staff at all times.

**4.** We openly welcome your input to any scenarios you would like to implement at you events (within TMP rules)

**5.** If the person / persons who agreed to this partnership leave this server the partnership will be automatically cancelled unless ownership is transferred before they leave the server.
**5.1.** All event bookings will be removed from our system if Rule 5. has been actioned.

**6.** You must give us prior notice of at least 48hrs of any changes to your events. for example date / time changes, cancelations.

**7.** TMP rules must be followed at all times at your events.
**7.1** If your VTC / Group is found to be regularly breaking TMP rules this partnership will be terminated with out notice.

**8.** We reserve the right to cancel this partnership at any time if you are found in breach of these terms and conditions.

**VTC Partnerships**
**9.** As VTC partners we expect a minimum of 3 requests a year of our services for your events.
**9.1** Partnerships will be reviewed every 6 months and you will be reminded if you are found not to be meeting this requirement.
**9.2** We reserve the right to withdraw the partnership if no bookings received after 3 reminders.
**9.3** If rule 9.2 implemented you are not allowed to request a new partnership for 3 Months from the date of Rule 9.2 being implemented.

**Group Partnerships**
**10.** As Group partners we expect assistance of additional staff from your groups at large events we are attending.
**10.1** We are happy to assist at your events when needed

Please react with ✅ if you agree to these terms,
Please react with ❌ if you do not agree to these terms.

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
      const sentMessage = await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
      
      // Add reactions for users to agree or disagree
      await sentMessage.react('✅');
      await sentMessage.react('❌');
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