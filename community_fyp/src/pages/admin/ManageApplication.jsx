import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';
import '../../styles/admin.css';
import '../../styles/volunteering.css';
import { FaUser, FaEnvelope, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ManageApplications = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/admin/applications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(res.data);
      } catch (err) {
        setError('Failed to fetch applications');
      }
    };

    fetchApplications();
  }, []);

  const handleApprove = async (postId, appId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/volunteer-posts/${postId}/applications/${appId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications(applications.filter((app) => app._id !== appId));
    } catch (err) {
      setError('Failed to approve application');
    }
  };

  const handleReject = async (postId, appId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/volunteer-posts/${postId}/applications/${appId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications(applications.filter((app) => app._id !== appId));
    } catch (err) {
      setError('Failed to reject application');
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="page-container">
        <h2>Manage Applications</h2>
        {error && <p className="error-message">{error}</p>}
        {applications.length === 0 ? (
          <p>No pending applications.</p>
        ) : (
          <div className="volunteer-grid">
            {applications.map((app) => (
              <div key={app._id} className="volunteer-card application-card">
                <div className="volunteer-card-content">
                  <h3 className="volunteer-title">Application Review</h3>
                  
                  <div className="volunteer-details">
                    <div className="detail-item">
                      <FaUser className="detail-icon" />
                      <span><strong>Applicant:</strong> {app.user.name}</span>
                    </div>
                    <div className="detail-item">
                      <FaEnvelope className="detail-icon" />
                      <span><strong>Email:</strong> {app.user.email}</span>
                    </div>
                    {app.post && app.post.title && (
                      <div className="detail-item">
                        <span><strong>Position:</strong> {app.post.title}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="volunteer-card-footer admin-card-footer">
                  <button 
                    className="admin-action-button edit" 
                    onClick={() => handleApprove(app.post._id, app._id)}
                  >
                    <FaCheckCircle className="button-icon" />
                    Approve
                  </button>
                  <button 
                    className="admin-action-button delete" 
                    onClick={() => handleReject(app.post._id, app._id)}
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
    </>
  );
};

export default ManageApplications;