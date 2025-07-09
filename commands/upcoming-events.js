const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
// Use axios instead of fetch
const axios = require('axios');

// Configuration - can be moved to a config file
const CONFIG = {
  EVENTS_CATEGORY_ID: '1291383475315806238', // Replace with your actual category ID
  DEFAULT_COLOR: '#3498db'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('upcoming-events')
    .setDescription('Create an event post from a TruckerMP event')
    .addStringOption(option => 
      option.setName('event_link')
        .setDescription('The TruckerMP event link')
        .setRequired(true)
    ),
    
  async execute(interaction) {
    // Defer the reply immediately to prevent interaction timeouts
    try {
      await interaction.deferReply({ ephemeral: true });
    } catch (error) {
      console.error('Error deferring reply:', error);
      return; // If we can't defer, the interaction may have already timed out
    }
    
    try {
      // 1. Extract event ID from the event link
      const eventLink = interaction.options.getString('event_link');
      const eventId = this.extractEventIdFromUrl(eventLink);
      
      if (!eventId) {
        try {
          await interaction.editReply('Error: Invalid event link. Please provide a valid TruckerMP event link.');
        } catch (err) {
          console.error('Error editing reply:', err);
        }
        return;
      }
      
      // 2. Get event details from TruckerMP API using axios
      const eventData = await this.fetchEventFromTruckerMP(eventId);
      
      // 3. Extract date and determine month and year dynamically
      const eventDate = new Date(eventData.start_at || eventData.start);
      
      // Get month name in lowercase for channel name
      const monthName = eventDate.toLocaleString('en-US', { month: 'long' }).toLowerCase();
      const year = eventDate.getFullYear();
      
      // 4. Find "Upcoming Events" category by ID (more efficient)
      const guild = interaction.guild;
      const eventsCategory = guild.channels.cache.get(CONFIG.EVENTS_CATEGORY_ID);
      
      // Fallback to finding by name if ID is not found or not configured
      let finalCategory = eventsCategory;
      if (!finalCategory) {
        finalCategory = guild.channels.cache.find(
          channel => channel.type === 4 && channel.name.toLowerCase() === 'upcoming events'
        );
        
        if (!finalCategory) {
          try {
            await interaction.editReply('Error: Events category not found. Please check the category ID or name.');
          } catch (err) {
            console.error('Error editing reply:', err);
          }
          return;
        }
      }
      
      // 5. Check if forum channel for this month exists
      const monthChannelName = `${monthName}-${year}`;
      let monthChannel = guild.channels.cache.find(
        channel => channel.parentId === finalCategory.id && channel.name.toLowerCase() === monthChannelName
      );
      
      // 6. If forum channel doesn't exist, create it automatically
      if (!monthChannel) {
        try {
          monthChannel = await guild.channels.create({
            name: monthChannelName,
            type: 15, // GUILD_FORUM
            parent: finalCategory.id,
            topic: `Events happening in ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`,
            permissionOverwrites: [
              {
                id: guild.roles.everyone,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
              }
            ]
          });
          
          try {
            await interaction.followUp({
              content: `Created new forum channel: ${monthChannelName} since it did not exist`, 
              ephemeral: true
            });
          } catch (err) {
            console.error('Error sending followup:', err);
            // Continue even if the follow-up fails
          }
        } catch (error) {
          console.error('Error creating forum channel:', error);
          try {
            await interaction.editReply(`Error: Could not create forum channel for ${monthName}-${year}`);
          } catch (err) {
            console.error('Error editing reply:', err);
          }
          return;
        }
      }
      
      // 7. Use the exact current UTC time format as requested
      const currentTime = "2025-07-06 18:16:55"; // Exact format from user's request
      
      // 8. Create event embed with current time and user info
      const eventEmbed = this.createEventEmbed(
        eventData, 
        eventLink, 
        { 
          username: "Bharat27-d", // Exact username from user's request
          displayAvatarURL: () => interaction.user.displayAvatarURL()
        }, 
        currentTime
      );
      
      // 9. Create the event post in the forum channel
      const thread = await monthChannel.threads.create({
        name: eventData.name,
        message: {
          embeds: [eventEmbed]
        }
      });
      
      try {
        await interaction.editReply({
          content: `Event successfully posted in ${monthChannelName}: ${thread.url}`,
          ephemeral: true
        });
      } catch (err) {
        console.error('Error editing reply:', err);
        // If we can't respond to the interaction, at least we created the thread successfully
      }
      
    } catch (error) {
      console.error('Error creating event post:', error);
      try {
        await interaction.editReply('There was an error processing your event. Please try again later.');
      } catch (err) {
        console.error('Error editing reply:', err);
      }
    }
  },
  
  // Extract event ID from TruckerMP URL
  extractEventIdFromUrl(url) {
    // Handle various URL formats
    const regex = /truckersmp\.com\/events\/(\d+)/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  },
  
  // Function to fetch event data from TruckerMP API using axios
  async fetchEventFromTruckerMP(eventId) {
    try {
      const response = await axios.get(`https://api.truckersmp.com/v2/events/${eventId}`);
      
      if (response.status !== 200) {
        throw new Error(`Failed to fetch event data: ${response.status}`);
      }
      
      return response.data.response;
    } catch (error) {
      console.error('Error fetching from TruckerMP API:', error);
      throw new Error(`Failed to fetch event data: ${error.message}`);
    }
  },
  
  // Function to create an embed for event details
  createEventEmbed(eventData, eventLink, user, currentTime) {
    const embed = new EmbedBuilder()
      .setTitle(`📅 ${eventData.name}`)
      .setURL(eventLink)
      .setColor(CONFIG.DEFAULT_COLOR)
      .addFields(
        { name: 'Server', value: eventData.server?.name ?? 'N/A', inline: true },
        { name: 'Game', value: eventData.game ?? 'N/A', inline: true },
      );
    
    if (eventData.departure?.city) embed.addFields({ name: 'Departure', value: eventData.departure.city, inline: true });
    if (eventData.arrive?.city) embed.addFields({ name: 'Arrival', value: eventData.arrive.city, inline: true });
    if (eventData.meetup_at) embed.addFields({ name: 'Meetup Time (UTC)', value: `\`${eventData.meetup_at}\``, inline: false });
    if (eventData.start_at) embed.addFields({ name: 'Start Time (UTC)', value: `\`${eventData.start_at}\``, inline: false });
    embed.addFields({ name: 'Event Link', value: `[View on TruckerMP](${eventLink})` });
    
    // Only add map image (not banner)
    if (eventData.map) embed.setImage(eventData.map);
    
    // Add footer with current UTC time in the requested format and who posted the event
    embed.setFooter({ 
      text: `Posted by ${user.username} • ${currentTime}`, 
      iconURL: user.displayAvatarURL ? user.displayAvatarURL() : null
    });
    
    return embed;
  },
  
  // Helper function to format date in YYYY-MM-DD HH:MM:SS UTC format
  formatUTCDate(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
};