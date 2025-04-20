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
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('User Data:', response.data); // Debug the user data
        setUserData(response.data);

        // If user is admin, redirect to admin dashboard
        if (response.data.role === 'admin') {
          console.log('Redirecting to admin dashboard...');
          navigate('/admin-dashboard');
          return;
        }

        console.log('Redirecting to dashboard...');
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const updateLocation = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const token = localStorage.getItem('token');
            await axios.put(
              'http://localhost:5000/api/users/location',
              { latitude, longitude },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (error) {
            console.error('Error updating location:', error);
          }
        });
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    };

    updateLocation();
  }, []);

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
          <button
            className="action-button tertiary"
            onClick={() => navigate('/nearby-users')}
          >
            Find Nearby Users
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;