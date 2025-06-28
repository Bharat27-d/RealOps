const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('documentserver')
    .setDescription('Send a document link and instructions to a user for their event.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to send the document to')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('documentlink')
        .setDescription('The link to the document')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Adjust as needed

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const user = interaction.options.getUser('user');
      const documentLink = interaction.options.getString('documentlink');

      if (!user) {
        return await interaction.editReply({ content: 'User not found.' });
      }
      if (!documentLink) {
        return await interaction.editReply({ content: 'Please provide a document link.' });
      }

      const embed = new EmbedBuilder()
        .setTitle('Your Real Ops Event Document')
        .setDescription(
`Thank you for requesting our services for your event, please find below the link for your document.

**Document Link:** [Click here to view your document](${documentLink})

---

When you apply for your event server, in the additional information, please paste the following text:

\`\`\`
we wish to have real ops at our event [HERE](${documentLink}) is the link to our document thank you
\`\`\`

Please let us know when your real ops have been passed.

---

Could you also please add our banner to your event page:

\`\`\`
[![](https://imgur.com/TDMA4xs.png)](https://discord.gg/realops)
\`\`\`
`
        )
        .setColor('#00b894')
        .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        .setFooter({
          text: 'The Real Ops Group',
          iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        });

      await interaction.editReply({ content: `📄 Document link sent for <@${user.id}>.` });
      await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
    } catch (error) {
      console.error('Error in /documentserver:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'An error occurred while sending the document link.', ephemeral: true });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: 'An error occurred while sending the document link.' });
        }
      } catch (err) {}
    }
  }
};