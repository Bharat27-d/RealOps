const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getOverride } = require('../commandConfig');

// Static default description for dashboard editing
const DEFAULT_DESCRIPTION = `**Real Ops Group Partnership Terms**

1. **Mutual Promotion**: Both parties agree to promote each other's events and activities.
2. **Channel Exchange**: Each party will provide a channel for the other's announcements.
3. **Event Collaboration**: Partners may collaborate on joint events.
4. **Professional Conduct**: Maintain professional behavior at all times.
5. **Communication**: Respond to partnership inquiries within 48 hours.
6. **No Exclusivity**: This partnership is non-exclusive unless otherwise agreed.
7. **Termination**: Either party may terminate with 7 days notice.
8. **Updates**: Partners should keep each other informed of major changes.`;

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
      await interaction.deferReply({ flags: 64 });

      const user = interaction.options.getUser('user');
      if (!user) {
        return await interaction.editReply({ content: 'User not found.' });
      }

      const defaultTitle = 'Partnership Terms & Conditions';

      const embed = new EmbedBuilder()
        .setTitle(getOverride('partnershipterms', 'title', defaultTitle))
        .setDescription(getOverride('partnershipterms', 'description', DEFAULT_DESCRIPTION))
        .setImage(getOverride('partnershipterms', 'image', 'https://i.imgur.com/58wgkaF.png'))
        .setColor(getOverride('partnershipterms', 'color', '#00b894'))
        .setThumbnail(getOverride('partnershipterms', 'thumbnail', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'))
        .setFooter({
          text: getOverride('partnershipterms', 'footerText', 'The Real Ops Group'),
          iconURL: getOverride('partnershipterms', 'footerIcon', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
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
          await interaction.reply({ content: 'An error occurred while sending the partnership terms.', flags: 64 });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: 'An error occurred while sending the partnership terms.' });
        }
      } catch (err) {}
    }
  }
};
