const express = require('express');
const router = express.Router();
const { collections } = require('../firebase');
const botManager = require('../discordManager');
const { isStaff } = require('../auth');
const { cache, CACHE_TTL } = require('../cache');

// Get all embeds (templates and saved)
router.get('/', isStaff, async (req, res) => {
  try {
    const cacheKey = 'embeds:list';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const snapshot = await collections.embeds.orderBy('createdAt', 'desc').get();
    const embeds = [];
    snapshot.forEach(doc => {
      embeds.push({ id: doc.id, ...doc.data() });
    });
    cache.set(cacheKey, embeds, CACHE_TTL.SHORT);
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
    cache.invalidate('embeds:*');
    res.json({ id: docRef.id, ...embedData });
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

// Send multiple embeds in one message to multiple channels
router.post('/send-multiple', isStaff, async (req, res) => {
  try {
    const { channelIds, embedsData, mentions } = req.body;

    if (!channelIds || channelIds.length === 0) {
      return res.status(400).json({ error: 'No channels specified' });
    }

    if (!embedsData || embedsData.length === 0) {
      return res.status(400).json({ error: 'No embeds provided' });
    }

    // Build mention content string
    let mentionContent = '';
    if (mentions && mentions.length > 0) {
      const mentionTexts = mentions.map(mention => {
        if (typeof mention === 'object' && mention.id) {
          if (mention.type === 'user') return `<@${mention.id}>`;
          return `<@&${mention.id}>`;
        }
        if (typeof mention === 'string') return `<@&${mention}>`;
        return null;
      }).filter(Boolean);
      mentionContent = mentionTexts.join(' ');
    }

    const results = [];
    for (const channelId of channelIds) {
      try {
        console.log(`Sending ${embedsData.length} embeds to channel ${channelId}`);
        const result = await botManager.sendMultipleEmbeds(channelId, embedsData, mentionContent || null);
        results.push({ channelId, success: true, messageId: result.messageId });
      } catch (error) {
        console.error(`Error sending to channel ${channelId}:`, error);
        results.push({ channelId, success: false, error: error.message });
      }
    }

    res.json({ results });
  } catch (error) {
    console.error('Error sending multiple embeds:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch a message's embed data by channel/message ID
// MUST be before /:id routes so Express doesn't treat "fetch-message" as an :id
router.get('/fetch-message', isStaff, async (req, res) => {
  try {
    const { channelId, messageId } = req.query;
    
    if (!channelId || !messageId) {
      return res.status(400).json({ error: 'channelId and messageId are required' });
    }

    const result = await botManager.fetchMessage(channelId, messageId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Edit an existing message's embed
// MUST be before /:id routes so Express doesn't treat "edit-message" as an :id
router.put('/edit-message', isStaff, async (req, res) => {
  try {
    const { channelId, messageId, embedData, content } = req.body;
    
    if (!channelId || !messageId) {
      return res.status(400).json({ error: 'channelId and messageId are required' });
    }

    if (!embedData || (!embedData.title && !embedData.description)) {
      return res.status(400).json({ error: 'Embed must have a title or description' });
    }

    console.log('Editing message:', messageId, 'in channel:', channelId);
    const result = await botManager.editMessage(channelId, messageId, embedData, content || null);
    res.json(result);
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update embed template — /:id MUST come AFTER named routes like /edit-message
router.put('/:id', isStaff, async (req, res) => {
  try {
    // Deep clean: Firestore rejects undefined values
    const cleanData = JSON.parse(JSON.stringify(req.body));
    // Remove metadata fields that shouldn't be in the update
    delete cleanData.id;
    delete cleanData.createdAt;
    delete cleanData.createdBy;
    delete cleanData.updatedAt;

    console.log('Updating embed:', req.params.id, 'Fields:', Object.keys(cleanData));

    await collections.embeds.doc(req.params.id).set({
      ...cleanData,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    cache.invalidate('embeds:*');
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
    cache.invalidate('embeds:*');
    res.json({ success: true });
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
