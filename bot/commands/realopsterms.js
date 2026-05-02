const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getOverride } = require('../commandConfig');

// Static default description for dashboard editing
const DEFAULT_DESCRIPTION = `**Real Ops Group Terms and Conditions**

1. **Event Attendance**: All members must attend scheduled events unless excused in advance.
2. **Professional Conduct**: Maintain professional behavior at all times.
3. **Communication**: Respond to staff messages within 48 hours.
4. **Event Protocol**: Follow all Real Ops event protocols and guidelines.
5. **Discord Activity**: Remain active on Discord and participate in discussions.
6. **Confidentiality**: Keep internal information confidential.
7. **Respect**: Treat all members and partners with respect.
8. **Violations**: Violations may result in removal from the group.`;

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

      const defaultTitle = 'Real Ops Terms and Conditions';

      const embed = new EmbedBuilder()
        .setTitle(getOverride('realopsterms', 'title', defaultTitle))
        .setDescription(getOverride('realopsterms', 'description', DEFAULT_DESCRIPTION))
        .setImage(getOverride('realopsterms', 'image', 'https://i.imgur.com/thTwvxr.png'))
        .setColor(getOverride('realopsterms', 'color', '#00b894'))
        .setThumbnail(getOverride('realopsterms', 'thumbnail', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'))
        .setFooter({
          text: getOverride('realopsterms', 'footerText', 'The Real Ops Group'),
          iconURL: getOverride('realopsterms', 'footerIcon', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
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
