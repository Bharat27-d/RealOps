const express = require('express');
const router = express.Router();
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { collections } = require('../firebase');
const { cache, CACHE_TTL } = require('../cache');
const botManager = require('../discordManager');

// Enable open CORS for all public read endpoints
router.use(cors());

// Rate limiter for contact submissions — max 5 messages per hour per IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many contact submissions. Please try again after an hour.' }
});

const STAFF_ROLE_IDS = [
  '1291116832308068448', // Founder
  '1291139504786378823', // Co-Founder
  '1386691716945543240', // Developer
  '1291144543630262292', // Project Manager
  '1488997119162318970', // Snr Event Manager
  '1300834129780150272', // Partner Manager
  '1291121579207692430', // Event Manager
  '1344406747955200081', // Snr Support Manager
  '1296422181806542898', // Media Manager
  '1291123331591831632', // Social Media Manager
  '1292896422949163120', // HR Department
  '1291394387888177193', // Support Staff
  '1291122540864864348', // Event Supervisor
  '1291818052744253612', // Planner
  '1345496957082406972', // Junior Planner
  '1296423697711894528'  // Media Team
];

const ROLE_NAMES = {
  '1291116832308068448': 'Founder',
  '1291139504786378823': 'Co-Founder',
  '1386691716945543240': 'Developer',
  '1291144543630262292': 'Project Manager',
  '1488997119162318970': 'Snr Event Manager',
  '1300834129780150272': 'Partner Manager',
  '1291121579207692430': 'Event Manager',
  '1344406747955200081': 'Snr Support Manager',
  '1296422181806542898': 'Media Manager',
  '1291123331591831632': 'Social Media Manager',
  '1292896422949163120': 'HR Department',
  '1291394387888177193': 'Support Staff',
  '1291122540864864348': 'Event Supervisor',
  '1291818052744253612': 'Planner',
  '1345496957082406972': 'Junior Planner',
  '1296423697711894528': 'Media Team'
};

// ============================================================
// PUBLIC API — No authentication required
// Read-only endpoints that expose publicly-safe data
// for the RealOps public website.
// ============================================================

const PUBLIC_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// GET /api/public/events — Upcoming calendar events
router.get('/events', async (req, res) => {
  try {
    const cacheKey = 'public:events';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const snapshot = await collections.events
      .where('type', '==', 'calendar_event')
      .get();

    const events = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Ignore archived events
      if (data.archived) return;

      // Only include future or today's events
      if (data.date && data.date >= todayStr) {
        events.push({
          id: doc.id,
          title: data.title || 'Untitled Event',
          date: data.date || null,
          time: data.time || null,
          server: data.server || data.truckerMpData?.server?.name || null,
          image: data.truckerMpData?.banner || data.image || null,
          map: data.truckerMpData?.map || data.image || null,
          attendance: data.attendance || data.truckerMpData?.attendances?.confirmed || 0,
          status: data.status || 'scheduled',
          description: data.description || '',
          departure: data.truckerMpData?.departure?.city || null,
          arrival: data.truckerMpData?.arrive?.city || null,
          eventLink: data.truckerMpData?.id
            ? `https://truckersmp.com/events/${data.truckerMpData.id}`
            : null
        });
      }
    });

    // Sort by date ascending in-memory
    events.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.localeCompare(b.date);
    });

    cache.set(cacheKey, events, PUBLIC_CACHE_TTL);
    res.json(events);
  } catch (error) {
    if (error.code === 8 || error.message?.includes('Quota exceeded')) {
      const cachedData = cache.get('public:events');
      if (cachedData) return res.json(cachedData);
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }
    console.error('Public events error:', error.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/public/staff — Active staff members
router.get('/staff', async (req, res) => {
  try {
    const cacheKey = 'public:staff';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const members = await botManager.getGuildMembers(STAFF_ROLE_IDS);
    
    // Sort logic from Staff.js
    const getHighestRolePriority = (member) => {
      for (let i = 0; i < STAFF_ROLE_IDS.length; i++) {
        if (member.roles.some(role => role.id === STAFF_ROLE_IDS[i])) return i;
      }
      return STAFF_ROLE_IDS.length;
    };
    
    members.sort((a, b) => getHighestRolePriority(a) - getHighestRolePriority(b));

    const staffList = members.map(member => {
      const staffRoles = member.roles
        .filter(r => STAFF_ROLE_IDS.includes(r.id))
        .sort((a, b) => STAFF_ROLE_IDS.indexOf(a.id) - STAFF_ROLE_IDS.indexOf(b.id))
        .map(r => ROLE_NAMES[r.id] || r.name);
           
      const position = staffRoles[0] || 'Team Member';
       
      let department = 'General';
      if (position.includes('Founder') || position.includes('Co-Founder') || position.includes('Developer') || position.includes('Project Manager')) department = 'Management';
      else if (position.includes('Snr Event') || position.includes('Partner') || position.includes('Event Manager') || position.includes('Snr Support')) department = 'Management';
      else if (position.includes('Media Manager') || position.includes('Social Media')) department = 'Media';
      else if (position.includes('HR') || position.includes('Human')) department = 'Human Resources';
      else if (position.includes('Support Staff')) department = 'Support';
      else if (position.includes('Event Supervisor') || position.includes('Planner')) department = 'Events';
      else if (position.includes('Media Team')) department = 'Media';
       
      return {
        id: member.id,
        name: member.nickname || member.username,
        avatar: member.avatar,
        position: position,
        department: department,
        roles: staffRoles,
        status: 'active',
        joinDate: member.joinedAt
      };
    });


    cache.set(cacheKey, staffList, PUBLIC_CACHE_TTL);
    res.json(staffList);
  } catch (error) {
    if (error.code === 8 || error.message?.includes('Quota exceeded')) {
      const cachedData = cache.get('public:staff');
      if (cachedData) return res.json(cachedData);
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }
    console.error('Public staff error:', error.message);
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

// GET /api/public/stats — Aggregate statistics
router.get('/stats', async (req, res) => {
  try {
    const cacheKey = 'public:stats';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const [eventsSnap, partnershipsSnap, completedSnap] = await Promise.all([
      collections.events.count().get(),
      collections.partnerships.count().get(),
      collections.events.where('status', '==', 'completed').count().get()
    ]);

    let teamMemberCount = 0;
    try {
      teamMemberCount = await botManager.getMembersWithRoleCount('1291122795190812774');
    } catch (err) {
      console.error('Error fetching team member count:', err);
    }

    const stats = {
      totalEvents: eventsSnap.data().count || 0,
      completedEvents: completedSnap.data().count || 0,
      totalStaff: teamMemberCount || 0,
      activePartnerships: partnershipsSnap.data().count || 0,
      // Founded year — used to calculate "Years of Service"
      foundedYear: 2021
    };

    cache.set(cacheKey, stats, PUBLIC_CACHE_TTL);
    res.json(stats);
  } catch (error) {
    if (error.code === 8 || error.message?.includes('Quota exceeded')) {
      const cachedData = cache.get('public:stats');
      if (cachedData) return res.json(cachedData);
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }
    console.error('Public stats error:', error.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/public/partnerships — Active partnerships
router.get('/partnerships', async (req, res) => {
  try {
    const cacheKey = 'public:partnerships';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const snapshot = await collections.partnerships.orderBy('createdAt', 'desc').get();
    const partnerships = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      // Show active/approved/accepted AND pending partnerships publicly
      if (data.status === 'active' || data.status === 'approved' || data.status === 'accepted' || data.status === 'pending') {
        partnerships.push({
          id: doc.id,
          name: data.serverName || data.partnerName || data.name || 'Partner',
          logo: data.logo || null,
          description: data.description || data.announcementText || '',
          url: data.website || data.serverInvite || data.discordInvite || data.inviteLink || null
        });
      }
    });

    cache.set(cacheKey, partnerships, PUBLIC_CACHE_TTL);
    res.json(partnerships);
  } catch (error) {
    if (error.code === 8 || error.message?.includes('Quota exceeded')) {
      const cachedData = cache.get('public:partnerships');
      if (cachedData) return res.json(cachedData);
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }
    console.error('Public partnerships error:', error.message);
    res.status(500).json({ error: 'Failed to fetch partnerships' });
  }
});

// GET /api/public/recruitment — Open staff positions
router.get('/recruitment', async (req, res) => {
  try {
    const cacheKey = 'public:recruitment';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(cachedData);

    const snapshot = await collections.staff
      .doc('openings')
      .collection('positions')
      .orderBy('createdAt', 'desc')
      .get();

    const positions = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      positions.push({
        id: doc.id,
        title: data.title || 'Untitled Position',
        description: data.description || '',
        requirements: data.requirements || '',
        roles: (data.roles || []).filter(r => r.status === 'open'),
        createdAt: data.createdAt || null
      });
    });

    // Only return positions that have at least one open role
    const openPositions = positions.filter(p => p.roles.length > 0);

    cache.set(cacheKey, openPositions, PUBLIC_CACHE_TTL);
    res.json(openPositions);
  } catch (error) {
    if (error.code === 8 || error.message?.includes('Quota exceeded')) {
      const cachedData = cache.get('public:recruitment');
      if (cachedData) return res.json(cachedData);
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }
    console.error('Public recruitment error:', error.message);
    res.status(500).json({ error: 'Failed to fetch recruitment data' });
  }
});
// POST /api/public/contact — Handle contact form submissions (rate-limited)
router.post('/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, discord, subject, message } = req.body;

    if (!name || !discord || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const channelId = process.env.DISCORD_CONTACT_CHANNEL;
    
    if (!channelId) {
      console.warn('Contact form submitted but DISCORD_CONTACT_CHANNEL is not configured.');
      // Still return success to user so they don't see an error if backend isn't fully configured
      return res.json({ success: true, warning: 'Discord channel not configured' });
    }

    const embedData = {
      title: '📬 New Contact Form Submission',
      color: '#ff6b35', // Primary brand color
      description: message,
      timestamp: true,
      footer: { text: `Subject: ${subject.toUpperCase()}` }
    };

    // Add fields
    const content = `**Name:** ${name}\n**Email:** ${email}\n**Discord:** ${discord || 'Not provided'}`;

    await botManager.sendEmbed(channelId, embedData, content);

    res.json({ success: true });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Failed to process submission' });
  }
});

module.exports = router;
