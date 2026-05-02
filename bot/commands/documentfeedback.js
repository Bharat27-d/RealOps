const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getOverride } = require('../commandConfig');

// Static default description for dashboard editing (placeholder for dynamic document and event links)
const DEFAULT_DESCRIPTION = `Here are the documents for the event:

**Event Sheet:** [Link]
**Attendance Sheet:** [Link]

Please review the documents and provide feedback on the event sheet and attendance sheet.`;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('documentfeedback')
    .setDescription('Send a document link and event feedback instructions to a user.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to send the feedback instructions to')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('documentlink')
        .setDescription('The link to the document')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('eventlink')
        .setDescription('The TMP event link')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Adjust as needed

  async execute(interaction) {
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.deferReply({ flags: 64 });
      }

      const user = interaction.options.getUser('user');
      const documentLink = interaction.options.getString('documentlink');
      const eventLink = interaction.options.getString('eventlink');

      if (!user) {
        return await interaction.editReply({ content: 'User not found.' });
      }
      if (!documentLink) {
        return await interaction.editReply({ content: 'Please provide a document link.' });
      }
      if (!eventLink) {
        return await interaction.editReply({ content: 'Please provide an event link.' });
      }

      const defaultTitle = 'Your Real Ops Event Document & Feedback Instructions';
      const dynamicDescription = `Thank you for requesting our services for your event, please find below the link for your document.

**Document Link:** [Click here to view your document](${documentLink})

**Event Link:** ${eventLink}

As you already have your event server, you will need to follow these steps to request your real ops:

1. Open an event manager feedback ticket.
2. Please paste the below text into the ticket:

\`\`\`
we wish to request real ops for our event TMP link ${eventLink} [HERE](${documentLink}) is the link to our document
\`\`\`
`;

      const embed = new EmbedBuilder()
        .setTitle(getOverride('documentfeedback', 'title', defaultTitle))
        .setDescription(dynamicDescription)
        .setColor(getOverride('documentfeedback', 'color', '#00b894'))
        .setThumbnail(getOverride('documentfeedback', 'thumbnail', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'))
        .setFooter({
          text: getOverride('documentfeedback', 'footerText', 'The Real Ops Group'),
          iconURL: getOverride('documentfeedback', 'footerIcon', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        });

      await interaction.editReply({ content: `📄 Document feedback instructions sent for <@${user.id}>.` });
      await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
    } catch (error) {
      console.error('Error in /documentfeedback:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'An error occurred while sending the document feedback instructions.', flags: 64 });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: 'An error occurred while sending the document feedback instructions.' });
        }
      } catch (err) {}
    }
  }
};
