import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { geminiService } from '../utils/gemini';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './Allocations.css';

const Allocations = () => {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [family, setFamily] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [goalsRes, familyRes] = await Promise.all([
        api.get('/goals/my-goals'),
        api.get('/families/my-family')
      ]);

      const goals = goalsRes.data || [];
      setFamily(familyRes.data?._id ? familyRes.data : null);

      // Derive allocations from real goals
      const derived = goals.map((goal, i) => ({
        id: goal._id,
        category: goal.name,
        allocated: goal.targetAmount || 0,
        used: goal.currentAmount || 0,
        progress: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0,
        color: goal.color || '#6366f1',
        icon: goal.icon || '🎯',
        deadline: goal.deadline ? new Date(goal.deadline).getFullYear().toString() : 'Ongoing',
        beneficiaries: goal.beneficiary?.name ? [goal.beneficiary.name] : ['Family']
      }));

      setAllocations(derived);
    } catch (err) {
      console.error('Error fetching allocations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getAIRecommendations = async () => {
    if (allocations.length === 0) {
      alert('Add some goals first to get AI recommendations!');
      return;
    }
    setAiLoading(true);
    try {
      const recommendations = await geminiService.optimizeGoals(
        allocations,
        family?.monthlyIncome || 0,
        10
      );
      if (recommendations) setAiRecommendations(recommendations);
    } catch (err) {
      setAiRecommendations('⚠️ **Unable to generate AI recommendations at this moment.** Please try again later or check your network connection.');
    } finally {
      setAiLoading(false);
    }
  };

  const totalAllocated = allocations.reduce((sum, item) => sum + item.allocated, 0);
  const totalUsed = allocations.reduce((sum, item) => sum + item.used, 0);
  const overallProgress = totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0;

  if (loading) {
    return (
      <div className="allocations-page loading">
        <div className="fm-spinner" style={{width:40,height:40,border:'3px solid #e2e8f0',borderTopColor:'#6366f1',borderRadius:'50%',animation:'fm-spin 0.8s linear infinite'}}></div>
        <p>Loading your financial allocations...</p>
      </div>
    );
  }

  return (
    <div className="allocations-page">
      <div className="page-header">
        <h1>💰 Financial Allocations</h1>
        <p>Track your family's financial goals and investments</p>
      </div>

      {allocations.length === 0 ? (
        <div className="fm-empty">
          <div className="fm-empty-icon">💰</div>
          <h3>No Allocations Yet</h3>
          <p>Create financial goals first — your allocations will appear here automatically.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="allocations-summary">
            <div className="summary-card">
              <div className="summary-icon">💰</div>
              <div className="summary-content">
                <h3>₹{totalAllocated.toLocaleString()}</h3>
                <p>Total Allocated</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">📈</div>
              <div className="summary-content">
                <h3>₹{totalUsed.toLocaleString()}</h3>
                <p>Amount Collected</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">🎯</div>
              <div className="summary-content">
                <h3>{overallProgress.toFixed(1)}%</h3>
                <p>Overall Progress</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">⏰</div>
              <div className="summary-content">
                <h3>{allocations.length}</h3>
                <p>Active Goals</p>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="ai-recommendations-section">
            <div className="section-header">
              <h2>🤖 AI-Powered Recommendations</h2>
              <button onClick={getAIRecommendations} className="fm-btn fm-btn-primary" disabled={aiLoading}>
                {aiLoading ? 'Analyzing...' : 'Get Smart Allocations'}
              </button>
            </div>
            {aiRecommendations && (
              <div className="recommendations-content">
                <div className="recommendations-content" style={{ overflowX: 'auto', whiteSpace: 'normal', display: 'block' }}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    table: ({node, ...props}) => <table style={{borderCollapse: 'collapse', width: '100%', margin: '10px 0'}} {...props} />,
                    th: ({node, ...props}) => <th style={{border: '1px solid #ddd', padding: '8px', background: '#f8fafc'}} {...props} />,
                    td: ({node, ...props}) => <td style={{border: '1px solid #ddd', padding: '8px'}} {...props} />
                  }}
                >
                  {aiRecommendations}
                </ReactMarkdown>
              </div>
              </div>
            )}
          </div>

          {/* Allocations Grid */}
          <div className="allocations-grid">
            <h2>Your Family's Financial Goals</h2>
            <div className="allocations-list">
              {allocations.map((allocation) => (
                <div key={allocation.id} className="allocation-card">
                  <div className="allocation-header">
                    <div className="allocation-icon">{allocation.icon}</div>
                    <div className="allocation-info">
                      <h3>{allocation.category}</h3>
                      <p className="deadline">Target: {allocation.deadline}</p>
                    </div>
                    <div className="allocation-amount">
                      ₹{(allocation.allocated / 100000).toFixed(1)}L
                    </div>
                  </div>
                  <div className="progress-section">
                    <div className="progress-header">
                      <span>Progress</span>
                      <span>{allocation.progress.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${allocation.progress}%`, backgroundColor: allocation.color }}></div>
                    </div>
                    <div className="amount-details">
                      <span>₹{allocation.used.toLocaleString()} collected</span>
                      <span>₹{(allocation.allocated - allocation.used).toLocaleString()} remaining</span>
                    </div>
                  </div>
                  <div className="beneficiaries">
                    <strong>Beneficiaries:</strong>
                    <div className="beneficiary-list">
                      {allocation.beneficiaries.map((b, i) => (
                        <span key={i} className="beneficiary-tag">{b}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Allocations;