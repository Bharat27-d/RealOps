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

// Send HR Department panel
async function sendPanel(channel) {
    const hrEmbed = new EmbedBuilder()
        .setTitle('📋 The Real Ops Group')
        .setDescription('If you wish to report a member of staff or have a complaint then please click the button below to open a HR ticket')
        .setColor('#E74C3C')
        .setImage('https://i.ibb.co/0p9d3tCd/Z7vW5Or.png') // Replace with your contact image URL
        .setFooter({ 
            text: 'The Real Ops Group',
            iconURL: 'https://i.postimg.cc/fy4hqtjs/real-ops-group-logo.png'
        });
    
    const hrRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('hr_button')
                .setLabel('Create ticket')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📨')
        );
    
    return await channel.send({ embeds: [hrEmbed], components: [hrRow] });
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