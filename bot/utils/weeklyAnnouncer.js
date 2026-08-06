const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const { db } = require('../firebase') || {};

async function runWeeklyAnnouncement(client) {
    console.log('⏰ Running weekly events announcement job...');
    try {
        // Fetch general settings to get the channel ID and roles
        const settingsDoc = await db.collection('settings').doc('general').get();
        const settings = settingsDoc.exists ? settingsDoc.data() : {};
        const channelId = settings.weeklyAnnouncementChannelId;
        const roleIds = settings.weeklyAnnouncementRoleIds || [];
        
        if (!channelId) {
            console.warn('⚠️ Weekly announcement channel not configured in settings. Skipping announcement.');
            return;
        }
        
        const channel = await client.channels.fetch(channelId).catch(() => null);
        if (!channel) {
            console.error(`❌ Could not find weekly announcement channel with ID: ${channelId}`);
            return;
        }
        
        // Calculate date range for the UPCOMING week (Mon-Sun)
        const today = new Date();
        
        // Find the next upcoming Monday (tomorrow, since this runs on Sunday)
        const monday = new Date(today);
        monday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
        monday.setHours(0, 0, 0, 0);
        
        // The Sunday of that upcoming week (6 days after Monday)
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        
        const eventsSnapshot = await db.collection('events')
            .where('type', '==', 'calendar_event')
            .get();
            
        let upcomingEvents = [];
        
        eventsSnapshot.forEach(doc => {
            const event = doc.data();
            if (event.date) {
                const eventDate = new Date(event.date);
                if (eventDate >= monday && eventDate <= sunday) {
                    upcomingEvents.push(event);
                }
            }
        });
        
        upcomingEvents.sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));
        
        if (upcomingEvents.length === 0) {
            console.log('No events found for this upcoming week, skipping announcement.');
            return;
        }
        
        const embed = new EmbedBuilder()
            .setTitle(`📅 Upcoming Events This Week!`)
            .setDescription(`Here are all the events happening from **${monday.toLocaleDateString()}** to **${sunday.toLocaleDateString()}**.`)
            .setColor('#5865F2')
            .setTimestamp()
            .setFooter({ text: 'The Real Ops Group', iconURL: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png' });
            
        upcomingEvents.forEach(event => {
            const eventDateTime = new Date(`${event.date}T${event.time || '00:00'}`);
            const unix = Math.floor(eventDateTime.getTime() / 1000);
            
            let details = `**Time:** <t:${unix}:F> (<t:${unix}:R>)\n`;
            if (event.description) {
                details += `*${event.description}*\n`;
            }
            if (event.truckerMpData && event.truckerMpData.id) {
                details += `[View on TruckerMP](https://truckersmp.com/events/${event.truckerMpData.id})\n`;
            }
            
            embed.addFields({
                name: `🔹 ${event.title}`,
                value: details,
                inline: false
            });
        });
        
        let content = '';
        if (roleIds.length > 0) {
            content = roleIds.map(id => `<@&${id}>`).join(' ');
        }
        
        await channel.send({ content: content || undefined, embeds: [embed] });
        console.log(`✅ Weekly announcement sent to channel ${channelId}`);
        
    } catch (error) {
        console.error('❌ Error running weekly events announcement:', error);
    }
}

function setupWeeklyAnnouncements(client) {
    if (!db) {
        console.warn('[WeeklyAnnouncer] Firebase not available, skipping weekly announcements setup.');
        return;
    }
    console.log('📅 Setting up Weekly Event Announcements cron job (Sunday 19:00 UTC)...');
    
    // Runs at 19:00 every Sunday in UTC timezone
    cron.schedule('0 19 * * 0', () => runWeeklyAnnouncement(client), {
        timezone: "UTC"
    });
}

module.exports = { setupWeeklyAnnouncements, runWeeklyAnnouncement };
