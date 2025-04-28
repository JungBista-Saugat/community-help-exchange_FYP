import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const ProtectedRoute = ({ element, allowedRoles = [] }) => {
  // Prioritize sessionStorage token over localStorage token
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    const checkUserAccess = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // First check if we have userData stored in session
        const sessionUserData = sessionStorage.getItem('userData');
        if (sessionUserData) {
          const userData = JSON.parse(sessionUserData);
          const userRole = userData.role;
          const isRoleAllowed = allowedRoles.length === 0 || allowedRoles.includes(userRole);
          setHasAccess(isRoleAllowed);
          setLoading(false);
          return;
        }
        
        // If no cached user data, fetch from API
        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Cache the user data in session storage
        sessionStorage.setItem('userData', JSON.stringify(response.data));
        
        const userRole = response.data.role;
        
        // Check if allowedRoles is empty (any role is allowed) or user role is included
        const isRoleAllowed = allowedRoles.length === 0 || allowedRoles.includes(userRole);
        
        setHasAccess(isRoleAllowed);
        setLoading(false);
      } catch (error) {
        console.error('Error checking user access:', error);
        // Clear tokens if authentication fails
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userData');
        localStorage.removeItem('token');
        setLoading(false);
      }
    };
    
    checkUserAccess();
  }, [token, allowedRoles]);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (!hasAccess && allowedRoles.length > 0) {
    // Redirect to dashboard if user doesn't have the required role
    return <Navigate to="/dashboard" />;
  }

  return element;
};

export default ProtectedRoute;
