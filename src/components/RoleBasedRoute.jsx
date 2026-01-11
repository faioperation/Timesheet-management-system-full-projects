import { Navigate, useLocation } from 'react-router-dom';
import { getRoleBasedDashboard } from '../libs/roleUtils';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const token = getCookie('auth_token');
  const userRole = getCookie('user_role');

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route has allowed roles and user role is not in the list, redirect to their dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    const dashboardPath = getRoleBasedDashboard(userRole || 'User');
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

export default RoleBasedRoute;
