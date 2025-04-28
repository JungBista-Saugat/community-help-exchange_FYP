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
            <div className="volunteer-grid">
              {applications
                .filter(app => app.status === 'pending')
                .map((app) => (
                <div key={app.applicationId} className="volunteer-card application-card">
                  <div className="volunteer-card-content">
                    <h3 className="volunteer-title">Application for: {app.postTitle}</h3>
                    
                    <div className="volunteer-details">
                      <div className="detail-item">
                        <FaUser className="detail-icon" />
                        <span><strong>Applicant:</strong> {app.user.name}</span>
                      </div>
                      <div className="detail-item">
                        <FaEnvelope className="detail-icon" />
                        <span><strong>Email:</strong> {app.user.email}</span>
                      </div>
                      <div className="detail-item">
                        <FaCalendarAlt className="detail-icon" />
                        <span><strong>Applied on:</strong> {formatDate(app.appliedAt)}</span>
                      </div>
                      <div className="detail-item">
                        <FaMapMarkerAlt className="detail-icon" />
                        <span><strong>Location:</strong> {app.location}</span>
                      </div>
                      <div className="detail-item">
                        <FaCalendarAlt className="detail-icon" />
                        <span><strong>Date:</strong> {formatDate(app.date)}</span>
                      </div>
                      <div className="detail-item">
                        <FaCoins className="detail-icon" />
                        <span><strong>Points to Award:</strong> {app.pointsAwarded}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="volunteer-card-footer admin-card-footer">
                    <button
                      className="admin-action-button edit"
                      onClick={() => handleApproveApplication(app.postId, app.applicationId)}
                    >
                      <FaCheckCircle className="button-icon" />
                      Approve
                    </button>
                    <button
                      className="admin-action-button delete"
                      onClick={() => handleRejectApplication(app.postId, app.applicationId)}
                    >
                      <FaTimesCircle className="button-icon" />
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
