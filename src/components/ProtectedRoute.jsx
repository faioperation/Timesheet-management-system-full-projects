import { Navigate, useLocation } from 'react-router-dom';
import { getRoleBasedDashboard } from '../libs/roleUtils';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const token = getCookie('auth_token');
  const publicPaths = ['/login', '/signup', '/forgot-password', '/send-otp', '/change-password', '/verify-otp'];
  const isPublicPath = publicPaths.includes(location.pathname);

  // If user is on a public path and has a token, redirect to their dashboard
  if (isPublicPath && token) {
    const userRole = getCookie('user_role');
    const dashboardPath = getRoleBasedDashboard(userRole || 'User');
    return <Navigate to={dashboardPath} replace />;
  }

  // If user is on a protected path and has no token, redirect to login
  // Token refresh will be handled automatically by apiFetch when making API calls
  if (!isPublicPath && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // All protected routes should render children if token exists
  return children;
};

export default ProtectedRoute;
