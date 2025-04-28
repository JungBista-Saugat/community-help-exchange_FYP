import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import '../../styles/admin.css';
import '../../styles/volunteering.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaCoins, FaEnvelope, FaUser, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const AdminDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch pending applications only
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        // Check if user is admin from cached data
        const sessionUserData = sessionStorage.getItem('userData');
        if (sessionUserData) {
          const userData = JSON.parse(sessionUserData);
          if (userData.role !== 'admin') {
            // Not an admin, redirect to regular dashboard
            sessionStorage.setItem('redirecting', 'true');
            navigate('/dashboard');
            return;
          }
        }
        
        const applicationsResponse = await axios.get('http://localhost:5000/api/admin/applications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Filter for pending applications and ensure uniqueness
        const pendingApps = applicationsResponse.data.filter(app => app.status === 'pending');
        
        // Ensure unique applications (avoid duplicates)
        const uniqueApplications = [];
        const seenApplications = new Set();
        
        pendingApps.forEach(app => {
          const appId = app.applicationId || app._id;
          const postId = app.postId;
          const uniqueKey = `${appId}-${postId}`;
          
          if (!seenApplications.has(uniqueKey)) {
            seenApplications.add(uniqueKey);
            
            // Ensure the application has a unique ID for React's key prop
            uniqueApplications.push({
              ...app,
              uniqueId: uniqueKey
            });
          }
        });
        
        setApplications(uniqueApplications);
        
        // Clear any redirection flags
        sessionStorage.removeItem('redirecting');
      } catch (err) {
        setError('Failed to load applications');
        console.error(err);
        
        // Clear tokens on authentication error
        if (err.response && err.response.status === 401) {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('userData');
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [navigate]);

  // Approve application
  const handleApproveApplication = async (postId, applicationId) => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/volunteer-posts/${postId}/applications/${applicationId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove the approved application from the list using uniqueId
      setApplications(applications.filter(app => app.uniqueId !== `${applicationId}-${postId}`));
    } catch (err) {
      setError('Failed to approve application');
      console.error(err);
    }
  };

  // Reject application
  const handleRejectApplication = async (postId, applicationId) => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/volunteer-posts/${postId}/applications/${applicationId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove the rejected application from the list using uniqueId
      setApplications(applications.filter(app => app.uniqueId !== `${applicationId}-${postId}`));
    } catch (err) {
      setError('Failed to reject application');
      console.error(err);
    }
  };

  // Helper to format date strings
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div>
        <AdminNavbar />
        <div className="page-container">
          <h1>Admin Dashboard</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminNavbar />
      <div className="page-container admin-dashboard">
        <h1>Admin Dashboard</h1>
        {error && <p className="error-message">{error}</p>}

        <div className="applications-section">
          <h2>Pending Applications</h2>
          {applications.length === 0 ? (
            <p>No pending applications at the moment.</p>
          ) : (
            <div className="volunteer-grid">
              {applications.map((app, index) => {
                const appUniqueId = app.uniqueId || `dashboard-app-${index}`;
                const approveButtonId = `dashboard-approve-${appUniqueId}`;
                const rejectButtonId = `dashboard-reject-${appUniqueId}`;
                
                return (
                  <div key={appUniqueId} className="volunteer-card application-card">
                    <div className="volunteer-card-content">
                      <h3 className="volunteer-title">Application for: {app.postTitle || 'Volunteer Position'}</h3>
                      
                      <div className="volunteer-details">
                        <div className="detail-item">
                          <FaUser className="detail-icon" />
                          <span><strong>Applicant:</strong> {app.user?.name || 'Unknown'}</span>
                        </div>
                        <div className="detail-item">
                          <FaEnvelope className="detail-icon" />
                          <span><strong>Email:</strong> {app.user?.email || 'Unknown'}</span>
                        </div>
                        <div className="detail-item">
                          <FaCalendarAlt className="detail-icon" />
                          <span><strong>Applied on:</strong> {formatDate(app.appliedAt)}</span>
                        </div>
                        <div className="detail-item">
                          <FaMapMarkerAlt className="detail-icon" />
                          <span><strong>Location:</strong> {app.location || 'Not specified'}</span>
                        </div>
                        <div className="detail-item">
                          <FaCalendarAlt className="detail-icon" />
                          <span><strong>Date:</strong> {formatDate(app.date)}</span>
                        </div>
                        <div className="detail-item">
                          <FaCoins className="detail-icon" />
                          <span><strong>Points to Award:</strong> {app.pointsAwarded || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="volunteer-card-footer admin-card-footer">
                      <div className="button-container">
                        <label htmlFor={approveButtonId} className="visually-hidden">
                          Approve application from {app.user?.name || 'applicant'} for {app.postTitle || 'position'}
                        </label>
                        <button
                          id={approveButtonId}
                          className="admin-action-button edit"
                          onClick={() => handleApproveApplication(app.postId, app.applicationId)}
                          aria-label={`Approve application from ${app.user?.name || 'applicant'}`}
                        >
                          <FaCheckCircle className="button-icon" />
                          Approve
                        </button>
                      </div>
                      
                      <div className="button-container">
                        <label htmlFor={rejectButtonId} className="visually-hidden">
                          Reject application from {app.user?.name || 'applicant'} for {app.postTitle || 'position'}
                        </label>
                        <button
                          id={rejectButtonId}
                          className="admin-action-button delete"
                          onClick={() => handleRejectApplication(app.postId, app.applicationId)}
                          aria-label={`Reject application from ${app.user?.name || 'applicant'}`}
                        >
                          <FaTimesCircle className="button-icon" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style jsx="true">{`
        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          margin: -1px;
          padding: 0;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }
        .button-container {
          display: inline-block;
          margin-right: 10px;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
