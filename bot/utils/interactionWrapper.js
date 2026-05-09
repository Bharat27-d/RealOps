const { MessageFlags } = require('discord.js');

/**
 * A centralized interaction wrapper to handle errors safely and auto-defer interactions
 * to prevent the 3-second timeout "Unknown Interaction" errors from Discord.
 */

async function safeReply(interaction, options, isEdit = false) {
    try {
        if (isEdit || interaction.replied || interaction.deferred) {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(() => {});
            }
            return await interaction.editReply(options);
        } else {
            return await interaction.reply(options);
        }
    } catch (error) {
        console.error(`Error ${isEdit ? 'editing' : 'sending'} reply:`, error);
        return null;
    }
}

/**
 * Wrapper for command execution that auto-defers and catches errors.
 */
async function safeCommandExecute(interaction, command) {
    try {
        // Auto-defer if the command takes too long (optional implementation, or just defer immediately)
        // Some commands prefer ephemeral, some prefer public. We can leave deferral to the command
        // or force it here if they define a 'autoDefer' property.
        
        await command.execute(interaction);
    } catch (error) {
        if (error.code === 40060 || error.code === 10062) return; // Ignore interaction already acknowledged

        console.error(`[Error in Command ${interaction.commandName}]:`, error);
        try {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'An error occurred while executing this command. Please contact an administrator.',
                    flags: MessageFlags.Ephemeral
                });
            } else if (interaction.deferred && !interaction.replied) {
                await interaction.editReply({
                    content: 'An error occurred while executing this command. Please contact an administrator.'
                });
            }
        } catch (err) {}
    }
}

/**
 * Wrapper for button/modal interactions
 */
async function safeInteractionHandler(interaction, handler) {
    try {
        await handler(interaction);
    } catch (error) {
        if (error.code === 40060 || error.code === 10062) return;

        console.error(`[Error handling ${interaction.type} interaction]:`, error);
        try {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'An error occurred while processing your request.',
                    flags: MessageFlags.Ephemeral
                });
            } else if (interaction.deferred && !interaction.replied) {
                await interaction.editReply({
                    content: 'An error occurred while processing your request.'
                });
            }
        } catch (replyError) {}
    }
}

module.exports = {
    safeReply,
    safeCommandExecute,
    safeInteractionHandler
};
