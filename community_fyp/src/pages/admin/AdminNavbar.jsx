import React from 'react';
import { Link, useNavigate } from 'react-router-dom';


const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      <div className="flex gap-4">
        <Link to="/admin/volunteer-opportunities" className="text-white hover:text-yellow-300">
          Manage Posts
        </Link>
        <Link to="/admin/create-post" className="text-white hover:text-yellow-300">
          Create Post
        </Link>
        <Link to="/admin/applications" className="text-white hover:text-yellow-300">
          Applications
        </Link>
      </div>
      <button onClick={handleLogout} className="text-white hover:text-red-400">
        Logout
      </button>
    </nav>
  );
};

export default AdminNavbar;