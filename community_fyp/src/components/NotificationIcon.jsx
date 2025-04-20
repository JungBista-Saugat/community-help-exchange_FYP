import React from 'react';
import { FaBell } from 'react-icons/fa';
import '../styles/notification.css';

const NotificationIcon = ({ unreadCount, onClick }) => {
  return (
    <div className="notification-icon" onClick={onClick}>
      <FaBell size={20} color="#333" />
      {unreadCount > 0 && (
        <span className="notification-badge">{unreadCount}</span>
      )}
    </div>
  );
};

export default NotificationIcon; 