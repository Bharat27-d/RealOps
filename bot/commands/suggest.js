const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  MessageFlags
} = require('discord.js');
const firebase = require('../firebase');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Submit a new feature idea or suggestion for the community.')
    .addStringOption(option =>
      option.setName('suggestion')
        .setDescription('Describe your suggestion in detail')
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const suggestionText = interaction.options.getString('suggestion');
      const author = interaction.user;

      let targetChannelId = config.channels?.activeSuggestions;
      if (!targetChannelId || targetChannelId === 'PLACEHOLDER_ACTIVE_SUGGESTIONS_ID') {
        return interaction.editReply({
          content: '❌ The suggestion system is currently disabled because the Active Suggestions channel is not configured.'
        });
      }

      const targetChannel = interaction.client.channels.cache.get(targetChannelId);
      if (!targetChannel) {
        return interaction.editReply({
          content: '❌ Could not find the active suggestions channel. Please contact an admin.'
        });
      }

      const container = new ContainerBuilder()
        .setAccentColor(0xFFA500)
        .addSectionComponents(
          new SectionBuilder()
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`## 💡 New Suggestion\n**From:** <@${author.id}>\n\n>>> ${suggestionText}`)
            )
            .setThumbnailAccessory(
              new ThumbnailBuilder({ media: { url: author.displayAvatarURL({ dynamic: true, extension: 'png' }) } })
            )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`**Status:** 📊 Voting Open  |  **Votes:** 👍 0 • 👎 0`)
        )
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('suggest_upvote')
              .setLabel('Upvote (0)')
              .setStyle(ButtonStyle.Success)
              .setEmoji('✅'),
            new ButtonBuilder()
              .setCustomId('suggest_downvote')
              .setLabel('Downvote (0)')
              .setStyle(ButtonStyle.Danger)
              .setEmoji('❌'),
            new ButtonBuilder()
              .setCustomId('suggest_approve')
              .setLabel('Approve')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('🛡️')
          )
        );

      const suggestionMessage = await targetChannel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2
      });

      // Save initial metadata to Firebase
      if (firebase && firebase.collections && firebase.collections.suggestions) {
        await firebase.collections.suggestions.doc(suggestionMessage.id).set({
          messageId: suggestionMessage.id,
          authorId: author.id,
          authorTag: author.tag,
          suggestionText: suggestionText,
          upvotes: 0,
          downvotes: 0,
          voters: {}, // Map of userId -> "up" | "down"
          status: 'active',
          createdAt: new Date().toISOString()
        });
      }

      await interaction.editReply({
        content: `✅ Your suggestion has been successfully posted in <#${targetChannelId}> for voting!`
      });

    } catch (error) {
      console.error('Error executing /suggest:', error);
      if (interaction.deferred && !interaction.replied) {
        await interaction.editReply({ content: '❌ An error occurred while submitting your suggestion.' });
      } else if (!interaction.replied) {
        await interaction.reply({ content: '❌ An error occurred while submitting your suggestion.', flags: 64 });
      }
    }
  }
};
