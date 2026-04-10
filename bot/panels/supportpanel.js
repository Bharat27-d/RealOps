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

// Send Support panel
async function sendPanel(channel) {
    const container = new ContainerBuilder()
        .setAccentColor(0xFF0000)
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('## 🎫 Support / Enquiries\n-# The Real Ops Group')
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder({ media: { url: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' } })
                )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                'If you would like more information regarding our services, then please feel free to speak with one of our Support staff who will be happy to answer your questions.\n\nReact with 🎫 to contact our support team.'
            )
        )
        .addMediaGalleryComponents(
            new MediaGalleryBuilder()
                .addItems(
                    new MediaGalleryItemBuilder({ media: { url: 'https://i.postimg.cc/0NmPQwdt/support.png' } })
                )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addActionRowComponents(
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('support_button')
                        .setLabel('Get Support')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji(config.emojis.support || '🎫')
                )
        );

    return await channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

// Create a modal for support requests
function createModal() {
    const modal = new ModalBuilder()
        .setCustomId('support_modal')
        .setTitle('Support Request Form');

    const discordNameInput = new TextInputBuilder()
        .setCustomId('discord_name')
        .setLabel('Your Discord name')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const helpDescriptionInput = new TextInputBuilder()
        .setCustomId('help_description')
        .setLabel('How can we help you?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    // Add inputs to rows
    modal.addComponents(
        new ActionRowBuilder().addComponents(discordNameInput),
        new ActionRowBuilder().addComponents(helpDescriptionInput)
    );

    return modal;
}

// Format submitted data into an embed
function createResponseEmbed(user, data, ticketId) {
    return new EmbedBuilder()
        .setTitle('Support Request')
        .setDescription(
            `**What is your Discord name?**
\`${data.discordName}\`

**How can we help you?**
\`\`\`
${data.helpDescription}
\`\`\`

**Submitted At**
<t:${Math.floor(Date.now() / 1000)}:F>
`
        )
        .setColor('#2ecc71')
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
        helpDescription: interaction.fields.getTextInputValue('help_description'),
        submittedAt: new Date().toISOString()
    };
}

module.exports = {
    sendPanel,
    createModal,
    createResponseEmbed,
    processSubmittedData,
    ticketType: 'support',
    buttonId: 'support_button',
    modalId: 'support_modal'
};