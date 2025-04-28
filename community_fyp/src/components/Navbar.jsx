import React, { useState, useEffect } from 'react';
import { FaBell, FaUser, FaSignInAlt } from 'react-icons/fa';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import Notification from './Notification';

const Navbar = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchUnreadCount();
    fetchUserData();
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async () => {
    try {
      // First check sessionStorage for user data
      const sessionUserData = sessionStorage.getItem('userData');
      if (sessionUserData) {
        const userData = JSON.parse(sessionUserData);
        console.log('Using cached user data in Navbar:', userData);
        setUserData(userData);
        return;
      }
      
      // Fall back to API call if no cached data
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched user data in Navbar:', response.data);
      
      // Cache the user data
      sessionStorage.setItem('userData', JSON.stringify(response.data));
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      // Update unread count
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const toggleNotifications = () => {
    if (!showNotifications && !loading) {
      fetchNotifications();
    }
    setShowNotifications(!showNotifications);
  };

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

  return (
    <nav className="navbar">
      {userData && (
        <div className="user-info">
          <div className="username-badge">
            {getUserName()}
          </div>
          <div className="points-display">
            <span className="points-label">Points:</span> 
            <span className="points-value">{userData.points || 0}</span>
          </div>
        </div>
      )}

      <div className="nav-actions">
        <div className="notification-icon" onClick={toggleNotifications}>
          <FaBell size={20} />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </div>
        <NavLink to="/profile" className={({ isActive }) => `icon-button user-icon ${isActive ? 'active' : ''}`}>
          <FaUser />
        </NavLink>
        {!userData ? (
          <button className="login-button" onClick={() => navigate('/login')}>
            <FaSignInAlt className="login-icon" />
            Login
          </button>
        ) : (
          <button 
            className="logout-button" 
            onClick={() => {
              localStorage.removeItem('token');
              sessionStorage.removeItem('token');
              sessionStorage.removeItem('userData');
              navigate('/login');
            }}
          >
            Logout
          </button>
        )}
      </div>

      <Notification 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        loading={loading}
        onMarkAsRead={markAsRead}
      />
    </nav>
  );
};

export default Navbar;