    const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getOverride } = require('../commandConfig');

// Static default description for dashboard editing
const DEFAULT_DESCRIPTION = `📅 **Our Availability 2025/2026**

Our team is available for events throughout the year. Below you'll find our general availability and booking information.

**Availability Period:**
- January 2025 - December 2026

**Booking Requirements:**
- Minimum 48 hours notice
- Event details must be provided in advance
- Staff assignment based on availability

**Contact:**
- Open a ticket in the appropriate channel
- Include event date, time, and requirements
- We'll confirm staff availability within 24 hours

**Policies:**
- Cancellations require 24 hours notice
- Multiple bookings may have limited availability
- Special requests subject to approval`;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('availability')
    .setDescription('Show the current Real Ops Group event availability for 2025/2026.'),
  async execute(interaction) {
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.deferReply();
      }

      const embed = new EmbedBuilder()
        .setTitle(getOverride('availability', 'title', 'Our Availability 2025/2026'))
        .setDescription(getOverride('availability', 'description', DEFAULT_DESCRIPTION))
        .setImage(getOverride('availability', 'image', 'https://i.imgur.com/ZCRiwr6.png'))
        .setColor(getOverride('availability', 'color', '#ff0000'))
        .setFooter({
          text: getOverride('availability', 'footerText', 'The Real Ops Group'),
          iconURL: getOverride('availability', 'footerIcon', 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in /availability:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'An error occurred while displaying the availability.', flags: 64 });
      } else if (interaction.deferred && !interaction.replied) {
        await interaction.editReply({ content: 'An error occurred while displaying the availability.' });
      }
    }
  }
};
