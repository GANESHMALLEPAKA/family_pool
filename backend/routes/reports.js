import express from 'express';
import Report from '../models/Report.js';
import Goal from '../models/Goal.js';
import Family from '../models/Family.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get MY reports (scoped to user's family)
router.get('/my-reports', auth, async (req, res) => {
  try {
    const family = await Family.findOne({ patriarch: req.user._id });
    if (!family) {
      return res.json([]);
    }

    const reports = await Report.find({ familyId: family._id })
      .sort({ createdAt: -1 });
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate financial summary report
router.post('/financial-summary', auth, async (req, res) => {
  try {
    const family = await Family.findOne({ patriarch: req.user._id });
    if (!family) {
      return res.status(400).json({ message: 'No family found' });
    }

    const goals = await Goal.find({ familyId: family._id });
    
    // Calculate totals
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const totalContributions = goals.reduce((sum, goal) => 
      sum + goal.contributors.reduce((acc, contrib) => acc + contrib.amount, 0), 0
    );
    
    // Member contributions
    const memberContributions = {};
    goals.forEach(goal => {
      goal.contributors.forEach(contrib => {
        if (!memberContributions[contrib.memberName]) {
          memberContributions[contrib.memberName] = 0;
        }
        memberContributions[contrib.memberName] += contrib.amount;
      });
    });
    
    const report = await Report.create({
      familyId: family._id,
      title: `Financial Summary - ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`,
      type: 'financial_summary',
      period: {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date()
      },
      data: {
        family: {
          name: family.name,
          totalWealth: family.totalWealth,
          monthlyIncome: family.monthlyIncome,
          memberCount: family.members.length
        },
        goals: {
          total: totalGoals,
          completed: completedGoals,
          active: totalGoals - completedGoals,
          totalTarget: totalTargetAmount || 0,
          totalCurrent: totalCurrentAmount || 0,
          overallProgress: totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0
        },
        contributions: {
          total: totalContributions,
          byMember: memberContributions
        },
        goalsBreakdown: goals.map(goal => ({
          name: goal.name,
          category: goal.category,
          target: goal.targetAmount,
          current: goal.currentAmount,
          progress: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount * 100) : 0,
          status: goal.status
        }))
      },
      generatedBy: { name: req.user.name }
    });
    
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reports for family
router.get('/family/:familyId', auth, async (req, res) => {
  try {
    // Ownership check
    const family = await Family.findById(req.params.familyId);
    const isMember = family && (family.patriarch.toString() === req.user._id.toString() || family.members.some(m => m.userId?.toString() === req.user._id.toString()));
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const reports = await Report.find({ familyId: req.params.familyId })
      .sort({ createdAt: -1 });
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific report
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete report
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Ownership check
    const family = await Family.findById(report.familyId);
    const isMember = family && (family.patriarch.toString() === req.user._id.toString() || family.members.some(m => m.userId?.toString() === req.user._id.toString()));
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;