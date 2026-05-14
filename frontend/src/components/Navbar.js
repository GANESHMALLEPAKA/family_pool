import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          👨‍👩‍👧‍👦 FamilyPool
        </Link>
        
        {user ? (
          <div className="nav-menu">
            <Link 
              to="/dashboard" 
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/family-members" 
              className={`nav-link ${location.pathname === '/family-members' ? 'active' : ''}`}
            >
              Family Members
            </Link>
            <Link 
              to="/goals" 
              className={`nav-link ${location.pathname === '/goals' ? 'active' : ''}`}
            >
              Goals
            </Link>
            <Link 
              to="/family-tree" 
              className={`nav-link ${location.pathname === '/family-tree' ? 'active' : ''}`}
            >
              Family Tree
            </Link>
            <Link 
              to="/allocations" 
              className={`nav-link ${location.pathname === '/allocations' ? 'active' : ''}`}
            >
              Allocations
            </Link>
            <Link 
              to="/reports" 
              className={`nav-link ${location.pathname === '/reports' ? 'active' : ''}`}
            >
              Reports
            </Link>
            {(user.role === 'patriarch' || user.role === 'matriarch') && (
              <Link 
                to="/admin" 
                className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
              >
                Admin
              </Link>
            )}
            <div className="user-menu">
              <span>Welcome, {user.name}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        ) : (
          <div className="nav-menu">
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/login?register=true" className="btn btn-primary">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;