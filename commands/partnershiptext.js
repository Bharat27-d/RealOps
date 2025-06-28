const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('partnershiptext')
    .setDescription('Send the partnership text to a user.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to send the partnership text to')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Adjust as needed

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const user = interaction.options.getUser('user');
      if (!user) {
        return await interaction.editReply({ content: 'User not found.' });
      }

      // Partnership text as in image 1, in a code block
      const partnershipText = 
`Hello and welcome to The Real-Ops Group

We are a group dedicated to providing Real-Ops for events on TruckersMP.
We where built from experienced staff within the TruckersMP community with years of experience in producing great events enjoyed by our great community time after time.
We thought it was time this community deserved a dedicated team that could bring real-ops to your events.
Our staff consist of long serving TMP staff and experienced long serving players of this great community.

What we can offer

Our experienced staff will take care of everything for you and keep you informed as each stage is completed and supply the documentation you need for the TMP Event Managers to pass your events Real-ops requests.
Then our experienced Event Team can take care of your real-ops to insure your event goes perfectly every time.
We can also supply your events with Convoy Control through our CC Groups partners.

Contact us

If you would like to know more then please feel free to speak to our support staff by opening a ticket in [Support](https://discord.com/channels/1291110532837015584/1318312015630045184) and they will be happy to answer all your questions.

If you would like to book us for your event then please open a Real-Ops Request ticket in [Book us](https://discord.com/channels/1291110532837015584/1318311275314286682) and our experienced planners will take care of everything for you.

If you would like to join our team you can find all available staff positions in [staff-openings](https://discord.com/channels/1291110532837015584/1291739954791059527) and you can apply by opening a ticket in [Join the Team](https://discord.com/channels/1291110532837015584/1318310934015512649)

https://discord.gg/realops
https://imgur.com/x3rgpvg
https://imgur.com/kmrKx8y.png`;

      await interaction.editReply({ content: `📄 Partnership text sent for <@${user.id}>.` });
      await interaction.channel.send({ 
        content: `<@${user.id}>\n\`\`\`\n${partnershipText}\n\`\`\``
      });
    } catch (error) {
      console.error('Error in /partnershiptext:', error);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: 'An error occurred while sending the partnership text.', ephemeral: true });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: 'An error occurred while sending the partnership text.' });
        }
      } catch (err) {}
    }
  }
};