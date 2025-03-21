import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaHandsHelping, 
  FaComments, 
  FaUser, 
  FaCog, 
  FaSignOutAlt 
} from 'react-icons/fa';
import '../styles/navbar.css';

const SideNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="side-nav-container">
      <div className="nav-section main-nav">
        <div className="nav-item" onClick={() => navigate('/')}>
          <FaTachometerAlt className="nav-icon" />
          <span>Dashboard</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/ask-help')}>
          <FaHandsHelping className="nav-icon" />
          <span>Ask Help</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/offer-help')}>
          <FaHandsHelping className="nav-icon" />
          <span>Offer Help</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/messages')}>
          <FaComments className="nav-icon" />
          <span>Messages</span>
        </div>
        <div className="nav-item" onClick={() => navigate('/volunteer-opportunities')}>
          <FaHandsHelping className="nav-icon" />
          <span>Volunteering</span>
        </div>
      </div>

      <div className="nav-section bottom-nav">
        <div className="nav-item" onClick={() => navigate('/profile')}>
          <FaUser className="nav-icon" />
          <span>Profile</span>
        </div>
        <div className="nav-item sub-item" onClick={handleLogout}>
          <FaSignOutAlt className="nav-icon" />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default SideNavbar;