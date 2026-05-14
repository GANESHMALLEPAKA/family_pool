import React from 'react';

const MemberList = ({ members }) => {
  const getHealthColor = (health) => {
    switch (health) {
      case 'excellent': return '#059669';
      case 'good': return '#f59e0b';
      case 'poor': return '#dc2626';
      default: return '#64748b';
    }
  };

  return (
    <div className="member-list">
      <h3>Family Members</h3>
      <div className="members-grid">
        {members.map((member) => (
          <div key={member.id} className="member-card">
            <div className="member-header">
              <div className="member-avatar">{member.avatar}</div>
              <div className="member-info">
                <h4>{member.name}</h4>
                <p className="member-role">{member.relationship}</p>
              </div>
            </div>
            
            <div className="member-details">
              <div className="detail-item">
                <span>Age:</span>
                <strong>{member.age}</strong>
              </div>
              
              {member.financialHealth !== 'na' && (
                <>
                  <div className="detail-item">
                    <span>Financial Health:</span>
                    <strong 
                      style={{ color: getHealthColor(member.financialHealth) }}
                    >
                      {member.financialHealth.charAt(0).toUpperCase() + member.financialHealth.slice(1)}
                    </strong>
                  </div>
                  
                  <div className="detail-item">
                    <span>Monthly Contribution:</span>
                    <strong className="contribution">
                      ₹{member.monthlyContribution.toLocaleString()}
                    </strong>
                  </div>
                </>
              )}
              
              {member.financialHealth === 'na' && (
                <div className="detail-item">
                  <span>Status:</span>
                  <strong className="na-status">Dependent</strong>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberList;