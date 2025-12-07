const express = require('express');
const router = express.Router();
const { collections } = require('../firebase');
const botManager = require('../discordManager');
const { isStaff } = require('../auth');

// Get all feedback
router.get('/', isStaff, async (req, res) => {
  try {
    const { category, status } = req.query;
    let query = collections.feedback;

    if (category) {
      query = query.where('category', '==', category);
    }
    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const feedback = [];
    snapshot.forEach(doc => {
      feedback.push({ id: doc.id, ...doc.data() });
    });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create feedback entry
router.post('/', isStaff, async (req, res) => {
  try {
    const feedbackData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const docRef = await collections.feedback.add(feedbackData);
    res.json({ id: docRef.id, ...feedbackData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update feedback
router.put('/:id', isStaff, async (req, res) => {
  try {
    await collections.feedback.doc(req.params.id).update({
      ...req.body,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.id
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Respond to feedback
router.post('/:id/respond', isStaff, async (req, res) => {
  try {
    const { response, sendDM } = req.body;
    const doc = await collections.feedback.doc(req.params.id).get();
    const feedback = doc.data();

    if (sendDM && feedback.userId) {
      await botManager.sendDM(feedback.userId, null, {
        title: '📝 Response to Your Feedback',
        description: response,
        color: '#00b894',
        footer: {
          text: 'The Real Ops Group',
          iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        }
      });
    }

    await collections.feedback.doc(req.params.id).update({
      response,
      respondedAt: new Date().toISOString(),
      respondedBy: req.user.id,
      status: 'responded'
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all documentation
router.get('/documentation/list', isStaff, async (req, res) => {
  try {
    const snapshot = await collections.documentation.orderBy('createdAt', 'desc').get();
    const docs = [];
    snapshot.forEach(doc => {
      docs.push({ id: doc.id, ...doc.data() });
    });
    res.json(docs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create documentation
router.post('/documentation', isStaff, async (req, res) => {
  try {
    const docData = {
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };

    const docRef = await collections.documentation.add(docData);
    res.json({ id: docRef.id, ...docData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send documentation
router.post('/documentation/:id/send', isStaff, async (req, res) => {
  try {
    const { channelId, userId } = req.body;
    const doc = await collections.documentation.doc(req.params.id).get();
    const documentation = doc.data();

    const embedData = {
      title: '📚 ' + documentation.title,
      description: documentation.content,
      color: '#5865F2',
      url: documentation.url,
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

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
