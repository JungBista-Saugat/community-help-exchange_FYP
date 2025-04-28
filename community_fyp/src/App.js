import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';

// Importing from pages folder
import Login from './pages/login';
import Signup from './pages/signup';
import Dashboard from './pages/dashboard';
import ForgotPassword from './pages/forgotPassword';
import ResetPassword from './pages/resetPassword';
import ProfileCompletion from './pages/profileCompletion';
import VolunteerOpportunities from './pages/admin/volunteerOpportunities';
import AdminDashboard from './pages/admin/adminDashboard';
import Messages from './pages/Messages';
import AskHelp from './pages/AskHelp';
import OfferHelp from './pages/OfferHelp';
import Profile from './pages/Profile';
import Volunteering from './pages/Volunteering'; 
import CreatePost from './pages/admin/CreatePost'; 
import ManageApplications from './pages/admin/ManageApplication'; 
import NearbyUsers from './components/NearbyUsers';
// Protected Route
import ProtectedRoute from './components/ProtectedRoute';
// Session Manager
import SessionManager from './components/SessionManager';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Add SessionManager to handle multi-tab sessions */}
        <SessionManager />
        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/profile-completion" element={<ProtectedRoute element={<ProfileCompletion />} />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/admin/volunteer-opportunities" element={<ProtectedRoute element={<VolunteerOpportunities />} allowedRoles={['admin']} />} />
          <Route path="/messages" element={<ProtectedRoute element={<Messages />} />} />
          <Route path="/ask-help" element={<ProtectedRoute element={<AskHelp />} />} />
          <Route path="/offer-help" element={<ProtectedRoute element={<OfferHelp />} />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/volunteer" element={<ProtectedRoute element={<Volunteering />} />} />
          <Route path="/admin/create-post" element={<ProtectedRoute element={<CreatePost />} allowedRoles={['admin']} />} />
          <Route path="/admin/applications" element={<ProtectedRoute element={<ManageApplications />} allowedRoles={['admin']} />} />
          <Route path="/admin/adminDashboard" element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin']} />} />
          <Route path="/nearby-users" element={<NearbyUsers />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;