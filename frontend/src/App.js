import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import FamilyLanding from './components/FamilyLanding';
import Dashboard from './components/Dashboard';
import FamilyTreePage from './components/FamilyTreePage';
import Allocations from './components/Allocations';
import FamilyMembers from './components/FamilyMembers';
import GoalsManager from './components/GoalsManager';
import Reports from './components/Reports';
import Login from './pages/Login';
import AICopilot from './components/AICopilot';
import AdminPanel from './components/AdminPanel';
import './App.css';

const LoginRoute = () => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <AICopilot />
          <Routes>
            <Route path="/" element={<FamilyLanding />} />
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/family-tree" element={<ProtectedRoute><FamilyTreePage /></ProtectedRoute>} />
            <Route path="/allocations" element={<ProtectedRoute><Allocations /></ProtectedRoute>} />
            <Route path="/family-members" element={<ProtectedRoute><FamilyMembers /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><GoalsManager /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;