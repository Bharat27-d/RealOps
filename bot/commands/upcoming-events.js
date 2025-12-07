const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const CONFIG = {
  EVENTS_CATEGORY_ID: '1291383475315806238', 
  DEFAULT_COLOR: '#3498db',
  // Add roles that should have access to event channels
  AUTHORIZED_ROLE_IDS: [
    '1291122795190812774'  // Replace with another authorized role ID
  ],
  // RealOps Group logo
  LOGO_URL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
};

function toDiscordTimestamp(iso, style = 'F') {
  if (!iso) return 'N/A';
  const unix = Math.floor(new Date(iso).getTime() / 1000);
  return `<t:${unix}:${style}>`;
}
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
    try {
      await interaction.deferReply({ flags: 64 });
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
      
      // 6. If forum channel doesn't exist, create it with private permissions
      if (!monthChannel) {
        try {
          // Set up permission overwrites for the channel
          const permissionOverwrites = [
            // Deny access to everyone by default
            {
              id: guild.roles.everyone,
              deny: [PermissionFlagsBits.ViewChannel]
            }
          ];
          
          // Add permissions for authorized roles
          for (const roleId of CONFIG.AUTHORIZED_ROLE_IDS) {
            permissionOverwrites.push({
              id: roleId,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
            });
          }
          
          // Create the forum channel with restricted access
          monthChannel = await guild.channels.create({
            name: monthChannelName,
            type: 15, // GUILD_FORUM
            parent: finalCategory.id,
            topic: `Events happening in ${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`,
            permissionOverwrites: permissionOverwrites
          });
          
          try {
            await interaction.followUp({
              content: `Created new private forum channel: ${monthChannelName} since it did not exist`,
              flags: 64
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
      
      // 7. Get the current UTC time
      const now = new Date();
      const currentTime = this.formatUTCDate(now);
      
      // 8. Create event embed with current time
      const eventEmbed = this.createEventEmbed(eventData, eventLink, currentTime);      
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
          flags: 64
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
      }      return response.data.response;
    } catch (error) {
      console.error('Error fetching from TruckerMP API:', error);
      throw new Error(`Failed to fetch event data: ${error.message}`);
    }
  },
  
  // Function to create an embed for event details
  createEventEmbed(eventData, eventLink, currentTime) {    const embed = new EmbedBuilder()
      .setTitle(`📅 ${eventData.name}`)
      .setURL(eventLink)
      .setColor(CONFIG.DEFAULT_COLOR)
      .addFields(
        { name: 'Server', value: eventData.server?.name ?? 'N/A', inline: true },
        { name: 'Game', value: eventData.game ?? 'N/A', inline: true },
      );
    
    if (eventData.departure?.city) embed.addFields({ name: 'Departure', value: eventData.departure.city, inline: true });
    if (eventData.arrive?.city) embed.addFields({ name: 'Arrival', value: eventData.arrive.city, inline: true });
    
    // Add Discord timestamps for meetup and start times
    if (eventData.meetup_at) {
      const meetupTimestamp = toDiscordTimestamp(eventData.meetup_at, 'F');
      const meetupRelative = toDiscordTimestamp(eventData.meetup_at, 'R');
      embed.addFields({ 
        name: 'Meetup Time', 
        value: `${meetupTimestamp} (${meetupRelative})`, 
        inline: false 
      });
    }
    
    if (eventData.start_at) {
      const startTimestamp = toDiscordTimestamp(eventData.start_at, 'F');
      const startRelative = toDiscordTimestamp(eventData.start_at, 'R');
      embed.addFields({ 
        name: 'Start Time', 
        value: `${startTimestamp} (${startRelative})`, 
        inline: false 
      });
    }
        embed.addFields({ name: 'Event Link', value: `[View on TruckerMP](${eventLink})` });
    
    // Only add map image (not banner)
    if (eventData.map) embed.setImage(eventData.map);
    
    // Add footer with The RealOps Group and logo
    embed.setFooter({ 
      text: `The RealOps Group`,
      iconURL: CONFIG.LOGO_URL    });
    
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
