import React, { useState, useMemo, useEffect } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { FaEye, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ReusableTable from '../components/ReusableTable';
import { apiFetch } from '../libs/apiFetch';
import { toast } from 'react-toastify';

export default function Timesheet() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [filterPeriod, setFilterPeriod] = useState('Weekly');
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [selectedTimesheetDetails, setSelectedTimesheetDetails] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [timesheets, setTimesheets] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [userRole, setUserRole] = useState('');

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

  const handleStatusChange = async (row, nextStatus) => {
    const statusValue = nextStatus.toLowerCase();
    setUpdatingStatusId(row.id);
    try {
      const response = await apiFetch(`/timesheet/${row.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: statusValue }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        const message = result.message || result.error || 'Failed to update status';
        throw new Error(message);
      }
      setTimesheets((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, status: formatStatus(statusValue) } : item
        )
      );
      toast.success('Status updated');
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const normalizeTimesheet = (item) => {
    const clientName =
      item.client?.name ||
      item.client_name ||
      item.client ||
      item.party?.name ||
      '-';
    const createdBy =
      item.user?.name ||
      item.created_by_name ||
      item.createdBy ||
      '-';
    const start = item.start_date || item.startDate;
    const end = item.end_date || item.endDate;
    const period =
      item.period ||
      (start && end ? `${formatDate(start)} to ${formatDate(end)}` : '-');
    const uploadDate = formatDate(item.upload_date || item.created_at || item.uploadDate);
    const status = formatStatus(item.status || item.approval_status || item.state);

    return {
      id: item.id || `${clientName}-${period}-${uploadDate}`,
      createdBy,
      client: clientName,
      period,
      uploadDate,
      status,
      subject: item.subject || item.email_subject || '-',
    };
  };

  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    };
    setUserRole(getCookie('user_role') || '');
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

  // Filter data based on active filter
  const filteredData = useMemo(() => {
    if (activeFilter === 'All') {
      return timesheets;
    }
    return timesheets.filter(item => item.status === activeFilter);
  }, [activeFilter, timesheets]);

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

  const handleView = async (row) => {
    setSelectedTimesheet(row);
    setSelectedTimesheetDetails(null);
    setIsDetailsLoading(true);
    try {
      const response = await apiFetch(`/timesheet/${row.id}`, { method: 'GET' });
      if (!response.ok) {
        throw new Error('Failed to load timesheet details');
      }
      const result = await response.json();
      if (result.success && result.data) {
        setSelectedTimesheetDetails(result.data);
      } else {
        throw new Error(result.message || 'Failed to load timesheet details');
      }
    } catch (error) {
      console.error('Timesheet details error:', error);
      toast.error(error.message || 'Failed to load timesheet details');
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedTimesheet(null);
    setSelectedTimesheetDetails(null);
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
      key: 'subject',
      label: 'Subject',
      className: 'text-left',
    },
    {
      key: 'status',
      label: 'Status',
      className: 'text-left',
      render: (row) => (
        <div className="flex items-center gap-2">
          {userRole === 'Business Admin' ? (
            <>
              <select
                value={row.status}
                onChange={(e) => handleStatusChange(row, e.target.value)}
                disabled={updatingStatusId === row.id}
                className="px-3 py-1 rounded-full text-xs font-medium border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5069E5] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <IoMdArrowDropdown className="text-gray-400 pointer-events-none" size={14} />
            </>
          ) : (
            <span className={`px-3 py-1 inline-flex items-center rounded-full text-xs font-medium border ${getStatusBadgeClass(row.status)}`}>
              {row.status}
            </span>
          )}
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
                ${activeFilter === filter
                  ? 'bg-[#E0E7FF] text-[#5069E5] border-[#5069E5]'
                  : 'bg-white text-gray-600 hover:text-gray-900 border-transparent'
                }
              `}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* Create Timesheet Button */}
          <Link
            to="/timesheet/create"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#5069E5] text-white rounded-lg text-sm font-medium hover:bg-[#3d52c7] transition-colors shadow-sm"
          >
            <FaPlus size={14} />
            <span>Create Timesheet</span>
          </Link>

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
                      className={`w-full text-left px-4 py-2 hover:bg-[#E0E7FF] transition-colors ${filterPeriod === option ? 'bg-[#E0E7FF] text-[#5069E5]' : 'text-gray-800'
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
            {isDetailsLoading ? (
              <div className="flex items-center justify-center py-10 text-gray-500">
                Loading details...
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500">Created by</p>
                    <p className="text-gray-800 font-medium">
                      {selectedTimesheetDetails?.user?.name || selectedTimesheet.createdBy || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Client</p>
                    <p className="text-gray-800 font-medium">
                      {selectedTimesheetDetails?.client?.name || selectedTimesheet.client || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Period</p>
                    <p className="text-gray-800 font-medium">
                      {selectedTimesheetDetails?.period || selectedTimesheet.period || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Upload Date</p>
                    <p className="text-gray-800 font-medium">
                      {selectedTimesheetDetails?.upload_date || selectedTimesheet.uploadDate || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <p className="text-gray-800 font-medium">
                      {selectedTimesheetDetails?.status || selectedTimesheet.status || '-'}
                    </p>
                  </div>
                </div>

                {selectedTimesheetDetails?.entries?.length > 0 && (
                  <div>
                    <p className="text-gray-500 mb-2">Entries</p>
                    <div className="max-h-56 overflow-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 border-b">Date</th>
                            <th className="px-3 py-2 border-b">Daily</th>
                            <th className="px-3 py-2 border-b">Extra</th>
                            <th className="px-3 py-2 border-b">Vacation</th>
                            <th className="px-3 py-2 border-b">Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedTimesheetDetails.entries.map((entry, idx) => (
                            <tr key={idx} className="border-b last:border-b-0">
                              <td className="px-3 py-2">{entry.entry_date || '-'}</td>
                              <td className="px-3 py-2">{entry.daily_hours ?? '-'}</td>
                              <td className="px-3 py-2">{entry.extra_hours ?? '-'}</td>
                              <td className="px-3 py-2">{entry.vacation_hours ?? '-'}</td>
                              <td className="px-3 py-2">{entry.note || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
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
