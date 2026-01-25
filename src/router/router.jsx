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
import ChangePasswordPage from "../pages/settings/ChangePassword";
import TimesheetRoute from "../pages/TimesheetRoute";
import Scheduler from "../pages/Scheduler";
import TimesheetReport from "../pages/TimesheetReport";
import UserDashboard from "../pages/dashboard/UserDashboard";
import BusinessAdminDashboard from "../pages/dashboard/BusinessAdminDashboard";
import SupervisorDashboard from "../pages/dashboard/SupervisorDashboard";
import CreateTimesheet from "../pages/timesheet/CreateTimesheet";
import Activity from "../pages/Activity";
import UserList from "../pages/UserList";
import AddUser from "../pages/AddUser";
import AddInternalUser from "../pages/AddInternalUser";
import AssignClientDetails from "../pages/AssignClientDetails";
import UserProfileView from "../pages/UserProfileView";
import SystemAdminDashboard from "../pages/dashboard/SystemAdminDashboard";
import AddCompany from "../pages/dashboard/AddCompany";
import CompanyList from "../pages/dashboard/CompanyList";
import CompanyView from "../pages/dashboard/CompanyView";
import RevenueDashboard from "../pages/dashboard/RevenueDashboard";
import ConsultantDashboard from "../pages/dashboard/ConsultantDashboard";
import HoursDashboard from "../pages/dashboard/HoursDashboard";

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
      'Business Admin': '/dashboard/revenue',
      'Staff': '/dashboard/supervisor',
      'User': '/dashboard/user',
    };
    return roleMap[role] || '/dashboard/revenue';
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
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [

      {
        index: true,
        element: <HomeRedirect />,
      },

      {
        path: 'dashboard/system-admin',
        element: (
          <RoleBasedRoute allowedRoles={['System Admin']}>
            <SystemAdminDashboard />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'dashboard/business-admin',
        element: <Navigate to="/dashboard/revenue" replace />,
      },
      {
        path: 'dashboard/revenue',
        element: (
          <RoleBasedRoute allowedRoles={['Business Admin']}>
            <RevenueDashboard />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'dashboard/consultant',
        element: (
          <RoleBasedRoute allowedRoles={['Business Admin']}>
            <ConsultantDashboard />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'dashboard/hours',
        element: (
          <RoleBasedRoute allowedRoles={['Business Admin']}>
            <HoursDashboard />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'dashboard/supervisor',
        element: (
          <RoleBasedRoute allowedRoles={['Staff']}>
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
      {
        path: 'company/add',
        element: (
          <RoleBasedRoute allowedRoles={['System Admin']}>
            <AddCompany />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'dashboard/company',
        element: (
          <RoleBasedRoute allowedRoles={['System Admin']}>
            <CompanyList />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'dashboard/company/view/:id',
        element: (
          <RoleBasedRoute allowedRoles={['System Admin']}>
            <CompanyView />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'user/userlist',
        element: (
          <RoleBasedRoute allowedRoles={['Business Admin', 'Staff']}>
            <UserList />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'user/view/:userName',
        element: (
          <RoleBasedRoute allowedRoles={['Business Admin', 'Staff']}>
            <UserProfileView />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'user/add',
        element: (
          <RoleBasedRoute allowedRoles={['Business Admin', 'Staff']}>
            <AddUser />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'user/add-internal',
        element: (
          <RoleBasedRoute allowedRoles={['Business Admin', 'Staff']}>
            <AddInternalUser />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'user/assign-client-details',
        element: (
          <RoleBasedRoute allowedRoles={['Business Admin', 'Staff']}>
            <AssignClientDetails />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'timesheet',
        element: <TimesheetRoute />,
      },
      {
        path: 'scheduler',
        element: (
          <RoleBasedRoute allowedRoles={['Business Admin', 'Staff']}>
            <Scheduler />
          </RoleBasedRoute>
        ),
      },
      {
        path: 'timesheet/report/:timesheetId',
        element: <TimesheetReport />,
      },
      {
        path: 'timesheet/create',
        element: <CreateTimesheet />,
      },
      {
        path: 'activity',
        element: (
          <RoleBasedRoute allowedRoles={['Business Admin']}>
            <Activity />
          </RoleBasedRoute>
        ),
      },
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
/*
          {
            path: 'subscription',
            element: <Subscription />,
          },
*/
          {
            path: 'template',
            element: (
              <RoleBasedRoute allowedRoles={['Staff', 'Business Admin', 'User']}>
                <Template />
              </RoleBasedRoute>
            ),
          },
          {
            path: 'change-password',
            element: <ChangePasswordPage />,
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
