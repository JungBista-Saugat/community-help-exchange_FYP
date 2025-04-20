import React, { useState, useEffect } from 'react';
import { FaSearch, FaBell, FaUser, FaSignInAlt } from 'react-icons/fa';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import Notification from './Notification';

const Navbar = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
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
      const token = localStorage.getItem('token');
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

  return (
    <nav className="navbar">
      <div className="search-container">
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
          />
          <FaSearch className="search-icon" />
        </div>
      </div>

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
        <button className="login-button" onClick={() => navigate('/login')}>
          <FaSignInAlt className="login-icon" />
          Login
        </button>
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