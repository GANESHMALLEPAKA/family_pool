import express from 'express';
import Goal from '../models/Goal.js';
import Family from '../models/Family.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get MY goals (scoped to user's family)
router.get('/my-goals', auth, async (req, res) => {
  try {
    const family = await Family.findOne({ patriarch: req.user._id });
    if (!family) {
      return res.json([]);
    }

    const goals = await Goal.find({ familyId: family._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all goals for family
router.get('/family/:familyId', auth, async (req, res) => {
  try {
    // Ownership check
    const family = await Family.findById(req.params.familyId);
    const isMember = family && (family.patriarch.toString() === req.user._id.toString() || family.members.some(m => m.userId?.toString() === req.user._id.toString()));
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const goals = await Goal.find({ familyId: req.params.familyId })
      .sort({ createdAt: -1 });
    
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new goal
router.post('/create', auth, async (req, res) => {
  try {
    const { familyId, name, description, category, targetAmount, deadline, beneficiary, priority } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Goal name is required (min 2 characters)' });
    }
    if (!targetAmount || targetAmount <= 0) {
      return res.status(400).json({ message: 'Target amount must be greater than 0' });
    }
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    // Verify ownership
    let resolvedFamilyId = familyId;
    if (!resolvedFamilyId) {
      const family = await Family.findOne({ patriarch: req.user._id });
      if (!family) {
        return res.status(400).json({ message: 'No family found. Create a family first.' });
      }
      resolvedFamilyId = family._id;
    } else {
      const family = await Family.findById(resolvedFamilyId);
      const isMember = family && (family.patriarch.toString() === req.user._id.toString() || family.members.some(m => m.userId?.toString() === req.user._id.toString()));
      if (!isMember) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    
    const goal = await Goal.create({
      familyId: resolvedFamilyId,
      name: name.trim(),
      description: description?.trim(),
      category,
      targetAmount: Math.max(1, parseInt(targetAmount)),
      deadline,
      beneficiary,
      priority: priority || 'medium',
      icon: getIconForCategory(category),
      color: getColorForCategory(category)
    });
    
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add contribution to goal
router.post('/:id/contribute', auth, async (req, res) => {
  try {
    const { memberName, amount, note, type } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }
    
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Ownership check
    const family = await Family.findById(goal.familyId);
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }
    const isMember = family.patriarch.toString() === req.user._id.toString() || family.members.some(m => m.userId?.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    goal.contributors.push({
      memberId: req.user._id,
      memberName: memberName || req.user.name,
      amount: Math.max(1, parseInt(amount)),
      note: note?.trim(),
      type: type || 'one-time'
    });
    
    await goal.updateCurrentAmount();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update goal
router.put('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Ownership check
    const family = await Family.findById(goal.familyId);
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }
    const isMember = family.patriarch.toString() === req.user._id.toString() || family.members.some(m => m.userId?.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const allowedFields = ['name', 'description', 'category', 'targetAmount', 'deadline', 'beneficiary', 'priority', 'status'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Ownership check
    const family = await Family.findById(goal.familyId);
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }
    const isMember = family.patriarch.toString() === req.user._id.toString() || family.members.some(m => m.userId?.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get goal contributions
router.get('/:id/contributions', auth, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.json(goal.contributors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper functions
function getIconForCategory(category) {
  const icons = {
    education: '🎓',
    wedding: '💍',
    house_purchase: '🏠',
    retirement: '👴',
    vacation: '✈️',
    emergency: '🛡️',
    vehicle: '🚗',
    other: '🎯'
  };
  return icons[category] || '🎯';
}

function getColorForCategory(category) {
  const colors = {
    education: '#3b82f6',
    wedding: '#ec4899',
    house_purchase: '#f59e0b',
    retirement: '#ef4444',
    vacation: '#10b981',
    emergency: '#8b5cf6',
    vehicle: '#6366f1',
    other: '#64748b'
  };
  return colors[category] || '#64748b';
}

export default router;