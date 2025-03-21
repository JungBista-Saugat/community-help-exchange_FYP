import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/login';
import Signup from './pages/signup';
import Dashboard from './pages/dashboard';
import ForgotPassword from './pages/forgotPassword';
import ResetPassword from './pages/resetPassword';
import ProfileCompletion from './pages/profileCompletion';
import VolunteerOpportunities from './pages/volunteerOpportunities';
import AdminDashboard from './pages/adminDashboard';
import Messages from './pages/Messages';
import AskHelp from './pages/AskHelp';
import OfferHelp from './pages/OfferHelp';
import Profile from './pages/Profile';

const isAuthenticated = async () => {
  const token = localStorage.getItem('token');
  if (!token) return { authenticated: false, role: null };
  
  try {
    const response = await fetch('http://localhost:5000/api/users/validate-token', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Invalid token');
    const data = await response.json();
    return { authenticated: data.valid, role: data.role };
  } catch (error) {
    localStorage.removeItem('token');
    return { authenticated: false, role: null };
  }
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/profile-completion"
            element={isAuthenticated().authenticated ? <ProfileCompletion /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated().authenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/volunteer-opportunities"
            element={isAuthenticated().authenticated ? <VolunteerOpportunities /> : <Navigate to="/login" />}
          />
          <Route
            path="/messages"
            element={isAuthenticated().authenticated ? <Messages /> : <Navigate to="/login" />}
          />
          <Route
            path="/ask-help"
            element={isAuthenticated().authenticated ? <AskHelp /> : <Navigate to="/login" />}
          />
          <Route
            path="/offer-help"
            element={isAuthenticated().authenticated ? <OfferHelp /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={isAuthenticated().authenticated ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin-dashboard"
            element={isAuthenticated().authenticated && isAuthenticated().role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />}
          />
          <Route path="/" element={isAuthenticated().authenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;