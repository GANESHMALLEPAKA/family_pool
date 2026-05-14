import React from 'react';
import { Link } from 'react-router-dom';
import Hero from './Hero';
import FeaturesGrid from './FeaturesGrid';
import Footer from './Footer';
import './FamilyLanding.css';

const FamilyLanding = () => {
  return (
    <div className="family-landing">
      <Hero />
      <FeaturesGrid />

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">🚀 Simple Process</span>
            <h2>Get Started in Minutes</h2>
            <p>Join your family's financial journey in three easy steps</p>
          </div>

          <div className="steps-wrapper">
            <div className="steps-line"></div>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <div className="step-icon">👨‍👩‍👧‍👦</div>
                <h3>Create Family</h3>
                <p>Set up your family account and invite members to join the wealth-building journey.</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <div className="step-icon">🎯</div>
                <h3>Set Goals</h3>
                <p>Define shared goals like education, vacation, or dream home with target amounts.</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <div className="step-icon">📈</div>
                <h3>Grow Together</h3>
                <p>Track contributions, get AI insights, and watch your family wealth grow!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Counter Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-bg-elements">
            <div className="stat-glow glow-1"></div>
            <div className="stat-glow glow-2"></div>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon-wrapper">💰</div>
              <h3 className="counter">₹50,000 Cr+</h3>
              <p>Wealth Managed</p>
              <div className="stat-bar">
                <div className="stat-bar-fill" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon-wrapper">👨‍👩‍👧‍👦</div>
              <h3 className="counter">10 Lakh+</h3>
              <p>Happy Families</p>
              <div className="stat-bar">
                <div className="stat-bar-fill gold" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon-wrapper">🎯</div>
              <h3 className="counter">94%</h3>
              <p>Goal Success Rate</p>
              <div className="stat-bar">
                <div className="stat-bar-fill green" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">💬 Stories</span>
            <h2>Trusted by Families Across India</h2>
            <p>See how families are building wealth together</p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p>"Family Pool transformed our finances. We've saved ₹5 lakhs in the first year alone! The AI suggestions are spot on."</p>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍👩‍👧</div>
                <div className="author-info">
                  <h4>Rajesh Kumar</h4>
                  <p>Mumbai</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card featured">
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p>"Finally, a platform that understands Indian family values. Our children's education fund grew by 40% using the goal tracking!"</p>
              <div className="testimonial-author">
                <div className="author-avatar">👩‍👧‍👦</div>
                <div className="author-info">
                  <h4>Priya Sharma</h4>
                  <p>Delhi</p>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p>"Best financial decision we made. The transparent tracking keeps everyone accountable and motivated."</p>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍👩‍👦‍👦</div>
                <div className="author-info">
                  <h4>Arun & Meena</h4>
                  <p>Bangalore</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Build <span>Generational Wealth?</span></h2>
            <p>Join thousands of Indian families already managing their finances together. Start free today.</p>
            <div className="cta-actions">
              <Link to="/login?register=true" className="btn btn-white btn-large">
                Start Free Trial →
              </Link>
              <Link to="/login" className="btn btn-outline-light">
                Sign In
              </Link>
            </div>
            <div className="cta-trust">
              <span>🔒 No credit card required</span>
              <span>✓ Free for families under 5 members</span>
              <span>⚡ Setup in 2 minutes</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FamilyLanding;