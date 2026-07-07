import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { apiFetch } from '../libs/apiFetch';

const SettingsLayout = () => {
  const location = useLocation();

  // Get user role from cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const userRole = getCookie('user_role');
  const [permissions, setPermissions] = React.useState(null);

  React.useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await apiFetch('/profile', { method: 'GET' });
        const result = await response.json();
        if (result.success && result.data && result.data.business) {
          setPermissions(result.data.business.permission);
        }
      } catch (error) {
        console.error("Error fetching permissions for settings layout:", error);
      }
    };
    fetchPermissions();
  }, []);

  // Define tabs based on role
    const getTabs = () => {
    let baseTabs = [];
    if (userRole === 'supervisor' || userRole === 'Staff' || userRole === 'staff') {
      // Supervisor/Staff: Only Profile and Template
      baseTabs = [
        { name: 'Profile', path: '/settings/profile' },
        { name: 'Template', path: '/settings/template' },
        { name: 'Security', path: '/settings/change-password' },
      ];
    } else if (userRole === 'Business Admin') {
      // Business Admin: All tabs except holiday
      baseTabs = [
        { name: 'Profile', path: '/settings/profile' },
        { name: 'Company', path: '/settings/company' },
        { name: 'Role permission', path: '/settings/role-permission' },
        { name: 'Template', path: '/settings/template' },
        // { name: 'Subscription', path: '/settings/subscription' },
        { name: 'Security', path: '/settings/change-password' },
      ];
    } else if (userRole === 'System Admin') {
      // System Admin: Only Profile and Security
      baseTabs = [
        { name: 'Profile', path: '/settings/profile' },
        { name: 'Security', path: '/settings/change-password' },
      ];
    } else {
      // Default/User: Profile, Weekend, and Security
      baseTabs = [
        { name: 'Profile', path: '/settings/profile' },
        { name: 'Weekend', path: '/settings/weekend' },
        { name: 'Security', path: '/settings/change-password' },
      ];
    }

    if (permissions) {
        return baseTabs.filter(tab => {
            if (tab.name === 'Template' && permissions.template_can_add === 0) return false;
            return true;
        });
    }
    return baseTabs;
  };

  const tabs = getTabs();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="w-full pb-10">
      {/* Settings Tabs Navigation - Matching Image Design */}
      <div className="rounded-lg mb-6">
        <nav className="flex space-x-0">
          {tabs.map((tab, index) => {
            const active = isActive(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`
                  px-6 py-4 text-sm font-medium transition-colors border-b-2
                  ${
                    active
                      ? 'border-[#5069E5] text-[#5069E5] bg-[#F3F4FF]'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }
                  ${index === 0 ? 'rounded-tl-lg' : ''}
                  ${index === tabs.length - 1 ? 'rounded-tr-lg' : ''}
                `}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Settings Content */}
      <Outlet />
    </div>
  );
};

export default SettingsLayout;
