const express = require('express');
const router = express.Router();
const { collections } = require('../firebase');
const botManager = require('../discordManager');
const { isStaff } = require('../auth');

// Get all partnerships
router.get('/', isStaff, async (req, res) => {
  try {
    const snapshot = await collections.partnerships.orderBy('createdAt', 'desc').get();
    const partnerships = [];
    snapshot.forEach(doc => {
      partnerships.push({ id: doc.id, ...doc.data() });
    });
    res.json(partnerships);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create partnership
router.post('/', isStaff, async (req, res) => {
  try {
    const partnershipData = {
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const docRef = await collections.partnerships.add(partnershipData);
    res.json({ id: docRef.id, ...partnershipData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update partnership status
router.put('/:id/status', isStaff, async (req, res) => {
  try {
    const { status, notes } = req.body;
    await collections.partnerships.doc(req.params.id).update({
      status,
      notes,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.id
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send partnership terms
router.post('/:id/send-terms', isStaff, async (req, res) => {
  try {
    const { channelId, userId, terms } = req.body;
    const doc = await collections.partnerships.doc(req.params.id).get();
    const partnership = doc.data();

    const embedData = {
      title: '🤝 Partnership Terms & Agreement',
      description: terms || partnership.terms,
      color: '#00b894',
      footer: {
        text: 'The Real Ops Group',
        iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
      },
      timestamp: true
    };

    if (userId) {
      await botManager.sendDM(userId, null, embedData);
    } else if (channelId) {
      await botManager.sendEmbed(channelId, embedData);
    }

    await collections.partnerships.doc(req.params.id).update({
      termsSentAt: new Date().toISOString(),
      termsSentBy: req.user.id
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send partnership announcement
router.post('/:id/announce', isStaff, async (req, res) => {
  try {
    const { channelId } = req.body;
    const doc = await collections.partnerships.doc(req.params.id).get();
    const partnership = doc.data();

    const embedData = {
      title: '🎉 New Partnership Announcement',
      description: `We're excited to announce our partnership with **${partnership.partnerName}**!\n\n${partnership.announcementText}`,
      color: '#00b894',
      thumbnail: partnership.logo,
      footer: {
        text: 'The Real Ops Group',
        iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
      },
      timestamp: true
    };

    const result = await botManager.sendEmbed(channelId, embedData);

    await collections.partnerships.doc(req.params.id).update({
      announcedAt: new Date().toISOString(),
      announcedBy: req.user.id,
      announcementMessageId: result.messageId
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quick announce partnership (no need to create partnership first)
router.post('/announce-quick', isStaff, async (req, res) => {
  try {
    const { channelId, embedData, content } = req.body;

    const result = await botManager.sendEmbed(channelId, embedData, content);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete partnership
router.delete('/:id', isStaff, async (req, res) => {
  try {
    await collections.partnerships.doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
