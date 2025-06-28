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

// Send Support panel
async function sendPanel(channel) {
    const supportEmbed = new EmbedBuilder()
        .setAuthor({ name: 'The Real Ops Group', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' }) // replace with your actual logo URL
    .setTitle('🎫 Support / Enquiries')
    .setDescription(
        'If you would like more information regarding our services, then please feel free to speak with one of our Support staff who will be happy to answer your questions.\n\n' +
        'React with 🎫 to contact our support team.'
    )
    .setImage('https://i.postimg.cc/0NmPQwdt/support.png')
    .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
    .setColor('#ff0000') // Set a color for the embed
    .setFooter({ text: 'The Real Ops Group', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' }); // optional footer icon
    
    const supportRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('support_button')
                .setLabel('Get Support')
                .setStyle(ButtonStyle.Success)
                .setEmoji(config.emojis.support || '🎫')
        );
    
    return await channel.send({ embeds: [supportEmbed], components: [supportRow] });
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
<t:${Math.floor(Date.now()/1000)}:F>
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