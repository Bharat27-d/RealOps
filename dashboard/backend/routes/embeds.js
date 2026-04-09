const express = require('express');
const router = express.Router();
const { collections } = require('../firebase');
const botManager = require('../discordManager');
const { isStaff } = require('../auth');

// Get all embeds (templates and saved)
router.get('/', isStaff, async (req, res) => {
  try {
    const snapshot = await collections.embeds.orderBy('createdAt', 'desc').get();
    const embeds = [];
    snapshot.forEach(doc => {
      embeds.push({ id: doc.id, ...doc.data() });
    });
    res.json(embeds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save embed template
router.post('/save', isStaff, async (req, res) => {
  try {
    const embedData = {
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };

    const docRef = await collections.embeds.add(embedData);
    res.json({ id: docRef.id, ...embedData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update embed template
router.put('/:id', isStaff, async (req, res) => {
  try {
    // Deep clean: Firestore rejects undefined values
    const cleanData = JSON.parse(JSON.stringify(req.body));
    // Remove metadata fields that shouldn't be in the update
    delete cleanData.id;
    delete cleanData.createdAt;
    delete cleanData.createdBy;

    await collections.embeds.doc(req.params.id).update({
      ...cleanData,
      updatedAt: new Date().toISOString()
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating embed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete embed template
router.delete('/:id', isStaff, async (req, res) => {
  try {
    await collections.embeds.doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send embed to channel
router.post('/send', isStaff, async (req, res) => {
  try {
    const { channelId, embedData } = req.body;

    const result = await botManager.sendEmbed(channelId, embedData);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Duplicate embed
router.post('/:id/duplicate', isStaff, async (req, res) => {
  try {
    const doc = await collections.embeds.doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Embed not found' });
    }

    const embedData = doc.data();
    delete embedData.createdAt;
    delete embedData.updatedAt;

    const newEmbed = {
      ...embedData,
      name: `${embedData.name} (Copy)`,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };

    const docRef = await collections.embeds.add(newEmbed);
    res.json({ id: docRef.id, ...newEmbed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
