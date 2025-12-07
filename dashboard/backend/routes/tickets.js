const express = require('express');
const router = express.Router();
const { collections } = require('../firebase');
const { isStaff } = require('../auth');

// Get all tickets
router.get('/', isStaff, async (req, res) => {
  try {
    const { status, assignedTo } = req.query;
    let query = collections.tickets;

    if (status) {
      query = query.where('status', '==', status);
    }
    if (assignedTo) {
      query = query.where('assignedTo', '==', assignedTo);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const tickets = [];
    snapshot.forEach(doc => {
      tickets.push({ id: doc.id, ...doc.data() });
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ticket by ID with full transcript
router.get('/:id', isStaff, async (req, res) => {
  try {
    const doc = await collections.tickets.doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update ticket
router.put('/:id', isStaff, async (req, res) => {
  try {
    await collections.tickets.doc(req.params.id).update({
      ...req.body,
      updatedAt: new Date().toISOString()
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add message to ticket transcript
router.post('/:id/messages', isStaff, async (req, res) => {
  try {
    const { message, author } = req.body;
    const ticketRef = collections.tickets.doc(req.params.id);
    
    await ticketRef.update({
      transcript: admin.firestore.FieldValue.arrayUnion({
        message,
        author,
        timestamp: new Date().toISOString()
      }),
      updatedAt: new Date().toISOString()
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ticket analytics
router.get('/analytics/stats', isStaff, async (req, res) => {
  try {
    const snapshot = await collections.tickets.get();
    const tickets = [];
    snapshot.forEach(doc => {
      tickets.push(doc.data());
    });

    const stats = {
      total: tickets.length,
      active: tickets.filter(t => t.status === 'open').length,
      pending: tickets.filter(t => t.status === 'pending').length,
      closed: tickets.filter(t => t.status === 'closed').length,
      avgResponseTime: calculateAvgResponseTime(tickets),
      byDepartment: groupByDepartment(tickets)
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View HTML transcript
router.get('/:id/transcript/html', isStaff, async (req, res) => {
  try {
    const doc = await collections.tickets.doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).send('<html><body><h1>Ticket not found</h1></body></html>');
    }
    
    const ticketData = doc.data();
    if (!ticketData.transcriptHtml) {
      return res.status(404).send('<html><body><h1>No HTML transcript available</h1><p>This ticket does not have an HTML transcript.</p></body></html>');
    }
    
    // Decode base64 to HTML
    const htmlBuffer = Buffer.from(ticketData.transcriptHtml, 'base64');
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlBuffer);
  } catch (error) {
    console.error('Error serving HTML transcript:', error);
    res.status(500).send('<html><body><h1>Error loading transcript</h1></body></html>');
  }
});

// Helper functions
function calculateAvgResponseTime(tickets) {
  const responseTimes = tickets
    .filter(t => t.firstResponseAt && t.createdAt)
    .map(t => new Date(t.firstResponseAt) - new Date(t.createdAt));
  
  if (responseTimes.length === 0) return 0;
  const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  return Math.round(avg / 1000 / 60); // minutes
}

function groupByDepartment(tickets) {
  const departments = {};
  tickets.forEach(ticket => {
    const dept = ticket.department || 'General';
    if (!departments[dept]) {
      departments[dept] = { total: 0, open: 0, closed: 0 };
    }
    departments[dept].total++;
    if (ticket.status === 'open') departments[dept].open++;
    if (ticket.status === 'closed') departments[dept].closed++;
  });
  return departments;
}

module.exports = router;
