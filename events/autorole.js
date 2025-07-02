const { Events } = require('discord.js');

// CONFIGURE THIS: Set the role ID you want to auto-assign
const AUTO_ROLE_ID = '1291120505763401759'; // Replace with your actual role ID

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        try {
            // Check if the role exists in the guild
            const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
            if (!role) {
                console.error(`AutoRole: Role with ID ${AUTO_ROLE_ID} not found in guild ${member.guild.name}`);
                return;
            }
            // Assign the role to the new member
            await member.roles.add(role);
            console.log(`AutoRole: Assigned role ${role.name} to ${member.user.tag}`);
        } catch (error) {
            console.error(`AutoRole: Failed to assign role to ${member.user.tag}:`, error);
        }
    }
};