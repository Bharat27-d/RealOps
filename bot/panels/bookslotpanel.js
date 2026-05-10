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

// Send Book Slot panel
async function sendPanel(channel) {
    const container = new ContainerBuilder()
        .setAccentColor(0xFFD700)
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('## 🎉 Book Your Slot\n-# The Real Ops Group')
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder({ media: { url: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' } })
                )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                'Book your slot for our special event!\n\nClick the button below to reserve your spot and join us for an amazing experience.\n\n📅 Limited slots available - First come, first served!'
            )
        )
        .addMediaGalleryComponents(
            new MediaGalleryBuilder()
                .addItems(
                    new MediaGalleryItemBuilder({ media: { url: 'https://i.postimg.cc/VLHsv1MV/Book-us.png' } })
                )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addActionRowComponents(
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('bookslot_button')
                        .setLabel('Book Slot')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🎉')
                )
        );

    return await channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

// Create a modal for slot booking
function createModal() {
    const modal = new ModalBuilder()
        .setCustomId('bookslot_modal')
        .setTitle('Book Your Slot');

    const nameInput = new TextInputBuilder()
        .setCustomId('name_input')
        .setLabel('Name')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const vtcInfoInput = new TextInputBuilder()
        .setCustomId('vtc_info')
        .setLabel('VTC Name, Position')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('e.g., RealOps VTC, Driver');

    const slotNoInput = new TextInputBuilder()
        .setCustomId('slot_no')
        .setLabel('Slot No.')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('e.g., Slot 4');

    // Add inputs to rows
    modal.addComponents(
        new ActionRowBuilder().addComponents(nameInput),
        new ActionRowBuilder().addComponents(vtcInfoInput),
        new ActionRowBuilder().addComponents(slotNoInput)
    );

    return modal;
}

// Format submitted data into an embed
function createResponseEmbed(user, data, ticketId) {
    return new EmbedBuilder()
        .setTitle('🎉 Slot Booking Request')
        .setDescription(
            `**Name**
\`${data.name}\`

**VTC Name, Position**
\`${data.vtcInfo}\`

**Slot No.**
\`${data.slotNo}\`

**Discord Username:** ${user.tag}
**Discord ID:** ${user.id}
**Submitted At:** <t:${Math.floor(Date.now() / 1000)}:F>`
        )
        .setColor('#FFD700')
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
        name: interaction.fields.getTextInputValue('name_input'),
        vtcInfo: interaction.fields.getTextInputValue('vtc_info'),
        slotNo: interaction.fields.getTextInputValue('slot_no'),
        submittedAt: new Date().toISOString()
    };
}

module.exports = {
    sendPanel,
    createModal,
    createResponseEmbed,
    processSubmittedData,
    ticketType: 'bookSlot',
    buttonId: 'bookslot_button',
    modalId: 'bookslot_modal'
};
