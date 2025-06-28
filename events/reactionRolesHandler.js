const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      if (!interaction.isButton()) return;
      if (!interaction.customId.startsWith('reactionrole_')) return;

      if (!interaction.inGuild() || !interaction.member) {
        return await interaction.reply({ content: 'This can only be used in a server.', ephemeral: true });
      }

      const roleId = interaction.customId.replace('reactionrole_', '');
      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) return await interaction.reply({ content: 'Role not found!', ephemeral: true });

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
      // Always reply, and only once!
      await interaction.reply({ content, ephemeral: true });
    } catch (error) {
      console.error(error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'An error occurred, please try again.', ephemeral: true });
      }
    }
  }
};