const { Events } = require('discord.js');

// Replace these IDs with your actual notification role IDs!
const NOTI_ROLE_IDS = [
  '1353404794487967825',   // 🎉 Event notifications
  '1353404794487967825',  // 💖 Socials notifications
  '1357061305445384232',  // 🖥️ Streamer notifications
];

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('notireaction_')) return;

    if (!interaction.inGuild() || !interaction.member) {
      return await interaction.reply({ content: 'This can only be used in a server.', ephemeral: true });
    }

    const roleId = interaction.customId.replace('notireaction_', '');
    if (!NOTI_ROLE_IDS.includes(roleId)) {
      return await interaction.reply({ content: 'Invalid or missing notification role.', ephemeral: true });
    }

    const role = interaction.guild.roles.cache.get(roleId);
    if (!role) {
      return await interaction.reply({ content: 'Role not found!', ephemeral: true });
    }

    if (!role.editable) {
      return await interaction.reply({ content: 'I cannot manage this role.', ephemeral: true });
    }

    const member = interaction.member;
    let content;
    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId);
      content = `Role **${role.name}** removed!`;
    } else {
      await member.roles.add(roleId);
      content = `Role **${role.name}** assigned!`;
    }

    await interaction.reply({ content, ephemeral: true });
  }
};