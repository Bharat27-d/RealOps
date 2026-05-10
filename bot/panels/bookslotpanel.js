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

    const discordNameInput = new TextInputBuilder()
        .setCustomId('discord_name')
        .setLabel('Your Discord name')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const truckersmpIdInput = new TextInputBuilder()
        .setCustomId('truckersmp_id')
        .setLabel('TruckersMP ID')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('Enter your TruckersMP ID');

    const eventNameInput = new TextInputBuilder()
        .setCustomId('event_name')
        .setLabel('Which event are you booking for?')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('e.g., Anniversary Convoy');

    const additionalNotesInput = new TextInputBuilder()
        .setCustomId('additional_notes')
        .setLabel('Additional notes (optional)')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setPlaceholder('Any special requirements or questions?');

    // Add inputs to rows
    modal.addComponents(
        new ActionRowBuilder().addComponents(discordNameInput),
        new ActionRowBuilder().addComponents(truckersmpIdInput),
        new ActionRowBuilder().addComponents(eventNameInput),
        new ActionRowBuilder().addComponents(additionalNotesInput)
    );

    return modal;
}

// Format submitted data into an embed
function createResponseEmbed(user, data, ticketId) {
    return new EmbedBuilder()
        .setTitle('🎉 Slot Booking Request')
        .setDescription(
            `**Discord Name**
\`${data.discordName}\`

**TruckersMP ID**
\`${data.truckersmpId}\`

**Event Name**
\`${data.eventName}\`

${data.additionalNotes ? `**Additional Notes**
\`\`\`
${data.additionalNotes}
\`\`\`` : ''}

**Submitted At**
<t:${Math.floor(Date.now() / 1000)}:F>
`
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
        discordName: interaction.fields.getTextInputValue('discord_name'),
        truckersmpId: interaction.fields.getTextInputValue('truckersmp_id'),
        eventName: interaction.fields.getTextInputValue('event_name'),
        additionalNotes: interaction.fields.getTextInputValue('additional_notes') || 'None',
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
