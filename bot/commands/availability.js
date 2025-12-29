    const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

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
        .setTitle('Our Availability 2025/2026')
        .setDescription(
`**Key:**  
🟢 Available  
🟠 Limited Availability  
🔴 Sorry Fully Booked

---

**2025**  
June: 🔴 Fully Booked (partner slots only)  
July: 🔴 Fully Booked (partner slots only)  
August: 🔴 Fully Booked (partner slots only)  
September: 🔴 Fully Booked (partner slots only)  
October: 🔴 Fully Booked (partner slots only)  
November: 🔴 Fully Booked (partner slots only)  
December: 🟢 (Sorry no bookings between 23/12/2025 & 02/01/2026)

---

**2026**  
January: 🟢 Available  
February: 🟢 Available  
March: 🟢 Available  
April: 🟢 Available  
May: 🟢 Available

---

**Please Note:** Only our Partners can book us for more than 4 months in advance (except special events).

**Partnership Availability**  
Media Group Partnerships now open.
`
        )
        .setImage('https://i.imgur.com/ZCRiwr6.png')
        .setColor('#ff0000')
        .setFooter({
          text: 'The Real Ops Group',
          iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
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
