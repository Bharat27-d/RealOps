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

// Send Founders Manager panel
async function sendPanel(channel) {
    const foundersEmbed = new EmbedBuilder()
        .setAuthor({ 
            name: 'The Real Ops Group', 
            iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' 
        })
        .setTitle('Founder / Management')
        .setDescription(
            'To Contact the Founder / Management then please\n' +
            'react with 📩'
        )
        .setImage('https://i.postimg.cc/2SLGZvjv/Z7vW5Or.png') // Replace with your actual banner if different
        .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        .setColor('#f1c40f')
        .setFooter({ 
            text: 'The Real Ops Group Tickets', 
            iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' 
        });

    
    const foundersRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('founders_button')
                .setLabel('Contact Founders')
                .setStyle(ButtonStyle.Primary)
                .setEmoji(config.emojis.founders || '👑')
        );
    
    return await channel.send({ embeds: [foundersEmbed], components: [foundersRow] });
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