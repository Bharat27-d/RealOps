const express = require('express');
const router = express.Router();
const { collections } = require('../firebase');
const botManager = require('../discordManager');
const { isStaff } = require('../auth');
const fs = require('fs').promises;
const path = require('path');

// Bot panel default configurations
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
  }
};

// Get all panels (directly from bot config)
router.get('/', isStaff, async (req, res) => {
  try {
    const panels = Object.values(BOT_PANEL_DEFAULTS);
    res.json(panels);
  } catch (error) {
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

    // Update the sendPanel function with new values
    // Update title
    fileContent = fileContent.replace(
      /\.setTitle\(['"`].*?['"`]\)/s,
      `.setTitle('${panelData.title.replace(/'/g, "\\'")}')`
    );

    // Update description
    fileContent = fileContent.replace(
      /\.setDescription\(\s*['"`]([\s\S]*?)['"`]\s*\)/,
      `.setDescription(\n        '${panelData.description.replace(/'/g, "\\'").replace(/\n/g, "\\n' +\n        '")}'\n    )`
    );

    // Update color
    fileContent = fileContent.replace(
      /\.setColor\(['"`].*?['"`]\)/,
      `.setColor('${panelData.color}')`
    );

    // Update image if present
    if (panelData.image) {
      fileContent = fileContent.replace(
        /\.setImage\(['"`].*?['"`]\)/,
        `.setImage('${panelData.image}')`
      );
    }

    // Update thumbnail if present
    if (panelData.thumbnail) {
      fileContent = fileContent.replace(
        /\.setThumbnail\(['"`].*?['"`]\)/,
        `.setThumbnail('${panelData.thumbnail}')`
      );
    }

    // Update footer text
    if (panelData.footer?.text) {
      fileContent = fileContent.replace(
        /text:\s*['"`].*?['"`]/,
        `text: '${panelData.footer.text.replace(/'/g, "\\'")}'`
      );
    }

    // Update footer iconURL
    if (panelData.footer?.iconURL) {
      fileContent = fileContent.replace(
        /iconURL:\s*['"`].*?['"`]/g,
        `iconURL: '${panelData.footer.iconURL}'`
      );
    }

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
    const { channelId } = req.body;

    if (!type || !channelId) {
      return res.status(400).json({ error: 'Panel type and channel ID are required' });
    }

    const panel = BOT_PANEL_DEFAULTS[type];
    if (!panel) {
      return res.status(404).json({ error: 'Panel type not found' });
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

module.exports = router;
