const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { collections } = require('../firebase');
const { isAuthenticated } = require('../auth');

// ─── In-memory cache to reduce Firebase reads ───
let customCommandsCache = null;
let customCommandsCacheTime = 0;
let builtInCommandsCache = null;
let builtInCommandsCacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds

function isCacheValid(cacheTime) {
  return Date.now() - cacheTime < CACHE_TTL;
}

function invalidateCustomCommandsCache() {
  customCommandsCache = null;
  customCommandsCacheTime = 0;
}

function invalidateBuiltInCache() {
  builtInCommandsCache = null;
  builtInCommandsCacheTime = 0;
}

// ─── Sanitize embed data — strip empty strings, validate fields array ───
function sanitizeEmbedData(body) {
  const {
    name, description, title, text, image, thumbnail, enabled,
    color, url, timestamp,
    authorName, authorIcon, authorUrl,
    footerText, footerIcon,
    fields, // array of { name, value, inline } — embed fields
    options // array of { name, description, type, required } — slash command options
  } = body;

  const VALID_OPT_TYPES = ['string', 'number', 'boolean', 'user', 'role', 'channel'];

  const data = {
    name: name !== undefined ? name : undefined,
    description: description || '',
    title: title || '',
    text: text || '',
    image: image || '',
    thumbnail: thumbnail || '',
    color: color || '',
    url: url || '',
    timestamp: timestamp || '',
    authorName: authorName || '',
    authorIcon: authorIcon || '',
    authorUrl: authorUrl || '',
    footerText: footerText || '',
    footerIcon: footerIcon || '',
    enabled: enabled !== undefined ? enabled : true,
    fields: [],
    options: []
  };

  // Validate and sanitize embed fields array
  if (Array.isArray(fields)) {
    data.fields = fields
      .filter(f => f && f.name && f.name.trim() && f.value && f.value.trim())
      .map(f => ({
        name: f.name.trim().substring(0, 256),
        value: f.value.trim().substring(0, 1024),
        inline: !!f.inline
      }));
  }

  // Validate and sanitize command options array
  if (Array.isArray(options)) {
    data.options = options
      .filter(o => o && o.name && o.name.trim())
      .map(o => ({
        name: o.name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').substring(0, 32),
        description: (o.description || 'No description').substring(0, 100),
        type: VALID_OPT_TYPES.includes(o.type) ? o.type : 'string',
        required: !!o.required
      }));
  }

  return data;
}

function decodeSourceString(value, quote) {
  if (!value) return '';
  if (quote === '`') {
    return value.replace(/\\`/g, '`').replace(/\\\$/g, '$');
  }

  return value
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

function extractConstString(content, constName) {
  const match = content.match(new RegExp(`const\\s+${constName}\\s*=\\s*(['"\`])([\\s\\S]*?)\\1`));
  if (!match) return null;
  return decodeSourceString(match[2], match[1]);
}

// Helper: extract editable fields from a command source file
function parseCommandFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fields = {};

  // Extract image: .setImage('url') - more flexible
  const imageMatches = content.match(/\.setImage\s*\(\s*['"`](https?:\/\/[^'"`]+)['"`]\s*\)/g);
  if (imageMatches && imageMatches.length > 0) {
    fields.image = imageMatches[0].match(/https?:\/\/[^'"`]+/)[0];
  }

  // Extract thumbnail: .setThumbnail('url') - more flexible
  const thumbMatches = content.match(/\.setThumbnail\s*\(\s*['"`](https?:\/\/[^'"`]+)['"`]\s*\)/g);
  if (thumbMatches && thumbMatches.length > 0) {
    fields.thumbnail = thumbMatches[0].match(/https?:\/\/[^'"`]+/)[0];
  }

  // Extract color: .setColor('color') - more flexible
  const colorMatch = content.match(/\.setColor\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
  if (colorMatch) {
    fields.color = colorMatch[1];
  }

  // Extract title: .setTitle('title') - more flexible pattern
  const titleMatch = content.match(/\.setTitle\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
  if (titleMatch) {
    fields.title = titleMatch[1];
  }

  // Extract description (first static one) - full content
  // Check for DEFAULT_DESCRIPTION constant (for dynamic descriptions) - support multi-line - highest priority
  const defaultDescription = extractConstString(content, 'DEFAULT_DESCRIPTION');
  // Check for defaultDescription variable assignment - second priority
  const defaultDescriptionVar = extractConstString(content, 'defaultDescription');
  // Look for setDescription in EmbedBuilder context - third priority
  const descMatch = content.match(/const embed = new EmbedBuilder\(\)[\s\S]*?\.setDescription\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
  // Also check for template literal descriptions - fourth priority
  const descTemplateMatch = content.match(/const embed = new EmbedBuilder\(\)[\s\S]*?\.setDescription\s*\(\s*`([^`]+)`\s*\)/);
  // Check for any setDescription call (more flexible) - fifth priority
  const descAnyMatch = content.match(/\.setDescription\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/);
  
  if (defaultDescription) {
    fields.embedDescription = defaultDescription;
  } else if (defaultDescriptionVar) {
    fields.embedDescription = defaultDescriptionVar;
  } else if (descTemplateMatch) {
    fields.embedDescription = descTemplateMatch[1];
  } else if (descMatch) {
    fields.embedDescription = descMatch[1];
  } else if (descAnyMatch) {
    fields.embedDescription = descAnyMatch[1];
  }

  // Extract footer text - more flexible
  const footerMatch = content.match(/text:\s*['"`]([^'"`]+)['"`]/);
  if (footerMatch) {
    fields.footerText = footerMatch[1];
  }

  // Extract footer icon - more flexible
  const footerIconMatch = content.match(/iconURL:\s*['"`](https?:\/\/[^'"`]+)['"`]/);
  if (footerIconMatch) {
    fields.footerIcon = footerIconMatch[1];
  }

  // If no fields were extracted but the file contains EmbedBuilder, return placeholder to enable customization
  if (Object.keys(fields).length === 0 && content.includes('new EmbedBuilder')) {
    return { hasEmbed: true }; // Return placeholder so customize button shows
  }

  return fields;
}

// Get built-in commands with their editable fields + any saved overrides
router.get('/built-in', isAuthenticated, async (req, res) => {
  try {
    // Return cache if valid
    if (builtInCommandsCache && isCacheValid(builtInCommandsCacheTime)) {
      return res.json(builtInCommandsCache);
    }

    const commandsDir = path.join(__dirname, '..', '..', '..', 'bot', 'commands');
    
    console.log('Commands directory:', commandsDir);
    
    if (!fs.existsSync(commandsDir)) {
      console.error('Commands directory does not exist:', commandsDir);
      return res.json([]);
    }

    // Load all saved overrides from Firebase (single read)
    let savedOverrides = {};
    try {
      const overridesSnapshot = await collections.commandOverrides.get();
      overridesSnapshot.forEach(doc => {
        savedOverrides[doc.id] = doc.data();
      });
    } catch (e) {
      console.error('Error loading command overrides:', e);
    }

    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
    const builtInCommands = [];

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(commandsDir, file), 'utf8');
        
        const nameMatch = content.match(/\.setName\(['"`]([^'"`]+)['"`]\)/);
        const descMatch = content.match(/\.setDescription\(['"`]([^'"`]+)['"`]\)/);
        
        if (nameMatch) {
          const cmdName = nameMatch[1];
          let defaults;
          try {
            defaults = parseCommandFile(path.join(commandsDir, file));
          } catch (e) {
            console.error(`Error parsing ${file}:`, e);
            defaults = { hasEmbed: true }; // Fallback to allow customization
          }
          const overrides = savedOverrides[cmdName] || {};

          builtInCommands.push({
            id: `builtin_${cmdName}`,
            name: cmdName,
            description: descMatch ? descMatch[1] : 'No description',
            type: 'built-in',
            file: file,
            enabled: true,
            // Default values from source code
            defaults: defaults,
            // Current overrides from Firebase
            overrides: overrides,
            // Merged values (overrides take priority)
            current: { ...defaults, ...Object.fromEntries(
              Object.entries(overrides).filter(([_, v]) => v !== undefined && v !== '')
            )}
          });
        }
      } catch (fileError) {
        console.error(`Error reading command file ${file}:`, fileError.message);
      }
    }

    // Panel setup commands (no editable content)
    const panelCommands = [
      { name: 'setup-jointeam', description: 'Set up the Join Team panel in the current channel' },
      { name: 'setup-bookus', description: 'Set up the Book Us panel in the current channel' },
      { name: 'setup-support', description: 'Set up the Support panel in the current channel' },
      { name: 'setup-partnership', description: 'Set up the Partnership panel in the current channel' },
      { name: 'setup-founders', description: 'Set up the Founders Manager panel in the current channel' },
      { name: 'setup-hr', description: 'Set up the HR Department panel in the current channel' }
    ];

    for (const cmd of panelCommands) {
      builtInCommands.push({
        id: `builtin_${cmd.name}`,
        name: cmd.name,
        description: cmd.description,
        type: 'built-in',
        file: 'index.js (panel command)',
        enabled: true,
        defaults: {},
        overrides: {},
        current: {}
      });
    }

    // Cache the result
    builtInCommandsCache = builtInCommands;
    builtInCommandsCacheTime = Date.now();

    res.json(builtInCommands);
  } catch (error) {
    console.error('Error reading built-in commands:', error);
    res.status(500).json({ error: 'Failed to read built-in commands' });
  }
});

// Save overrides for a built-in command
router.put('/built-in/:commandName', isAuthenticated, async (req, res) => {
  try {
    const { commandName } = req.params;
    const overrides = req.body;

    // Save to Firebase using command name as doc ID
    await collections.commandOverrides.doc(commandName).set(overrides, { merge: true });

    // Invalidate cache so next GET fetches fresh data
    invalidateBuiltInCache();

    res.json({ success: true, message: `Overrides saved for /${commandName}` });
  } catch (error) {
    console.error('Error saving command overrides:', error);
    res.status(500).json({ error: 'Failed to save overrides' });
  }
});

// Reset overrides for a built-in command (back to defaults)
router.delete('/built-in/:commandName', isAuthenticated, async (req, res) => {
  try {
    const { commandName } = req.params;
    await collections.commandOverrides.doc(commandName).delete();

    // Invalidate cache
    invalidateBuiltInCache();

    res.json({ success: true, message: `Overrides reset for /${commandName}` });
  } catch (error) {
    console.error('Error resetting command overrides:', error);
    res.status(500).json({ error: 'Failed to reset overrides' });
  }
});

// Get all custom commands (with caching)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Return cache if valid
    if (customCommandsCache && isCacheValid(customCommandsCacheTime)) {
      return res.json(customCommandsCache);
    }

    const snapshot = await collections.customCommands.get();
    const commands = [];
    snapshot.forEach(doc => {
      commands.push({ id: doc.id, ...doc.data() });
    });

    // Cache the result
    customCommandsCache = commands;
    customCommandsCacheTime = Date.now();

    res.json(commands);
  } catch (error) {
    console.error('Error fetching custom commands:', error);
    res.status(500).json({ error: 'Failed to fetch custom commands' });
  }
});

// Create a new custom command
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const data = sanitizeEmbedData(req.body);
    
    // Command name must be lowercase and dash/underscore only
    const cleanName = (data.name || '').toLowerCase().replace(/[^a-z0-9_-]/g, '');
    
    if (!cleanName) {
      return res.status(400).json({ error: 'Valid command name is required' });
    }

    // Check local cache first before hitting Firebase
    if (customCommandsCache && customCommandsCache.some(c => c.name === cleanName)) {
      return res.status(400).json({ error: 'Command name already exists' });
    }

    // Fallback: check Firebase if cache is stale
    const querySnapshot = await collections.customCommands.where('name', '==', cleanName).get();
    if (!querySnapshot.empty) {
      return res.status(400).json({ error: 'Command name already exists' });
    }

    const newCommand = {
      ...data,
      name: cleanName,
      description: data.description || 'No description provided',
      createdAt: new Date().toISOString()
    };

    const docRef = await collections.customCommands.add(newCommand);

    // Invalidate cache after write
    invalidateCustomCommandsCache();

    res.status(201).json({ id: docRef.id, ...newCommand });
  } catch (error) {
    console.error('Error creating custom command:', error);
    res.status(500).json({ error: 'Failed to create command' });
  }
});

// Update a custom command
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const data = sanitizeEmbedData(req.body);

    const docRef = collections.customCommands.doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Command not found' });
    }

    const updates = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    // Don't overwrite the name on update
    delete updates.name;

    await docRef.update(updates);

    // Invalidate cache after write
    invalidateCustomCommandsCache();

    res.json({ id, ...doc.data(), ...updates });
  } catch (error) {
    console.error('Error updating custom command:', error);
    res.status(500).json({ error: 'Failed to update command' });
  }
});

// Delete a custom command
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    await collections.customCommands.doc(id).delete();

    // Invalidate cache after write
    invalidateCustomCommandsCache();

    res.json({ success: true, message: 'Command deleted successfully' });
  } catch (error) {
    console.error('Error deleting custom command:', error);
    res.status(500).json({ error: 'Failed to delete command' });
  }
});

module.exports = router;
