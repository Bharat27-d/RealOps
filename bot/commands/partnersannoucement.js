const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnerannouncement')
    .setDescription('Announce a new partnership with a specified partner.')
    .addStringOption(option =>
      option.setName('partner')
        .setDescription('The name of the new partner (e.g., Storm Media)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('link')
        .setDescription('Optional: Link to the partner (e.g., Discord or website)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Adjust as needed

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const partner = interaction.options.getString('partner');
      const link = interaction.options.getString('link');
      const partnerMention = link
        ? `[${partner}](${link})`
        : partner;

      const embed = new EmbedBuilder()
        .setTitle('Partnership Announcement')
        .setDescription(
`We are excited to announce that we have a new partnership with ${partnerMention} 🎉🎉🎉`
        )
        .setColor('#ff0000')
        .setThumbnail('https://cdn.discordapp.com/attachments/1291127061434716282/1321518479803801651/image.png?ex=677094d8&is=676f4358&hm=8cd9c1e4f5e5e91d0c6b23b5e9f4d9e8e8f8e8f8e8f8e8f8e8f8e8f8e8f8&')
        .setImage('https://i.postimg.cc/rwWZ5RZh/new-partnership.png')
        .setFooter({
          text: 'The Real Ops Group Partnership Manager',
          iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        });
    } catch (error) {
      console.error('Error in /partnerannouncement:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'An error occurred while sending the partnership announcement.', flags: 64 });
      } else if (interaction.deferred && !interaction.replied) {
        await interaction.editReply({ content: 'An error occurred while sending the partnership announcement.' });
      }
    }
  }
};
