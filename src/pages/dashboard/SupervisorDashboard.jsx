import React from 'react';

export default function SupervisorDashboard() {
  return (
    <div className="w-full pb-10">
      <h2 className="text-2xl font-bold text-black mb-6">Supervisor Dashboard</h2>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-700">This is the Supervisor Dashboard. Content specific to supervisor role will be displayed here.</p>
        {/* Add supervisor-specific content here */}
      </div>
    </div>
  );
}

