require('dotenv').config();

module.exports = {
    // Discord credentials
    BOT_TOKEN: process.env.BOT_TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    GUILD_ID: process.env.GUILD_ID,

    // Staff roles that can see and manage tickets
    staffRoles: {
        admin: [''],
        moderator: ['1292218198028058674', '1300518058749853716'],
        support: ['1291394387888177193'],
        partnership: ['1300834129780150272'],
        founders: ['1291116832308068448', '1291139504786378823'],
        hr: ['1292896422949163120'],
        bookings: ['1292218198028058674', '1300518058749853716']
    },

    // Ticket panel category IDs
    ticketCategories: {
        joinTeam: '1292866127549956107',
        bookUs: '1292859420333707294',
        support: '1292866493473886238',
        partnership: '1300843282611306590',
        founders: '1292867254765092978',
        hr: '1292867139593834597'
    },

    // Channel configuration
    logChannel: '1291495743277895751',
    transcriptChannel: '1291495743277895751',
    WELCOME_CHANNEL_ID: '1374056199518945462',
    STAFF_CHANGES_CHANNEL_ID: '1292927159958114336',
    STAFF_AVAILABILITY_CHANNEL_ID: '1291128212079771880', // Channel for staff availability checks

    channels: {
        staffOpenings: '1291739954791059527',
        activeSuggestions: '1361402427517047008',
        implementedFeatures: '1361402427517047008'
    },

    // Emoji configuration
    emojis: {
        joinTeam: '👥',
        bookUs: '📅',
        support: '🎫',
        partnership: '🤝',
        founders: '👑',
        hr: '📋',
        close: '🔒',
        delete: '🗑️'
    },

    // Role IDs used across the bot
    ROLES: {
        JNR_PLANNER: '1345496957082406972',
        DEVELOPER: '1386691716945543240',
        PM: '1291144543630262292',
        PMM: '1300834129780150272',
        EM: '1291121579207692430',
        MM: '1296422181806542898',
        HRD: '1292896422949163120',
        DM: '1291123331591831632',
        SSM: '1344406747955200081',
        SS: '1291394387888177193',
        ES: '1291122540864864348',
        PL: '1291818052744253612',
        M: '1296423697711894528',
        STAFF: '1291122795190812774'
    }
};
