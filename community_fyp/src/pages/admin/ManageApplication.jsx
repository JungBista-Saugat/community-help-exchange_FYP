import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';
import '../../styles/admin.css';
import '../../styles/volunteering.css';
import { FaUser, FaEnvelope, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const ManageApplications = () => {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        
        // Check if user is admin from cached data
        const sessionUserData = sessionStorage.getItem('userData');
        if (sessionUserData) {
          const userData = JSON.parse(sessionUserData);
          if (userData.role !== 'admin') {
            console.error('User is not an admin');
            setError('You do not have admin permissions');
            setLoading(false);
            return;
          }
        }
        
        const res = await axios.get('http://localhost:5000/api/admin/applications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Filter out duplicate applications and ensure each has a unique ID
        // Use application ID + post ID as a unique combination
        const uniqueApplications = [];
        const seenApplications = new Set();
        
        res.data.forEach(app => {
          const appId = app.applicationId || app._id;
          const postId = app.postId || (app.post && app.post._id);
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
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch applications:', err);
        setError('Failed to fetch applications');
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleApprove = async (postId, appId) => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/volunteer-posts/${postId}/applications/${appId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Use the uniqueId to filter out the processed application
      setApplications(applications.filter((app) => app.uniqueId !== `${appId}-${postId}`));
    } catch (err) {
      console.error('Failed to approve application:', err);
      setError('Failed to approve application');
    }
  };

  const handleReject = async (postId, appId) => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/volunteer-posts/${postId}/applications/${appId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Use the uniqueId to filter out the processed application
      setApplications(applications.filter((app) => app.uniqueId !== `${appId}-${postId}`));
    } catch (err) {
      console.error('Failed to reject application:', err);
      setError('Failed to reject application');
    }
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="page-container">
          <h2>Manage Applications</h2>
          <p>Loading applications...</p>
        </div>
      </>
    );
  }

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
            {applications.map((app, index) => {
              // Generate unique IDs for form elements using the application's uniqueId and index
              const appUniqueId = app.uniqueId || `app-${index}`;
              
              return (
                <div key={appUniqueId} className="volunteer-card application-card">
                  <div className="volunteer-card-content">
                    <h3 className="volunteer-title">Application Review</h3>
                    
                    <div className="volunteer-details">
                      <div className="detail-item">
                        <FaUser className="detail-icon" />
                        <span><strong>Applicant:</strong> {app.user?.name || 'Unknown'}</span>
                      </div>
                      <div className="detail-item">
                        <FaEnvelope className="detail-icon" />
                        <span><strong>Email:</strong> {app.user?.email || 'Unknown'}</span>
                      </div>
                      {app.post && app.post.title && (
                        <div className="detail-item">
                          <span><strong>Position:</strong> {app.post.title}</span>
                        </div>
                      )}
                      {app.postTitle && (
                        <div className="detail-item">
                          <span><strong>Position:</strong> {app.postTitle}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="volunteer-card-footer admin-card-footer">
                    <div className="button-container">
                      <label htmlFor={`approve-btn-${appUniqueId}-${index}`} className="visually-hidden">
                        Approve application from {app.user?.name || 'applicant'} for {app.postTitle || app.post?.title || 'position'}
                      </label>
                      <button 
                        id={`approve-btn-${appUniqueId}-${index}`}
                        className="admin-action-button edit" 
                        onClick={() => handleApprove(
                          app.postId || (app.post && app.post._id), 
                          app.applicationId || app._id
                        )}
                        aria-label={`Approve application from ${app.user?.name || 'applicant'}`}
                      >
                        <FaCheckCircle className="button-icon" />
                        Approve
                      </button>
                    </div>
                    
                    <div className="button-container">
                      <label htmlFor={`reject-btn-${appUniqueId}-${index}`} className="visually-hidden">
                        Reject application from {app.user?.name || 'applicant'} for {app.postTitle || app.post?.title || 'position'}
                      </label>
                      <button 
                        id={`reject-btn-${appUniqueId}-${index}`}
                        className="admin-action-button delete" 
                        onClick={() => handleReject(
                          app.postId || (app.post && app.post._id), 
                          app.applicationId || app._id
                        )}
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
    </>
  );
};

export default ManageApplications;