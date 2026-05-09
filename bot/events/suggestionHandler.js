const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, PermissionFlagsBits } = require('discord.js');
const firebase = require('../firebase');
const config = require('../config');

// Helper to determine if a user has staff roles to approve suggestions
function isStaff(member) {
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  
  if (!config.staffRoles) return false;
  
  // Combine all array values from staffRoles object into one flat list
  const allStaffRoleIds = Object.values(config.staffRoles).flat();
  return allStaffRoleIds.some(roleId => member.roles.cache.has(roleId));
}

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('suggest_')) return;

    // Fast-fail if Firebase isn't configured, as we need it for state tracking
    if (!firebase || !firebase.collections || !firebase.collections.suggestions) {
      return interaction.reply({
        content: '❌ Suggestion database is currently offline. Please try again later.',
        flags: MessageFlags.Ephemeral
      });
    }

    const { customId, message, user, member } = interaction;
    const messageId = message.id;

    try {
      // Defer to buy time for Firebase operations
      await interaction.deferUpdate();

      // Retrieve suggestion document from DB
      const docRef = firebase.collections.suggestions.doc(messageId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return interaction.followUp({
          content: '❌ Could not find suggestion data in the database. It may be too old.',
          flags: MessageFlags.Ephemeral
        });
      }

      const suggestionData = docSnap.data();

      if (suggestionData.status !== 'active') {
        return interaction.followUp({
          content: '❌ This suggestion is no longer active for voting.',
          flags: MessageFlags.Ephemeral
        });
      }

      // Handle Upvote / Downvote logic
      if (customId === 'suggest_upvote' || customId === 'suggest_downvote') {
        const actionType = customId === 'suggest_upvote' ? 'up' : 'down';
        const voters = suggestionData.voters || {};
        const previousVote = voters[user.id];

        let upvotes = suggestionData.upvotes || 0;
        let downvotes = suggestionData.downvotes || 0;

        // If clicking the same button they already pressed, we REMOVE their vote
        if (previousVote === actionType) {
          if (actionType === 'up') upvotes = Math.max(0, upvotes - 1);
          else downvotes = Math.max(0, downvotes - 1);
          
          delete voters[user.id];
        } 
        // If changing their vote
        else if (previousVote && previousVote !== actionType) {
          if (actionType === 'up') {
            upvotes++;
            downvotes = Math.max(0, downvotes - 1);
          } else {
            downvotes++;
            upvotes = Math.max(0, upvotes - 1);
          }
          voters[user.id] = actionType;
        } 
        // If entirely new vote
        else {
          if (actionType === 'up') upvotes++;
          else downvotes++;
          voters[user.id] = actionType;
        }

        // Save new vote counts back to Firebase
        await docRef.update({
          upvotes,
          downvotes,
          voters
        });

        const authorUser = await interaction.client.users.fetch(suggestionData.authorId).catch(() => null);
        const avatarUrl = authorUser ? authorUser.displayAvatarURL({ dynamic: true, extension: 'png' }) : 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png';

        // Reconstruct container to reflect new numbers
        const { ContainerBuilder, TextDisplayBuilder, SectionBuilder, SeparatorBuilder, ThumbnailBuilder } = require('discord.js');
        const container = new ContainerBuilder()
          .setAccentColor(0xFFA500)
          .addSectionComponents(
            new SectionBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## 💡 New Suggestion\n**From:** <@${suggestionData.authorId}>\n\n>>> ${suggestionData.suggestionText}`)
              )
              .setThumbnailAccessory(
                new ThumbnailBuilder({ media: { url: avatarUrl } })
              )
          )
          .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**Status:** 📊 Voting Open  |  **Votes:** 👍 ${upvotes} • 👎 ${downvotes}`)
          )
          .addActionRowComponents(
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('suggest_upvote')
                .setLabel(`Upvote (${upvotes})`)
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅'),
              new ButtonBuilder()
                .setCustomId('suggest_downvote')
                .setLabel(`Downvote (${downvotes})`)
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌'),
              new ButtonBuilder()
                .setCustomId('suggest_approve')
                .setLabel('Approve')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🛡️')
            )
          );

        await message.edit({
          embeds: [], // Clear any old embeds
          components: [container],
          flags: MessageFlags.IsComponentsV2
        });

        return; // Finished voting interaction
      }

      // Handle Staff Approval logic
      if (customId === 'suggest_approve') {
        if (!isStaff(member)) {
          return interaction.followUp({
            content: '❌ Only staff members can approve suggestions.',
            flags: MessageFlags.Ephemeral
          });
        }

        const implementedChannelId = config.channels?.implementedFeatures;
        
        if (!implementedChannelId || implementedChannelId === 'PLACEHOLDER_IMPLEMENTED_FEATURES_ID') {
          return interaction.followUp({
            content: '❌ The Implemented Features channel has not been configured in the bot.',
            flags: MessageFlags.Ephemeral
          });
        }

        const implementedChannel = interaction.client.channels.cache.get(implementedChannelId);
        
        if (!implementedChannel) {
          return interaction.followUp({
            content: '❌ Cannot find the Implemented Features channel. Please check config.',
            flags: MessageFlags.Ephemeral
          });
        }

        // Mark as implemented in Firebase
        await docRef.update({
          status: 'implemented',
          implementedAt: new Date().toISOString(),
          implementedBy: user.id
        });

        const authorUserLocal = await interaction.client.users.fetch(suggestionData.authorId).catch(() => null);
        const avatarUrlLocal = authorUserLocal ? authorUserLocal.displayAvatarURL({ dynamic: true, extension: 'png' }) : 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png';

        const { ContainerBuilder, TextDisplayBuilder, SectionBuilder, SeparatorBuilder, ThumbnailBuilder } = require('discord.js');
        // Create the shiny implemented container
        const implementedContainer = new ContainerBuilder()
          .setAccentColor(0x00b894) // Success Green
          .addSectionComponents(
            new SectionBuilder()
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## 💡 Suggestion Implemented\n**From:** <@${suggestionData.authorId}>\n**Approved By:** <@${user.id}>\n\n>>> ${suggestionData.suggestionText}`)
              )
              .setThumbnailAccessory(
                new ThumbnailBuilder({ media: { url: avatarUrlLocal } })
              )
          )
          .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**Status:** 🎉 Implemented  |  **Final Votes:** 👍 ${suggestionData.upvotes || 0} • 👎 ${suggestionData.downvotes || 0}`)
          );

        // Try to DM the author
        try {
          const authorUser = await interaction.client.users.fetch(suggestionData.authorId);
          if (authorUser) {
            await authorUser.send({
              content: `🎉 Congratulations! Your suggestion has been approved and implemented by **${user.tag}**!`,
              components: [implementedContainer],
              flags: MessageFlags.IsComponentsV2
            });
          }
        } catch (err) {
          console.error(`Could not DM user ${suggestionData.authorId} about their suggestion.`);
        }

        // Post to implemented channel and remove from active
        await implementedChannel.send({ components: [implementedContainer], flags: MessageFlags.IsComponentsV2 });
        await message.delete();
        
        return interaction.followUp({
          content: '✅ Suggestion has been successfully marked as implemented and moved.',
          flags: MessageFlags.Ephemeral
        });
      }

    } catch (error) {
      console.error('Error in suggestion handler:', error);
      try {
        await interaction.followUp({
          content: '❌ An unexpected error occurred handling this suggestion. Please try again or contact an administrator.',
          flags: MessageFlags.Ephemeral
        });
      } catch (e) {}
    }
  }
};
