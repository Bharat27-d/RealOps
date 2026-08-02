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
      option.setName('documentlink1')
        .setDescription('The first document link')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('documentlink2')
        .setDescription('The second document link')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('documentlink3')
        .setDescription('The third document link')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('documentlink4')
        .setDescription('The fourth document link')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('documentlink5')
        .setDescription('The fifth document link')
        .setRequired(false)
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
      const eventLink = interaction.options.getString('eventlink');
      
      const docs = [];
      for (let i = 1; i <= 5; i++) {
        const link = interaction.options.getString(`documentlink${i}`);
        if (link) docs.push(link);
      }

      if (!user) {
        return await interaction.editReply({ content: 'User not found.' });
      }
      if (!eventLink) {
        return await interaction.editReply({ content: 'Please provide an event link.' });
      }

      const defaultTitle = 'Your Real Ops Event Document & Feedback Instructions';
      const docsList = docs.length > 0
        ? docs.map((doc, index) => `**Document ${index + 1}:** [Click here to view](${doc})`).join('\n')
        : '**Documents:** None provided';

      let ticketDocs = '';
      if (docs.length === 1) {
          ticketDocs = `[HERE](${docs[0]}) is the link to our document`;
      } else if (docs.length > 1) {
          ticketDocs = `Here are the links to our documents: ${docs.map((d, i) => `[Doc ${i + 1}](${d})`).join(' ')}`;
      }

      const ticketText = `we wish to request real ops for our event TMP link ${eventLink} ${ticketDocs}`.trim();

      const dynamicDescription = `Thank you for requesting our services for your event, please find below the links for your documents.

${docsList}

**Event Link:** ${eventLink}

As you already have your event server, you will need to follow these steps to request your real ops:

1. Open an event manager feedback ticket.
2. Please paste the below text into the ticket:

\`\`\`
${ticketText}
\`\`\`
`;

      const embed = new EmbedBuilder()
        .setTitle(getOverride('documentfeedback', 'title', defaultTitle))
        .setDescription(getOverride('documentfeedback', 'description', dynamicDescription))
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
