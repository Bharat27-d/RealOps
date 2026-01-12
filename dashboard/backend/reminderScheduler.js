const { collections } = require('./firebase');
const botManager = require('./discordManager');

// Store active reminder timeouts
const activeReminders = new Map();

// Schedule all pending reminders on server start
async function initializeReminderScheduler() {
  try {
    console.log('Initializing reminder scheduler...');
    
    // Get all calendar events with reminders enabled that haven't been sent
    const snapshot = await collections.events
      .where('type', '==', 'calendar_event')
      .where('reminder', '==', true)
      .where('reminderSent', '==', false)
      .get();

    let scheduledCount = 0;
    const now = Date.now();

    snapshot.forEach(doc => {
      const event = doc.data();
      
      // Check if event has date and time
      if (!event.date || !event.time) {
        return;
      }

      // Calculate reminder time
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      const reminderMinutes = parseInt(event.reminderTime) || 30; // Default 30 minutes
      const reminderTime = eventDateTime.getTime() - (reminderMinutes * 60 * 1000);
      const delay = reminderTime - now;

      // Only schedule if reminder time is in the future
      if (delay > 0) {
        scheduleReminder(doc.id, delay);
        scheduledCount++;
        
        const minutesUntilReminder = Math.round(delay / 1000 / 60);
        console.log(`Scheduled reminder for event "${event.title}" (${doc.id}) in ${minutesUntilReminder} minutes`);
      } else if (eventDateTime.getTime() > now) {
        // Event hasn't happened yet but reminder time has passed
        // Send reminder immediately
        console.log(`Reminder time passed for event "${event.title}" (${doc.id}), sending immediately`);
        sendCalendarEventReminder(doc.id);
      } else {
        // Event has already passed, mark reminder as sent to avoid future scheduling
        console.log(`Event "${event.title}" (${doc.id}) has passed, skipping reminder`);
        collections.events.doc(doc.id).update({ reminderSent: true });
      }
    });

    console.log(`Reminder scheduler initialized. Scheduled ${scheduledCount} reminders.`);
  } catch (error) {
    // Handle quota exceeded gracefully
    if (error.code === 8 || error.message?.includes('Quota exceeded') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      console.warn('⚠️  Firebase quota exceeded - reminders will be scheduled on next restart');
    } else {
      console.error('Error initializing reminder scheduler:', error);
    }
  }
}

// Schedule a single reminder
function scheduleReminder(eventId, delay) {
  // Clear existing timeout if any
  if (activeReminders.has(eventId)) {
    clearTimeout(activeReminders.get(eventId));
  }

  // Schedule new timeout
  const timeoutId = setTimeout(async () => {
    await sendCalendarEventReminder(eventId);
    activeReminders.delete(eventId);
  }, delay);

  activeReminders.set(eventId, timeoutId);
}

// Send calendar event reminder
async function sendCalendarEventReminder(eventId) {
  try {
    const eventDoc = await collections.events.doc(eventId).get();
    if (!eventDoc.exists) {
      console.log(`Event ${eventId} not found, skipping reminder`);
      return;
    }

    const event = eventDoc.data();

    // Check if reminder was already sent
    if (event.reminderSent) {
      console.log(`Reminder already sent for event ${eventId}`);
      return;
    }

    // Get the default announcement channel from settings
    const settingsDoc = await collections.settings.doc('general').get();
    const settings = settingsDoc.exists ? settingsDoc.data() : {};
    const defaultChannel = settings.eventReminderChannelId;
    const reminderRoleIds = settings.eventReminderRoleIds || []; // Array of roles to tag
    
    if (!defaultChannel) {
      console.log('⚠️ No default event reminder channel configured. Set eventReminderChannelId in Settings > General');
      return;
    }

    const embedData = {
      title: `🔔 Event Reminder: ${event.title}`,
      description: `**This event is starting in 30 minutes!**\n\n${event.description || 'No description available.'}`,
      color: 0xFFD700, // Golden color
      image: event.image || null,
      footer: {
        text: 'The Real Ops Group',
        icon_url: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png'
      },
      timestamp: new Date().toISOString()
    };

    // Add event details
    const fields = [];
    
    if (event.date && event.time) {
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      const unix = Math.floor(eventDateTime.getTime() / 1000);
      fields.push({
        name: '⏰ Event Time',
        value: `<t:${unix}:F> (<t:${unix}:R>)`,
        inline: false
      });
    }

    // Add TruckerMP data if available
    if (event.truckerMpData) {
      const tmp = event.truckerMpData;
      if (tmp.server?.name) fields.push({ name: '🖥️ Server', value: tmp.server.name, inline: true });
      if (tmp.game) fields.push({ name: '🎮 Game', value: tmp.game, inline: true });
      if (tmp.departure?.city) fields.push({ name: '📍 Departure', value: tmp.departure.city, inline: true });
      if (tmp.arrive?.city) fields.push({ name: '🏁 Arrival', value: tmp.arrive.city, inline: true });
      
      if (tmp.id) {
        fields.push({ 
          name: '🔗 Event Link', 
          value: `[View on TruckerMP](https://truckersmp.com/events/${tmp.id})`,
          inline: false
        });
      }
    }

    if (fields.length > 0) {
      embedData.fields = fields;
    }

    // Build content with role mentions if configured
    let content = null;
    if (reminderRoleIds && reminderRoleIds.length > 0) {
      content = reminderRoleIds.map(roleId => `<@&${roleId}>`).join(' ');
    }

    // Send the reminder
    await botManager.sendEmbed(defaultChannel, embedData, content);
    
    // Mark reminder as sent
    await collections.events.doc(eventId).update({
      reminderSent: true,
      reminderSentAt: new Date().toISOString()
    });

    console.log(`✅ Calendar event reminder sent for "${event.title}" (${eventId}) to channel ${defaultChannel}`);
  } catch (error) {
    console.error('❌ Error sending calendar event reminder:', error);
  }
}

// Cancel a reminder
function cancelReminder(eventId) {
  if (activeReminders.has(eventId)) {
    clearTimeout(activeReminders.get(eventId));
    activeReminders.delete(eventId);
    console.log(`Cancelled reminder for event ${eventId}`);
  }
}

// Export functions
module.exports = {
  initializeReminderScheduler,
  scheduleReminder,
  cancelReminder,
  sendCalendarEventReminder
};
