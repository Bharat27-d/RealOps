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

// Send HR Department panel
async function sendPanel(channel) {
    const container = new ContainerBuilder()
        .setAccentColor(0xE74C3C)
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('## 📋 The Real Ops Group')
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder({ media: { url: 'https://i.postimg.cc/fy4hqtjs/real-ops-group-logo.png' } })
                )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                'If you wish to report a member of staff or have a complaint then please click the button below to open a HR ticket'
            )
        )
        .addMediaGalleryComponents(
            new MediaGalleryBuilder()
                .addItems(
                    new MediaGalleryItemBuilder({ media: { url: 'https://i.ibb.co/0p9d3tCd/Z7vW5Or.png' } })
                )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addActionRowComponents(
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('hr_button')
                        .setLabel('Create ticket')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('📨')
                )
        );

    return await channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

// Create a modal for HR requests
function createModal() {
    const modal = new ModalBuilder()
        .setCustomId('hr_modal')
        .setTitle('HR Request Form');

    const discordNameInput = new TextInputBuilder()
        .setCustomId('discord_name')
        .setLabel('Your Discord name')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const reasonInput = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Reason for opening Ticket')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const detailsInput = new TextInputBuilder()
        .setCustomId('details')
        .setLabel('Full details of ticket opening and reason')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    // Add inputs to rows
    modal.addComponents(
        new ActionRowBuilder().addComponents(discordNameInput),
        new ActionRowBuilder().addComponents(reasonInput),
        new ActionRowBuilder().addComponents(detailsInput)
    );

    return modal;
}

// Process the submitted data
function processSubmittedData(interaction) {
    return {
        discordName: interaction.fields.getTextInputValue('discord_name'),
        reason: interaction.fields.getTextInputValue('reason'),
        details: interaction.fields.getTextInputValue('details'),
        submittedAt: new Date().toISOString()
    };
}

// Format submitted data into an embed
function createResponseEmbed(user, data, ticketId) {
    return new EmbedBuilder()
        .setTitle('HR Ticket')
        .setDescription(
            `**Your Discord Name**
\`${data.discordName}\`

**Reason**
\`${data.reason}\`

**Details**
\`\`\`
${data.details}
\`\`\`
`
        )
        .setColor('#E74C3C')
        .setFooter({
            text: `Ticket ID: ${ticketId}`,
            iconURL: 'https://i.postimg.cc/fy4hqtjs/real-ops-group-logo.png'
        })
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();
}

module.exports = {
    sendPanel,
    createModal,
    createResponseEmbed,
    processSubmittedData,
    ticketType: 'hr',
    buttonId: 'hr_button',
    modalId: 'hr_modal'
};