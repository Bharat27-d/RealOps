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
const axios = require('axios'); // Use axios instead of fetch for better compatibility

// Send Book Us panel
async function sendPanel(channel) {
    const container = new ContainerBuilder()
        .setAccentColor(0xC79A20)
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('## 📩 Real Ops Request\n-# The Real Ops Group')
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder({ media: { url: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' } })
                )
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                'If you would like to book us for your event then please be sure to read the Terms & Conditions above and check our availability in <#' + (config.channels?.availability || '1303770457513787412') + '> | our-availability before opening a ticket\nTo request our services react with 📩'
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
                        .setCustomId('bookus_button')
                        .setLabel('Book Us')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('📩')
                )
        );

    return await channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 });
}

// Create a modal for booking requests
function createModal() {
    const modal = new ModalBuilder()
        .setCustomId('bookus_modal')
        .setTitle('Book Us Form');

    const discordNameInput = new TextInputBuilder()
        .setCustomId('discord_name')
        .setLabel('Your Discord name')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const roleInput = new TextInputBuilder()
        .setCustomId('vtc_role')
        .setLabel('Your role within VTC?')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const eventLinkInput = new TextInputBuilder()
        .setCustomId('event_link')
        .setLabel('TruckerMP event link')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setPlaceholder('https://truckersmp.com/events/12345');

    // Add inputs to rows
    modal.addComponents(
        new ActionRowBuilder().addComponents(discordNameInput),
        new ActionRowBuilder().addComponents(roleInput),
        new ActionRowBuilder().addComponents(eventLinkInput)
    );

    return modal;
}

// Get Unix timestamp (in seconds)
function getUnixTimestamp() {
    return Math.floor(Date.now() / 1000);
}

// Convert UTC date string to Unix timestamp
function dateStringToUnixTimestamp(dateString) {
    try {
        const date = new Date(dateString);
        return Math.floor(date.getTime() / 1000);
    } catch (error) {
        console.error('Error converting date string to timestamp:', error);
        return null;
    }
}

// Extract event ID from TruckerMP event link
function extractEventId(eventLink) {
    if (!eventLink || typeof eventLink !== 'string') {
        console.log('Invalid event link provided');
        return null;
    }
    try {
        const patterns = [
            /truckersmp\.com\/events\/(\d+)/i,
            /truckersmp\.com\/en\/events\/(\d+)/i,
            /truckersmp\.com\/[a-z]{2}\/events\/(\d+)/i,
        ];
        for (const pattern of patterns) {
            const match = eventLink.match(pattern);
            if (match && match[1]) return match[1];
        }
        const numericMatch = eventLink.match(/(\d+)/);
        if (numericMatch && numericMatch[1]) return numericMatch[1];
        console.log('No event ID found in link:', eventLink);
        return null;
    } catch (error) {
        console.error('Error extracting event ID:', error);
        return null;
    }
}

// NEW: Fetch meetup/start times from TruckerMP API for a given event link
async function getEventTimeInfo(eventLink) {
    const eventId = extractEventId(eventLink);
    if (!eventId) return null;
    try {
        const response = await axios.get(`https://api.truckersmp.com/v2/events/${eventId}`);
        const apiData = response.data;
        if (!apiData?.response) return null;
        const event = apiData.response;
        const meetup_at = event.meetup_at || null;
        const start_at = event.start_at || null;
        const meetupTs = meetup_at ? dateStringToUnixTimestamp(meetup_at) : null;
        const startTs = start_at ? dateStringToUnixTimestamp(start_at) : null;
        return { eventId, meetup_at, start_at, meetupTs, startTs };
    } catch (err) {
        console.error('Error fetching event time info:', err?.message || err);
        return null;
    }
}

// Format submitted data into an embed
function createResponseEmbed(user, data, ticketId) {
    const timestamp = getUnixTimestamp();
    const descriptionParts = [
        `Request submitted by <@${user.id}>`,
        '',
        '**Your Discord name**',
        '```',
        data.discordName || 'Not provided',
        '```',
        '',
        '**Your role within VTC?**',
        '```',
        data.vtcRole || 'Not provided',
        '```',
        '',
        '**TruckerMP event link**',
        '```',
        data.eventLink || 'Not provided',
        '```'
    ];

    // Include event date info if present (fetched earlier in the flow)
    if (data.eventStartAt || data.eventMeetupAt) {
        if (data.eventStartAt && data.eventStartTs) {
            descriptionParts.push('', '**Start Time**', '```', `${data.eventStartAt}`, '```', `<t:${data.eventStartTs}:F> (<t:${data.eventStartTs}:R>)`);
        }
        if (data.eventMeetupAt && data.eventMeetupTs) {
            descriptionParts.push('', '**Meetup Time**', '```', `${data.eventMeetupAt}`, '```', `<t:${data.eventMeetupTs}:F> (<t:${data.eventMeetupTs}:R>)`);
        }
    }

    descriptionParts.push(
        '',
        `**Discord Username:** ${user.tag}`,
        `**Discord ID:** ${user.id}`,
        `**Submitted At:** <t:${timestamp}:F>`
    );

    return new EmbedBuilder()
        .setTitle('Book Us Request')
        .setDescription(descriptionParts.join('\n'))
        .setColor('#e74c3c')
        .setFooter({
            text: `Ticket ID: ${ticketId}`,
            iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        })
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();
}

// Process the submitted data
function processSubmittedData(interaction) {
    const timestamp = getUnixTimestamp();
    try {
        const discordName = interaction.fields.getTextInputValue('discord_name') || '';
        const vtcRole = interaction.fields.getTextInputValue('vtc_role') || '';
        const eventLink = interaction.fields.getTextInputValue('event_link') || '';
        const eventId = extractEventId(eventLink);
        return {
            discordName,
            vtcRole,
            eventLink,
            eventId,
            submittedAt: new Date().toISOString(),
            timestamp
        };
    } catch (error) {
        console.error('Error processing submitted data:', error);
        return {
            discordName: 'Error retrieving data',
            vtcRole: 'Error retrieving data',
            eventLink: 'Error retrieving data',
            submittedAt: new Date().toISOString(),
            timestamp
        };
    }
}

async function sendEventDetails(channel, eventData, user) {
    try {
        let eventId = eventData.eventId;
        if (!eventId && eventData.eventLink) {
            eventId = extractEventId(eventData.eventLink);
        }
        if (!eventId) {
            await channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Event Details')
                        .setDescription('No valid event ID could be found in the provided link.')
                        .setColor('#e67e22')
                ]
            });
            return;
        }
        const response = await axios.get(`https://api.truckersmp.com/v2/events/${eventId}`);
        const apiData = response.data;
        if (!apiData.response) {
            await channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('Event Details')
                        .setDescription('Invalid response from TruckerMP API')
                        .setColor('#e74c3c')
                ]
            });
            return;
        }
        const event = apiData.response;

        const eventEmbed = new EmbedBuilder()
            .setTitle(`📅 TruckerMP Event Details`)
            .setColor('#3498db')
            .addFields(
                { name: 'Event Name', value: event.name || 'Unnamed Event', inline: false },
                { name: 'Server', value: event.server?.name || 'N/A', inline: true },
                { name: 'Game', value: event.game || 'Unknown', inline: true }
            );

        if (event.departure?.city) {
            eventEmbed.addFields({ name: 'Departure City', value: event.departure.city, inline: true });
        }
        if (event.arrive?.city) {
            eventEmbed.addFields({ name: 'Arrival City', value: event.arrive.city, inline: true });
        }

        if (event.meetup_at) {
            const meetupTimestamp = dateStringToUnixTimestamp(event.meetup_at);
            if (meetupTimestamp) {
                eventEmbed.addFields({
                    name: 'Meetup Time',
                    value: `<t:${meetupTimestamp}:F> (<t:${meetupTimestamp}:R>)`,
                    inline: false
                });
            } else {
                eventEmbed.addFields({ name: 'Meetup Time (UTC)', value: `\`${event.meetup_at}\``, inline: false });
            }
        }

        if (event.start_at) {
            const startTimestamp = dateStringToUnixTimestamp(event.start_at);
            if (startTimestamp) {
                eventEmbed.addFields({
                    name: 'Start Time',
                    value: `<t:${startTimestamp}:F> (<t:${startTimestamp}:R>)`,
                    inline: false
                });
            } else {
                eventEmbed.addFields({ name: 'Start Time (UTC)', value: `\`${event.start_at}\``, inline: false });
            }
        }

        eventEmbed.addFields({
            name: 'Event Link',
            value: `[View on TruckerMP](https://truckersmp.com/events/${eventId})`,
            inline: false
        });

        const bannerEmbed = new EmbedBuilder()
            .setTitle('📢 Event Banner')
            .setColor('#2ecc71')
            .setImage(event.banner || 'https://via.placeholder.com/800x200?text=No+Banner+Available');

        const mapEmbed = new EmbedBuilder()
            .setTitle('🗺️ Event Map')
            .setColor('#e67e22')
            .setImage(event.map || 'https://via.placeholder.com/800x200?text=No+Map+Available');

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('event_accept')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('event_decline')
                    .setLabel('Decline')
                    .setStyle(ButtonStyle.Danger)
            );

        await channel.send({ embeds: [eventEmbed, bannerEmbed] });
        await channel.send({ embeds: [mapEmbed], components: [actionRow] });

    } catch (error) {
        console.error('Error processing event details:', error);
        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Event Details')
                    .setDescription(`An error occurred while retrieving event details: ${error.message}`)
                    .setColor('#e74c3c')
            ]
        });
    }
}

module.exports = {
    sendPanel,
    createModal,
    createResponseEmbed,
    processSubmittedData,
    sendEventDetails,
    getEventTimeInfo, // <-- export new helper
    ticketType: 'bookUs',
    buttonId: 'bookus_button',
    modalId: 'bookus_modal'
};