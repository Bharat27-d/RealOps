const { Events } = require('discord.js');
const config = require('../config');

// Priority array (highest to lowest)
const ROLE_PRIORITY = [
    config.ROLES.PM,
    config.ROLES.PMM,
    config.ROLES.EM,
    config.ROLES.MM,
    config.ROLES.M,            // <- ADDED: Media Team
    config.ROLES.HRD,
    config.ROLES.DM,
    config.ROLES.SSM,
    config.ROLES.SS,
    config.ROLES.ES,
    config.ROLES.PL,
    config.ROLES.JNR_PLANNER,
    config.ROLES.STAFF
];

// Map of role IDs to nickname prefixes
const ROLE_NICK_PREFIXES = {
    [config.ROLES.PM]: "Project Manager |",
    [config.ROLES.PMM]: "Partnership Manager |",
    [config.ROLES.EM]: "Event Manager |",
    [config.ROLES.MM]: "Media Manager |",
    [config.ROLES.M]: "Media |",   // <- ADDED: Media Team prefix
    [config.ROLES.HRD]: "HR Department |",
    [config.ROLES.DM]: "Discord Moderator |",
    [config.ROLES.SSM]: "Social Media Manager |",
    [config.ROLES.SS]: "Support Staff |",
    [config.ROLES.ES]: "Event Supervisor |",
    [config.ROLES.PL]: "Planner Team |",
    [config.ROLES.JNR_PLANNER]: "Jnr Planner |",
    [config.ROLES.STAFF]: "RealOps Staff |"
};

const STAFF_ROLE_IDS = Object.values(config.ROLES);

function getHighestPriorityStaffRole(roleIds) {
    for (const id of ROLE_PRIORITY) {
        if (roleIds.has(id)) return id;
    }
    return null;
}

// Helper: Check if a nickname starts with any staff prefix
function isStaffBotNickname(nick) {
    if (!nick) return true; // If no nickname, treat as replaceable
    return Object.values(ROLE_NICK_PREFIXES).some(prefix => nick.startsWith(prefix));
}

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        if (newMember.user?.bot) return;

        // Get sets of staff roles before and after the update
        const oldStaffRoles = new Set(
            oldMember.roles.cache.filter(r => STAFF_ROLE_IDS.includes(r.id)).map(r => r.id)
        );
        const newStaffRoles = new Set(
            newMember.roles.cache.filter(r => STAFF_ROLE_IDS.includes(r.id)).map(r => r.id)
        );

        // If the set of staff roles didn't change, do nothing
        const oldRolesArr = Array.from(oldStaffRoles).sort();
        const newRolesArr = Array.from(newStaffRoles).sort();
        const rolesChanged = oldRolesArr.length !== newRolesArr.length ||
            oldRolesArr.some((role, i) => role !== newRolesArr[i]);
        if (!rolesChanged) return;

        // If the member has no staff roles now, reset nickname only if it was a bot-set staff nickname
        if (newStaffRoles.size === 0) {
            if (isStaffBotNickname(newMember.nickname)) {
                try {
                    await newMember.setNickname(null);
                } catch (err) {
                    console.error(`Could not reset nickname for ${newMember.user.tag}:`, err);
                }
            }
            return;
        }

        // Otherwise, set nickname for the highest priority staff role only if the old nickname was bot-set or missing
        const topRoleId = getHighestPriorityStaffRole(newStaffRoles);
        if (topRoleId && ROLE_NICK_PREFIXES[topRoleId]) {
            const prefix = ROLE_NICK_PREFIXES[topRoleId];
            const desiredNickname = `${prefix} ${newMember.user.username}`;
            if (isStaffBotNickname(newMember.nickname) && newMember.nickname !== desiredNickname) {
                try {
                    await newMember.setNickname(desiredNickname);
                } catch (err) {
                    console.error(`Could not change nickname for ${newMember.user.tag}:`, err);
                }
            }
        }
    }
};