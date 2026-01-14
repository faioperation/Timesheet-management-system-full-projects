// Role utility functions for routing and menu management

/**
 * Get the dashboard path based on user role
 */
export const getRoleBasedDashboard = (role) => {
  const roleMap = {
    'System Admin': '/dashboard/system-admin',
    'Business Admin': '/dashboard/business-admin',
    'supervisor': '/dashboard/supervisor',
    'Staff': '/dashboard/supervisor', // Staff (from backend) and supervisor are the same role
    'staff': '/dashboard/supervisor', // lowercase staff (if any)
    'User': '/dashboard/user',
  };

  return roleMap[role] || '/dashboard/business-admin'; // Default fallback
};

/**
 * Get menu items based on user role
 */
export const getRoleBasedMenuItems = (role) => {
  // System Admin menu
  if (role === 'System Admin') {
    return [
      { Title: 'home', pathname: '/dashboard/system-admin', iconKey: 'home' },
      { 
        Title: 'company', 
        pathname: '/dashboard/system-admin/company', 
        iconKey: 'company',
        subItems: [
          { Title: 'Add Company', pathname: '/dashboard/system-admin/company/add' },
          { Title: 'Company List', pathname: '/dashboard/system-admin/company/list' },
        ]
      },
    ];
  }

  // Business Admin menu
  if (role === 'Business Admin') {
    return [
      { Title: 'dashboard', pathname: '/dashboard/business-admin', iconKey: 'dashboard' },
      { Title: 'users', pathname: '/user/userlist', iconKey: 'users' },
      { Title: 'timesheet', pathname: '/timesheet', iconKey: 'timesheet' },
      { Title: 'scheduler', pathname: '/scheduler', iconKey: 'scheduler' },
      { Title: 'activity', pathname: '/activity', iconKey: 'activity' },
      { Title: 'settings', pathname: '/settings/profile', iconKey: 'settings' },
    ];
  }

  // Supervisor/Staff menu (Staff from backend and supervisor are the same role)
  if (role === 'supervisor' || role === 'Staff') {
    return [
      { Title: 'dashboard', pathname: '/dashboard/supervisor', iconKey: 'dashboard' },
      { Title: 'users', pathname: '/user/userlist', iconKey: 'users' },
      { Title: 'timesheet', pathname: '/timesheet', iconKey: 'timesheet' },
      { Title: 'scheduler', pathname: '/scheduler', iconKey: 'scheduler' },
      { Title: 'activity', pathname: '/activity', iconKey: 'activity' },
      { Title: 'settings', pathname: '/settings/profile', iconKey: 'settings' },
    ];
  }

  // User menu (default)
  return [
    { Title: 'dashboard', pathname: '/dashboard/user', iconKey: 'dashboard' },
    { Title: 'timesheet', pathname: '/timesheet', iconKey: 'timesheet' },
    { Title: 'settings', pathname: '/settings/profile', iconKey: 'settings' },
  ];
};
