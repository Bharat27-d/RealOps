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

    // Fetch all data once (instead of multiple times)
    const [ticketSnapshot, eventSnapshot, staffSnapshot] = await Promise.all([
      collections.tickets.get(),
      collections.events.get(),
      collections.staff.where('isStaff', '==', true).get()
    ]);

    // Convert snapshots to arrays once
    const tickets = [];
    ticketSnapshot.forEach(doc => tickets.push(doc.data()));
    
    const events = [];
    eventSnapshot.forEach(doc => events.push(doc.data()));
    
    const staff = [];
    staffSnapshot.forEach(doc => staff.push(doc.data()));

    // Get Team Member role count from Discord (cached separately)
    const TEAM_MEMBER_ROLE_ID = '1291122795190812774';
    const teamMemberCount = await discordManager.getMembersWithRoleCount(TEAM_MEMBER_ROLE_ID);

    const stats = {
      tickets: getTicketStats(tickets),
      events: getEventStats(events),
      staff: getStaffStats(staff, teamMemberCount),
      engagement: getEngagementStats(tickets, events)
    };

    // Cache for 3 minutes
    cache.set(cacheKey, stats, CACHE_TTL.ANALYTICS);

    res.json(stats);
  } catch (error) {
    // Handle quota exceeded gracefully
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

// Get ticket statistics (uses pre-fetched data)
function getTicketStats(tickets) {
  return {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    closed: tickets.filter(t => t.status === 'closed').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    avgResponseTime: calculateAvgResponseTime(tickets),
    dailyTickets: getDailyTickets(tickets)
  };
}

// Get event statistics (uses pre-fetched data)
function getEventStats(events) {
  return {
    total: events.length,
    scheduled: events.filter(e => e.status === 'scheduled').length,
    completed: events.filter(e => e.status === 'completed').length,
    cancelled: events.filter(e => e.status === 'cancelled').length,
    upcoming: events.filter(e => new Date(e.date) > new Date()).length
  };
}

// Get staff statistics (uses pre-fetched data)
function getStaffStats(staff, teamMemberCount) {
  return {
    total: teamMemberCount,
    active: staff.filter(s => s.status === 'active').length,
    inactive: staff.filter(s => s.status === 'inactive').length,
    onLeave: staff.filter(s => s.status === 'leave').length
  };
}

// Get engagement statistics (uses pre-fetched data)
function getEngagementStats(tickets, events) {
  return {
    totalInteractions: tickets.length + events.length,
    last7Days: calculateLast7DaysActivity(tickets, events)
  };
}

// Helper functions
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
    
    // Count tickets created on this date
    tickets.forEach(ticket => {
      if (ticket.createdAt) {
        const createdAtStr = typeof ticket.createdAt === 'string' ? ticket.createdAt : (ticket.createdAt instanceof Date ? ticket.createdAt.toISOString() : String(ticket.createdAt));
        if (createdAtStr.startsWith(dateStr)) count++;
      }
    });
    
    // Count events created on this date
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
