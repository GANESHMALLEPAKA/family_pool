import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './FamilyMembers.css';

const FamilyMembers = () => {
  const { user } = useAuth();
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMember, setNewMember] = useState({
    name: '',
    role: 'son',
    email: '',
    phone: '',
    dateOfBirth: '',
    monthlyIncome: ''
  });

  const fetchFamily = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/families/my-family');
      if (response.data && response.data._id) {
        setFamily(response.data);
        setMembers(response.data.members || []);
      } else {
        setFamily(null);
        setMembers([]);
      }
    } catch (err) {
      console.error('Error fetching family:', err);
      setError('Failed to load family data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFamily();
  }, [fetchFamily]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!family) return;

    try {
      const response = await api.post(`/families/${family._id}/members`, {
        name: newMember.name.trim(),
        role: newMember.role,
        email: newMember.email.trim(),
        phone: newMember.phone.trim(),
        dateOfBirth: newMember.dateOfBirth || undefined,
        monthlyIncome: parseInt(newMember.monthlyIncome) || 0
      });

      setFamily(response.data);
      setMembers(response.data.members || []);
      setNewMember({ name: '', role: 'son', email: '', phone: '', dateOfBirth: '', monthlyIncome: '' });
      setShowAddForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add member');
    }
  };

  const updateMemberContribution = async (memberId, contribution) => {
    if (!family) return;
    try {
      const response = await api.put(`/families/${family._id}/members/${memberId}`, {
        monthlyContribution: parseInt(contribution) || 0
      });
      setFamily(response.data);
      setMembers(response.data.members || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update contribution');
    }
  };

  const removeMember = async (memberId) => {
    if (!family) return;
    if (!window.confirm('Are you sure you want to remove this family member?')) return;

    try {
      const response = await api.delete(`/families/${family._id}/members/${memberId}`);
      setFamily(response.data.family);
      setMembers(response.data.family?.members || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="fm-page">
        <div className="fm-loading">
          <div className="fm-spinner"></div>
          <p>Loading family members...</p>
        </div>
      </div>
    );
  }

  const totalIncome = members.reduce((sum, m) => sum + (m.monthlyIncome || 0), 0);
  const totalContributions = members.reduce((sum, m) => sum + (m.monthlyContribution || 0), 0);

  return (
    <div className="fm-page">
      <div className="fm-container">
        {/* Header */}
        <div className="fm-header">
          <div className="fm-header-text">
            <h1>👨‍👩‍👧‍👦 Family Members</h1>
            <p className="fm-subtitle">{family ? family.name : 'Manage your family'}</p>
          </div>
          <button className="fm-btn fm-btn-primary" onClick={() => setShowAddForm(true)}>
            <span>+</span> Add Member
          </button>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <div className="fm-modal-overlay" onClick={() => setShowAddForm(false)}>
            <div className="fm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="fm-modal-header">
                <h3>Add New Family Member</h3>
                <button className="fm-close-btn" onClick={() => setShowAddForm(false)}>×</button>
              </div>
              <form onSubmit={handleAddMember}>
                <div className="fm-form-grid">
                  <div className="fm-form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={newMember.name}
                      onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                      required
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="fm-form-group">
                    <label>Relationship *</label>
                    <select
                      value={newMember.role}
                      onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                    >
                      <option value="patriarch">Patriarch</option>
                      <option value="matriarch">Matriarch</option>
                      <option value="son">Son</option>
                      <option value="daughter">Daughter</option>
                      <option value="spouse">Spouse</option>
                      <option value="grandchild">Grandchild</option>
                      <option value="parent">Parent</option>
                      <option value="member">Other Member</option>
                    </select>
                  </div>
                  <div className="fm-form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="fm-form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={newMember.phone}
                      onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="fm-form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={newMember.dateOfBirth}
                      onChange={(e) => setNewMember({...newMember, dateOfBirth: e.target.value})}
                    />
                  </div>
                  <div className="fm-form-group">
                    <label>Monthly Income (₹)</label>
                    <input
                      type="number"
                      value={newMember.monthlyIncome}
                      onChange={(e) => setNewMember({...newMember, monthlyIncome: e.target.value})}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
                <div className="fm-modal-actions">
                  <button type="button" className="fm-btn fm-btn-ghost" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="fm-btn fm-btn-primary">
                    Add Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Empty State */}
        {members.length === 0 && (
          <div className="fm-empty">
            <div className="fm-empty-icon">👨‍👩‍👧‍👦</div>
            <h3>No Family Members Yet</h3>
            <p>Start building your family pool by adding your first family member.</p>
            <button className="fm-btn fm-btn-primary" onClick={() => setShowAddForm(true)}>
              Add Your First Member
            </button>
          </div>
        )}

        {/* Members Grid */}
        {members.length > 0 && (
          <div className="fm-grid">
            {members.map((member) => (
              <div key={member._id} className="fm-card">
                <div className="fm-card-top">
                  <div className="fm-avatar">
                    {getAvatarForRole(member.role)}
                  </div>
                  <div className="fm-card-info">
                    <h3>{member.name}</h3>
                    <span className={`fm-role-badge fm-role-${member.role}`}>
                      {formatRole(member.role)}
                    </span>
                  </div>
                  {member.role !== 'patriarch' && (
                    <button
                      className="fm-remove-btn"
                      onClick={() => removeMember(member._id)}
                      title="Remove member"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="fm-card-details">
                  <div className="fm-detail-row">
                    <span className="fm-detail-label">Monthly Income</span>
                    <span className="fm-detail-value fm-income">₹{(member.monthlyIncome || 0).toLocaleString()}</span>
                  </div>
                  <div className="fm-detail-row">
                    <span className="fm-detail-label">Contribution</span>
                    <div className="fm-contribution-input">
                      <span>₹</span>
                      <input
                        type="number"
                        value={member.monthlyContribution || ''}
                        onChange={(e) => updateMemberContribution(member._id, e.target.value)}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                  {member.email && (
                    <div className="fm-detail-row">
                      <span className="fm-detail-label">Email</span>
                      <span className="fm-detail-value fm-truncate">{member.email}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="fm-detail-row">
                      <span className="fm-detail-label">Phone</span>
                      <span className="fm-detail-value">{member.phone}</span>
                    </div>
                  )}
                  <div className="fm-detail-row">
                    <span className="fm-detail-label">Joined</span>
                    <span className="fm-detail-value">{new Date(member.joinedAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {members.length > 0 && (
          <div className="fm-summary">
            <h3>Family Financial Summary</h3>
            <div className="fm-summary-grid">
              <div className="fm-summary-card">
                <span className="fm-summary-icon">💰</span>
                <div>
                  <span className="fm-summary-label">Total Monthly Income</span>
                  <strong className="fm-summary-value">₹{totalIncome.toLocaleString()}</strong>
                </div>
              </div>
              <div className="fm-summary-card">
                <span className="fm-summary-icon">📊</span>
                <div>
                  <span className="fm-summary-label">Total Contributions</span>
                  <strong className="fm-summary-value">₹{totalContributions.toLocaleString()}</strong>
                </div>
              </div>
              <div className="fm-summary-card">
                <span className="fm-summary-icon">👥</span>
                <div>
                  <span className="fm-summary-label">Active Members</span>
                  <strong className="fm-summary-value">{members.length}</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function getAvatarForRole(role) {
  const avatars = {
    patriarch: '👴', matriarch: '👵', son: '👨', daughter: '👩',
    spouse: '💑', grandchild: '👦', parent: '👨‍👩‍👦', member: '👤'
  };
  return avatars[role] || '👤';
}

function formatRole(role) {
  const labels = {
    patriarch: 'Patriarch', matriarch: 'Matriarch', son: 'Son', daughter: 'Daughter',
    spouse: 'Spouse', grandchild: 'Grandchild', parent: 'Parent', member: 'Member'
  };
  return labels[role] || role;
}

export default FamilyMembers;