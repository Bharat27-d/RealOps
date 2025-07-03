const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('realopsscenarios')
    .setDescription('Send Real Ops scenarios to a user with scenario images and text (up to 6, using image links).')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to send the scenarios to')
        .setRequired(true)
    )
    // Scenario 1
    .addStringOption(option =>
      option.setName('ro1image')
        .setDescription('Image link for Scenario 1 (must be a valid image URL)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('ro1text')
        .setDescription('Text for Scenario 1')
        .setRequired(true)
    )
    // Scenario 2
    .addStringOption(option =>
      option.setName('ro2image')
        .setDescription('Image link for Scenario 2 (must be a valid image URL)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('ro2text')
        .setDescription('Text for Scenario 2')
        .setRequired(true)
    )
    // Scenario 3
    .addStringOption(option =>
      option.setName('ro3image')
        .setDescription('Image link for Scenario 3 (must be a valid image URL)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('ro3text')
        .setDescription('Text for Scenario 3')
        .setRequired(true)
    )
    // Scenario 4
    .addStringOption(option =>
      option.setName('ro4image')
        .setDescription('Image link for Scenario 4 (must be a valid image URL)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('ro4text')
        .setDescription('Text for Scenario 4')
        .setRequired(true)
    )
    // Optional Scenario 5
    .addStringOption(option =>
      option.setName('ro5image')
        .setDescription('Image link for Optional Scenario 5 (valid image URL)')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('ro5text')
        .setDescription('Text for Optional Scenario 5')
        .setRequired(false)
    )
    // Optional Scenario 6
    .addStringOption(option =>
      option.setName('ro6image')
        .setDescription('Image link for Optional Scenario 6 (valid image URL)')
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

      // Collect scenarios
      const scenarios = [
        {
          text: interaction.options.getString('ro1text'),
          image: interaction.options.getString('ro1image')
        },
        {
          text: interaction.options.getString('ro2text'),
          image: interaction.options.getString('ro2image')
        },
        {
          text: interaction.options.getString('ro3text'),
          image: interaction.options.getString('ro3image')
        },
        {
          text: interaction.options.getString('ro4text'),
          image: interaction.options.getString('ro4image')
        }
      ];
      // Optionals
      if (interaction.options.getString('ro5text') || interaction.options.getString('ro5image')) {
        scenarios.push({
          text: interaction.options.getString('ro5text'),
          image: interaction.options.getString('ro5image')
        });
      }
      if (interaction.options.getString('ro6text') || interaction.options.getString('ro6image')) {
        scenarios.push({
          text: interaction.options.getString('ro6text'),
          image: interaction.options.getString('ro6image')
        });
      }

      // Create an embed per scenario
      const embeds = scenarios.map((sc, idx) => {
        const embed = new EmbedBuilder()
          .setTitle(`Scenario ${idx + 1}`)
          .setDescription(sc.text ? sc.text : 'No description provided.')
          .setColor('#00b894')
          .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
          .setFooter({
            text: 'The Real Ops Group',
            iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
          });
        if (sc.image && sc.image.match(/^https?:\/\/.*\.(png|jpg|jpeg|gif|webp)$/i)) {
          embed.setImage(sc.image);
        } else if (sc.image) {
          embed.addFields({ name: 'Image link', value: `[View Image](${sc.image})` });
        }
        return embed;
      });

      await interaction.editReply({ content: `📄 Event scenarios sent for <@${user.id}>.` });
      await interaction.channel.send({ content: `<@${user.id}>`, embeds });
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