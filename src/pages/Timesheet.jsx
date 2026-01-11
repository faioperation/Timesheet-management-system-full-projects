import React, { useState, useEffect } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import ReusableTable from '../components/ReusableTable';

export default function Timesheet() {
  const [filterPeriod, setFilterPeriod] = useState('Weekly');
  const [showDropdown, setShowDropdown] = useState(false);
  const [timesheetData, setTimesheetData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Sample data - replace with API call
  useEffect(() => {
    // Mock data matching the image
    const mockData = Array.from({ length: 25 }, (_, index) => ({
      id: index + 1,
      no: String(index + 1).padStart(2, '0'),
      client: 'Naresh Vyas',
      period: '15 Sep 2025 to 21 Sep 2025',
      uploadDate: '14 Sep 2025',
      status: 'Approved',
    }));
    setTimesheetData(mockData);
  }, []);

  const filterOptions = ['Weekly', 'Monthly', 'Yearly'];

  const handleFilterChange = (option) => {
    setFilterPeriod(option);
    setShowDropdown(false);
    // Fetch data based on filter here
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Fetch data for the page here
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'no',
      label: 'No',
      className: 'text-left',
    },
    {
      key: 'client',
      label: 'Client',
      className: 'text-left',
    },
    {
      key: 'period',
      label: 'Period',
      className: 'text-left',
    },
    {
      key: 'uploadDate',
      label: 'Upload Date',
      className: 'text-left',
    },
    {
      key: 'status',
      label: 'Status',
      className: 'text-left',
      render: (row) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(row.status)}`}>
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full pb-10">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">My submitted timesheet</h2>
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-[#5069E5] transition-colors cursor-pointer justify-between min-w-[120px]"
          >
            <span>{filterPeriod}</span>
            <IoMdArrowDropdown className="text-gray-500" size={20} />
          </button>
          
          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              ></div>
              <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 min-w-[120px]">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleFilterChange(option)}
                    className={`w-full text-left px-4 py-2 hover:bg-[#E0E7FF] transition-colors ${
                      filterPeriod === option ? 'bg-[#E0E7FF] text-[#5069E5]' : 'text-gray-800'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reusable Table */}
      <ReusableTable
        columns={columns}
        data={timesheetData}
        itemsPerPage={10}
        onPageChange={handlePageChange}
        showPagination={true}
        headerBgColor="bg-[#E0E7FF]"
      />
    </div>
  );
}
