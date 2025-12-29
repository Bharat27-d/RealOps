const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('documentserver')
    .setDescription('Send document links and instructions to a user for their event.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to send the documents to')
        .setRequired(true)
    )
    // Document links (up to 7, all optional)
    .addStringOption(option =>
      option.setName('documentlink1')
        .setDescription('First document link')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('documentlink2')
        .setDescription('Second document link')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('documentlink3')
        .setDescription('Third document link')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('documentlink4')
        .setDescription('Fourth document link')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('documentlink5')
        .setDescription('Fifth document link')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('documentlink6')
        .setDescription('Sixth document link')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('documentlink7')
        .setDescription('Seventh document link')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Adjust as needed

  async execute(interaction) {
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.deferReply({ flags: 64 });
      }

      const user = interaction.options.getUser('user');
      const documentLinks = [];
      // Collect up to 7 document links
      for (let i = 1; i <= 7; i++) {
        const link = interaction.options.getString(`documentlink${i}`);
        if (link) documentLinks.push(link);
      }

      if (!user) {
        return await interaction.editReply({ content: 'User not found.' });
      }
      if (documentLinks.length === 0) {
        return await interaction.editReply({ content: 'Please provide at least one document link.' });
      }

      // Build the list for the embed and the preformatted code block
      let embedLinks = documentLinks.map((link, idx) => `**Route ${idx + 1}:** [Click here to view document ${idx + 1}](${link})`).join('\n\n');
      let codeBlockLinks = documentLinks.map((link, idx) => `[Route ${idx + 1}](${link})`).join('\n\n');

      const embed = new EmbedBuilder()
        .setTitle('Your Real Ops Event Documents')
        .setDescription(
`Thank you for requesting our services for your event, please find below the links for your documents.

${embedLinks}

---

When you apply for your event server, in the additional information, please paste the following text:

\`\`\`
We would like to request permission to have real ops at our event here are the links to our documents

${codeBlockLinks}

Thank you
\`\`\`

Please let us know when your real ops have been passed.

---

Could you also please add our banner to your event page:

\`\`\`
[![](https://ik.imagekit.io/RealOpsMedia1/TMP%20banners/TMP%20banners/repls.png?updatedAt=1759407884999)](https://discord.gg/realops)
\`\`\`
`
        )
        .setColor('#00b894')
        .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        .setFooter({
          text: 'The Real Ops Group',
          iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        });

      await interaction.editReply({ content: `📄 Document link(s) sent for <@${user.id}>.` });
      await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
    } catch (error) {
      console.error('Error in /documentserver:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'An error occurred while sending the document links.', flags: 64 });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: 'An error occurred while sending the document links.' });
        }
      } catch (err) {}
    }
  }
};
