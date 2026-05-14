import express from 'express';
import Family from '../models/Family.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get MY family (primary endpoint for the logged-in user)
router.get('/my-family', auth, async (req, res) => {
  try {
    const family = await Family.findOne({ patriarch: req.user._id });
    
    if (!family) {
      return res.json({ family: null, message: 'No family found. Create one to get started.' });
    }
    
    res.json(family);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get family by ID (with ownership check)
router.get('/:id', auth, async (req, res) => {
  try {
    const family = await Family.findById(req.params.id);
    
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    // Ownership check: user must be patriarch or a member
    const isMember = family.patriarch.toString() === req.user._id.toString() ||
      family.members.some(m => m.userId?.toString() === req.user._id.toString());
    
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(family);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new family
router.post('/create', auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Family name is required (min 2 characters)' });
    }

    // Check if user already has a family
    const existingFamily = await Family.findOne({ patriarch: req.user._id });
    if (existingFamily) {
      return res.status(400).json({ message: 'You already have a family. Use that one instead.' });
    }
    
    const family = await Family.create({
      name: name.trim(),
      patriarch: req.user._id,
      members: [{
        userId: req.user._id,
        name: req.user.name,
        role: 'patriarch',
        email: req.user.email
      }]
    });
    
    await family.updateTotalWealth();
    res.status(201).json(family);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add family member
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { name, role, email, phone, dateOfBirth, monthlyIncome } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Member name is required (min 2 characters)' });
    }
    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }
    
    const family = await Family.findById(req.params.id);
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }
    
    // Check if user is family patriarch
    if (family.patriarch.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only family patriarch can add members' });
    }
    
    family.members.push({
      name: name.trim(),
      role,
      email: email?.trim()?.toLowerCase(),
      phone: phone?.trim(),
      dateOfBirth,
      monthlyIncome: Math.max(0, parseInt(monthlyIncome) || 0)
    });
    
    await family.save();
    await family.updateTotalWealth();
    
    res.json(family);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update family member
router.put('/:familyId/members/:memberId', auth, async (req, res) => {
  try {
    const family = await Family.findById(req.params.familyId);
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    // Ownership check
    if (family.patriarch.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only family patriarch can update members' });
    }
    
    const member = family.members.id(req.params.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const { name, role, email, phone, monthlyIncome, monthlyContribution, isActive } = req.body;
    
    if (name !== undefined) member.name = name.trim();
    if (role !== undefined) member.role = role;
    if (email !== undefined) member.email = email?.trim()?.toLowerCase();
    if (phone !== undefined) member.phone = phone?.trim();
    if (monthlyIncome !== undefined) member.monthlyIncome = Math.max(0, parseInt(monthlyIncome) || 0);
    if (monthlyContribution !== undefined) member.monthlyContribution = Math.max(0, parseInt(monthlyContribution) || 0);
    if (isActive !== undefined) member.isActive = isActive;
    
    await family.save();
    await family.updateTotalWealth();
    
    res.json(family);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update family name
router.put('/:id', auth, async (req, res) => {
  try {
    const family = await Family.findById(req.params.id);
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    if (family.patriarch.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only family patriarch can update family info' });
    }

    const { name } = req.body;
    if (name) family.name = name.trim();

    await family.save();
    res.json(family);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove family member
router.delete('/:familyId/members/:memberId', auth, async (req, res) => {
  try {
    const family = await Family.findById(req.params.familyId);
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }

    // Ownership check
    if (family.patriarch.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only family patriarch can remove members' });
    }

    // Prevent removing the patriarch
    const member = family.members.id(req.params.memberId);
    if (member && member.userId?.toString() === family.patriarch.toString()) {
      return res.status(400).json({ message: 'Cannot remove the family patriarch' });
    }
    
    family.members.pull({ _id: req.params.memberId });
    await family.save();
    await family.updateTotalWealth();
    
    res.json({ message: 'Member removed successfully', family });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /admin/stats
// Returns advanced analytics for Patriarch/Matriarch roles
router.get('/admin/stats', auth, async (req, res) => {
  try {
    const userRole = req.user.role;
    if (userRole !== 'patriarch' && userRole !== 'matriarch') {
      return res.status(403).json({ message: 'Forbidden. Admin panel requires Patriarch or Matriarch role.' });
    }

    // Get current family deep stats
    const family = await Family.findOne({
      $or: [{ patriarch: req.user._id }, { "members.userId": req.user._id }]
    });
    if (!family) return res.status(404).json({ message: 'Family not found.' });

    // Platform-wide aggregation (Anonymized)
    const allFamilies = await Family.find({});
    let platformTotalWealth = 0;
    let platformTotalIncome = 0;
    let wealthyFamiliesCount = 0;

    allFamilies.forEach(f => {
      platformTotalWealth += f.totalWealth || 0;
      platformTotalIncome += f.monthlyIncome || 0;
      if ((f.totalWealth || 0) > 5000000) wealthyFamiliesCount++; // 50L+ wealth
    });

    const averagePlatformWealth = allFamilies.length > 0 ? (platformTotalWealth / allFamilies.length) : 0;
    const averagePlatformIncome = allFamilies.length > 0 ? (platformTotalIncome / allFamilies.length) : 0;

    res.json({
      familyStats: {
        totalWealth: family.totalWealth,
        monthlyIncome: family.monthlyIncome,
        memberCount: family.members.length,
        established: family.createdAt
      },
      platformStats: {
        totalFamilies: allFamilies.length,
        averageWealth: averagePlatformWealth,
        averageIncome: averagePlatformIncome,
        topPercentile: wealthyFamiliesCount > 0 ? Math.round((wealthyFamiliesCount / allFamilies.length) * 100) : 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating admin stats' });
  }
});

export default router;