const {
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ContainerBuilder,
    TextDisplayBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    SectionBuilder,
    SeparatorBuilder,
    ThumbnailBuilder,
    MessageFlags
} = require('discord.js');
const config = require('../config');

// Send Partnership panel
async function sendPanel(channel) {
    const container = new ContainerBuilder()
        .setAccentColor(0x9B59B6)
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('## 🤝 Partnership Request\n-# The Real Ops Group')
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder({ media: { url: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' } })
                )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                'If you would like to request a partnership with us\nthen please react with 📩 and fill out our request form'
            )
        )
        .addMediaGalleryComponents(
            new MediaGalleryBuilder()
                .addItems(
                    new MediaGalleryItemBuilder({ media: { url: 'https://i.postimg.cc/vZ6Z5Swh/partnership-2.png' } })
                )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addActionRowComponents(
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('partnership_button')
                        .setLabel('Discuss Partnership')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(config.emojis.partnership || '🤝')
                )
        );

    return await channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

// Create a modal for partnership requests
function createModal() {
    const modal = new ModalBuilder()
        .setCustomId('partnership_modal')
        .setTitle('Partnership Application');

    const discordNameInput = new TextInputBuilder()
        .setCustomId('discord_name')
        .setLabel('Your Discord name')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const vtcNameInput = new TextInputBuilder()
        .setCustomId('vtc_name')
        .setLabel('VTC Name')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const partnershipReasonInput = new TextInputBuilder()
        .setCustomId('partnership_reason')
        .setLabel('Why are you requesting a partnership with us?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    // Add inputs to rows
    modal.addComponents(
        new ActionRowBuilder().addComponents(discordNameInput),
        new ActionRowBuilder().addComponents(vtcNameInput),
        new ActionRowBuilder().addComponents(partnershipReasonInput)
    );

    return modal;
}

// Format submitted data into an embed
function createResponseEmbed(user, data, ticketId) {
    return new EmbedBuilder()
        .setTitle('Partnership Proposal')
        .setDescription(
            `**Your Discord Name**
\`${data.discordName}\`

**VTC Name**
\`${data.vtcName}\`

**Why are you requesting a partnership with us**
\`\`\`
${data.partnershipReason}
\`\`\`
`
        )
        .setColor('#9b59b6')
        .setFooter({
            text: `Ticket ID: ${ticketId}`,
            iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        })
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();
}

// Process the submitted data
function processSubmittedData(interaction) {
    return {
        discordName: interaction.fields.getTextInputValue('discord_name'),
        vtcName: interaction.fields.getTextInputValue('vtc_name'),
        partnershipReason: interaction.fields.getTextInputValue('partnership_reason'),
        submittedAt: new Date().toISOString()
    };
}

module.exports = {
    sendPanel,
    createModal,
    createResponseEmbed,
    processSubmittedData,
    ticketType: 'partnership',
    buttonId: 'partnership_button',
    modalId: 'partnership_modal'
};