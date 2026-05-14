import React from 'react';
import './FamilyTreeGraph.css';

const FamilyTreeGraph = ({ familyData }) => {
  const getHealthColor = (health) => {
    switch (health) {
      case 'excellent': return '#059669';
      case 'good': return '#f59e0b';
      case 'poor': return '#dc2626';
      default: return '#64748b';
    }
  };

  const getHealthLabel = (health) => {
    switch (health) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'poor': return 'Needs Attention';
      default: return 'N/A';
    }
  };

  if (!familyData || !familyData.members) return null;

  const parents = familyData.members.filter(m => m.role === 'patriarch' || m.role === 'matriarch');
  const children = familyData.members.filter(m => m.role === 'son' || m.role === 'daughter' || m.role === 'spouse');
  const grandchildren = familyData.members.filter(m => m.role === 'grandchild');
  const others = familyData.members.filter(m => !['patriarch', 'matriarch', 'son', 'daughter', 'spouse', 'grandchild'].includes(m.role));

  const renderNode = (member) => {
    if (!member) return null;
    return (
      <div className={`member-node ${member.role}`} key={member.id}>
        <div className="node-content">
          <div className="avatar large">{member.avatar}</div>
          <h4>{member.name || 'Unknown'}</h4>
          <p className="role">{member.relationship}</p>
          <div className="financial-health">
            <span 
              className="health-dot"
              style={{ backgroundColor: getHealthColor(member.financialHealth) }}
            ></span>
            <span>{getHealthLabel(member.financialHealth)}</span>
          </div>
          <p className="contribution">₹{member.monthlyContribution?.toLocaleString()}/month</p>
        </div>
      </div>
    );
  };

  return (
    <div className="family-tree-graph" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
      
      {parents.length > 0 && (
        <div className="tree-generation gen-1" style={{ width: '100%' }}>
          <h3>Founders</h3>
          <div className="couple-container" style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {parents.map(renderNode)}
          </div>
        </div>
      )}

      {children.length > 0 && (
        <div className="tree-generation gen-2" style={{ width: '100%' }}>
          <h3>Next Generation</h3>
          <div className="children-container" style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {children.map(renderNode)}
          </div>
        </div>
      )}

      {grandchildren.length > 0 && (
        <div className="tree-generation gen-3" style={{ width: '100%' }}>
          <h3>Grandchildren</h3>
          <div className="children-container" style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {grandchildren.map(renderNode)}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div className="tree-generation gen-others" style={{ width: '100%' }}>
          <h3>Other Members</h3>
          <div className="children-container" style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {others.map(renderNode)}
          </div>
        </div>
      )}

    </div>
  );
};

export default FamilyTreeGraph;