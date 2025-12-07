const express = require('express');
const router = express.Router();
const { collections } = require('../firebase');
const { isStaff } = require('../auth');

// Default panel configurations from bot
const BOT_PANEL_CONFIGS = {
  support: {
    type: 'support',
    title: '🎫 Support / Enquiries',
    description: 'If you would like more information regarding our services, then please feel free to speak with one of our Support staff who will be happy to answer your questions.\n\nReact with 🎫 to contact our support team.',
    color: '#ff0000',
    thumbnail: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png',
    image: 'https://i.postimg.cc/0NmPQwdt/support.png',
    footer: { 
      text: 'The Real Ops Group', 
      iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' 
    },
    buttons: [{
      customId: 'support_button',
      label: 'Get Support',
      style: 'Success',
      emoji: '🎫'
    }]
  },
  bookus: {
    type: 'bookus',
    title: 'Real Ops Request',
    description: 'If you would like to book us for your event then please be sure to read the Terms & Conditions above and check our availability in <#1303770457513787412> | our-availability before opening a ticket\nTo request our services react with 📩',
    color: '#c79a20',
    thumbnail: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png',
    image: 'https://i.postimg.cc/VLHsv1MV/Book-us.png',
    footer: { 
      text: 'Real Ops Group Tickets', 
      iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' 
    },
    buttons: [{
      customId: 'bookus_button',
      label: 'Book Us',
      style: 'Success',
      emoji: '📩'
    }]
  },
  partnership: {
    type: 'partnership',
    title: 'Partnership Request',
    description: 'If you would like to request a partnership with us\nthen please react with 📩 and fill out our request form',
    color: '#9b59b6',
    thumbnail: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png',
    image: 'https://i.postimg.cc/vZ6Z5Swh/partnership-2.png',
    footer: { 
      text: 'The Real Ops Group Tickets', 
      iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' 
    },
    buttons: [{
      customId: 'partnership_button',
      label: 'Discuss Partnership',
      style: 'Secondary',
      emoji: '🤝'
    }]
  },
  jointeam: {
    type: 'jointeam',
    title: 'The Real Ops Group',
    description: 'Join Our Team\n\nYou can find all available positions in <#1291739954791059527> \nPlease react with 📨\nTo fill out the application form',
    color: '#E74C3C',
    thumbnail: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png',
    image: 'https://i.postimg.cc/5N4fhvW9/Join-team.png',
    footer: { 
      text: 'The Real Ops Group', 
      iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' 
    },
    buttons: [{
      customId: 'join_team_button',
      label: 'Join the Team',
      style: 'Success',
      emoji: '📨'
    }]
  },
  hr: {
    type: 'hr',
    title: '📋 The Real Ops Group',
    description: 'If you wish to report a member of staff or have a complaint then please click the button below to open a HR ticket',
    color: '#E74C3C',
    thumbnail: 'https://i.postimg.cc/fy4hqtjs/real-ops-group-logo.png',
    image: 'https://i.ibb.co/0p9d3tCd/Z7vW5Or.png',
    footer: { 
      text: 'The Real Ops Group', 
      iconURL: 'https://i.postimg.cc/fy4hqtjs/real-ops-group-logo.png' 
    },
    buttons: [{
      customId: 'hr_button',
      label: 'Create ticket',
      style: 'Success',
      emoji: '📨'
    }]
  },
  founder: {
    type: 'founder',
    title: 'Founder / Management',
    description: 'To Contact the Founder / Management then please\nreact with 📩',
    color: '#f1c40f',
    thumbnail: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png',
    image: 'https://i.postimg.cc/2SLGZvjv/Z7vW5Or.png',
    footer: { 
      text: 'The Real Ops Group Tickets', 
      iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' 
    },
    buttons: [{
      customId: 'founders_button',
      label: 'Contact Founders',
      style: 'Primary',
      emoji: '👑'
    }]
  }
};

// Initialize panels from bot configuration
router.post('/initialize', isStaff, async (req, res) => {
  try {
    const initialized = [];
    const skipped = [];

    for (const [type, config] of Object.entries(BOT_PANEL_CONFIGS)) {
      // Check if panel already exists
      const existingSnapshot = await collections.panels
        .where('type', '==', type)
        .get();
      
      if (existingSnapshot.empty) {
        // Create new panel from bot config
        const data = {
          ...config,
          createdBy: req.user.id,
          createdAt: new Date().toISOString(),
          source: 'bot'
        };
        const docRef = await collections.panels.add(data);
        initialized.push({ type, id: docRef.id });
      } else {
        skipped.push({ type, id: existingSnapshot.docs[0].id, reason: 'already exists' });
      }
    }

    res.json({
      success: true,
      initialized,
      skipped,
      message: `Initialized ${initialized.length} panels, skipped ${skipped.length} existing panels`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bot panel defaults
router.get('/defaults', isStaff, (req, res) => {
  res.json(BOT_PANEL_CONFIGS);
});

// Reset panel to bot defaults
router.post('/:type/reset', isStaff, async (req, res) => {
  try {
    const { type } = req.params;
    const defaultConfig = BOT_PANEL_CONFIGS[type];

    if (!defaultConfig) {
      return res.status(404).json({ error: 'Panel type not found in bot configuration' });
    }

    // Find existing panel
    const existingSnapshot = await collections.panels
      .where('type', '==', type)
      .get();

    if (existingSnapshot.empty) {
      // Create new from defaults
      const data = {
        ...defaultConfig,
        createdBy: req.user.id,
        createdAt: new Date().toISOString(),
        source: 'bot'
      };
      const docRef = await collections.panels.add(data);
      res.json({ id: docRef.id, ...data, message: 'Panel created from defaults' });
    } else {
      // Update existing with defaults
      const docId = existingSnapshot.docs[0].id;
      const data = {
        ...defaultConfig,
        updatedBy: req.user.id,
        updatedAt: new Date().toISOString(),
        source: 'bot'
      };
      await collections.panels.doc(docId).update(data);
      res.json({ id: docId, ...data, message: 'Panel reset to defaults' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
