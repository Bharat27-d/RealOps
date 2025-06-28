const { 
    ActionRowBuilder, 
    ButtonBuilder, 
    EmbedBuilder, 
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');
const config = require('../config');

// Send Partnership panel
async function sendPanel(channel) {
    const partnerEmbed = new EmbedBuilder()
        .setAuthor({ 
            name: 'The Real Ops Group', 
            iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' 
        })
        .setTitle('Partnership Request')
        .setDescription(
            'If you would like to request a partnership with us\n' +
            'then please react with 📩 and fill out our request form'
        )
        .setImage('https://i.postimg.cc/vZ6Z5Swh/partnership-2.png') // Replace with your actual partnership banner if different
        .setColor('#9b59b6')
        .setFooter({ 
            text: 'The Real Ops Group Tickets', 
            iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' 
        });
    
    const partnerRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('partnership_button')
                .setLabel('Discuss Partnership')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(config.emojis.partnership || '🤝')
        );
    
    return await channel.send({ embeds: [partnerEmbed], components: [partnerRow] });
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