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
        // First check if we have userData stored in session
        const sessionUserData = sessionStorage.getItem('userData');
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        let user;
        
        if (sessionUserData) {
          user = JSON.parse(sessionUserData);
          console.log('Using cached user data:', user);
        } else {
          const response = await axios.get('http://localhost:5000/api/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          user = response.data;
          // Cache the user data
          sessionStorage.setItem('userData', JSON.stringify(user));
          console.log('Fetched fresh user data:', user);
        }
        
        setUserData(user);

        // If user is admin, redirect to admin dashboard ONLY if we're not already
        // in the process of redirecting (prevent loops)
        if (user.role === 'admin' && !sessionStorage.getItem('redirecting')) {
          console.log('User is admin, redirecting to admin dashboard...');
          sessionStorage.setItem('redirecting', 'true');
          navigate('/admin/adminDashboard');
          return;
        }
        
        // Clear redirection flag once done
        sessionStorage.removeItem('redirecting');
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data');
        // Clear tokens on error
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userData');
        localStorage.removeItem('token');
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
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
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

  // Function to get username with proper fallbacks
  const getUserName = () => {
    if (!userData) return 'User';
    
    // Check different possible properties for user name
    if (userData.name) return userData.name;
    if (userData.username) return userData.username;
    if (userData.firstName) {
      return userData.lastName 
        ? `${userData.firstName} ${userData.lastName}` 
        : userData.firstName;
    }
    
    return 'User';
  };

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

        <div className="welcome-message">
          <h2>Hi there, {getUserName()}!</h2>
          <p>Welcome to Community Help Exchange Platform</p>
        </div>

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
            onClick={() => navigate('/volunteer')}
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