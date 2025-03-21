import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/dashboard.css';
import Layout from '../components/Layout';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUserData(response.data);
        
        // If profile is not completed, redirect to profile completion
        if (!response.data.completedProfile) {
          navigate('/profile-completion');
          return;
        }

        // If user is admin, redirect to admin dashboard
        if (response.data.role === 'admin') {
          navigate('/admin-dashboard');
          return;
        }
      } catch (err) {
        setError('Failed to load user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="dashboard-container">
          <p>Loading your dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard-container">
        {error && <p className="error-message">{error}</p>}
        
        <div className="points-card">
          <h3>Your Points</h3>
          <p>{userData?.points || 0}</p>
          <small>Use points to request help or earn more by volunteering</small>
        </div>

        <div className="motto">
          "Strengthen Your Community, One Request at a Time."
        </div>

        <div className="button-container">
          <button 
            className="action-button primary"
            onClick={() => navigate('/volunteer-opportunities')}
          >
            Volunteer Now
          </button>
          <button 
            className="action-button secondary"
            onClick={() => navigate('/ask-help')}
          >
            Request Help
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;