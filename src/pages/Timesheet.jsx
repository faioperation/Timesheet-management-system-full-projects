import React, { useState, useMemo, useEffect } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { FaEye } from 'react-icons/fa';
import ReusableTable from '../components/ReusableTable';

export default function Timesheet() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [filterPeriod, setFilterPeriod] = useState('Weekly');
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);

  // Sample data matching the image
  const allTimesheetData = [
    {
      id: 1,
      createdBy: 'Savannah Nguyen',
      client: 'Naresh Vyas',
      period: '15 Sep 2025 to 21 Sep 2025',
      uploadDate: '14 Sep 2025',
      status: 'Approved',
    },
    {
      id: 2,
      createdBy: 'Jane Cooper',
      client: 'Naresh Vyas',
      period: '15 Sep 2025 to 21 Sep 2025',
      uploadDate: '14 Sep 2025',
      status: 'Rejected',
    },
    {
      id: 3,
      createdBy: 'Darlene Robertson',
      client: 'Naresh Vyas',
      period: '15 Sep 2025 to 21 Sep 2025',
      uploadDate: '14 Sep 2025',
      status: 'Pending',
    },
    {
      id: 4,
      createdBy: 'Eleanor Pena',
      client: 'Naresh Vyas',
      period: '15 Sep 2025 to 21 Sep 2025',
      uploadDate: '14 Sep 2025',
      status: 'Approved',
    },
    {
      id: 5,
      createdBy: 'Jerome Bell',
      client: 'Naresh Vyas',
      period: '15 Sep 2025 to 21 Sep 2025',
      uploadDate: '14 Sep 2025',
      status: 'Approved',
    },
    {
      id: 6,
      createdBy: 'Jacob Jones',
      client: 'Naresh Vyas',
      period: '15 Sep 2025 to 21 Sep 2025',
      uploadDate: '14 Sep 2025',
      status: 'Created',
    },
    {
      id: 7,
      createdBy: 'Theresa Webb',
      client: 'Naresh Vyas',
      period: '15 Sep 2025 to 21 Sep 2025',
      uploadDate: '14 Sep 2025',
      status: 'Rejected',
    },
    {
      id: 8,
      createdBy: 'Jenny Wilson',
      client: 'Naresh Vyas',
      period: '15 Sep 2025 to 21 Sep 2025',
      uploadDate: '14 Sep 2025',
      status: 'Rejected',
    },
    {
      id: 9,
      createdBy: 'Wade Warren',
      client: 'Naresh Vyas',
      period: '15 Sep 2025 to 21 Sep 2025',
      uploadDate: '14 Sep 2025',
      status: 'Rejected',
    },
    {
      id: 10,
      createdBy: 'Guy Hawkins',
      client: 'Naresh Vyas',
      period: '15 Sep 2025 to 21 Sep 2025',
      uploadDate: '14 Sep 2025',
      status: 'Pending',
    },
    // Add more data for pagination
    ...Array.from({ length: 240 }, (_, index) => ({
      id: 11 + index,
      createdBy: `User ${11 + index}`,
      client: 'Naresh Vyas',
      period: '15 Sep 2025 to 21 Sep 2025',
      uploadDate: '14 Sep 2025',
      status: ['Approved', 'Rejected', 'Pending', 'Created'][index % 4],
    })),
  ];

  // Filter data based on active filter
  const filteredData = useMemo(() => {
    if (activeFilter === 'All') {
      return allTimesheetData;
    }
    return allTimesheetData.filter(item => item.status === activeFilter);
  }, [activeFilter]);

  useEffect(() => {
    // Reset to first page when filter changes
    setCurrentPage(1);
  }, [activeFilter]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handlePeriodChange = (period) => {
    setFilterPeriod(period);
    setShowDropdown(false);
    // Fetch data based on period here
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Fetch data for the page here if needed
  };

  const handleView = (row) => {
    setSelectedTimesheet(row);
  };

  const handleCloseModal = () => {
    setSelectedTimesheet(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Created':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const columns = [
    {
      key: 'createdBy',
      label: 'Created by',
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
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 inline-flex items-center rounded-full text-xs font-medium border ${getStatusBadgeClass(row.status)}`}>
            {row.status}
          </span>
          <IoMdArrowDropdown className="text-gray-400 cursor-pointer" size={14} />
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      className: 'text-left',
      render: (row) => (
        <button
          onClick={() => handleView(row)}
          className="flex items-center gap-1 text-[#5069E5] hover:text-[#3d52c7] font-medium transition-colors"
        >
          <FaEye size={14} />
          <span>View</span>
        </button>
      ),
    },
  ];

  const filterOptions = ['Weekly', 'Monthly', 'Yearly'];

  return (
    <div className="w-full pb-10">
      {/* Top Section with Filter Tabs and Dropdown */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          {['All', 'Pending', 'Approved', 'Rejected'].map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`
                px-6 py-2.5 rounded-lg text-sm font-medium transition-colors border-b-2
                ${
                  activeFilter === filter
                    ? 'bg-[#E0E7FF] text-[#5069E5] border-[#5069E5]'
                    : 'bg-white text-gray-600 hover:text-gray-900 border-transparent'
                }
              `}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Weekly Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-[#5069E5] transition-colors cursor-pointer justify-between min-w-[120px]"
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
                    onClick={() => handlePeriodChange(option)}
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

      {/* Table */}
      <ReusableTable
        key={activeFilter} // Reset pagination when filter changes
        columns={columns}
        data={filteredData}
        itemsPerPage={10}
        onPageChange={handlePageChange}
        headerBgColor="bg-[#E0E7FF]"
        stripedRows={true}
      />

      {selectedTimesheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Timesheet Details</h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Created by</p>
                <p className="text-gray-800 font-medium">{selectedTimesheet.createdBy}</p>
              </div>
              <div>
                <p className="text-gray-500">Client</p>
                <p className="text-gray-800 font-medium">{selectedTimesheet.client}</p>
              </div>
              <div>
                <p className="text-gray-500">Period</p>
                <p className="text-gray-800 font-medium">{selectedTimesheet.period}</p>
              </div>
              <div>
                <p className="text-gray-500">Upload Date</p>
                <p className="text-gray-800 font-medium">{selectedTimesheet.uploadDate}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="text-gray-800 font-medium">{selectedTimesheet.status}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-lg bg-[#5069E5] text-white hover:bg-[#3d52c7] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
