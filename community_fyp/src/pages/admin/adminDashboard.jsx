import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import '../../styles/admin.css';

const AdminDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch pending applications only
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        const applicationsResponse = await axios.get('http://localhost:5000/api/admin/applications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(applicationsResponse.data);
      } catch (err) {
        setError('Failed to load applications');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [navigate]);

  // Approve application
  const handleApproveApplication = async (postId, applicationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/volunteer-posts/${postId}/applications/${applicationId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove the approved application from the list
      setApplications(applications.filter(app => app.applicationId !== applicationId));
    } catch (err) {
      setError('Failed to approve application');
      console.error(err);
    }
  };

  // Reject application
  const handleRejectApplication = async (postId, applicationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/volunteer-posts/${postId}/applications/${applicationId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove the rejected application from the list
      setApplications(applications.filter(app => app.applicationId !== applicationId));
    } catch (err) {
      setError('Failed to reject application');
      console.error(err);
    }
  };

  // Helper to format date strings
  const formatDate = (dateString) => {
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
            <div className="applications-list">
              {applications
                .filter(app => app.status === 'pending')
                .map((app) => (
                <div key={app.applicationId} className="application-card">
                  <div className="application-info">
                    <h3>Application for: {app.postTitle}</h3>
                    <p><strong>Applicant:</strong> {app.user.name}</p>
                    <p><strong>Email:</strong> {app.user.email}</p>
                    <p><strong>Applied on:</strong> {formatDate(app.appliedAt)}</p>
                    <p><strong>Location:</strong> {app.location}</p>
                    <p><strong>Date:</strong> {formatDate(app.date)}</p>
                    <p><strong>Points to Award:</strong> {app.pointsAwarded}</p>
                  </div>
                  <div className="application-actions">
                    <button
                      className="approve-button"
                      onClick={() => handleApproveApplication(app.postId, app.applicationId)}
                    >
                      Approve
                    </button>
                    <button
                      className="reject-button"
                      onClick={() => handleRejectApplication(app.postId, app.applicationId)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
