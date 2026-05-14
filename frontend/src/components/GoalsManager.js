import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './GoalsManager.css';

const GoalsManager = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newGoal, setNewGoal] = useState({
    name: '', description: '', category: 'education',
    targetAmount: '', deadline: '',
    beneficiary: { name: '', memberId: '' }, priority: 'medium'
  });

  const [newContribution, setNewContribution] = useState({
    amount: '', note: '', type: 'one-time'
  });

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/goals/my-goals');
      setGoals(response.data || []);
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/goals/create', {
        name: newGoal.name.trim(),
        description: newGoal.description.trim(),
        category: newGoal.category,
        targetAmount: parseInt(newGoal.targetAmount),
        deadline: newGoal.deadline || undefined,
        beneficiary: newGoal.beneficiary.name ? {
          name: newGoal.beneficiary.name,
          ...(newGoal.beneficiary.memberId ? { memberId: newGoal.beneficiary.memberId } : {})
        } : undefined,
        priority: newGoal.priority
      });
      setGoals([response.data, ...goals]);
      setNewGoal({ name: '', description: '', category: 'education', targetAmount: '', deadline: '', beneficiary: { name: '', memberId: '' }, priority: 'medium' });
      setShowCreateForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create goal');
    }
  };

  const handleAddContribution = async (e) => {
    e.preventDefault();
    if (!selectedGoal) return;
    try {
      // Create Stripe checkout session
      const response = await api.post('/payment/create-checkout-session', {
        goalId: selectedGoal._id,
        amount: parseInt(newContribution.amount),
        note: newContribution.note.trim()
      });

      // Load stripe and redirect
      const { loadStripe } = await import('@stripe/stripe-js');
      // Using dummy PK for local testing
      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_1234567890');
      
      if (!stripe) throw new Error('Stripe failed to initialize.');

      const result = await stripe.redirectToCheckout({
        sessionId: response.data.id
      });

      if (result.error) {
        alert(result.error.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to initialize payment gateway');
    }
  };

  const deleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await api.delete(`/goals/${goalId}`);
      setGoals(goals.filter(g => g._id !== goalId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete goal');
    }
  };

  const getProgress = (goal) => {
    if (!goal.targetAmount || goal.targetAmount === 0) return 0;
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  };

  if (loading) {
    return <div className="goals-manager"><div className="loading">Loading goals...</div></div>;
  }

  return (
    <div className="goals-manager">
      <div className="goals-header">
        <div>
          <h2>🎯 Family Goals</h2>
          <p className="goals-subtitle">Track and achieve your family's financial milestones</p>
        </div>
        <button className="fm-btn fm-btn-primary" onClick={() => setShowCreateForm(true)}>
          + Create Goal
        </button>
      </div>

      {/* Create Goal Modal */}
      {showCreateForm && (
        <div className="fm-modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="fm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fm-modal-header">
              <h3>Create New Goal</h3>
              <button className="fm-close-btn" onClick={() => setShowCreateForm(false)}>×</button>
            </div>
            <form onSubmit={handleCreateGoal}>
              <div className="fm-form-grid">
                <div className="fm-form-group" style={{gridColumn: '1 / -1'}}>
                  <label>Goal Name *</label>
                  <input type="text" value={newGoal.name} onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} required placeholder="e.g., College Education Fund" />
                </div>
                <div className="fm-form-group" style={{gridColumn: '1 / -1'}}>
                  <label>Description</label>
                  <textarea value={newGoal.description} onChange={(e) => setNewGoal({...newGoal, description: e.target.value})} placeholder="Brief description..." rows="2" style={{padding:'10px 14px',border:'1.5px solid #e2e8f0',borderRadius:'10px',fontSize:'0.9rem',background:'#f8fafc',resize:'vertical',outline:'none',fontFamily:'inherit'}} />
                </div>
                <div className="fm-form-group">
                  <label>Category *</label>
                  <select value={newGoal.category} onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}>
                    <option value="education">Education</option>
                    <option value="wedding">Wedding</option>
                    <option value="house_purchase">House Purchase</option>
                    <option value="retirement">Retirement</option>
                    <option value="vacation">Vacation</option>
                    <option value="emergency">Emergency Fund</option>
                    <option value="vehicle">Vehicle</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="fm-form-group">
                  <label>Priority</label>
                  <select value={newGoal.priority} onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="fm-form-group">
                  <label>Target Amount (₹) *</label>
                  <input type="number" value={newGoal.targetAmount} onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})} required placeholder="1500000" min="1" />
                </div>
                <div className="fm-form-group">
                  <label>Deadline</label>
                  <input type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} />
                </div>
                <div className="fm-form-group" style={{gridColumn: '1 / -1'}}>
                  <label>Beneficiary Name</label>
                  <input type="text" value={newGoal.beneficiary.name} onChange={(e) => setNewGoal({...newGoal, beneficiary: {...newGoal.beneficiary, name: e.target.value}})} placeholder="Who will benefit?" />
                </div>
              </div>
              <div className="fm-modal-actions">
                <button type="button" className="fm-btn fm-btn-ghost" onClick={() => setShowCreateForm(false)}>Cancel</button>
                <button type="submit" className="fm-btn fm-btn-primary">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {showContributionForm && selectedGoal && (
        <div className="fm-modal-overlay" onClick={() => { setShowContributionForm(false); setSelectedGoal(null); }}>
          <div className="fm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fm-modal-header">
              <h3>Contribute to {selectedGoal.name}</h3>
              <button className="fm-close-btn" onClick={() => { setShowContributionForm(false); setSelectedGoal(null); }}>×</button>
            </div>
            <form onSubmit={handleAddContribution}>
              <div className="fm-form-grid">
                <div className="fm-form-group">
                  <label>Amount (₹) *</label>
                  <input type="number" value={newContribution.amount} onChange={(e) => setNewContribution({...newContribution, amount: e.target.value})} required placeholder="5000" min="1" />
                </div>
                <div className="fm-form-group">
                  <label>Type</label>
                  <select value={newContribution.type} onChange={(e) => setNewContribution({...newContribution, type: e.target.value})}>
                    <option value="one-time">One-time</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="fm-form-group" style={{gridColumn: '1 / -1'}}>
                  <label>Note (Optional)</label>
                  <input type="text" value={newContribution.note} onChange={(e) => setNewContribution({...newContribution, note: e.target.value})} placeholder="e.g., Monthly savings" />
                </div>
              </div>
              <div style={{padding:'0 28px 16px',background:'#f8fafc',margin:'0 16px',borderRadius:'12px'}}>
                <p style={{margin:'12px 0 4px',fontSize:'0.85rem',color:'#64748b'}}>Current: ₹{selectedGoal.currentAmount?.toLocaleString() || '0'}</p>
                <p style={{margin:'4px 0',fontSize:'0.85rem',color:'#64748b'}}>After: ₹{((selectedGoal.currentAmount || 0) + parseInt(newContribution.amount || 0)).toLocaleString()}</p>
              </div>
              <div className="fm-modal-actions">
                <button type="button" className="fm-btn fm-btn-ghost" onClick={() => { setShowContributionForm(false); setSelectedGoal(null); }}>Cancel</button>
                <button type="submit" className="fm-btn fm-btn-primary">Add Contribution</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length > 0 && (
        <div className="goals-grid">
          {goals.map((goal) => (
            <div key={goal._id} className="goal-card">
              <div className="goal-header">
                <div className="goal-icon" style={{ color: goal.color || '#6366f1' }}>
                  {goal.icon || '🎯'}
                </div>
                <div className="goal-info">
                  <h3>{goal.name}</h3>
                  <p className="goal-category">{(goal.category || '').replace('_', ' ')}</p>
                  <span className={`priority-badge priority-${goal.priority || 'medium'}`}>{goal.priority || 'medium'}</span>
                </div>
                <div className="goal-actions">
                  <button className="fm-btn fm-btn-primary" style={{padding:'6px 14px',fontSize:'0.8rem'}} onClick={() => { setSelectedGoal(goal); setShowContributionForm(true); }}>+ Contribute</button>
                  <button className="fm-remove-btn" style={{position:'static',opacity:1,width:28,height:28,fontSize:'0.9rem'}} onClick={() => deleteGoal(goal._id)} title="Delete goal">×</button>
                </div>
              </div>

              {goal.description && <p className="goal-description">{goal.description}</p>}

              <div className="goal-progress">
                <div className="progress-header">
                  <span>Progress</span>
                  <span>{getProgress(goal).toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${getProgress(goal)}%`, backgroundColor: goal.color || '#6366f1' }}></div>
                </div>
                <div className="amount-details">
                  <span>₹{(goal.currentAmount || 0).toLocaleString()} collected</span>
                  <span>₹{(goal.targetAmount || 0).toLocaleString()} target</span>
                </div>
              </div>

              <div className="goal-details">
                <div className="detail-item">
                  <span>Beneficiary:</span>
                  <span>{goal.beneficiary?.name || 'Family'}</span>
                </div>
                {goal.deadline && (
                  <div className="detail-item">
                    <span>Deadline:</span>
                    <span>{new Date(goal.deadline).toLocaleDateString('en-IN')}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span>Contributors:</span>
                  <span>{(goal.contributors || []).length} people</span>
                </div>
                <div className="detail-item">
                  <span>Status:</span>
                  <span className={`status-${goal.status || 'active'}`}>{goal.status || 'active'}</span>
                </div>
              </div>

              {(goal.contributors || []).length > 0 && (
                <div className="recent-contributions">
                  <h4>Recent Contributions</h4>
                  {goal.contributors.slice(-3).map((contrib, index) => (
                    <div key={index} className="contribution-item">
                      <span>{contrib.memberName}</span>
                      <span>₹{contrib.amount?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {goals.length === 0 && (
        <div className="fm-empty">
          <div className="fm-empty-icon">🎯</div>
          <h3>No Goals Yet</h3>
          <p>Create your first family financial goal to start building wealth together!</p>
          <button className="fm-btn fm-btn-primary" onClick={() => setShowCreateForm(true)}>
            Create Your First Goal
          </button>
        </div>
      )}
    </div>
  );
};

export default GoalsManager;