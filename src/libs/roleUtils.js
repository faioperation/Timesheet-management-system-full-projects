
export const getRoleBasedDashboard = (role) => {
  const roleMap = {
    'System Admin': '/dashboard/system-admin',
    'Business Admin': '/dashboard/revenue',
    'Staff': '/dashboard/supervisor',
    'User': '/dashboard/user',
  };

  return roleMap[role] || '/dashboard/revenue'; // Default fallback
};

export const getRoleBasedMenuItems = (role) => {
  // System Admin menu
  if (role === 'System Admin') {
    return [
      { Title: 'home', pathname: '/dashboard/system-admin', iconKey: 'home' },
      {
        Title: 'company',
        pathname: '/dashboard/company',
        iconKey: 'company',
        subItems: [
          { Title: 'Add Company', pathname: '/company/add' },
          { Title: 'Company List', pathname: '/dashboard/company' },
        ]
      },
    ];
  }

  // Business Admin menu
  if (role === 'Business Admin') {
    return [
      {
        Title: 'dashboard',
        pathname: '/dashboard/revenue',
        iconKey: 'dashboard',
        subItems: [
          { Title: 'Revenue Dashboard', pathname: '/dashboard/revenue' },
          { Title: 'Consultant Dashboard', pathname: '/dashboard/consultant' },
          { Title: 'Hours Dashboard', pathname: '/dashboard/hours' },
        ]
      },
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
