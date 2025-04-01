import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNavbar from './AdminNavbar';
import '../../styles/admin.css';

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
          applications.map((app) => (
            <div key={app._id} className="application-card">
              <p>Applicant: {app.user.name}</p>
              <p>Email: {app.user.email}</p>
              <button onClick={() => handleApprove(app.post._id, app._id)}>Approve</button>
              <button onClick={() => handleReject(app.post._id, app._id)}>Reject</button>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default ManageApplications;