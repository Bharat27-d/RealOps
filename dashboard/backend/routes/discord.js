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

module.exports = router;
