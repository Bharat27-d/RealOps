const express = require('express');
const router = express.Router();
const { collections } = require('../firebase');
const botManager = require('../discordManager');
const { isStaff } = require('../auth');
const { cache, CACHE_TTL } = require('../cache');

// Get all staff with filters
router.get('/', isStaff, async (req, res) => {
  try {
    const { role, department, status } = req.query;
    const cacheKey = `staff:list:${role || 'all'}:${department || 'all'}:${status || 'all'}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    let query = collections.staff.where('isStaff', '==', true);

    if (role) {
      query = query.where('roles', 'array-contains', role);
    }
    if (department) {
      query = query.where('department', '==', department);
    }
    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const staff = [];
    snapshot.forEach(doc => {
      staff.push({ id: doc.id, ...doc.data() });
    });
    cache.set(cacheKey, staff, CACHE_TTL.MEDIUM);
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get staff member details
router.get('/:id', isStaff, async (req, res) => {
  try {
    const doc = await collections.staff.doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Get staff tickets, events, notes
    const tickets = await collections.tickets.where('assignedTo', '==', req.params.id).get();
    const events = await collections.events.where('assignedStaff', 'array-contains', req.params.id).get();

    const staffData = {
      ...doc.data(),
      tickets: tickets.docs.map(d => ({ id: d.id, ...d.data() })),
      events: events.docs.map(d => ({ id: d.id, ...d.data() }))
    };

    res.json(staffData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update staff member
router.put('/:id', isStaff, async (req, res) => {
  try {
    await collections.staff.doc(req.params.id).update(req.body);
    cache.invalidate('staff:*');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get staff availability
router.get('/availability/calendar', isStaff, async (req, res) => {
  try {
    const cacheKey = 'staff:availability';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const snapshot = await collections.staffAvailability.get();
    const availability = [];
    snapshot.forEach(doc => {
      availability.push({ id: doc.id, ...doc.data() });
    });
    cache.set(cacheKey, availability, CACHE_TTL.MEDIUM);
    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create staff availability request
router.post('/availability/request', isStaff, async (req, res) => {
  try {
    const { staffId, message } = req.body;

    // Send DM to staff member
    await botManager.sendDM(staffId, message, {
      title: '📅 Availability Request',
      description: 'Please update your availability in the dashboard.',
      color: '#00b894'
    });

    // Save request
    await collections.staffAvailability.add({
      staffId,
      requestedBy: req.user.id,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create staff opening
router.post('/openings', isStaff, async (req, res) => {
  try {
    const opening = {
      ...req.body,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      status: 'open',
      applications: []
    };

    const docRef = await collections.staff.collection('openings').add(opening);
    res.json({ id: docRef.id, ...opening });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update staff roles in Discord
router.post('/:id/roles', isStaff, async (req, res) => {
  try {
    const { roleId, action } = req.body;

    if (action === 'add') {
      await botManager.addRole(req.params.id, roleId);
    } else if (action === 'remove') {
      await botManager.removeRole(req.params.id, roleId);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all staff openings
router.get('/openings/list', isStaff, async (req, res) => {
  try {
    const snapshot = await collections.staff.doc('openings').collection('positions').orderBy('createdAt', 'desc').get();
    const openings = [];
    snapshot.forEach(doc => {
      openings.push({ id: doc.id, ...doc.data() });
    });
    res.json(openings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create staff opening
router.post('/openings/create', isStaff, async (req, res) => {
  try {
    const { title, description, requirements, status } = req.body;
    
    const opening = {
      title,
      description,
      requirements,
      roles: [], // Array of {name, status: 'open'|'closed'}
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await collections.staff.doc('openings').collection('positions').add(opening);
    res.json({ id: docRef.id, ...opening });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update staff opening
router.put('/openings/:id', isStaff, async (req, res) => {
  try {
    const { title, description, requirements, roles } = req.body;
    
    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (roles !== undefined) updateData.roles = roles;

    await collections.staff.doc('openings').collection('positions').doc(req.params.id).update(updateData);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete staff opening
router.delete('/openings/:id', isStaff, async (req, res) => {
  try {
    await collections.staff.doc('openings').collection('positions').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Announce staff openings to channel
router.post('/openings/announce', isStaff, async (req, res) => {
  try {
    const { channelId, openings } = req.body;

    // Build roles list from all openings
    const allRoles = openings.flatMap(opening => 
      opening.roles.map(role => `**${role.name}** ${role.status === 'open' ? '🟢' : '🔴'}`)
    );
    
    const openingsList = allRoles.length > 0 ? allRoles.join('  \n') : '**No positions available at this time.**';

    const embedData = {
      title: 'The Real-Ops Group Recruitment',
      description: `**Staff openings**\n\nThank you for your interest in joining our team, you will find all available positions below.  \nGood luck.\n\n${openingsList}\n\nIf you would like to join the team then please open a ticket in # | join-the-team and good luck 🤞`,
      color: '#00b894',
      thumbnail: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png',
      image: 'https://i.imgur.com/GUywUAQ.png',
      footer: {
        text: 'The Real Ops Group',
        iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
      }
    };

    const result = await botManager.sendEmbed(channelId, embedData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
