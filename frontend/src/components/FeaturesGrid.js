import React from 'react';
import './FeaturesGrid.css';

const FeaturesGrid = () => {
  const features = [
    {
      icon: '👨‍👩‍👧‍👦',
      title: 'Family Pooling',
      description: 'Combine everyone\'s income into a shared family pool with transparent tracking.',
      color: 'purple'
    },
    {
      icon: '🎯',
      title: 'Smart Goals',
      description: 'Set and track family goals - from education funds to dream vacations.',
      color: 'gold'
    },
    {
      icon: '🤖',
      title: 'AI Insights',
      description: 'Get personalized financial advice powered by advanced AI technology.',
      color: 'cyan'
    },
    {
      icon: '📊',
      title: 'Live Reports',
      description: 'Beautiful dashboards showing where every rupee goes and grows.',
      color: 'green'
    }
  ];

  return (
    <section className="features-grid">
      <div className="features-container">
        <div className="features-header">
          <span className="section-badge">✨ Features</span>
          <h2>Everything Your Family Needs</h2>
          <p>Powerful tools designed specifically for Indian families to build wealth together</p>
        </div>

        <div className="features-list">
          {features.map((feature, index) => (
            <div key={index} className={`feature-card feature-${feature.color}`}>
              <div className="feature-icon-wrapper">
                <span className="feature-icon">{feature.icon}</span>
                <div className="icon-glow"></div>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="feature-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Visual Stats */}
        <div className="features-stats">
          <div className="feature-stat">
            <div className="stat-circle purple">
              <span>94%</span>
            </div>
            <p>Goal Success Rate</p>
          </div>
          <div className="feature-stat">
            <div className="stat-circle gold">
              <span>2x</span>
            </div>
            <p>Faster Savings</p>
          </div>
          <div className="feature-stat">
            <div className="stat-circle cyan">
              <span>24/7</span>
            </div>
            <p>AI Support</p>
          </div>
          <div className="feature-stat">
            <div className="stat-circle green">
              <span>0</span>
            </div>
            <p>Hidden Fees</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;