const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

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
      await interaction.deferReply({ flags: 64 });

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

      const embed = new EmbedBuilder()
        .setTitle('Your Real Ops Event Document & Feedback Instructions')
        .setDescription(
`Thank you for requesting our services for your event, please find below the link for your document.

**Document Link:** [Click here to view your document](${documentLink})

**Event Link:** ${eventLink}

As you already have your event server, you will need to follow these steps to request your real ops:

1. Open an event manager feedback ticket.
2. Please paste the below text into the ticket:

\`\`\`
we wish to request real ops for our event TMP link ${eventLink} [HERE](${documentLink}) is the link to our document
\`\`\`
`
        )
        .setColor('#00b894')
        .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        .setFooter({
          text: 'The Real Ops Group',
          iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
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
