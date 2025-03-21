import React from 'react';
import { FaSearch, FaBell, FaUser, FaSignInAlt } from 'react-icons/fa';
import { useNavigate, NavLink } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

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
        <button className="icon-button" onClick={() => navigate('/notifications')}>
          <FaBell />
        </button>
        <NavLink to="/profile" className={({ isActive }) => `icon-button user-icon ${isActive ? 'active' : ''}`}>
          <FaUser />
        </NavLink>
        <button className="login-button" onClick={() => navigate('/login')}>
          <FaSignInAlt className="login-icon" />
          Login
        </button>
      </div>
    </nav>
  );
};

export default Navbar;