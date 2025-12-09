const express = require('express');
const router = express.Router();
const botManager = require('../discordManager');
const { isStaff } = require('../auth');

// Get all channels
router.get('/channels', isStaff, async (req, res) => {
  try {
    const channels = await botManager.getChannels();
    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all categories
router.get('/categories', isStaff, async (req, res) => {
  try {
    const categories = await botManager.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all roles
router.get('/roles', isStaff, async (req, res) => {
  try {
    const roles = await botManager.getRoles();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (limited list for mentions)
router.get('/users', isStaff, async (req, res) => {
  try {
    const guild = botManager.client.guilds.cache.first();
    if (!guild) {
      return res.status(503).json({ error: 'Bot not connected to guild' });
    }

    // Fetch all members
    await guild.members.fetch();
    
    // Map to simple user objects (limit to first 100 for performance)
    const users = Array.from(guild.members.cache.values())
      .filter(member => !member.user.bot) // Exclude bots
      .slice(0, 100)
      .map(member => ({
        id: member.user.id,
        username: member.user.username,
        displayName: member.displayName,
        avatar: member.user.displayAvatarURL()
      }));

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get guild members (staff only)
router.get('/members', isStaff, async (req, res) => {
  try {
    const { roleIds } = req.query;
    const roleIdArray = roleIds ? roleIds.split(',') : [];
    const members = await botManager.getGuildMembers(roleIdArray);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send DM to user
router.post('/dm', isStaff, async (req, res) => {
  try {
    const { userId, content, embed } = req.body;
    const result = await botManager.sendDM(userId, content, embed);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add role to member
router.post('/members/:userId/roles/add', isStaff, async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;
    const result = await botManager.addRole(userId, roleId);
    // Clear cache to force fresh data on next fetch
    botManager.clearCache();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove role from member
router.post('/members/:userId/roles/remove', isStaff, async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;
    const result = await botManager.removeRole(userId, roleId);
    // Clear cache to force fresh data on next fetch
    botManager.clearCache();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear Discord data cache
router.post('/cache/clear', isStaff, async (req, res) => {
  try {
    botManager.clearCache();
    res.json({ success: true, message: 'Cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message to channel
router.post('/send-message', isStaff, async (req, res) => {
  try {
    const { channelId, content } = req.body;
    const channel = await botManager.client.channels.fetch(channelId);
    const message = await channel.send(content);
    res.json({ success: true, messageId: message.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post staff availability check
router.post('/staff-availability', isStaff, async (req, res) => {
  try {
    const { eventLink } = req.body;
    const axios = require('axios');
    const { EmbedBuilder } = require('discord.js');

    // Extract event ID from TruckerMP link
    const match = eventLink.match(/events\/(\d+)/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid TruckerMP event link' });
    }
    const eventId = match[1];

    // Fetch event data from TruckerMP API
    const { data } = await axios.get(`https://api.truckersmp.com/v2/events/${eventId}`);
    const eventData = data.response;

    if (!eventData) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Helper function for Discord timestamps
    const toDiscordTimestamp = (iso, style = 'F') => {
      if (!iso) return 'N/A';
      const unix = Math.floor(new Date(iso).getTime() / 1000);
      return `<t:${unix}:${style}>`;
    };

    // Build embed
    const embed = new EmbedBuilder()
      .setTitle(`📅 ${eventData.name}`)
      .setURL(`https://truckersmp.com/events/${eventId}`)
      .setColor('#3498db')
      .addFields(
        { name: 'Server', value: eventData.server?.name ?? 'N/A', inline: true },
        { name: 'Game', value: eventData.game ?? 'N/A', inline: true }
      );

    if (eventData.departure?.city) embed.addFields({ name: 'Departure', value: eventData.departure.city, inline: true });
    if (eventData.arrive?.city) embed.addFields({ name: 'Arrival', value: eventData.arrive.city, inline: true });
    if (eventData.meetup_at) embed.addFields({ name: 'Meetup Time', value: toDiscordTimestamp(eventData.meetup_at, 'F'), inline: false });
    if (eventData.start_at) embed.addFields({ name: 'Start Time', value: toDiscordTimestamp(eventData.start_at, 'F'), inline: false });

    embed.addFields({ name: 'Event Link', value: `[View on TruckerMP](https://truckersmp.com/events/${eventId})` });

    if (eventData.map) embed.setImage(eventData.map);

    // Get the bot's guild
    const guild = botManager.client.guilds.cache.first();
    if (!guild) {
      return res.status(503).json({ error: 'Bot not connected to guild' });
    }

    // Use configured staff availability channel ID
    const channelId = '1291128212079771880'; // Staff availability channel
    
    const channel = await guild.channels.fetch(channelId);
    
    if (!channel) {
      return res.status(404).json({ error: `Channel ${channelId} not found` });
    }

    // Role IDs for mentions
    const roleId1 = '1291122795190812774';
    const roleId2 = '1350155100462514237';

    // Send message with role mentions
    const sentMessage = await channel.send({
      content: `<@&${roleId1}> <@&${roleId2}>`,
      embeds: [embed]
    });

    // Add reactions
    await sentMessage.react('✅');
    await sentMessage.react('❌');
    await sentMessage.react('⏳');
    await sentMessage.react('🚓');

    res.json({ 
      success: true, 
      messageId: sentMessage.id,
      channelId: channel.id,
      channelName: channel.name
    });
  } catch (error) {
    console.error('Error posting staff availability:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
