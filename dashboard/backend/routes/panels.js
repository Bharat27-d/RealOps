const express = require('express');
const router = express.Router();
const { collections } = require('../firebase');
const botManager = require('../discordManager');
const { isStaff } = require('../auth');
const fs = require('fs').promises;
const path = require('path');
const { cache, CACHE_TTL } = require('../cache');

// Bot panel default configurations (core/built-in panels)
const BOT_PANEL_DEFAULTS = {
  support: {
    type: 'support',
    title: '🎫 Support / Enquiries',
    description: 'If you would like more information regarding our services, then please feel free to speak with one of our Support staff who will be happy to answer your questions.\n\nReact with 🎫 to contact our support team.',
    color: '#ff0000',
    thumbnail: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png',
    image: 'https://i.postimg.cc/0NmPQwdt/support.png',
    footer: { text: 'The Real Ops Group', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' },
    buttons: [{ customId: 'support_button', label: 'Get Support', style: 'Success', emoji: '🎫' }]
  },
  bookus: {
    type: 'bookus',
    title: 'Real Ops Request',
    description: 'If you would like to book us for your event then please be sure to read the Terms & Conditions above and check our availability in <#1303770457513787412> | our-availability before opening a ticket\nTo request our services react with 📩',
    color: '#c79a20',
    thumbnail: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png',
    image: 'https://i.postimg.cc/VLHsv1MV/Book-us.png',
    footer: { text: 'Real Ops Group Tickets', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' },
    buttons: [{ customId: 'bookus_button', label: 'Book Us', style: 'Success', emoji: '📩' }]
  },
  partnership: {
    type: 'partnership',
    title: 'Partnership Request',
    description: 'If you would like to request a partnership with us\nthen please react with 📩 and fill out our request form',
    color: '#9b59b6',
    thumbnail: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png',
    image: 'https://i.postimg.cc/vZ6Z5Swh/partnership-2.png',
    footer: { text: 'The Real Ops Group Tickets', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' },
    buttons: [{ customId: 'partnership_button', label: 'Discuss Partnership', style: 'Secondary', emoji: '🤝' }]
  },
  jointeam: {
    type: 'jointeam',
    title: 'The Real Ops Group',
    description: 'Join Our Team\n\nYou can find all available positions in <#1291739954791059527> \nPlease react with 📨\nTo fill out the application form',
    color: '#E74C3C',
    thumbnail: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png',
    image: 'https://i.postimg.cc/5N4fhvW9/Join-team.png',
    footer: { text: 'The Real Ops Group', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' },
    buttons: [{ customId: 'join_team_button', label: 'Join the Team', style: 'Success', emoji: '📨' }]
  },
  hr: {
    type: 'hr',
    title: '📋 The Real Ops Group',
    description: 'If you wish to report a member of staff or have a complaint then please click the button below to open a HR ticket',
    color: '#E74C3C',
    thumbnail: 'https://i.postimg.cc/fy4hqtjs/real-ops-group-logo.png',
    image: 'https://i.ibb.co/0p9d3tCd/Z7vW5Or.png',
    footer: { text: 'The Real Ops Group', iconURL: 'https://i.postimg.cc/fy4hqtjs/real-ops-group-logo.png' },
    buttons: [{ customId: 'hr_button', label: 'Create ticket', style: 'Success', emoji: '📨' }]
  },
  founder: {
    type: 'founder',
    title: 'Founder / Management',
    description: 'To Contact the Founder / Management then please\nreact with 📩',
    color: '#f1c40f',
    thumbnail: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png',
    image: 'https://i.postimg.cc/2SLGZvjv/Z7vW5Or.png',
    footer: { text: 'The Real Ops Group Tickets', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' },
    buttons: [{ customId: 'founders_button', label: 'Contact Founders', style: 'Primary', emoji: '👑' }]
  },
  bookslot: {
    type: 'bookslot',
    title: '🎉 Book Your Slot',
    description: 'Book your slot for our special event!\n\nClick the button below to reserve your spot and join us for an amazing experience.\n\n📅 Limited slots available - First come, first served!',
    color: '#FFD700',
    thumbnail: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png',
    image: 'https://i.postimg.cc/VLHsv1MV/Book-us.png',
    footer: { text: 'The Real Ops Group', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' },
    buttons: [{ customId: 'bookslot_button', label: 'Book Slot', style: 'Success', emoji: '🎉' }]
  }
};

// Toggle button enabled/disabled state
router.post('/toggle-button', isStaff, async (req, res) => {
  try {
    const { buttonId, enabled } = req.body;
    
    const buttonStateRef = collections.settings.doc('buttonStates');
    const buttonStateDoc = await buttonStateRef.get();
    const buttonStates = buttonStateDoc.exists ? buttonStateDoc.data() : {};
    
    buttonStates[buttonId] = enabled;
    await buttonStateRef.set(buttonStates, { merge: true });
    
    res.json({ success: true, message: `Button ${enabled ? 'enabled' : 'disabled'} successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all panels (built-in + custom panels from Firestore)
router.get('/', isStaff, async (req, res) => {
  try {
    const cacheKey = 'panels:list';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);
    // Get panel states and button states from Firestore
    const [panelStatesSnapshot, buttonStatesSnapshot] = await Promise.all([
      collections.settings.doc('panelStates').get(),
      collections.settings.doc('buttonStates').get()
    ]);
    const panelStates = panelStatesSnapshot.exists ? panelStatesSnapshot.data() : {};
    const buttonStates = buttonStatesSnapshot.exists ? buttonStatesSnapshot.data() : {};
    
    // Get built-in panels with their button states
    const builtInPanels = Object.values(BOT_PANEL_DEFAULTS).map(p => ({
      ...p,
      isBuiltIn: true,
      enabled: panelStates[p.type] !== false,
      buttons: p.buttons.map(btn => ({
        ...btn,
        enabled: buttonStates[btn.customId] !== false // Default to enabled
      }))
    }));
    
    // Get custom panels from Firestore
    const customPanelsSnapshot = await collections.panels.get();
    const customPanels = customPanelsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      isBuiltIn: false
    }));
    
    // Combine both
    const allPanels = [...builtInPanels, ...customPanels];
    
    cache.set(cacheKey, allPanels, CACHE_TTL.MEDIUM);
    res.json(allPanels);
  } catch (error) {
    console.error('Error fetching panels:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update panel state (enable/disable)
router.put('/:panelId/state', isStaff, async (req, res) => {
  try {
    const { panelId } = req.params;
    const { enabled } = req.body;

    // Update panel state in Firestore
    const statesRef = collections.settings.doc('panelStates');
    await statesRef.set({
      [panelId]: enabled
    }, { merge: true });

    res.json({ 
      success: true, 
      message: `Panel ${enabled ? 'enabled' : 'disabled'} successfully!`
    });
  } catch (error) {
    console.error('Error updating panel state:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get panel by type (directly from bot config)
router.get('/:type', isStaff, async (req, res) => {
  try {
    const { type } = req.params;
    const panel = BOT_PANEL_DEFAULTS[type];
    
    if (!panel) {
      return res.status(404).json({ error: 'Panel type not found' });
    }
    
    res.json(panel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update panel configuration (writes to bot panel file permanently)
router.post('/', isStaff, async (req, res) => {
  try {
    const { type, ...panelData } = req.body;

    if (!BOT_PANEL_DEFAULTS[type]) {
      return res.status(404).json({ error: 'Panel type not found' });
    }

    // Update in-memory configuration
    BOT_PANEL_DEFAULTS[type] = {
      type,
      ...panelData
    };

    // Write to bot panel file
    const panelFileName = `${type}panel.js`;
    // Go up to RealOps root, then into bot/panels
    const panelFilePath = path.join(__dirname, '../../../bot/panels', panelFileName);

    // Read the existing file
    let fileContent = await fs.readFile(panelFilePath, 'utf8');

    // Split file at createResponseEmbed to protect it from regex corruption.
    // Components V2 panels (ContainerBuilder) don't use .setTitle()/.setDescription()
    // in sendPanel, so the regex would accidentally target createResponseEmbed instead.
    const protectBoundary = fileContent.indexOf('function createResponseEmbed');
    let editableSection = protectBoundary > -1 ? fileContent.substring(0, protectBoundary) : fileContent;
    const protectedSection = protectBoundary > -1 ? fileContent.substring(protectBoundary) : '';

    const isComponentsV2 = editableSection.includes('ContainerBuilder');

    if (isComponentsV2) {
      // Components V2 panels use TextDisplayBuilder.setContent() for description
      // Find and update the description text display (the longer content block)
      const descEscaped = panelData.description.replace(/'/g, "\\'").replace(/\n/g, '\\n');
      editableSection = editableSection.replace(
        /(addTextDisplayComponents\(\s*new TextDisplayBuilder\(\)\.setContent\(\s*)\n\s*['"`]([\s\S]*?)['"`]\s*\)/,
        `$1\n                '${descEscaped}'\n            )`
      );
    } else {
      // Traditional embed-based panels
      editableSection = editableSection.replace(
        /\.setTitle\(['"`].*?['"`]\)/s,
        `.setTitle('${panelData.title.replace(/'/g, "\\'")}')`
      );
      editableSection = editableSection.replace(
        /\.setDescription\(\s*['"`]([\s\S]*?)['"`]\s*\)/,
        `.setDescription(\n        '${panelData.description.replace(/'/g, "\\'").replace(/\n/g, "\\n' +\n        '")}'\n    )`
      );
    }

    // Update color (only in sendPanel section)
    editableSection = editableSection.replace(
      /\.setColor\(['"`].*?['"`]\)/,
      `.setColor('${panelData.color}')`
    );

    // Update image if present (only in sendPanel section)
    if (panelData.image) {
      editableSection = editableSection.replace(
        /\.setImage\(['"`].*?['"`]\)/,
        `.setImage('${panelData.image}')`
      );
    }

    // Update thumbnail if present (only in sendPanel section)
    if (panelData.thumbnail) {
      editableSection = editableSection.replace(
        /\.setThumbnail\(['"`].*?['"`]\)/,
        `.setThumbnail('${panelData.thumbnail}')`
      );
    }

    // Update footer text (only in sendPanel section)
    if (panelData.footer?.text) {
      editableSection = editableSection.replace(
        /text:\s*['"`].*?['"`]/,
        `text: '${panelData.footer.text.replace(/'/g, "\\'")}'`
      );
    }

    // Update footer iconURL (only in sendPanel section)
    if (panelData.footer?.iconURL) {
      editableSection = editableSection.replace(
        /iconURL:\s*['"`].*?['"`]/g,
        `iconURL: '${panelData.footer.iconURL}'`
      );
    }

    // Reconstruct the file with protected section intact
    fileContent = editableSection + protectedSection;

    // Write the updated content back to the file
    await fs.writeFile(panelFilePath, fileContent, 'utf8');

    res.json({ 
      success: true, 
      message: 'Panel updated permanently! Changes saved to bot file.',
      data: BOT_PANEL_DEFAULTS[type]
    });
  } catch (error) {
    console.error('Error updating panel:', error);
    res.status(500).json({ error: error.message });
  }
});

// Deploy panel to Discord channel
router.post('/:type/deploy', isStaff, async (req, res) => {
  try {
    const { type } = req.params;
    const { channelId, customPanelId } = req.body;

    if (!type || !channelId) {
      return res.status(400).json({ error: 'Panel type and channel ID are required' });
    }

    let panel;
    
    // Check if it's a built-in panel or custom panel
    if (customPanelId) {
      // Fetch custom panel from Firestore
      const panelDoc = await collections.panels.doc(customPanelId).get();
      if (!panelDoc.exists) {
        return res.status(404).json({ error: 'Custom panel not found' });
      }
      panel = panelDoc.data();
    } else {
      // Use built-in panel
      panel = BOT_PANEL_DEFAULTS[type];
      if (!panel) {
        return res.status(404).json({ error: 'Panel type not found' });
      }
    }

    if (!botManager.client) {
      return res.status(503).json({ error: 'Bot is not connected' });
    }

    // Fetch the channel
    const channel = await botManager.client.channels.fetch(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Create the embed using discord.js classes
    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    
    const embed = new EmbedBuilder()
      .setTitle(panel.title)
      .setDescription(panel.description)
      .setColor(panel.color);

    if (panel.thumbnail) {
      embed.setThumbnail(panel.thumbnail);
    }

    if (panel.image) {
      embed.setImage(panel.image);
    }

    if (panel.footer) {
      embed.setFooter({ 
        text: panel.footer.text, 
        iconURL: panel.footer.iconURL 
      });
    }

    // Create buttons if they exist
    const components = [];
    if (panel.buttons && panel.buttons.length > 0) {
      const row = new ActionRowBuilder();
      
      for (const btn of panel.buttons) {
        const button = new ButtonBuilder()
          .setCustomId(btn.customId)
          .setLabel(btn.label)
          .setStyle(ButtonStyle[btn.style]);

        if (btn.emoji) {
          button.setEmoji(btn.emoji);
        }

        row.addComponents(button);
      }
      
      components.push(row);
    }

    // Send the panel to the channel
    const message = await channel.send({
      embeds: [embed],
      components: components
    });

    res.json({ 
      success: true, 
      message: `${panel.title} deployed successfully to ${channel.name}!`,
      messageId: message.id,
      channelId: channel.id
    });
  } catch (error) {
    console.error('Error deploying panel:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new custom panel
router.post('/custom', isStaff, async (req, res) => {
  try {
    const { name, title, description, color, thumbnail, image, footer, buttons, enabled } = req.body;

    if (!name || !title || !description) {
      return res.status(400).json({ error: 'Name, title, and description are required' });
    }

    // Create panel data
    const panelData = {
      type: name.toLowerCase().replace(/\s+/g, '_'),
      name,
      title,
      description,
      color: color || '#5865F2',
      thumbnail: thumbnail || '',
      image: image || '',
      footer: footer || { text: 'The Real Ops Group', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' },
      buttons: buttons || [],
      enabled: enabled !== undefined ? enabled : true,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    // Save to Firestore
    const docRef = await collections.panels.add(panelData);

    res.json({ 
      success: true, 
      message: 'Custom panel created successfully!',
      id: docRef.id,
      data: { id: docRef.id, ...panelData }
    });
  } catch (error) {
    console.error('Error creating custom panel:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update custom panel (enable/disable or edit)
router.put('/custom/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Update in Firestore
    await collections.panels.doc(id).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    res.json({ 
      success: true, 
      message: 'Custom panel updated successfully!',
      data: { id, ...updateData }
    });
  } catch (error) {
    console.error('Error updating custom panel:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete custom panel
router.delete('/custom/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete from Firestore
    await collections.panels.doc(id).delete();

    res.json({ 
      success: true, 
      message: 'Custom panel deleted successfully!'
    });
  } catch (error) {
    console.error('Error deleting custom panel:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
