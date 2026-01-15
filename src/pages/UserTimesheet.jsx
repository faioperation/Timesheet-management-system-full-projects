import React, { useState, useMemo, useEffect } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import ReusableTable from '../components/ReusableTable';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../libs/apiFetch';
import { toast } from 'react-toastify';

export default function UserTimesheet() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [filterPeriod, setFilterPeriod] = useState('Weekly');
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [timesheets, setTimesheets] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatStatus = (status) => {
    if (!status) return 'Pending';
    const value = status.toString().toLowerCase();
    if (value === 'reject') return 'Rejected';
    if (value === 'submitted') return 'Pending';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const normalizeTimesheet = (item) => {
    const clientName =
      item.client?.name ||
      item.client_name ||
      item.client ||
      item.party?.name ||
      '-';
    const start = item.start_date || item.startDate;
    const end = item.end_date || item.endDate;
    const period =
      item.period ||
      (start && end ? `${formatDate(start)} to ${formatDate(end)}` : '-');
    const uploadDate = formatDate(item.upload_date || item.created_at || item.uploadDate);
    const status = formatStatus(item.status || item.approval_status || item.state);
    const userId = item.user_id || item.created_by || item.user?.id || null;

    return {
      id: item.id || `${clientName}-${period}-${uploadDate}`,
      client: clientName,
      period,
      uploadDate,
      status,
      userId,
    };
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiFetch('/profile', { method: 'GET' });
        if (!response.ok) return;
        const result = await response.json();
        if (result.success && result.data && result.data.id) {
          setCurrentUserId(result.data.id);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchTimesheets = async () => {
      setIsFetching(true);
      try {
        const response = await apiFetch('/timesheet', { method: 'GET' });
        if (!response.ok) {
          throw new Error('Failed to fetch timesheets');
        }

        const result = await response.json();
        const list = Array.isArray(result.data?.data)
          ? result.data.data
          : Array.isArray(result.data)
          ? result.data
          : [];

        const mapped = list.map(normalizeTimesheet);
        setTimesheets(mapped);
      } catch (error) {
        console.error('Error fetching timesheets:', error);
        toast.error(error.message || 'Failed to load timesheets');
        setTimesheets([]);
      } finally {
        setIsFetching(false);
      }
    };

    fetchTimesheets();
  }, []);

  // Filter data based on active filter and current user
  const filteredData = useMemo(() => {
    let data = timesheets;

    if (currentUserId) {
      data = data.filter((item) => item.userId === currentUserId);
    }

    if (activeFilter !== 'All') {
      data = data.filter(item => item.status === activeFilter);
    }

    return data.map((item, index) => ({
      ...item,
      no: String(index + 1).padStart(2, '0'),
    }));
  }, [activeFilter, timesheets, currentUserId]);

  useEffect(() => {
    // Reset to first page when filter changes
    setCurrentPage(1);
  }, [activeFilter]);

  const handlePeriodChange = (period) => {
    setFilterPeriod(period);
    setShowDropdown(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
      key: 'no',
      label: 'No',
      className: 'text-left w-[6%]',
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
        <span className={`px-3 py-1 inline-flex items-center rounded-full text-xs font-medium border ${getStatusBadgeClass(row.status)}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      className: 'text-left',
      render: (row) => (
        <button
          type="button"
          onClick={() =>
            navigate(`/timesheet/report/${row.id}`, { state: { period: row.period } })
          }
          className="text-[#5069E5] hover:text-[#3d52c7] font-medium transition-colors"
        >
          View report
        </button>
      ),
    },
  ];

  const filterOptions = ['Weekly', 'Monthly', 'Yearly'];

  return (
    <div className="w-full pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-lg font-bold text-gray-700">My submitted timesheet</h3>

        {/* Weekly/Monthly/Yearly Dropdown */}
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
      {isFetching ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading timesheets...</div>
          </div>
        </div>
      ) : (
        <ReusableTable
          key={activeFilter} // Reset pagination when filter changes
          columns={columns}
          data={filteredData}
          itemsPerPage={10}
          onPageChange={handlePageChange}
          headerBgColor="bg-[#E0E7FF]"
          stripedRows={true}
        />
      )}
    </div>
  );
}

