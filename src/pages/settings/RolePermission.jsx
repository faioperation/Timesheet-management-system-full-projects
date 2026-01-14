import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../libs/apiFetch';
import { toast } from 'react-toastify';

const features = [
  { name: 'Timesheet', key: 'Timesheet' },
  { name: 'Schedular', key: 'Schedular' },
  { name: 'General mail', key: 'General mail' },
  { name: 'Schedular', key: 'Schedular2' },
  { name: 'Supervisor activity', key: 'Supervisor activity' },
  { name: 'User activity', key: 'User activity' },
  { name: 'User', key: 'User' },
  { name: 'Internal user', key: 'Internal user' },
  { name: 'Customer assign to user', key: 'Customer assign to user' },
  { name: 'Client', key: 'Client' },
  { name: 'Vendor', key: 'Vendor' },
  { name: 'Employee', key: 'Employee' },
  { name: 'Template', key: 'Template' },
];

export default function RolePermission() {
  const [activeRole, setActiveRole] = useState('Supervisor');
  const [permissions, setPermissions] = useState({
    Supervisor: {},
    User: {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Map API permission names to feature and action
  const mapPermissionToFeature = (permissionName) => {
    const permissionMap = {
      // Timesheet permissions
      'create_timesheet': { feature: 'Timesheet', action: 'add' },
      'view_timesheet': { feature: 'Timesheet', action: 'view' },
      'update_timesheet': { feature: 'Timesheet', action: 'update' },
      'submit_timesheet': { feature: 'Timesheet', action: 'view' }, // submit maps to view
      
      // User permissions
      'view_user': { feature: 'User', action: 'view' },
      'create_user_details': { feature: 'User', action: 'add' },
      'view_user_details': { feature: 'User', action: 'view' },
      'update_user_details': { feature: 'User', action: 'update' },
      'delete_user_details': { feature: 'User', action: 'delete' },
      
      // Party/Client/Vendor/Employee permissions
      'view_party': { feature: 'Client', action: 'view' }, // Assuming party includes client/vendor/employee
      
      // Project permissions
      'view_project': { feature: 'Template', action: 'view' }, // Mapping to closest match
      
      // Reports permissions
      'view_reports': { feature: 'User activity', action: 'view' }, // Mapping to closest match
    };

    return permissionMap[permissionName] || null;
  };

  // Fetch permissions from API
  const fetchPermissions = useCallback(async (role) => {
    setIsFetching(true);
    try {
      const endpoint = role === 'Supervisor' ? '/supervisor-permissions' : '/user-permissions';
      const response = await apiFetch(endpoint, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Initialize all features with false permissions
        const initialPermissions = {};
        features.forEach(feature => {
          initialPermissions[feature.key] = {
            add: false,
            view: false,
            update: false,
            delete: false,
          };
        });

        // Map API permissions to UI format
        result.data.forEach(permission => {
          const mapped = mapPermissionToFeature(permission.name);
          if (mapped) {
            if (!initialPermissions[mapped.feature]) {
              initialPermissions[mapped.feature] = {
                add: false,
                view: false,
                update: false,
                delete: false,
              };
            }
            initialPermissions[mapped.feature][mapped.action] = true;
          }
        });

        setPermissions(prev => ({
          ...prev,
          [role]: initialPermissions,
        }));
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Failed to load permissions');
    } finally {
      setIsFetching(false);
    }
  }, []);

  // Fetch permissions when component mounts or role changes
  useEffect(() => {
    fetchPermissions(activeRole);
  }, [activeRole, fetchPermissions]);

  const actions = [
    { key: 'add', label: 'Add' },
    { key: 'view', label: 'view' },
    { key: 'update', label: 'Update' },
    { key: 'delete', label: 'Delete' },
  ];

  const handleToggle = (feature, action) => {
    setPermissions(prev => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [feature]: {
          ...prev[activeRole][feature] || { add: false, view: false, update: false, delete: false },
          [action]: !(prev[activeRole][feature]?.[action] || false),
        },
      },
    }));
  };


  if (isFetching) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-black mb-6">Role Permission</h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading permissions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-black mb-6">Role Permission</h2>

      {/* Role Selection Tabs */}
      <div className="flex gap-2 mb-6">
        {['Supervisor', 'User'].map((role) => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeRole === role
                ? 'bg-[#5069E5] text-white'
                : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-300'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Permission Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  Feature
                </th>
                {actions.map((action) => (
                  <th
                    key={action.key}
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {action.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {features.map((feature, index) => {
                const featurePermissions = permissions[activeRole]?.[feature.key] || {
                  add: false,
                  view: false,
                  update: false,
                  delete: false,
                };
                
                return (
                  <tr key={`${feature.key}-${index}`} className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {feature.name}
                    </td>
                    {actions.map((action) => {
                      const isEnabled = featurePermissions[action.key] || false;
                      return (
                        <td key={action.key} className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => handleToggle(feature.key, action.key)}
                            disabled={isLoading}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5069E5] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                              isEnabled ? 'bg-[#5069E5]' : 'bg-gray-300'
                            }`}
                            role="switch"
                            aria-checked={isEnabled}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isEnabled ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

