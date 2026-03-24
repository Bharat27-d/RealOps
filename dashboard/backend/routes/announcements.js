const express = require('express');
const router = express.Router();
const cron = require('node-cron');
const { collections } = require('../firebase');
const botManager = require('../discordManager');
const { isStaff } = require('../auth');

// Store scheduled tasks
const scheduledTasks = new Map();

// Initialize scheduled messages on server start
async function initializeScheduledMessages() {
  try {
    // Clean up old sent messages (older than 12 hours)
    await cleanupOldMessages();

    // Load scheduled messages
    const snapshot = await collections.scheduledMessages
      .where('status', '==', 'scheduled')
      .get();

    snapshot.forEach(doc => {
      const message = doc.data();
      scheduleMessage(doc.id, message);
    });

    console.log(`✅ Initialized ${scheduledTasks.size} scheduled messages`);
  } catch (error) {
    // Ignore NOT_FOUND errors (collection doesn't exist yet)
    if (error.code === 5 || error.message.includes('NOT_FOUND')) {
      console.log('ℹ️  No scheduled messages collection yet (will be created on first use)');
    } else if (error.code === 8 || error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('Quota exceeded')) {
      console.warn('⚠️  Firebase quota exceeded - scheduled messages will load on next restart');
      console.warn('   Consider upgrading your Firebase plan or wait for quota reset (usually midnight PT)');
    } else {
      console.error('Error initializing scheduled messages:', error);
    }
  }
}

// Clean up old sent messages (older than 12 hours)
async function cleanupOldMessages() {
  try {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    
    const snapshot = await collections.scheduledMessages
      .where('status', '==', 'sent')
      .get();

    let deletedCount = 0;
    const batch = collections.scheduledMessages.firestore.batch();

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.sentAt && data.sentAt < twelveHoursAgo) {
        batch.delete(doc.ref);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      await batch.commit();
      console.log(`🗑️ Cleaned up ${deletedCount} old sent messages`);
    }
  } catch (error) {
    // Handle quota exceeded gracefully
    if (error.code === 8 || error.message?.includes('Quota exceeded') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      console.warn('⚠️  Firebase quota exceeded - skipping message cleanup');
    } else {
      console.error('Error cleaning up old messages:', error);
    }
  }
}

// Schedule a message
function scheduleMessage(id, messageData) {
  const scheduleTimeStr = messageData.scheduledFor || messageData.scheduleTime;
  if (!scheduleTimeStr) {
    console.error('No schedule time provided for message', id);
    return;
  }

  // Parse the datetime-local input - it comes in format "YYYY-MM-DDTHH:mm"
  // Append ":00.000Z" to make it a valid ISO string in UTC
  let isoString = scheduleTimeStr;
  if (!scheduleTimeStr.includes('Z') && !scheduleTimeStr.includes('+')) {
    // If no timezone info, treat as UTC by adding Z
    if (scheduleTimeStr.length === 16) { // "YYYY-MM-DDTHH:mm"
      isoString = scheduleTimeStr + ':00.000Z';
    } else if (scheduleTimeStr.length === 19) { // "YYYY-MM-DDTHH:mm:ss"
      isoString = scheduleTimeStr + '.000Z';
    } else {
      isoString = scheduleTimeStr + 'Z';
    }
  }

  const scheduledTime = new Date(isoString);
  const now = new Date();

  console.log(`Scheduling message ${id} for ${scheduledTime.toISOString()} (Current: ${now.toISOString()})`);
  console.log(`Time difference: ${Math.round((scheduledTime - now) / 1000)} seconds`);

  if (scheduledTime <= now) {
    // Send immediately if time has passed
    console.log(`⚠️ Schedule time already passed, sending immediately`);
    sendScheduledMessage(id, messageData);
    return;
  }

  // Calculate delay
  let delay = scheduledTime - now;
  
  // Max delay for setTimeout is 2^31-1 ms (~24.8 days) to avoid overflow warning
  const MAX_TIMEOUT = 2147483647;
  if (delay > MAX_TIMEOUT) {
    console.log(`⚠️ Delay ${delay}ms exceeds max timeout, capping to ${MAX_TIMEOUT}ms (~24.8 days)`);
    delay = MAX_TIMEOUT;
  }
  
  console.log(`✅ Message will be sent in ${Math.round(delay / 1000)} seconds (${Math.round(delay / 60000)} minutes)`);

  // Schedule the message
  const timeout = setTimeout(() => {
    sendScheduledMessage(id, messageData);
  }, delay);

  scheduledTasks.set(id, timeout);
}

// Send scheduled message
async function sendScheduledMessage(id, messageData) {
  try {
    console.log(`Executing scheduled message ${id}`, messageData);
    const channelIds = messageData.channelIds || [messageData.channelId];
    
    // Filter out undefined/null/empty channel IDs
    const validChannelIds = (Array.isArray(channelIds) ? channelIds : [channelIds]).filter(id => id && id.trim());
    
    if (validChannelIds.length === 0) {
      throw new Error('No valid channel IDs provided');
    }

    console.log(`Sending to ${validChannelIds.length} channel(s):`, validChannelIds);
    const results = [];

    for (const channelId of validChannelIds) {
      try {
        if (!channelId || typeof channelId !== 'string') {
          console.error(`Invalid channel ID: ${channelId}`);
          results.push({ channelId, success: false, error: 'Invalid channel ID' });
          continue;
        }

        let messageContent = '';
        
        // Add mentions outside embed
        if (messageData.mentions && messageData.mentions.length > 0) {
          const mentionTexts = messageData.mentions.map(mention => {
            if (typeof mention === 'object' && mention.id) {
              if (mention.type === 'user') {
                return `<@${mention.id}>`;
              }
              // Default to role mention
              return `<@&${mention.id}>`;
            }
            // Legacy: assume string ID is a role
            if (typeof mention === 'string') {
              return `<@&${mention}>`;
            }
            return null;
          }).filter(Boolean);
          
          messageContent = mentionTexts.join(' ');
        }

        // Send embed if provided
        if (messageData.embedData && (messageData.embedData.title || messageData.embedData.description)) {
          console.log(`Sending embed to channel ${channelId}`);
          const result = await botManager.sendEmbed(channelId, {
            ...messageData.embedData,
            content: messageContent
          });
          results.push({ channelId, success: true, messageId: result.messageId });
        } else if (messageData.content) {
          // Fallback to plain message if no embed
          const channel = await botManager.client.channels.fetch(channelId);
          const message = await channel.send(messageData.content);
          results.push({ channelId, success: true, messageId: message.id });
        } else {
          console.log(`No content to send for channel ${channelId}`);
          results.push({ channelId, success: false, error: 'No content provided' });
        }
      } catch (error) {
        console.error(`Error sending to channel ${channelId}:`, error);
        results.push({ channelId, success: false, error: error.message });
      }
    }

    // Update status
    await collections.scheduledMessages.doc(id).update({
      status: 'sent',
      sentAt: new Date().toISOString(),
      results
    });

    // Remove from scheduled tasks
    scheduledTasks.delete(id);

    console.log(`✅ Sent scheduled message ${id} to ${channelIds.length} channel(s)`);

    // Schedule auto-delete after 12 hours
    const deleteDelay = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
    setTimeout(async () => {
      try {
        await collections.scheduledMessages.doc(id).delete();
        console.log(`🗑️ Auto-deleted sent message ${id} after 12 hours`);
      } catch (error) {
        console.error(`Error auto-deleting message ${id}:`, error);
      }
    }, deleteDelay);
  } catch (error) {
    console.error(`Error sending scheduled message ${id}:`, error);
    
    await collections.scheduledMessages.doc(id).update({
      status: 'failed',
      error: error.message
    });

    scheduledTasks.delete(id);
  }
}

// Get all scheduled messages
router.get('/', isStaff, async (req, res) => {
  try {
    // Get all documents without ordering (to avoid index requirement)
    const snapshot = await collections.scheduledMessages.get();
    
    const messages = [];
    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort in memory by scheduledFor or scheduleTime
    messages.sort((a, b) => {
      const timeA = new Date(a.scheduledFor || a.scheduleTime || 0);
      const timeB = new Date(b.scheduledFor || b.scheduleTime || 0);
      return timeA - timeB;
    });
    
    console.log(`Retrieved ${messages.length} scheduled messages`);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching scheduled messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create scheduled message
router.post('/', isStaff, async (req, res) => {
  try {
    const { scheduleTime, channelIds, mentions, embedData, repeat } = req.body;

    if (!scheduleTime) {
      return res.status(400).json({ error: 'Schedule time is required' });
    }

    if (!channelIds || channelIds.length === 0) {
      return res.status(400).json({ error: 'At least one channel is required' });
    }

    // Validate channelIds are valid strings
    const validChannelIds = (Array.isArray(channelIds) ? channelIds : [channelIds])
      .filter(id => id && typeof id === 'string' && id.trim().length > 0)
      .map(id => id.trim());

    if (validChannelIds.length === 0) {
      return res.status(400).json({ error: 'No valid channel IDs provided' });
    }

    const messageData = {
      scheduledFor: scheduleTime,
      scheduleTime: scheduleTime,
      channelIds: validChannelIds,
      mentions: mentions || [],
      embedData: embedData || {},
      repeat: repeat || 'none',
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      status: 'scheduled'
    };

    console.log('Creating scheduled message:', JSON.stringify(messageData, null, 2));

    const docRef = await collections.scheduledMessages.add(messageData);
    
    // Schedule the message
    scheduleMessage(docRef.id, messageData);

    res.json({ id: docRef.id, ...messageData });
  } catch (error) {
    console.error('Error creating scheduled message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update scheduled message
router.put('/:id', isStaff, async (req, res) => {
  try {
    const doc = await collections.scheduledMessages.doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const currentData = doc.data();

    if (currentData.status !== 'scheduled') {
      return res.status(400).json({ error: 'Cannot update already sent message' });
    }

    // Cancel existing schedule
    if (scheduledTasks.has(req.params.id)) {
      clearTimeout(scheduledTasks.get(req.params.id));
      scheduledTasks.delete(req.params.id);
    }

    // Update data
    const updatedData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
      updatedBy: req.user.id
    };

    await collections.scheduledMessages.doc(req.params.id).update(updatedData);

    // Reschedule
    const fullData = { ...currentData, ...updatedData };
    scheduleMessage(req.params.id, fullData);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel scheduled message
router.delete('/:id', isStaff, async (req, res) => {
  try {
    const doc = await collections.scheduledMessages.doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Cancel schedule
    if (scheduledTasks.has(req.params.id)) {
      clearTimeout(scheduledTasks.get(req.params.id));
      scheduledTasks.delete(req.params.id);
    }

    // Update status
    await collections.scheduledMessages.doc(req.params.id).update({
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancelledBy: req.user.id
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send announcement to multiple channels
router.post('/announce', isStaff, async (req, res) => {
  try {
    const { channelIds, content, embedData, mentions } = req.body;

    if (!channelIds || channelIds.length === 0) {
      return res.status(400).json({ error: 'No channels specified' });
    }

    const results = [];

    for (const channelId of channelIds) {
      try {
        let messageContent = content || '';
        
        // Add mentions outside embed (from mentions field)
        if (mentions && mentions.length > 0) {
          const mentionTexts = mentions.map(mention => {
            if (typeof mention === 'object' && mention.id) {
              if (mention.type === 'user') {
                return `<@${mention.id}>`;
              }
              // Default to role mention
              return `<@&${mention.id}>`;
            }
            // Legacy: assume string ID is a role
            if (typeof mention === 'string') {
              return `<@&${mention}>`;
            }
            return null;
          }).filter(Boolean);
          
          const mentionText = mentionTexts.join(' ');
          messageContent = mentionText + (messageContent ? '\n' + messageContent : '');
        }

        if (embedData && embedData.title) {
          // Don't modify embed description - user can use <@&roleId> format directly
          // Just pass the description as-is for manual mentions
          const embedDescription = embedData.description || '';

          console.log('Sending embed to channel:', channelId, {
            title: embedData.title,
            description: embedDescription,
            color: embedData.color,
            content: messageContent
          });

          const result = await botManager.sendEmbed(channelId, {
            ...embedData,
            description: embedDescription,
            content: messageContent
          });
          results.push({ channelId, success: true, messageId: result.messageId });
        } else {
          const channel = await botManager.client.channels.fetch(channelId);
          const message = await channel.send(messageContent);
          results.push({ channelId, success: true, messageId: message.id });
        }
      } catch (error) {
        console.error('Error sending to channel:', channelId, error);
        results.push({ channelId, success: false, error: error.message });
      }
    }

    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { router, initializeScheduledMessages };
