import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only allow Patriarch or Matriarch
    if (!user || (user.role !== 'patriarch' && user.role !== 'matriarch')) {
      navigate('/dashboard');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await api.get('/families/admin/stats');
        setStats(res.data);
      } catch (err) {
        setError('Failed to load admin statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate]);

  if (loading) return <div className="admin-loading">Crunching numbers...</div>;
  if (error) return <div className="admin-error">{error}</div>;
  if (!stats) return null;

  return (
    <div className="admin-panel-container">
      <div className="admin-header">
        <h1>🛡️ Administration & Global Analytics</h1>
        <p>Exclusive access for Family Leaders</p>
      </div>

      <div className="admin-grid">
        {/* Local Family Section */}
        <div className="admin-section">
          <h2>Your Family Performance</h2>
          <div className="stats-cards">
            <div className="stat-card blue">
              <span className="stat-title">Total Wealth</span>
              <span className="stat-value">₹{stats.familyStats.totalWealth?.toLocaleString() || '0'}</span>
            </div>
            <div className="stat-card green">
              <span className="stat-title">Monthly Income</span>
              <span className="stat-value">₹{stats.familyStats.monthlyIncome?.toLocaleString() || '0'}</span>
            </div>
            <div className="stat-card purple">
              <span className="stat-title">Members</span>
              <span className="stat-value">{stats.familyStats.memberCount} active</span>
            </div>
          </div>
        </div>

        {/* Global Platform Section */}
        <div className="admin-section platform-section">
          <h2>Platform Benchmarks</h2>
          <p className="benchmark-sub">Compare your standing anonymously against all other families on FamilyPool.</p>
          
          <div className="stats-cards">
            <div className="stat-card dark">
              <span className="stat-title">Average Platform Wealth</span>
              <span className="stat-value">₹{stats.platformStats.averageWealth?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <span className={`trend ${stats.familyStats.totalWealth > stats.platformStats.averageWealth ? 'up' : 'down'}`}>
                {stats.familyStats.totalWealth > stats.platformStats.averageWealth 
                  ? '↑ You are above average' 
                  : '↓ Below platform average'}
              </span>
            </div>

            <div className="stat-card dark">
              <span className="stat-title">Platform Demographics</span>
              <span className="stat-value">{stats.platformStats.totalFamilies}</span>
              <span className="trend">Families currently registered</span>
            </div>

            <div className="stat-card gold">
              <span className="stat-title">Top Percentile Metric</span>
              <span className="stat-value">{stats.platformStats.topPercentile}%</span>
              <span className="trend">Families with &gt; 50L Wealth</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
