const express = require('express');
const router = express.Router();
const { collections } = require('../firebase');
const { isAdmin } = require('../auth');

// Get bot configuration
router.get('/', isAdmin, async (req, res) => {
  try {
    const configDoc = await collections.botConfig.doc('main').get();
    
    if (configDoc.exists) {
      res.json(configDoc.data());
    } else {
      // Return default configuration if not set
      res.json({
        staffRoles: {
          admin: [],
          moderator: ['1292218198028058674', '1300518058749853716'],
          support: ['1291394387888177193'],
          partnership: ['1300834129780150272'],
          founders: ['1291116832308068448', '1291139504786378823'],
          hr: ['1292896422949163120'],
          bookings: ['1292218198028058674', '1300518058749853716']
        },
        ticketCategories: {
          joinTeam: '1292866127549956107',
          bookUs: '1292859420333707294',
          support: '1292866493473886238',
          partnership: '1300843282611306590',
          founders: '1292867254765092978',
          hr: '1292867139593834597'
        },
        channels: {
          logChannel: '1291495743277895751',
          transcriptChannel: '1291495743277895751',
          welcomeChannel: '1374056199518945462',
          staffChangesChannel: '1292927159958114336',
          staffOpenings: '1291739954791059527'
        },
        roles: {
          JNR_PLANNER: '1345496957082406972',
          DEVELOPER: '1386691716945543240',
          PM: '1291144543630262292',
          PMM: '1300834129780150272',
          EM: '1291121579207692430',
          MM: '1296422181806542898',
          HRD: '1292896422949163120',
          DM: '1291123331591831632',
          SSM: '1344406747955200081',
          SS: '1291394387888177193',
          ES: '1291122540864864348',
          PL: '1291818052744253612',
          M: '1296423697711894528',
          STAFF: '1291122795190812774'
        },
        emojis: {
          joinTeam: '👥',
          bookUs: '📅',
          support: '🎫',
          partnership: '🤝',
          founders: '👑',
          hr: '📋',
          close: '🔒',
          delete: '🗑️'
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update bot configuration
router.put('/', isAdmin, async (req, res) => {
  try {
    console.log('Updating config:', JSON.stringify(req.body, null, 2));
    
    if (!collections.botConfig) {
      throw new Error('Bot config collection not initialized');
    }
    
    await collections.botConfig.doc('main').set(req.body, { merge: true });
    
    // Log the update to a separate audit collection (not botConfig itself)
    try {
      const { db } = require('../firebase');
      await db.collection('auditLog').add({
        type: 'config_update',
        updatedBy: req.user.id,
        updatedAt: new Date().toISOString(),
        changes: req.body
      });
    } catch (logError) {
      console.error('Failed to log config update:', logError);
      // Don't fail the request if logging fails
    }

    res.json({ success: true, message: 'Bot configuration updated successfully' });
  } catch (error) {
    console.error('Config update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all staff roles from Discord
router.get('/discord-roles', isAdmin, async (req, res) => {
  try {
    const botManager = require('../discordManager');
    const roles = await botManager.getRoles();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all channels from Discord
router.get('/discord-channels', isAdmin, async (req, res) => {
  try {
    const botManager = require('../discordManager');
    const channels = await botManager.getChannels();
    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get general settings (event reminder channel, etc.)
router.get('/general', isAdmin, async (req, res) => {
  try {
    const settingsDoc = await collections.settings.doc('general').get();
    
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      // Ensure all expected fields have defaults
      res.json({
        eventReminderChannelId: null,
        eventReminderRoleIds: [],
        weeklyAnnouncementChannelId: null,
        weeklyAnnouncementRoleIds: [],
        ...data
      });
    } else {
      res.json({
        eventReminderChannelId: null,
        eventReminderRoleIds: [],
        weeklyAnnouncementChannelId: null,
        weeklyAnnouncementRoleIds: []
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update general settings
router.put('/general', isAdmin, async (req, res) => {
  try {
    console.log('Updating general settings:', JSON.stringify(req.body, null, 2));
    
    if (!collections.settings) {
      throw new Error('Settings collection not initialized');
    }
    
    await collections.settings.doc('general').set(req.body, { merge: true });
    res.json({ success: true, message: 'General settings updated successfully' });
  } catch (error) {
    console.error('General settings update error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
