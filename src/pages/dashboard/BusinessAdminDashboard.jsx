import React from 'react';

export default function BusinessAdminDashboard() {
  return (
    <div className="w-full pb-10">
      <h2 className="text-2xl font-bold text-black mb-6">Business Admin Dashboard</h2>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-700">This is the Business Admin Dashboard. Content specific to business admin role will be displayed here.</p>
        {/* Add business admin-specific content here */}
      </div>
    </div>
  );
}

