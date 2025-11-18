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
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    try {
      // Log to verify execution timing (debugging)
      console.log("Received interaction for /realopsscenarios at:", new Date().toISOString());

      // Defer reply right away!
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
<<<<<<< HEAD

=======
      // Optionals
>>>>>>> f2fd194637de26aa8b071c319ac6dd2cd0be6967
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

<<<<<<< HEAD
      // Intro embed
      const introEmbed = new EmbedBuilder()
        .setTitle('Real Ops Event Scenarios')
        .setDescription('Our planning team have completed the scenarios for your event, please look over these and let us know if you would like any changes.')
        .setColor('#23272A')
        .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png');

      // Create embeds per scenario
      const embeds = [
        introEmbed,
        ...scenarios.map((sc, idx) => {
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
        })
      ];
=======
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
>>>>>>> f2fd194637de26aa8b071c319ac6dd2cd0be6967

      await interaction.editReply({ content: `📄 Event scenarios sent for <@${user.id}>.` });
      await interaction.channel.send({ content: `<@${user.id}>`, embeds });
    } catch (error) {
      console.error('Error in /realopsscenarios:', error);
      // Only reply if not already replied or deferred
      if (!interaction.replied && !interaction.deferred) {
        try {
          await interaction.reply({ content: 'An error occurred while sending the scenarios.', ephemeral: true });
        } catch (err) {}
      } else if (!interaction.replied && interaction.deferred) {
        try {
          await interaction.editReply({ content: 'An error occurred while sending the scenarios.' });
        } catch (err) {}
      }
    }
  }
};