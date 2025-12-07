const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staffopening')
    .setDescription('Show staff openings and recruitment information'),
  async execute(interaction) {
    try {
      const embed = new EmbedBuilder()
        .setTitle('The Real-Ops Group Recruitment')
        .setDescription(
`**Staff openings**

Thank you for your interest in joining our team, you will find all available positions below.  
Good luck.

**Planner** 🟢  
**Jnr Planner** 🟢  
**Real-Ops Staff** 🟢  
**Media Team** 🟢  

If you would like to join the team then please open a ticket in <#join-the-team> and good luck 🤞`
        )
        .setImage('https://i.imgur.com/GUywUAQ.png')
        .setColor('#00b894')
        .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        .setFooter({
          text: 'The Real Ops Group',
          iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in /planning2:', error);
      // Defensive: only reply if not already replied/deferred
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'An error occurred while displaying the staff openings.', flags: 64 });
      } else if (interaction.deferred && !interaction.replied) {
        await interaction.editReply({ content: 'An error occurred while displaying the staff openings.' });
      }
    }
  }
};
