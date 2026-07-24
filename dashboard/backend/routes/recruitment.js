const express = require('express');
const router = express.Router();
const { collections } = require('../firebase');
const { isStaff } = require('../auth');
const { cache } = require('../cache');

// Collection reference helper
const getPositionsRef = () => collections.staff.doc('openings').collection('positions');

// Invalidate public cache helper
const invalidateCache = () => {
  cache.invalidate('public:recruitment');
};

// GET all recruitment positions
router.get('/', isStaff, async (req, res) => {
  try {
    const snapshot = await getPositionsRef().orderBy('createdAt', 'desc').get();
    const positions = [];
    snapshot.forEach(doc => {
      positions.push({ id: doc.id, ...doc.data() });
    });
    res.json(positions);
  } catch (error) {
    console.error('Error fetching recruitment positions:', error);
    res.status(500).json({ error: 'Failed to fetch recruitment data' });
  }
});

// POST a new position
router.post('/', isStaff, async (req, res) => {
  try {
    const { title, description, requirements, roles } = req.body;
    
    if (!title || !roles || !Array.isArray(roles)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newDoc = {
      title,
      description: description || '',
      requirements: requirements || '',
      roles,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await getPositionsRef().add(newDoc);
    invalidateCache();
    
    res.json({ id: docRef.id, ...newDoc });
  } catch (error) {
    console.error('Error creating recruitment position:', error);
    res.status(500).json({ error: 'Failed to create position' });
  }
});

// PUT update an existing position
router.put('/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requirements, roles } = req.body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (roles !== undefined) updateData.roles = roles;
    
    await getPositionsRef().doc(id).update(updateData);
    invalidateCache();
    
    res.json({ success: true, message: 'Position updated successfully' });
  } catch (error) {
    console.error('Error updating recruitment position:', error);
    res.status(500).json({ error: 'Failed to update position' });
  }
});

// DELETE a position
router.delete('/:id', isStaff, async (req, res) => {
  try {
    const { id } = req.params;
    await getPositionsRef().doc(id).delete();
    invalidateCache();
    
    res.json({ success: true, message: 'Position deleted successfully' });
  } catch (error) {
    console.error('Error deleting recruitment position:', error);
    res.status(500).json({ error: 'Failed to delete position' });
  }
});

module.exports = router;
