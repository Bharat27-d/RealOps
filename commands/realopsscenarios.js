const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('realopsscenarios')
    .setDescription('Send Real Ops scenarios to a user with scenario images and text (up to 6).')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to send the scenarios to')
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option.setName('ro1image')
        .setDescription('Image for Scenario 1')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('ro1text')
        .setDescription('Text for Scenario 1')
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option.setName('ro2image')
        .setDescription('Image for Scenario 2')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('ro2text')
        .setDescription('Text for Scenario 2')
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option.setName('ro3image')
        .setDescription('Image for Scenario 3')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('ro3text')
        .setDescription('Text for Scenario 3')
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option.setName('ro4image')
        .setDescription('Image for Scenario 4')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('ro4text')
        .setDescription('Text for Scenario 4')
        .setRequired(true)
    )
    .addAttachmentOption(option =>
      option.setName('ro5image')
        .setDescription('Image for Optional Scenario 5')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('ro5text')
        .setDescription('Text for Optional Scenario 5')
        .setRequired(false)
    )
    .addAttachmentOption(option =>
      option.setName('ro6image')
        .setDescription('Image for Optional Scenario 6')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('ro6text')
        .setDescription('Text for Optional Scenario 6')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Adjust as needed

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const user = interaction.options.getUser('user');
      if (!user) {
        return await interaction.editReply({ content: 'User not found.' });
      }

      // Required scenarios
      const ro1image = interaction.options.getAttachment('ro1image');
      const ro1text = interaction.options.getString('ro1text');
      const ro2image = interaction.options.getAttachment('ro2image');
      const ro2text = interaction.options.getString('ro2text');
      const ro3image = interaction.options.getAttachment('ro3image');
      const ro3text = interaction.options.getString('ro3text');
      const ro4image = interaction.options.getAttachment('ro4image');
      const ro4text = interaction.options.getString('ro4text');

      // Optionals
      const ro5image = interaction.options.getAttachment('ro5image');
      const ro5text = interaction.options.getString('ro5text');
      const ro6image = interaction.options.getAttachment('ro6image');
      const ro6text = interaction.options.getString('ro6text');

      // Build description with each scenario's text immediately followed by its image link
      let description =
`Our planning team have completed the scenarios for your event, please look over these and let us know if you would like any changes.

**Scenario 1**
${ro1text}
[View Image](${ro1image.url})

**Scenario 2**
${ro2text}
[View Image](${ro2image.url})

**Scenario 3**
${ro3text}
[View Image](${ro3image.url})

**Scenario 4**
${ro4text}
[View Image](${ro4image.url})
`;

      // Optionals
      if (ro5text || ro5image || ro6text || ro6image) {
        description += '\n**Optional Extras**\n';
        if (ro5text || ro5image) {
          description += `\n**Scenario 5**\n${ro5text ? ro5text : ''}`;
          if (ro5image) description += `\n[View Image](${ro5image.url})\n`;
        }
        if (ro6text || ro6image) {
          description += `\n**Scenario 6**\n${ro6text ? ro6text : ''}`;
          if (ro6image) description += `\n[View Image](${ro6image.url})\n`;
        }
      }

      const { EmbedBuilder } = require('discord.js');
      const embed = new EmbedBuilder()
        .setTitle('Real Ops Event Scenarios')
        .setDescription(description)
        .setImage('https://i.imgur.com/Dr5htQb.png')
        .setColor('#00b894')
        .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        .setFooter({
          text: 'The Real Ops Group',
          iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        });

      await interaction.editReply({ content: `📄 Event scenarios sent for <@${user.id}>.` });
      await interaction.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
    } catch (error) {
      console.error('Error in /realopsscenarios:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'An error occurred while sending the scenarios.', ephemeral: true });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: 'An error occurred while sending the scenarios.' });
        }
      } catch (err) {}
    }
  }
};