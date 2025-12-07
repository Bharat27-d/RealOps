const express = require('express');
const router = express.Router();
const { collections } = require('../firebase');
const { isStaff } = require('../auth');
const discordManager = require('../discordManager');

// Get analytics data
router.get('/overview', isStaff, async (req, res) => {
  try {
    const stats = {
      tickets: await getTicketStats(),
      events: await getEventStats(),
      staff: await getStaffStats(),
      engagement: await getEngagementStats()
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ticket statistics
async function getTicketStats() {
  const snapshot = await collections.tickets.get();
  const tickets = [];
  snapshot.forEach(doc => tickets.push(doc.data()));

  return {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    closed: tickets.filter(t => t.status === 'closed').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    avgResponseTime: calculateAvgResponseTime(tickets),
    dailyTickets: getDailyTickets(tickets)
  };
}

// Get event statistics
async function getEventStats() {
  const snapshot = await collections.events.get();
  const events = [];
  snapshot.forEach(doc => events.push(doc.data()));

  return {
    total: events.length,
    scheduled: events.filter(e => e.status === 'scheduled').length,
    completed: events.filter(e => e.status === 'completed').length,
    cancelled: events.filter(e => e.status === 'cancelled').length,
    upcoming: events.filter(e => new Date(e.date) > new Date()).length
  };
}

// Get staff statistics
async function getStaffStats() {
  const snapshot = await collections.staff.where('isStaff', '==', true).get();
  const staff = [];
  snapshot.forEach(doc => staff.push(doc.data()));

  // Get Team Member role count from Discord
  const TEAM_MEMBER_ROLE_ID = '1291122795190812774';
  const teamMemberCount = await discordManager.getMembersWithRoleCount(TEAM_MEMBER_ROLE_ID);

  return {
    total: teamMemberCount,
    active: staff.filter(s => s.status === 'active').length,
    inactive: staff.filter(s => s.status === 'inactive').length,
    onLeave: staff.filter(s => s.status === 'leave').length
  };
}

// Get engagement statistics
async function getEngagementStats() {
  const ticketSnapshot = await collections.tickets.get();
  const eventSnapshot = await collections.events.get();
  
  return {
    totalInteractions: ticketSnapshot.size + eventSnapshot.size,
    last7Days: calculateLast7DaysActivity(ticketSnapshot, eventSnapshot)
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
    
    const count = tickets.filter(t => 
      t.createdAt && t.createdAt.startsWith(dateStr)
    ).length;

    last7Days.push({ date: dateStr, count });
  }

  return last7Days;
}

function calculateLast7DaysActivity(ticketSnapshot, eventSnapshot) {
  const activities = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    let count = 0;
    ticketSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.createdAt && data.createdAt.startsWith(dateStr)) count++;
    });
    eventSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.createdAt && data.createdAt.startsWith(dateStr)) count++;
    });

    activities.push({ date: dateStr, count });
  }

  return activities;
}

module.exports = router;
