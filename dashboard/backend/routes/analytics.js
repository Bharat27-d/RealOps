const express = require('express');
const router = express.Router();
const { collections } = require('../firebase');
const { isStaff } = require('../auth');
const discordManager = require('../discordManager');
const { cache, CACHE_TTL } = require('../cache');

// Get analytics data with caching
router.get('/overview', isStaff, async (req, res) => {
  try {
    // Check cache first
    const cacheKey = 'analytics:overview';
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Prepare date boundaries
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

    // Fetch counts and recent data
    const [
      totalTicketsSnap, openTicketsSnap, closedTicketsSnap, pendingTicketsSnap,
      totalEventsSnap, scheduledEventsSnap, completedEventsSnap, cancelledEventsSnap,
      recentTicketsSnap, recentEventsSnap, staffSnapshot
    ] = await Promise.all([
      collections.tickets.count().get(),
      collections.tickets.where('status', '==', 'open').count().get(),
      collections.tickets.where('status', '==', 'closed').count().get(),
      collections.tickets.where('status', '==', 'pending').count().get(),
      
      collections.events.count().get(),
      collections.events.where('status', '==', 'scheduled').count().get(),
      collections.events.where('status', '==', 'completed').count().get(),
      collections.events.where('status', '==', 'cancelled').count().get(),
      
      collections.tickets.where('createdAt', '>=', thirtyDaysAgoStr).get(),
      collections.events.where('createdAt', '>=', thirtyDaysAgoStr).get(),
      collections.staff.where('isStaff', '==', true).get()
    ]);

    // Extract recent arrays
    const recentTickets = [];
    recentTicketsSnap.forEach(doc => recentTickets.push(doc.data()));
    
    const recentEvents = [];
    let upcomingEventsCount = 0;
    recentEventsSnap.forEach(doc => {
      const data = doc.data();
      recentEvents.push(data);
      if (data.date && new Date(data.date) > new Date()) {
        upcomingEventsCount++;
      }
    });
    
    const staff = [];
    staffSnapshot.forEach(doc => staff.push(doc.data()));

    // Get Team Member role count from Discord (cached separately)
    const TEAM_MEMBER_ROLE_ID = '1291122795190812774';
    let teamMemberCount = 0;
    try {
      teamMemberCount = await discordManager.getMembersWithRoleCount(TEAM_MEMBER_ROLE_ID);
    } catch (err) {}

    const stats = {
      tickets: {
        total: totalTicketsSnap.data().count,
        open: openTicketsSnap.data().count,
        closed: closedTicketsSnap.data().count,
        pending: pendingTicketsSnap.data().count,
        avgResponseTime: calculateAvgResponseTime(recentTickets),
        dailyTickets: getDailyTickets(recentTickets)
      },
      events: {
        total: totalEventsSnap.data().count,
        scheduled: scheduledEventsSnap.data().count,
        completed: completedEventsSnap.data().count,
        cancelled: cancelledEventsSnap.data().count,
        upcoming: upcomingEventsCount
      },
      staff: getStaffStats(staff, teamMemberCount),
      engagement: {
        totalInteractions: totalTicketsSnap.data().count + totalEventsSnap.data().count,
        last7Days: calculateLast7DaysActivity(recentTickets, recentEvents)
      }
    };

    // Cache for 3 minutes
    cache.set(cacheKey, stats, CACHE_TTL.ANALYTICS);

    res.json(stats);
  } catch (error) {
    if (error.code === 8 || error.message?.includes('Quota exceeded')) {
      const cachedData = cache.get('analytics:overview');
      if (cachedData) {
        return res.json({ ...cachedData, _cached: true, _quotaExceeded: true });
      }
      return res.status(503).json({ 
        error: 'Firebase quota exceeded. Please try again later.',
        retryAfter: 'Quota resets at midnight Pacific Time'
      });
    }
    res.status(500).json({ error: error.message });
  }
});

function getStaffStats(staff, teamMemberCount) {
  return {
    total: teamMemberCount,
    active: staff.filter(s => s.status === 'active').length,
    inactive: staff.filter(s => s.status === 'inactive').length,
    onLeave: staff.filter(s => s.status === 'leave').length
  };
}

function calculateAvgResponseTime(tickets) {
  const responseTimes = tickets
    .filter(t => t.firstResponseAt && t.createdAt)
    .map(t => new Date(t.firstResponseAt) - new Date(t.createdAt));
  
  if (responseTimes.length === 0) return 0;
  const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  return Math.round(avg / 1000 / 60); // minutes
}

function getDailyTickets(tickets) {
  const last7Days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const count = tickets.filter(t => {
      if (!t.createdAt) return false;
      const createdAtStr = typeof t.createdAt === 'string' ? t.createdAt : (t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt));
      return createdAtStr.startsWith(dateStr);
    }).length;

    last7Days.push({ date: dateStr, count });
  }

  return last7Days;
}

function calculateLast7DaysActivity(tickets, events) {
  const activities = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    let count = 0;
    
    tickets.forEach(ticket => {
      if (ticket.createdAt) {
        const createdAtStr = typeof ticket.createdAt === 'string' ? ticket.createdAt : (ticket.createdAt instanceof Date ? ticket.createdAt.toISOString() : String(ticket.createdAt));
        if (createdAtStr.startsWith(dateStr)) count++;
      }
    });
    
    events.forEach(event => {
      if (event.createdAt) {
        const createdAtStr = typeof event.createdAt === 'string' ? event.createdAt : (event.createdAt instanceof Date ? event.createdAt.toISOString() : String(event.createdAt));
        if (createdAtStr.startsWith(dateStr)) count++;
      }
    });

    activities.push({ date: dateStr, count });
  }

  return activities;
}

module.exports = router;
