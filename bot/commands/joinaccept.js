const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getOverride, parsePlaceholders } = require('../commandConfig');

// Static default description for dashboard editing (placeholder for dynamic user mention)
const DEFAULT_DESCRIPTION = 'Thank you for your application to join the team, I am pleased to say your application has been accepted and welcome to the team, ${user.mention}!';

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
    // Only defer if not already acknowledged. safeCommandExecute allows this
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply({ flags: 64 });
    }

    const user = interaction.options.getUser('user');
    if (!user) {
      return await interaction.editReply({ content: 'User not found.' });
    }

    const embedDescription = parsePlaceholders(
      getOverride('joinaccept', 'description', DEFAULT_DESCRIPTION),
      interaction
    );

    const embed = new EmbedBuilder()
      .setTitle(getOverride('joinaccept', 'title', 'Team Application Accepted'))
      .setDescription(embedDescription)
      .setColor(getOverride('joinaccept', 'color', '#00b894'))
      .setImage(getOverride('joinaccept', 'image', 'https://i.postimg.cc/5t3m40Nn/simple.png'))
      .setThumbnail(getOverride('joinaccept', 'thumbnail', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'))
      .setFooter({
        text: getOverride('joinaccept', 'footerText', 'The Real Ops Group'),
        iconURL: getOverride('joinaccept', 'footerIcon', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
      });

    await interaction.editReply({ content: `✅ Application accepted for <@${user.id}>.` });
    await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
  }
};
