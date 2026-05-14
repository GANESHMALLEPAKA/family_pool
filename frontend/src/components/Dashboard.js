import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { geminiService } from '../utils/gemini';
import api from '../utils/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [family, setFamily] = useState(null);
  const [goals, setGoals] = useState([]);
  const [aiAdvice, setAiAdvice] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [familyRes, goalsRes] = await Promise.all([
        api.get('/families/my-family'),
        api.get('/goals/my-goals')
      ]);

      if (familyRes.data && familyRes.data._id) {
        setFamily(familyRes.data);
      }
      setGoals(goalsRes.data || []);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const members = family?.members || [];
  const totalIncome = members.reduce((sum, m) => sum + (m.monthlyIncome || 0), 0);
  const totalContributions = members.reduce((sum, m) => sum + (m.monthlyContribution || 0), 0);
  const totalGoalsCurrent = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const totalGoalsTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  const hasData = members.length > 0 || goals.length > 0;

  const getAIAdvice = async () => {
    if (!hasData) {
      alert('Add family members or goals first to get personalized AI advice!');
      return;
    }

    setAiLoading(true);
    setAiAdvice('');

    try {
      const status = await geminiService.checkAIStatus();
      if (!status.aiEnabled) {
        alert('AI service is not configured. Please check your Groq API key.');
        return;
      }

      const advice = await geminiService.getFinancialAdvice(
        { totalWealth: totalGoalsCurrent, members: members.length, monthlyIncome: totalIncome },
        goals.map(g => ({ name: g.name, target: g.targetAmount, current: g.currentAmount, category: g.category })),
        "Family financial planning overview"
      );
      setAiAdvice(advice);
    } catch (error) {
      console.error('AI advice failed:', error);
      alert(`Failed to get AI advice: ${error.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="fm-spinner" style={{width:40,height:40,border:'3px solid #e2e8f0',borderTopColor:'#6366f1',borderRadius:'50%',animation:'fm-spin 0.8s linear infinite'}}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user?.name || 'User'}!</h1>
          <p>Your family financial command center</p>
        </div>
        <div className="header-actions">
          <button onClick={getAIAdvice} className="fm-btn fm-btn-primary" disabled={aiLoading}>
            {aiLoading ? '⏳ Analyzing...' : '🤖 Get AI Advice'}
          </button>
        </div>
      </div>

      {/* Onboarding for new users */}
      {!hasData && (
        <div className="setup-guide">
          <h3>🚀 Get Started with FamilyPool</h3>
          <p style={{color:'#64748b',marginBottom:24}}>Set up your family financial plan in 3 easy steps</p>
          <div className="setup-steps">
            <div className="setup-step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h4>Add Family Members</h4>
                <p>Go to Family Members page and add your family</p>
              </div>
            </div>
            <div className="setup-step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h4>Set Financial Goals</h4>
                <p>Create goals for education, retirement, etc.</p>
              </div>
            </div>
            <div className="setup-step">
              <span className="step-number">3</span>
              <div className="step-content">
                <h4>Track Progress</h4>
                <p>Monitor contributions and get AI insights</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {hasData && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Savings</h3>
            <p className="amount">₹{totalGoalsCurrent.toLocaleString()}</p>
            <span className="growth">Across {goals.length} goals</span>
          </div>
          <div className="stat-card">
            <h3>Active Goals</h3>
            <p className="amount">{goals.length}</p>
            <span className="growth">{goals.filter(g => g.status === 'completed').length} completed</span>
          </div>
          <div className="stat-card">
            <h3>Family Members</h3>
            <p className="amount">{members.length}</p>
            <span className="growth">{members.filter(m => (m.monthlyIncome || 0) > 0).length} earning</span>
          </div>
          <div className="stat-card">
            <h3>Monthly Income</h3>
            <p className="amount">₹{totalIncome.toLocaleString()}</p>
            <span className="growth">Family total</span>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {aiAdvice && (
        <div className="ai-insights">
          <h3>🤖 AI Financial Insights</h3>
          <div className="advice-content" style={{ overflowX: 'auto', whiteSpace: 'normal', display: 'block' }}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                table: ({node, ...props}) => <table style={{borderCollapse: 'collapse', width: '100%', margin: '10px 0'}} {...props} />,
                th: ({node, ...props}) => <th style={{border: '1px solid #ddd', padding: '8px', background: '#f8fafc'}} {...props} />,
                td: ({node, ...props}) => <td style={{border: '1px solid #ddd', padding: '8px'}} {...props} />
              }}
            >
              {aiAdvice}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Goals Overview */}
      {goals.length > 0 && (
        <div className="goals-overview">
          <div className="section-header">
            <h3>Your Family Goals Progress</h3>
          </div>
          {goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
            return (
              <div key={goal._id} className="goal-progress">
                <div className="goal-header">
                  <span>{goal.icon || '🎯'} {goal.name}</span>
                  <span>₹{(goal.currentAmount || 0).toLocaleString()} / ₹{(goal.targetAmount || 0).toLocaleString()}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%`, backgroundColor: goal.color || '#6366f1' }}></div>
                </div>
                <span className="progress-percent">{progress.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Family Members Overview */}
      {members.length > 0 && (
        <div className="family-members">
          <div className="section-header">
            <h3>Family Members</h3>
          </div>
          <div className="members-grid">
            {members.map(member => (
              <div key={member._id} className="member-card">
                <div className="member-header-row">
                  <div className="member-avatar-small">
                    {getAvatarForRole(member.role)}
                  </div>
                  <div className="member-info">
                    <h4>{member.name}</h4>
                    <p className="member-role">{member.role}</p>
                    <p className="member-income">₹{(member.monthlyIncome || 0).toLocaleString()}/month</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <a href="/family-members" className="action-btn" style={{textDecoration:'none'}}>
            <span className="action-icon">👨‍👩‍👧‍👦</span>
            <span>Family Members</span>
          </a>
          <a href="/goals" className="action-btn" style={{textDecoration:'none'}}>
            <span className="action-icon">🎯</span>
            <span>Set Goals</span>
          </a>
          <a href="/allocations" className="action-btn" style={{textDecoration:'none'}}>
            <span className="action-icon">💰</span>
            <span>Allocations</span>
          </a>
          <a href="/reports" className="action-btn" style={{textDecoration:'none'}}>
            <span className="action-icon">📊</span>
            <span>Reports</span>
          </a>
        </div>
      </div>
    </div>
  );
};

function getAvatarForRole(role) {
  const avatars = {
    patriarch: '👴', matriarch: '👵', parent: '👨‍👩‍👦', son: '👨', daughter: '👩',
    spouse: '💑', grandchild: '👦', member: '👤'
  };
  return avatars[role?.toLowerCase()] || '👤';
}

export default Dashboard;