import React from 'react';
import '../styles/notification.css';

const Notification = ({ isOpen, onClose, notifications, loading, onMarkAsRead }) => {
  if (!isOpen) return null;

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-container" onClick={e => e.stopPropagation()}>
        <div className="notification-header">
          <h2>Notifications</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="notification-content">
          {loading ? (
            <p>Loading notifications...</p>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <div 
                key={notification._id} 
                className="notification-item"
                onClick={() => !notification.read && onMarkAsRead(notification._id)}
              >
                <div className={`notification-dot ${notification.read ? '' : 'unread'}`} />
                <div className="notification-text">
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-notifications">No notifications</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification; 