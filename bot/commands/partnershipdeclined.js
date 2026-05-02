const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getOverride } = require('../commandConfig');

// Static default description for dashboard editing (placeholder for dynamic reason)
const DEFAULT_DESCRIPTION = 'Thank you for requesting a partnership with the Real Ops Group. Unfortunately, on this occasion, we have declined your request due to requirements.\n\nYou can request a new partnership after 30 days from the date of this ticket.';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnershipdeclined')
    .setDescription('Inform a user that their partnership request was declined, with a reason.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user whose partnership request was declined')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('The reason for declining the partnership')
        .setRequired(true)
        .addChoices(
          { name: 'We feel this partnership would not benefit both parties', value: 'We feel this partnership would not benefit both parties' },
          { name: 'You do not meet TMP requirements', value: 'You do not meet TMP requirements' },
          { name: 'Only higher management can request partnerships', value: 'Only higher management can request partnerships' }
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Adjust as needed

  async execute(interaction) {
    try {
      await interaction.deferReply({ flags: 64 });

      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');
      if (!user) {
        return await interaction.editReply({ content: 'User not found.' });
      }
      if (!reason) {
        return await interaction.editReply({ content: 'Please provide a reason.' });
      }

      const defaultTitle = 'Partnership Request Declined';
      const dynamicDescription = `Thank you for requesting a partnership with the Real Ops Group. Unfortunately, on this occasion, we have declined your request due to **${reason}**.

You can request a new partnership after 30 days from the date of this ticket.`;

      const embed = new EmbedBuilder()
        .setTitle(getOverride('partnershipdeclined', 'title', defaultTitle))
        .setDescription(dynamicDescription)
        .setImage(getOverride('partnershipdeclined', 'image', 'https://i.imgur.com/58wgkaF.png'))
        .setColor(getOverride('partnershipdeclined', 'color', '#e74c3c'))
        .setThumbnail(getOverride('partnershipdeclined', 'thumbnail', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'))
        .setFooter({
          text: getOverride('partnershipdeclined', 'footerText', 'The Real Ops Group'),
          iconURL: getOverride('partnershipdeclined', 'footerIcon', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        });

      await interaction.editReply({ content: `❌ Partnership declined for <@${user.id}>.` });
      await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
    } catch (error) {
      console.error('Error in /partnershipdeclined:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'An error occurred while sending the partnership decline.', flags: 64 });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: 'An error occurred while sending the partnership decline.' });
        }
      } catch (err) {}
    }
  }
};
