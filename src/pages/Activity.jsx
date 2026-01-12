import React, { useState, useEffect, useMemo } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import ReusableTable from '../components/ReusableTable';

// Sample activities data matching the image
const allActivitiesData = [
    {
      id: 1,
      no: '01',
      createdBy: 'Ralph Edwards',
      date: '14 Sep 2025',
      role: 'Admin',
      activities: 'Timesheet approved',
    },
    {
      id: 2,
      no: '02',
      createdBy: 'Kathryn Murphy',
      date: '14 Sep 2025',
      role: 'User',
      activities: 'Timesheet Submit',
    },
    {
      id: 3,
      no: '03',
      createdBy: 'Jacob Jones',
      date: '14 Sep 2025',
      role: 'Supervisor',
      activities: 'Add user',
    },
    {
      id: 4,
      no: '04',
      createdBy: 'Esther Howard',
      date: '14 Sep 2025',
      role: 'Admin',
      activities: 'Timesheet Resubmit',
    },
    {
      id: 5,
      no: '05',
      createdBy: 'Eleanor Pena',
      date: '14 Sep 2025',
      role: 'User',
      activities: 'Create Timesheet',
    },
    {
      id: 6,
      no: '06',
      createdBy: 'Darlene Robertson',
      date: '14 Sep 2025',
      role: 'Supervisor',
      activities: 'Timesheet approved',
    },
    {
      id: 7,
      no: '07',
      createdBy: 'Theresa Webb',
      date: '14 Sep 2025',
      role: 'Admin',
      activities: 'Timesheet Submit',
    },
    {
      id: 8,
      no: '08',
      createdBy: 'Brooklyn Simmons',
      date: '14 Sep 2025',
      role: 'User',
      activities: 'Add user',
    },
    {
      id: 9,
      no: '09',
      createdBy: 'Savannah Nguyen',
      date: '14 Sep 2025',
      role: 'Supervisor',
      activities: 'Timesheet Resubmit',
    },
    {
      id: 10,
      no: '10',
      createdBy: 'Jerome Bell',
      date: '14 Sep 2025',
      role: 'Admin',
      activities: 'Create Timesheet',
    },
    {
      id: 11,
      no: '11',
      createdBy: 'Ralph Edwards',
      date: '14 Sep 2025',
      role: 'User',
      activities: 'Timesheet approved',
    },
    // Add more data to match 25 pages requirement
    ...Array.from({ length: 239 }, (_, index) => ({
      id: 12 + index,
      no: String(12 + index).padStart(2, '0'),
      createdBy: `User ${12 + index}`,
      date: '14 Sep 2025',
      role: ['Admin', 'User', 'Supervisor'][index % 3],
      activities: ['Timesheet approved', 'Timesheet Submit', 'Add user', 'Timesheet Resubmit', 'Create Timesheet'][index % 5],
    })),
];

export default function Activity() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on active filter
  const filteredData = useMemo(() => {
    if (activeFilter === 'All') {
      return allActivitiesData;
    }
    return allActivitiesData.filter(item => item.role === activeFilter);
  }, [activeFilter]);

  useEffect(() => {
    // Reset to first page when filter changes
    setCurrentPage(1);
  }, [activeFilter]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Fetch data for the page here if needed
  };

  const totalPages = Math.ceil(filteredData.length / 10);

  const columns = [
    {
      key: 'no',
      label: 'No',
      className: 'text-left w-[5%]',
    },
    {
      key: 'createdBy',
      label: 'Created by',
      className: 'text-left w-[25%]',
    },
    {
      key: 'date',
      label: 'Date',
      className: 'text-left w-[20%]',
    },
    {
      key: 'role',
      label: 'Role',
      className: 'text-left w-[15%]',
    },
    {
      key: 'activities',
      label: 'Activities',
      className: 'text-left w-[35%]',
    },
  ];

  return (
    <div className="w-full pb-10">
      {/* Top Section with Filter Tabs and Dropdown */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          {['All', 'Admin', 'User', 'Supervisor'].map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`
                px-6 py-2.5 rounded-lg text-sm font-medium transition-colors border-b-2
                ${
                  activeFilter === filter
                    ? 'bg-[#F3F4FF] text-[#5069E5] border-[#5069E5]'
                    : 'bg-white text-gray-600 hover:text-gray-900 border-transparent'
                }
              `}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Activities Dropdown */}
        <div className="relative">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-[#5069E5] transition-colors">
            <span>Activities</span>
            <IoMdArrowDropdown size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <ReusableTable
        key={activeFilter} // Reset pagination when filter changes
        columns={columns}
        data={filteredData}
        itemsPerPage={10}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        headerBgColor="bg-[#E0E7FF]"
        stripedRows={true}
      />
    </div>
  );
}

