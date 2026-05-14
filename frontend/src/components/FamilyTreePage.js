import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import FamilyTreeGraph from './FamilyTreeGraph';
import MemberList from './MemberList';
import { geminiService } from '../utils/gemini';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './FamilyTreePage.css';

const FamilyTreePage = () => {
  const [familyData, setFamilyData] = useState(null);
  const [aiInsights, setAiInsights] = useState('');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchFamily = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/families/my-family');
      if (response.data && response.data._id) {
        const family = response.data;
        // Transform to the format FamilyTreeGraph expects
        const members = (family.members || []).map((m, i) => ({
          id: m._id || i + 1,
          name: m.name,
          role: m.role,
          age: m.dateOfBirth ? Math.floor((Date.now() - new Date(m.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null,
          avatar: getAvatarForRole(m.role),
          financialHealth: (m.monthlyIncome || 0) > 50000 ? 'excellent' : (m.monthlyIncome || 0) > 20000 ? 'good' : 'fair',
          monthlyContribution: m.monthlyContribution || 0,
          relationship: formatRole(m.role)
        }));

        // Build relationships based on roles
        const relationships = [];
        const patriarchs = members.filter(m => m.role === 'patriarch' || m.role === 'matriarch');
        const children = members.filter(m => ['son', 'daughter', 'grandchild'].includes(m.role));
        const spouses = members.filter(m => m.role === 'spouse');

        if (patriarchs.length >= 2) {
          relationships.push({ from: patriarchs[0].id, to: patriarchs[1].id, type: 'spouse' });
        }
        children.forEach(child => {
          if (patriarchs[0]) relationships.push({ from: patriarchs[0].id, to: child.id, type: 'parent' });
        });
        spouses.forEach(spouse => {
          const partner = children[0] || patriarchs[0];
          if (partner) relationships.push({ from: partner.id, to: spouse.id, type: 'spouse' });
        });

        setFamilyData({
          name: family.name,
          members,
          totalMonthlyContributions: members.reduce((sum, m) => sum + m.monthlyContribution, 0),
          relationships
        });
      } else {
        setFamilyData(null);
      }
    } catch (err) {
      console.error('Error fetching family:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFamily(); }, [fetchFamily]);

  const getFamilyInsights = async () => {
    if (!familyData || !familyData.members.length) return;
    setAiLoading(true);
    try {
      const insights = await geminiService.getFinancialAdvice(
        { totalWealth: familyData.totalMonthlyContributions * 12, members: familyData.members },
        [],
        "Family savings and investments"
      );
      if (insights) setAiInsights(insights);
    } catch (err) {
      alert('Failed to get AI insights');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="family-tree-page loading">
        <div className="fm-spinner" style={{width:40,height:40,border:'3px solid #e2e8f0',borderTopColor:'#6366f1',borderRadius:'50%',animation:'fm-spin 0.8s linear infinite'}}></div>
        <p>Loading your family tree...</p>
      </div>
    );
  }

  if (!familyData || !familyData.members.length) {
    return (
      <div className="family-tree-page">
        <div className="fm-empty">
          <div className="fm-empty-icon">🌳</div>
          <h3>No Family Tree Yet</h3>
          <p>Add family members first to see your family tree visualization.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="family-tree-page">
      <div className="page-header">
        <h1>👨‍👩‍👧‍👦 {familyData.name} Tree</h1>
        <p>Visualize your family structure and financial relationships</p>
      </div>

      <div className="family-tree-content">
        <div className="tree-visualization">
          <FamilyTreeGraph familyData={familyData} />
        </div>

        <div className="family-sidebar">
          <MemberList members={familyData.members} />
          
          <div className="family-stats">
            <h3>Family Financial Summary</h3>
            <div className="stat-item">
              <span>Monthly Contributions:</span>
              <strong>₹{familyData.totalMonthlyContributions.toLocaleString()}</strong>
            </div>
            <div className="stat-item">
              <span>Active Members:</span>
              <strong>{familyData.members.length}</strong>
            </div>
          </div>

          <button onClick={getFamilyInsights} className="fm-btn fm-btn-primary" style={{width:'100%',justifyContent:'center',marginTop:16}} disabled={aiLoading}>
            {aiLoading ? 'Analyzing...' : '🤖 Get AI Family Insights'}
          </button>

          {aiInsights && (
            <div className="ai-family-insights">
              <h4>🤖 Family Financial Insights</h4>
              <div className="insights-content" style={{ overflowX: 'auto', whiteSpace: 'normal' }}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    table: ({node, ...props}) => <table style={{borderCollapse: 'collapse', width: '100%', margin: '10px 0'}} {...props} />,
                    th: ({node, ...props}) => <th style={{border: '1px solid #ddd', padding: '8px', background: '#f8fafc'}} {...props} />,
                    td: ({node, ...props}) => <td style={{border: '1px solid #ddd', padding: '8px'}} {...props} />
                  }}
                >
                  {aiInsights}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function getAvatarForRole(role) {
  const avatars = { patriarch: '👴', matriarch: '👵', son: '👨', daughter: '👩', spouse: '💑', grandchild: '👦', parent: '👨‍👩‍👦', member: '👤' };
  return avatars[role] || '👤';
}

function formatRole(role) {
  const labels = { patriarch: 'Head', matriarch: 'Matriarch', son: 'Son', daughter: 'Daughter', spouse: 'Spouse', grandchild: 'Grandchild', parent: 'Parent', member: 'Member' };
  return labels[role] || role;
}

export default FamilyTreePage;