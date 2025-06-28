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
const axios = require('axios'); // Use axios instead of fetch for better compatibility

// Send Book Us panel
async function sendPanel(channel) {
    const bookEmbed = new EmbedBuilder()
        .setTitle('Real Ops Request')
        .setDescription('If you would like to book us for your event then please be sure to read the Terms & Conditions above and check our availability in <#' + (config.channels?.availability || '1303770457513787412') + '> | our-availability before opening a ticket\nTo request our services react with 📩')
        .setColor('#c79a20') 
        .setImage('https://i.postimg.cc/VLHsv1MV/Book-us.png') 
        .setThumbnail('https://i.ibb.co/FMYFdhk/real-ops-group-logo.png')
        .setAuthor({ 
            name: 'The Real Ops Group',
            iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        })
        .setFooter({ 
            text: 'Real Ops Group Tickets',
            iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        });
    
    const bookRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('bookus_button')
                .setLabel('Book Us')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📩')
        );
    
    return await channel.send({ embeds: [bookEmbed], components: [bookRow] });
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

// Extract event ID from TruckerMP event link
function extractEventId(eventLink) {
    if (!eventLink || typeof eventLink !== 'string') {
        console.log('Invalid event link provided');
        return null;
    }
    
    try {
        // Common patterns for TruckerMP event links
        const patterns = [
            /truckersmp\.com\/events\/(\d+)/i,
            /truckersmp\.com\/en\/events\/(\d+)/i,
            /truckersmp\.com\/[a-z]{2}\/events\/(\d+)/i,
        ];
        
        for (const pattern of patterns) {
            const match = eventLink.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        
        // If no match, try to find any numeric ID in the URL
        const numericMatch = eventLink.match(/(\d+)/);
        if (numericMatch && numericMatch[1]) {
            return numericMatch[1];
        }
        
        console.log('No event ID found in link:', eventLink);
        return null;
    } catch (error) {
        console.error('Error extracting event ID:', error);
        return null;
    }
}

// Format submitted data into an embed
function createResponseEmbed(user, data, ticketId) {
    // Get Unix timestamp for Discord timestamp
    const timestamp = getUnixTimestamp();
    
    // Create the base description with questions as headers and answers in code blocks
    const description = [
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
        '```',
        '',
        `**Discord Username:** ${user.tag}`,
        `**Discord ID:** ${user.id}`,
        `**Submitted At:** <t:${timestamp}:F>` // Discord timestamp that shows in user's local time
    ].join('\n');
    
    // Create embed with base information
    const embed = new EmbedBuilder()
        .setTitle('Book Us Request')
        .setDescription(description)
        .setColor('#e74c3c')
        .setFooter({ 
            text: `Ticket ID: ${ticketId}`, 
            iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        })
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();
    
    return embed;
}

// Process the submitted data
function processSubmittedData(interaction) {
    const timestamp = getUnixTimestamp();
    
    try {
        const discordName = interaction.fields.getTextInputValue('discord_name') || '';
        const vtcRole = interaction.fields.getTextInputValue('vtc_role') || '';
        const eventLink = interaction.fields.getTextInputValue('event_link') || '';
        
        console.log(`Processing data: Discord Name: ${discordName}, VTC Role: ${vtcRole}, Event Link: ${eventLink}`);
        
        // Get event ID from the link
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
        
        // Return default values to prevent undefined errors
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
        // Extract event ID from data or link
        let eventId = eventData.eventId;
        if (!eventId && eventData.eventLink) {
            eventId = extractEventId(eventData.eventLink);
        }
        
        if (!eventId) {
            console.log('No valid event ID found in data');
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
        
        console.log(`Fetching event details for ID: ${eventId}`);
        
        // Use axios for API request
        const response = await axios.get(`https://api.truckersmp.com/v2/events/${eventId}`);
        const apiData = response.data;
        
        if (!apiData.response) {
            console.error('Invalid API response structure:', apiData);
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
        
        // Get the event data from the response
        const event = apiData.response;
        console.log('Event data fetched:', event.name);
        
        // === 1. Main Event Details Embed ===
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
            eventEmbed.addFields({ name: 'Meetup Time (UTC)', value: `\`${event.meetup_at}\``, inline: false });
        }

        if (event.start_at) {
            eventEmbed.addFields({ name: 'Start Time (UTC)', value: `\`${event.start_at}\``, inline: false });
        }

        eventEmbed.addFields({
            name: 'Event Link',
            value: `[View on TruckerMP](https://truckersmp.com/events/${eventId})`,
            inline: false
        });

        // === 2. Banner Embed ===
        const bannerEmbed = new EmbedBuilder()
            .setTitle('📢 Event Banner')
            .setColor('#2ecc71')
            .setImage(event.banner || 'https://via.placeholder.com/800x200?text=No+Banner+Available');

        // === 3. Map Embed ===
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

        // === Send all 3 embeds ===
        await channel.send({ embeds: [eventEmbed, bannerEmbed] });

        await channel.send({
    embeds: [mapEmbed],
    components: [actionRow]
});


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
    ticketType: 'bookUs',
    buttonId: 'bookus_button',
    modalId: 'bookus_modal'
};