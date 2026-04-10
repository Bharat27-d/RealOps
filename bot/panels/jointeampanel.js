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

// Send Join the Team panel
async function sendPanel(channel) {
    // Get the proper channel ID for staff openings
    const staffOpeningsId = config.channels?.staffOpenings || '1291739954791059527';

    const container = new ContainerBuilder()
        .setAccentColor(0xE74C3C)
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('## 🚀 The Real Ops Group')
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder({ media: { url: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' } })
                )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**Join Our Team**\n\nYou can find all available positions in <#${staffOpeningsId}>\nPlease react with 📨\nTo fill out the application form`
            )
        )
        .addMediaGalleryComponents(
            new MediaGalleryBuilder()
                .addItems(
                    new MediaGalleryItemBuilder({ media: { url: 'https://i.postimg.cc/5N4fhvW9/Join-team.png' } })
                )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addActionRowComponents(
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('join_team_button')
                        .setLabel('Join the Team')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('📨')
                )
        );

    return await channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

// Create a modal for join team application
function createModal() {
    const modal = new ModalBuilder()
        .setCustomId('join_team_modal')
        .setTitle('Please fill out this application form');

    const positionInput = new TextInputBuilder()
        .setCustomId('position_input')
        .setLabel('What Position Are You Applying For?')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(100);

    const truckermpIdInput = new TextInputBuilder()
        .setCustomId('truckermp_id_input')
        .setLabel('Your TruckerMP ID')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(20)
        .setPlaceholder('e.g., 12345678');

    const experienceInput = new TextInputBuilder()
        .setCustomId('experience_input')
        .setLabel('What Experience Do You Have For This Role?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(4000);

    const whyChooseInput = new TextInputBuilder()
        .setCustomId('why_choose_input')
        .setLabel('Why Do You Think We Should Choose You?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(500);

    const timeInput = new TextInputBuilder()
        .setCustomId('time_input')
        .setLabel('How Much Time Can You Dedicate To This Role?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(200);

    // Add inputs to rows
    modal.addComponents(
        new ActionRowBuilder().addComponents(positionInput),
        new ActionRowBuilder().addComponents(truckermpIdInput),
        new ActionRowBuilder().addComponents(experienceInput),
        new ActionRowBuilder().addComponents(whyChooseInput),
        new ActionRowBuilder().addComponents(timeInput)
    );

    return modal;
}

// Get Unix timestamp (in seconds)
function getUnixTimestamp() {
    return Math.floor(Date.now() / 1000);
}

// Format date to UTC YYYY-MM-DD HH:MM:SS (for data storage and logging)
function formatDateUTC(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Format submitted data into an embed
function createResponseEmbed(user, data, ticketId) {
    // Get Unix timestamp for Discord timestamp
    const timestamp = getUnixTimestamp();

    // Create the description with questions as headers, answers in code blocks, and Discord timestamp
    const description = [
        `Application submitted by <@${user.id}>`,
        '',
        '**What position are you applying for ?**',
        '```',
        data.position,
        '```',
        '',
        '**Your TruckerMP ID**',
        '```',
        data.truckermpId,
        '```',
        '',
        '**What experiance do you have for this role ?**',
        '```',
        data.experience,
        '```',
        '',
        '**Why do you think we should choose you ?**',
        '```',
        data.whyChoose,
        '```',
        '',
        '**How much time can you dedicate to this role ?**',
        '```',
        data.timeCommitment,
        '```',
        '',
        `**Discord Username:** ${user.tag}`,
        `**Discord ID:** ${user.id}`,
        `**Submitted At:** <t:${timestamp}:F>` // Discord timestamp that shows in user's local time
    ].join('\n');

    return new EmbedBuilder()
        .setTitle('Team Application')
        .setDescription(description)
        .setColor('#3498db')
        .setFooter({
            text: `Application ID: ${ticketId}`,
            iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        })
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();
}

// Process the submitted data
function processSubmittedData(interaction) {
    return {
        position: interaction.fields.getTextInputValue('position_input'),
        truckermpId: interaction.fields.getTextInputValue('truckermp_id_input'),
        experience: interaction.fields.getTextInputValue('experience_input'),
        whyChoose: interaction.fields.getTextInputValue('why_choose_input'),
        timeCommitment: interaction.fields.getTextInputValue('time_input'),
        submittedAt: formatDateUTC(new Date()),
        timestamp: getUnixTimestamp()
    };
}

module.exports = {
    sendPanel,
    createModal,
    createResponseEmbed,
    processSubmittedData,
    ticketType: 'joinTeam',
    buttonId: 'join_team_button',
    modalId: 'join_team_modal'
};