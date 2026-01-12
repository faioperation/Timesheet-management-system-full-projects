import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import SignUp from "../pages/auth/SignUp";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyOTP from "../pages/auth/VerifyOTP";
import ChangePassword from "../pages/auth/ChangePassword";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../layout/DashboardLayout";
import SettingsLayout from "../layout/SettingsLayout";
import RoleBasedRoute from "../components/RoleBasedRoute";
import Profile from "../pages/settings/Profile";
import Template from "../pages/settings/Template";
import Company from "../pages/settings/Company";
import RolePermission from "../pages/settings/RolePermission";
import Subscription from "../pages/settings/Subscription";
import Timesheet from "../pages/Timesheet";
import UserDashboard from "../pages/dashboard/UserDashboard";
import BusinessAdminDashboard from "../pages/dashboard/BusinessAdminDashboard";
import SupervisorDashboard from "../pages/dashboard/SupervisorDashboard";
import CreateTimesheet from "../pages/timesheet/CreateTimesheet";
import Activity from "../pages/Activity";
import Scheduler from "../pages/Scheduler";
import UserList from "../pages/UserList";
import AddUser from "../pages/AddUser";
import AssignClientDetails from "../pages/AssignClientDetails";

// Helper function to redirect based on role
function HomeRedirect() {
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const getRoleBasedDashboard = (role) => {
    const roleMap = {
      'System Admin': '/dashboard/system-admin',
      'Business Admin': '/dashboard/business-admin',
      'supervisor': '/dashboard/supervisor',
      'Staff': '/dashboard/supervisor', // Staff (from backend) and supervisor are the same role
      'staff': '/dashboard/supervisor', // lowercase staff (if any)
      'User': '/dashboard/user',
    };
    return roleMap[role] || '/dashboard/business-admin';
  };

  const userRole = getCookie('user_role');
  const token = getCookie('auth_token');
  
  if (token && userRole) {
    const dashboardPath = getRoleBasedDashboard(userRole);
    return <Navigate to={dashboardPath} replace />;
  }
  
  return <Navigate to="/login" replace />;
}

const router = createBrowserRouter([
  // Public routes - No layout
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/verify-otp',
    element: <VerifyOTP />,
  },
  {
    path: '/change-password',
    element: <ChangePassword />,
  },
  // Protected routes with Dashboard Layout
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      // Root path - redirect based on role
      {
        index: true,
        element: <HomeRedirect />,
      },
      // Dashboard routes - Role based
      {
        path: 'dashboard/system-admin',
        element: (
          <RoleBasedRoute allowedRoles={['System Admin']}>
            <div>System Admin Dashboard</div>
          </RoleBasedRoute>
        ),
      },
      {
        path: 'dashboard/business-admin',
        element: (
          <RoleBasedRoute allowedRoles={['Business Admin']}>
            <BusinessAdminDashboard />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'dashboard/supervisor',
        element: (
          <RoleBasedRoute allowedRoles={['supervisor', 'Staff', 'staff']}>
            <SupervisorDashboard />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'dashboard/user',
        element: (
          <RoleBasedRoute allowedRoles={['User']}>
            <UserDashboard />
          </RoleBasedRoute>
        ),
      },
      // System Admin Company routes
      {
        path: 'dashboard/system-admin/company/*',
        element: (
          <RoleBasedRoute allowedRoles={['System Admin']}>
            <div>Company Management (To be implemented)</div>
          </RoleBasedRoute>
        ),
      },
      // User list route (for Business Admin and Supervisor)
      {
        path: 'user/userlist',
        element: (
          <RoleBasedRoute allowedRoles={['Business Admin', 'supervisor', 'Staff', 'staff']}>
            <UserList />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'user/add',
        element: (
          <RoleBasedRoute allowedRoles={['Business Admin', 'supervisor', 'Staff', 'staff']}>
            <AddUser />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'user/assign-client-details',
        element: (
          <RoleBasedRoute allowedRoles={['Business Admin', 'supervisor', 'Staff', 'staff']}>
            <AssignClientDetails />
          </RoleBasedRoute>
        ),
      },
      // Other routes - Available to all authenticated users based on role
      {
        path: 'timesheet',
        element: <Timesheet />,
      },
      {
        path: 'timesheet/create',
        element: <CreateTimesheet />,
      },
      {
        path: 'scheduler',
        element: (
          <RoleBasedRoute allowedRoles={['Business Admin', 'supervisor', 'Staff', 'staff']}>
            <Scheduler />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'activity',
        element: (
          <RoleBasedRoute allowedRoles={['Business Admin', 'supervisor', 'Staff', 'staff']}>
            <Activity />
          </RoleBasedRoute>
        ),
      },
      // Settings routes with SettingsLayout
      {
        path: 'settings',
        element: <SettingsLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/settings/profile" replace />,
          },
          {
            path: 'profile',
            element: <Profile />,
          },
          {
            path: 'company',
            element: <Company />,
          },
          {
            path: 'role-permission',
            element: <RolePermission />,
          },
          {
            path: 'subscription',
            element: <Subscription />,
          },
          {
            path: 'template',
            element: (
              <RoleBasedRoute allowedRoles={['supervisor', 'Staff', 'staff', 'Business Admin', 'System Admin']}>
                <Template />
              </RoleBasedRoute>
            ),
          },
          {
            path: '*',
            element: <Navigate to="/settings/profile" replace />,
          },
        ],
      },
    ],
  },
]);

export default router;
