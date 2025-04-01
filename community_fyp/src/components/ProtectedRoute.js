import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }

  return element;
};

export default ProtectedRoute;
