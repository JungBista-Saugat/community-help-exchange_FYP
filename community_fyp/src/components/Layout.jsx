import React from 'react';
import Navbar from './Navbar';
import SideNavbar from './SideNavbar';
import '../styles/navbar.css';

const Layout = ({ children }) => {
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