const express = require('express');
const router = express.Router();
const { collections } = require('../firebase');
const botManager = require('../discordManager');
const { isStaff } = require('../auth');
const reminderScheduler = require('../reminderScheduler');
const { cache, CACHE_TTL } = require('../cache');

// Get all events with caching
router.get('/', isStaff, async (req, res) => {
  try {
    // Check cache first (short TTL since events change frequently)
    const cacheKey = 'events:all';
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const snapshot = await collections.events.orderBy('date', 'desc').get();
    const events = [];
    const now = new Date();
    const deletedEvents = [];
    
    snapshot.forEach(doc => {
      const eventData = doc.data();
      
      // Auto-delete calendar events 1 day after the event date
      if (eventData.type === 'calendar_event' && eventData.date) {
        const eventDate = new Date(eventData.date);
        const today = new Date();
        
        // Set both to midnight for day comparison
        eventDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        // Calculate difference in days
        const daysDifference = Math.floor((today - eventDate) / (1000 * 60 * 60 * 24));
        
        // Delete if more than 1 day has passed since the event
        if (daysDifference > 1) {
          collections.events.doc(doc.id).delete();
          deletedEvents.push(doc.id);
          return; // Don't add to events list
        }
      }
      
      events.push({ id: doc.id, ...eventData });
    });
    
    if (deletedEvents.length > 0) {
      console.log(`Auto-deleted ${deletedEvents.length} past calendar events`);
    }
    
    // Cache for 30 seconds
    cache.set(cacheKey, events, CACHE_TTL.SHORT);
    
    res.json(events);
  } catch (error) {
    // Handle quota exceeded
    if (error.code === 8 || error.message?.includes('Quota exceeded')) {
      const cachedData = cache.get('events:all');
      if (cachedData) {
        return res.json(cachedData);
      }
      return res.status(503).json({ error: 'Firebase quota exceeded' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Create event
router.post('/', isStaff, async (req, res) => {
  try {
    const { type, scheduleTime, reminder, reminderTime, ...eventData } = req.body;

    // Handle different event types
    if (type === 'scenario_pack') {
      // Send scenario pack immediately (matching /realopsscenarios command)
      const { channelId, userId, scenarios, header } = eventData;

      const embeds = [
        {
          title: header.title || 'Real Ops Event Scenarios',
          description: header.description || 'Our planning team have completed the scenarios for your event, please look over these and let us know if you would like any changes.',
          color: header.color || '#00b894',
          thumbnail: header.logo || 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png',
          timestamp: false
        },
        ...scenarios.map((scenario, index) => ({
          title: scenario.title,
          description: scenario.description || 'No description provided.',
          color: scenario.color || '#00b894',
          image: scenario.image,
          thumbnail: header.logo || 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png',
          footer: {
            text: header.footer || 'The Real Ops Group',
            iconURL: header.logo || 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
          }
        }))
      ];

      const content = userId ? `<@${userId}>` : null;
      const result = await botManager.sendMultipleEmbeds(channelId, embeds, content);

      // Save to database
      const docRef = await collections.events.add({
        type: 'scenario_pack',
        ...eventData,
        createdBy: req.user.id,
        createdAt: new Date().toISOString(),
        status: 'sent',
        messageId: result.messageId
      });

      return res.json({ id: docRef.id, success: true });
    }

    if (type === 'calendar_event') {
      // Calendar event from TruckerMP - save to database
      const fullEventData = {
        ...eventData,
        type: 'calendar_event',
        createdBy: req.user.id,
        createdAt: new Date().toISOString(),
        reminder: reminder || false,
        reminderTime: reminderTime || null,
        reminderSent: false
      };

      const docRef = await collections.events.add(fullEventData);

      // Schedule reminder if enabled and event has date/time
      if (reminder && eventData.date && eventData.time) {
        const eventDateTime = new Date(`${eventData.date}T${eventData.time}`);
        const reminderMinutes = parseInt(reminderTime) || 120; // Default 2 hours
        const reminderDelay = eventDateTime.getTime() - (reminderMinutes * 60 * 1000) - Date.now();
        
        if (reminderDelay > 0) {
          reminderScheduler.scheduleReminder(docRef.id, reminderDelay);
          console.log(`Scheduled reminder for calendar event ${docRef.id} in ${Math.round(reminderDelay / 1000 / 60)} minutes`);
        } else {
          console.log(`Reminder time has passed for event ${docRef.id}, skipping reminder`);
        }
      }

      return res.json({ id: docRef.id, ...fullEventData });
    }

    if (type === 'announcement') {
      const fullEventData = {
        ...eventData,
        type: 'announcement',
        createdBy: req.user.id,
        createdAt: new Date().toISOString(),
        status: scheduleTime ? 'scheduled' : 'sent'
      };

      // If scheduled, save and schedule
      if (scheduleTime) {
        const docRef = await collections.events.add(fullEventData);
        
        // Schedule the announcement
        const scheduleDate = new Date(scheduleTime);
        const delay = scheduleDate.getTime() - Date.now();
        
        if (delay > 0) {
          setTimeout(async () => {
            await sendEventAnnouncement(docRef.id);
          }, delay);
        }

        // Schedule reminder if enabled
        if (reminder && reminderTime && eventData.date && eventData.time) {
          const eventDateTime = new Date(`${eventData.date}T${eventData.time}`);
          const reminderDelay = eventDateTime.getTime() - (parseInt(reminderTime) * 60 * 1000) - Date.now();
          
          if (reminderDelay > 0) {
            setTimeout(async () => {
              await sendEventReminder(docRef.id);
            }, reminderDelay);
          }
        }

        return res.json({ id: docRef.id, ...fullEventData });
      }

      // Send immediately (matching /staff-resources command for TruckerMP events)
      const embedData = {
        title: eventData.title,
        description: eventData.description,
        color: eventData.color || '#3498db',
        image: eventData.image,
        footer: {
          text: 'The Real Ops Group',
          iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
        },
        timestamp: true,
        url: eventData.truckerMpData ? `https://truckersmp.com/events/${eventData.truckerMpData.id}` : null
      };

      // Add fields for date/time or TruckerMP data
      if (eventData.truckerMpData) {
        const tmp = eventData.truckerMpData;
        embedData.fields = [
          { name: 'Server', value: tmp.server?.name || 'N/A', inline: true },
          { name: 'Game', value: tmp.game || 'N/A', inline: true }
        ];
        
        if (tmp.departure?.city) embedData.fields.push({ name: 'Departure', value: tmp.departure.city, inline: true });
        if (tmp.arrive?.city) embedData.fields.push({ name: 'Arrival', value: tmp.arrive.city, inline: true });
        
        // Use Discord timestamps for meetup and start times
        if (tmp.meetup_at) {
          // TruckerMP returns UTC time, ensure it's parsed as UTC
          const utcDate = tmp.meetup_at.includes('Z') ? tmp.meetup_at : tmp.meetup_at.replace(' ', 'T') + 'Z';
          const unix = Math.floor(new Date(utcDate).getTime() / 1000);
          console.log('Meetup timestamp:', tmp.meetup_at, '-> UTC:', utcDate, '-> Unix:', unix);
          embedData.fields.push({ 
            name: 'Meetup Time', 
            value: `<t:${unix}:F> (<t:${unix}:d>)`, 
            inline: false 
          });
        }
        if (tmp.start_at) {
          // TruckerMP returns UTC time, ensure it's parsed as UTC
          const utcDate = tmp.start_at.includes('Z') ? tmp.start_at : tmp.start_at.replace(' ', 'T') + 'Z';
          const unix = Math.floor(new Date(utcDate).getTime() / 1000);
          console.log('Start timestamp:', tmp.start_at, '-> UTC:', utcDate, '-> Unix:', unix);
          embedData.fields.push({ 
            name: 'Start Time', 
            value: `<t:${unix}:F> (<t:${unix}:d>)`, 
            inline: false 
          });
        }

        embedData.fields.push({ name: 'Event Link', value: `[View on TruckerMP](https://truckersmp.com/events/${tmp.id})` });
        
        if (eventData.spreadsheetLink) {
          embedData.fields.push({ name: 'Spreadsheet Link', value: `[Open Sheet](${eventData.spreadsheetLink})` });
        }
        if (eventData.profileLink) {
          embedData.fields.push({ name: 'Profile Link', value: `[Open Profile](${eventData.profileLink})` });
        }

        if (tmp.map) embedData.image = tmp.map;
      } else if (eventData.date && eventData.time) {
        // Convert manual date/time to Discord timestamp
        const eventDateTime = new Date(`${eventData.date}T${eventData.time}`);
        const unix = Math.floor(eventDateTime.getTime() / 1000);
        embedData.fields = [
          { 
            name: '📅 Event Time', 
            value: `<t:${unix}:F> (<t:${unix}:R>)`, 
            inline: false 
          }
        ];
      }

      // Build role mentions
      let content = null;
      if (eventData.roles && eventData.roles.length > 0) {
        content = eventData.roles.map(roleId => `<@&${roleId}>`).join(' ');
      }

      const result = await botManager.sendEmbed(eventData.channelId, embedData, content);
      
      const docRef = await collections.events.add({
        ...fullEventData,
        messageId: result.messageId
      });

      return res.json({ id: docRef.id, success: true });
    }

    // Default event creation
    const docRef = await collections.events.add({
      ...eventData,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      status: 'scheduled'
    });

    // Invalidate events cache
    cache.invalidate('events:*');
    cache.invalidate('analytics:*');

    res.json({ id: docRef.id, ...eventData });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to send event announcement
async function sendEventAnnouncement(eventId) {
  try {
    const eventDoc = await collections.events.doc(eventId).get();
    const event = eventDoc.data();

    const embedData = {
      title: event.title,
      description: event.description,
      color: event.color || '#5865F2',
      image: event.image,
      footer: {
        text: 'The Real Ops Group',
        iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
      },
      timestamp: true
    };

    if (event.date && event.time) {
      embedData.fields = [
        { name: '📅 Date', value: event.date, inline: true },
        { name: '🕐 Time', value: event.time, inline: true }
      ];
    }

    const result = await botManager.sendEmbed(event.channelId, embedData);
    
    await collections.events.doc(eventId).update({
      status: 'sent',
      sentAt: new Date().toISOString(),
      messageId: result.messageId
    });

    console.log(`Event announcement sent for ${eventId}`);
  } catch (error) {
    console.error('Error sending scheduled event:', error);
  }
}

// Helper function to send event reminder
async function sendEventReminder(eventId) {
  try {
    const eventDoc = await collections.events.doc(eventId).get();
    const event = eventDoc.data();

    const embedData = {
      title: `🔔 Reminder: ${event.title}`,
      description: `Don't forget! This event is coming up soon.\n\n${event.description}`,
      color: '#f39c12',
      image: event.image,
      footer: {
        text: 'The Real Ops Group',
        iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
      },
      timestamp: true
    };

    if (event.date && event.time) {
      embedData.fields = [
        { name: '📅 Date', value: event.date, inline: true },
        { name: '🕐 Time', value: event.time, inline: true }
      ];
    }

    await botManager.sendEmbed(event.channelId, embedData);
    console.log(`Event reminder sent for ${eventId}`);
  } catch (error) {
    console.error('Error sending event reminder:', error);
  }
}

// Update event
router.put('/:id', isStaff, async (req, res) => {
  try {
    await collections.events.doc(req.params.id).update(req.body);
    // Invalidate events cache
    cache.invalidate('events:*');
    cache.invalidate('analytics:*');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete event
router.delete('/:id', isStaff, async (req, res) => {
  try {
    // Cancel reminder if it exists
    reminderScheduler.cancelReminder(req.params.id);
    
    await collections.events.doc(req.params.id).delete();
    // Invalidate events cache
    cache.invalidate('events:*');
    cache.invalidate('analytics:*');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send event announcement
router.post('/:id/announce', isStaff, async (req, res) => {
  try {
    const { channelId } = req.body;
    const eventDoc = await collections.events.doc(req.params.id).get();
    const event = eventDoc.data();

    const embedData = {
      title: event.title,
      description: event.description,
      color: event.color || '#00b894',
      image: event.image,
      footer: {
        text: 'The Real Ops Group',
        iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
      },
      timestamp: true,
      fields: [
        { name: '📅 Date', value: event.date, inline: true },
        { name: '🕐 Time', value: event.time, inline: true }
      ]
    };

    const result = await botManager.sendEmbed(channelId, embedData);
    
    await collections.events.doc(req.params.id).update({
      announcedAt: new Date().toISOString(),
      announcementMessageId: result.messageId
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get forum configuration
router.get('/forum-config', isStaff, async (req, res) => {
  try {
    const configDoc = await collections.settings.doc('forumConfig').get();
    if (configDoc.exists) {
      res.json(configDoc.data());
    } else {
      res.json({
        forumId: '',
        autoLock: false,
        lockAfterDays: 7,
        autoArchive: false,
        archiveAfterDays: 30
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update forum configuration
router.post('/forum-config', isStaff, async (req, res) => {
  try {
    await collections.settings.doc('forumConfig').set(req.body, { merge: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create forum thread for event
router.post('/create-forum', isStaff, async (req, res) => {
  try {
    const { forumId, title, message } = req.body;
    
    const result = await botManager.createForumThread(forumId, title, message);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint for TruckerMP API (to avoid CORS issues)
router.get('/truckersmp/:eventId', isStaff, async (req, res) => {
  try {
    const { eventId } = req.params;
    const axios = require('axios');
    
    const response = await axios.get(`https://api.truckersmp.com/v2/events/${eventId}`);
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;
