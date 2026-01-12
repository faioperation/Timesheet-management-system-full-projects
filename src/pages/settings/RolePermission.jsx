import React, { useState } from 'react';

export default function RolePermission() {
  const [activeRole, setActiveRole] = useState('Supervisor');
  const [permissions, setPermissions] = useState({
    Supervisor: {
      Timesheet: { add: true, view: true, update: true, delete: false },
      'Schedular': { add: false, view: true, update: false, delete: false },
      'General mail': { add: true, view: true, update: true, delete: false },
      'Schedular2': { add: true, view: false, update: true, delete: false },
      'Supervisor activity': { add: true, view: true, update: true, delete: false },
      'User activity': { add: true, view: true, update: true, delete: false },
      'User': { add: true, view: true, update: true, delete: false },
      'Internal user': { add: true, view: true, update: true, delete: false },
      'Customer assign to user': { add: true, view: true, update: true, delete: false },
      'Client': { add: true, view: true, update: true, delete: false },
      'Vendor': { add: true, view: true, update: true, delete: false },
      'Employee': { add: true, view: true, update: true, delete: false },
      'Template': { add: true, view: true, update: true, delete: false },
    },
    User: {
      Timesheet: { add: false, view: false, update: false, delete: false },
      'Schedular': { add: false, view: false, update: false, delete: false },
      'General mail': { add: false, view: false, update: false, delete: false },
      'Schedular2': { add: false, view: false, update: false, delete: false },
      'Supervisor activity': { add: false, view: false, update: false, delete: false },
      'User activity': { add: false, view: false, update: false, delete: false },
      'User': { add: false, view: false, update: false, delete: false },
      'Internal user': { add: false, view: false, update: false, delete: false },
      'Customer assign to user': { add: false, view: false, update: false, delete: false },
      'Client': { add: false, view: false, update: false, delete: false },
      'Vendor': { add: false, view: false, update: false, delete: false },
      'Employee': { add: false, view: false, update: false, delete: false },
      'Template': { add: false, view: false, update: false, delete: false },
    },
  });

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
          ...prev[activeRole][feature],
          [action]: !prev[activeRole][feature][action],
        },
      },
    }));
  };


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
                const featurePermissions = permissions[activeRole][feature.key];
                
                return (
                  <tr key={`${feature.key}-${index}`} className={index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {feature.name}
                    </td>
                    {actions.map((action) => {
                      const isEnabled = featurePermissions?.[action.key] || false;
                      return (
                        <td key={action.key} className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => handleToggle(feature.key, action.key)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5069E5] focus:ring-offset-2 ${
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

