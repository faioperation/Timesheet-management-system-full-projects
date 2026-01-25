import React, { useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { IoMdArrowDropdown } from 'react-icons/io';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ReusableTable from '../../components/ReusableTable';
import { apiFetch } from '../../libs/apiFetch';

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const [filterPeriod, setFilterPeriod] = useState('Monthly');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [consultantData, setConsultantData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [recentTimesheets, setRecentTimesheets] = useState([]);

  // Get current date
  const currentDate = new Date();
  const dayNumber = currentDate.getDate();
  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch('/supervisor-dashboard-data', { method: 'GET' });
      const result = await response.json();

      if (response.ok && result.success) {
        setConsultantData(result.data.monthly_stats || []);
        setPieData(result.data.status_stats || []);
        setRecentTimesheets(result.data.recent_timesheets || []);
      } else {
        throw new Error(result.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback or error state could be handled here
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadgeClass = (status) => {
    const s = status.toLowerCase();
    switch (s) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 border-dashed';
      case 'reject':
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const recentTimesheetColumns = [
    { key: 'client', label: 'Client', className: 'text-left' },
    { key: 'startDate', label: 'Start date', className: 'text-left' },
    { key: 'endDate', label: 'End date', className: 'text-left' },
    {
      key: 'status',
      label: 'Status',
      className: 'text-left',
      render: (row) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(
            row.status
          )}`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  const filterOptions = ['Monthly', 'Weekly', 'Yearly'];

  const handlePeriodChange = (period) => {
    setFilterPeriod(period);
    setShowDropdown(false);
  };

  const handleAddUser = () => {
    navigate('/user/add');
  };

  return (
    <div className="w-full pb-10">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Date Display */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#5069E5] flex items-center justify-center text-white font-bold text-lg">
            {dayNumber}
          </div>
          <div className="text-gray-700">
            <span className="font-semibold">{dayName}, {monthName}</span>
          </div>
        </div>

        {/* Add User Button */}
        <button
          onClick={handleAddUser}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-medium"
        >
          <FaPlus size={14} />
          Add User
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consultant Bar Chart Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-700">Consultant</h3>
            {/* Monthly Dropdown */}
            {/* ... dropdown code remains ... */}
          </div>

          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center text-gray-400">Loading chart...</div>
          ) : consultantData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={consultantData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barSize={30}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#666", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#666", fontSize: 12 }} />
                <Tooltip cursor={false} />
                <Bar dataKey="w2" stackId="a" fill="#D9DFFF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="c2c" stackId="a" fill="#F46B6A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No data available</div>
          )}

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#D9DFFF] rounded"></div>
              <span className="text-sm text-gray-700">W2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#F46B6A] rounded"></div>
              <span className="text-sm text-gray-700">C2C</span>
            </div>
          </div>
        </div>

        {/* Time sheet Analytics Pie Chart Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4">Time sheet Analytics</h3>
          <div className="flex justify-center">
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center text-gray-400">Loading analytics...</div>
            ) : pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">No analytics data</div>
            )}
          </div>
          {/* Legend for pie chart */}
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }}></div>
                <span>{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Timesheet Table Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">Recent timesheet</h3>
        {isLoading ? (
          <div className="py-10 text-center text-gray-400">Loading timesheets...</div>
        ) : recentTimesheets.length > 0 ? (
          <ReusableTable
            columns={recentTimesheetColumns}
            data={recentTimesheets}
            itemsPerPage={5}
            showPagination={false}
            headerBgColor="bg-gray-100"
            stripedRows={true}
          />
        ) : (
          <div className="py-10 text-center text-gray-400">No recent timesheets found</div>
        )}
      </div>
    </div>
  );
}
