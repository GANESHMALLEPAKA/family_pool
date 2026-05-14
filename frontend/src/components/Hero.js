import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import VideoModal from './VideoModal';
import './Hero.css';

const Hero = () => {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <section className="hero">
      {/* Animated Background Elements */}
      <div className="hero-bg-elements">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          {/* Premium Badge */}
          <div className="hero-badge">
            <span className="badge-icon">🏆</span>
            <span>India's #1 Family Finance Platform</span>
          </div>

          <h1 className="hero-title">
            Building <span className="highlight">Generational</span><br />
            <span className="highlight-gold">Wealth</span> Together
          </h1>

          <p className="hero-subtitle">
            The intelligent platform that brings your entire family together to plan, save, and grow wealth across generations. AI-powered insights, collaborative goals, and real-time tracking.
          </p>

          <div className="hero-actions">
            <Link to="/login?register=true" className="btn btn-primary btn-large">
              <span>Get Started Free</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <button className="btn btn-glass" onClick={() => setShowDemo(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10,8 16,12 10,16" fill="currentColor" />
              </svg>
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="hero-trust">
            <div className="trust-item">
              <div className="trust-icon">👨‍👩‍👧‍👦</div>
              <div className="trust-info">
                <span className="trust-value">10 Lakh+</span>
                <span className="trust-label">Happy Families</span>
              </div>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <div className="trust-icon">💰</div>
              <div className="trust-info">
                <span className="trust-value">₹50,000 Cr+</span>
                <span className="trust-label">Wealth Managed</span>
              </div>
            </div>
            <div className="trust-divider"></div>
            <div className="trust-item">
              <div className="trust-icon">⭐</div>
              <div className="trust-info">
                <span className="trust-value">4.9/5</span>
                <span className="trust-label">User Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Dashboard Preview */}
        <div className="hero-visual">
          <div className="dashboard-preview">
            {/* Mock Dashboard Header */}
            <div className="preview-header">
              <div className="preview-dots">
                <span></span><span></span><span></span>
              </div>
              <div className="preview-title">Family Dashboard</div>
            </div>

            {/* Stats Cards */}
            <div className="preview-stats">
              <div className="preview-stat-card stat-primary">
                <div className="stat-icon">💎</div>
                <div className="stat-info">
                  <span className="stat-label">Total Savings</span>
                  <span className="stat-value">₹12,45,000</span>
                </div>
                <div className="stat-trend positive">+12% ↑</div>
              </div>
              <div className="preview-stat-card stat-gold">
                <div className="stat-icon">🎯</div>
                <div className="stat-info">
                  <span className="stat-label">Goals Progress</span>
                  <span className="stat-value">78%</span>
                </div>
                <div className="stat-trend positive">+5% ↑</div>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="preview-goals">
              <div className="preview-goal">
                <div className="goal-info">
                  <span className="goal-icon">🏠</span>
                  <span className="goal-name">Dream Home</span>
                  <span className="goal-percent">65%</span>
                </div>
                <div className="goal-bar">
                  <div className="goal-fill" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div className="preview-goal">
                <div className="goal-info">
                  <span className="goal-icon">🎓</span>
                  <span className="goal-name">Education Fund</span>
                  <span className="goal-percent">42%</span>
                </div>
                <div className="goal-bar">
                  <div className="goal-fill gold" style={{ width: '42%' }}></div>
                </div>
              </div>
              <div className="preview-goal">
                <div className="goal-info">
                  <span className="goal-icon">✈️</span>
                  <span className="goal-name">Family Vacation</span>
                  <span className="goal-percent">88%</span>
                </div>
                <div className="goal-bar">
                  <div className="goal-fill green" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>

            {/* Family Avatars */}
            <div className="preview-family">
              <div className="family-label">Family Members</div>
              <div className="family-avatars">
                <div className="avatar" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>👴</div>
                <div className="avatar" style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}>👨</div>
                <div className="avatar" style={{ background: 'linear-gradient(135deg, #14b8a6, #2dd4bf)' }}>👩</div>
                <div className="avatar" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>👦</div>
                <div className="avatar add">+2</div>
              </div>
            </div>
          </div>

          {/* Floating Cards */}
          <div className="floating-card card-ai">
            <div className="card-icon">🤖</div>
            <div className="card-text">
              <span className="card-title">AI Insight</span>
              <span className="card-desc">Save ₹5,000 more this month!</span>
            </div>
          </div>

          <div className="floating-card card-notification">
            <div className="card-icon">🔔</div>
            <div className="card-text">
              <span className="card-title">Goal Achieved! 🎉</span>
              <span className="card-desc">Emergency Fund completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Demo Modal */}
      <VideoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />
    </section>
  );
};

export default Hero;