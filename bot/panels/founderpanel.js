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

// Send Founders Manager panel
async function sendPanel(channel) {
    const container = new ContainerBuilder()
        .setAccentColor(0xF1C40F)
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('## 👑 Founder / Management\n-# The Real Ops Group')
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder({ media: { url: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' } })
                )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                'To Contact the Founder / Management then please\nreact with 📩'
            )
        )
        .addMediaGalleryComponents(
            new MediaGalleryBuilder()
                .addItems(
                    new MediaGalleryItemBuilder({ media: { url: 'https://i.postimg.cc/2SLGZvjv/Z7vW5Or.png' } })
                )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addActionRowComponents(
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('founders_button')
                        .setLabel('Contact Founders')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji(config.emojis.founders || '👑')
                )
        );

    return await channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

// Create a modal for founders contact
function createModal() {
    const modal = new ModalBuilder()
        .setCustomId('founders_modal')
        .setTitle('Founders Contact Request');

    const discordNameInput = new TextInputBuilder()
        .setCustomId('discord_name')
        .setLabel('Your Discord name')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const inquiryDetailsInput = new TextInputBuilder()
        .setCustomId('inquiry_details')
        .setLabel('Full details of your inquiry')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);
    ~
        // Add inputs to rows
        modal.addComponents(
            new ActionRowBuilder().addComponents(discordNameInput),
            new ActionRowBuilder().addComponents(inquiryDetailsInput)
        );

    return modal;
}

// Format submitted data into an embed
function createResponseEmbed(user, data, ticketId) {
    return new EmbedBuilder()
        .setTitle('Founders Contact Request')
        .setDescription(`Inquiry submitted by <@${user.id}>`)
        .addFields(
            { name: 'Discord Name', value: data.discordName, inline: true },
            { name: 'Inquiry Details', value: data.inquiryDetails, inline: false },
            { name: 'Submitted At', value: new Date().toLocaleString(), inline: true }
        )
        .setColor('#f1c40f')
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
        inquiryDetails: interaction.fields.getTextInputValue('inquiry_details'),
        submittedAt: new Date().toISOString()
    };
}

module.exports = {
    sendPanel,
    createModal,
    createResponseEmbed,
    processSubmittedData,
    ticketType: 'founders',
    buttonId: 'founders_button',
    modalId: 'founders_modal'
};