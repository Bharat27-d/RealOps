const express = require('express');
const router = express.Router();
const { collections } = require('../firebase');
const botManager = require('../discordManager');
const { isStaff } = require('../auth');
const { cache, CACHE_TTL } = require('../cache');

// Get all reaction roles
router.get('/reaction-roles', isStaff, async (req, res) => {
  try {
    const cacheKey = 'roles:reaction';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const snapshot = await collections.roles.where('type', '==', 'reaction').get();
    const reactionRoles = [];
    snapshot.forEach(doc => {
      reactionRoles.push({ id: doc.id, ...doc.data() });
    });
    cache.set(cacheKey, reactionRoles, CACHE_TTL.MEDIUM);
    res.json(reactionRoles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create reaction role
router.post('/reaction-roles', isStaff, async (req, res) => {
  try {
    const { channelId, messageText, roles } = req.body;

    // Create embed with reaction instructions
    const embedData = {
      title: '🎭 Reaction Roles',
      description: messageText || 'React to get roles!',
      color: '#00b894',
      fields: roles.map(r => ({
        name: r.emoji + ' ' + r.roleName,
        value: r.description || 'Click to get this role',
        inline: false
      })),
      footer: {
        text: 'The Real Ops Group',
        iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
      }
    };

    const result = await botManager.sendEmbed(channelId, embedData);

    // Save to database
    const roleData = {
      type: 'reaction',
      channelId,
      messageId: result.messageId,
      roles,
      createdBy: req.user.id,
      createdAt: new Date().toISOString()
    };

    const docRef = await collections.roles.add(roleData);
    cache.invalidate('roles:*');

    res.json({ id: docRef.id, ...roleData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get auto-role rules
router.get('/auto-roles', isStaff, async (req, res) => {
  try {
    const cacheKey = 'roles:auto';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const snapshot = await collections.roles.where('type', '==', 'auto').get();
    const autoRoles = [];
    snapshot.forEach(doc => {
      autoRoles.push({ id: doc.id, ...doc.data() });
    });
    cache.set(cacheKey, autoRoles, CACHE_TTL.MEDIUM);
    res.json(autoRoles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create auto-role rule
router.post('/auto-roles', isStaff, async (req, res) => {
  try {
    const ruleData = {
      type: 'auto',
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      enabled: true
    };

    const docRef = await collections.roles.add(ruleData);
    res.json({ id: docRef.id, ...ruleData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle auto-role rule
router.put('/auto-roles/:id/toggle', isStaff, async (req, res) => {
  try {
    const doc = await collections.roles.doc(req.params.id).get();
    const current = doc.data().enabled;

    await collections.roles.doc(req.params.id).update({
      enabled: !current,
      updatedAt: new Date().toISOString()
    });

    res.json({ success: true, enabled: !current });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get join requests
router.get('/join-requests', isStaff, async (req, res) => {
  try {
    const cacheKey = 'roles:join-requests';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const snapshot = await collections.roles
      .where('type', '==', 'join-request')
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get();
    
    const requests = [];
    snapshot.forEach(doc => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    cache.set(cacheKey, requests, CACHE_TTL.SHORT);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle join request
router.post('/join-requests/:id/handle', isStaff, async (req, res) => {
  try {
    const { action, roleId, reason } = req.body; // action: 'accept' or 'decline'
    const doc = await collections.roles.doc(req.params.id).get();
    const request = doc.data();

    if (action === 'accept') {
      await botManager.addRole(request.userId, roleId);
      await botManager.sendDM(request.userId, '✅ Your join request has been accepted!');
    } else {
      await botManager.sendDM(
        request.userId,
        `❌ Your join request has been declined.${reason ? '\n\nReason: ' + reason : ''}`
      );
    }

    await collections.roles.doc(req.params.id).update({
      status: action === 'accept' ? 'accepted' : 'declined',
      handledBy: req.user.id,
      handledAt: new Date().toISOString(),
      reason: reason || null
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get nickname rules
router.get('/nickname-rules', isStaff, async (req, res) => {
  try {
    const cacheKey = 'roles:nickname';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const snapshot = await collections.roles.where('type', '==', 'nickname').get();
    const rules = [];
    snapshot.forEach(doc => {
      rules.push({ id: doc.id, ...doc.data() });
    });
    cache.set(cacheKey, rules, CACHE_TTL.MEDIUM);
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create nickname rule
router.post('/nickname-rules', isStaff, async (req, res) => {
  try {
    const ruleData = {
      type: 'nickname',
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      enabled: true
    };

    const docRef = await collections.roles.add(ruleData);
    res.json({ id: docRef.id, ...ruleData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete role rule
router.delete('/:id', isStaff, async (req, res) => {
  try {
    await collections.roles.doc(req.params.id).delete();
    cache.invalidate('roles:*');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
