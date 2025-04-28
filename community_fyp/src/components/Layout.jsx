import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import SideNavbar from './SideNavbar';
import '../styles/navbar.css';

const Layout = ({ children }) => {
  // Use state to track which user is loaded in this layout
  const [currentUser, setCurrentUser] = useState('');
  
  useEffect(() => {
    // Check user data from session storage
    const sessionUserData = sessionStorage.getItem('userData');
    if (sessionUserData) {
      const userData = JSON.parse(sessionUserData);
      const userId = userData._id || userData.id;
      setCurrentUser(userId);
    }
  }, []);

  return (
    <div className="layout-container">
      <SideNavbar />
      <div className="main-container">
        <Navbar />
        <div className="content-container">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;