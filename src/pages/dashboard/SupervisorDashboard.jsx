import React, { useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { IoMdArrowDropdown } from 'react-icons/io';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ReusableTable from '../../components/ReusableTable';

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const [filterPeriod, setFilterPeriod] = useState('Monthly');
  const [showDropdown, setShowDropdown] = useState(false);

  // Get current date
  const currentDate = new Date();
  const dayNumber = currentDate.getDate();
  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });

  // Consultant bar chart data - Monthly data with W2 and C2C
  const consultantData = [
    { month: 'Jan', w2: 30, c2c: 10 },
    { month: 'Feb', w2: 15, c2c: 5 },
    { month: 'Mar', w2: 45, c2c: 5 },
    { month: 'Apr', w2: 35, c2c: 5 },
    { month: 'May', w2: 65, c2c: 10 },
    { month: 'Jun', w2: 30, c2c: 10 },
    { month: 'July', w2: 25, c2c: 5 },
    { month: 'Aug', w2: 30, c2c: 5 },
    { month: 'Sep', w2: 35, c2c: 5 },
    { month: 'Oct', w2: 40, c2c: 5 },
    { month: 'Nov', w2: 55, c2c: 10 },
    { month: 'Dec', w2: 70, c2c: 10 },
  ];

  // Pie chart data - matching the image proportions
  const pieData = [
    { name: 'Approved', value: 45, color: '#1B654A' }, // Dark green - largest slice (~40-45%)
    { name: 'Pending', value: 35, color: '#F46B6A' }, // Light pink (~30-35%)
    { name: 'Rejected', value: 20, color: '#E5D416' }, // Light yellow (~20-25%)
  ];

  // Recent timesheet data
  const recentTimesheets = [
    {
      id: 1,
      client: 'Jane Cooper',
      startDate: '16 Sep 2025',
      endDate: '21 Sep 2025',
      status: 'Pending',
    },
    {
      id: 2,
      client: 'Jane Cooper',
      startDate: '16 Sep 2025',
      endDate: '21 Sep 2025',
      status: 'Reject',
    },
    {
      id: 3,
      client: 'Jane Cooper',
      startDate: '16 Sep 2025',
      endDate: '21 Sep 2025',
      status: 'Approved',
    },
    {
      id: 4,
      client: 'Jane Cooper',
      startDate: '16 Sep 2025',
      endDate: '21 Sep 2025',
      status: 'Approved',
    },
    {
      id: 5,
      client: 'Jane Cooper',
      startDate: '16 Sep 2025',
      endDate: '21 Sep 2025',
      status: 'Approved',
    },
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 border-dashed';
      case 'Reject':
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
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-[#5069E5] transition-colors cursor-pointer"
              >
                <span>{filterPeriod}</span>
                <IoMdArrowDropdown className="text-gray-500" size={16} />
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

          {/* Bar Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={consultantData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barSize={30}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#666", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                tick={{ fill: "#666", fontSize: 12 }}
              />
              <Tooltip cursor={false} />
              <Bar
                dataKey="w2"
                stackId="a"
                fill="#D9DFFF"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="c2c"
                stackId="a"
                fill="#F46B6A"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

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
          <h3 className="text-lg font-bold text-gray-700 mb-4">
            Time sheet Analytics
          </h3>
          <div className="flex justify-center">
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
          </div>
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
              <div className="w-3 h-3 bg-[#1B654A] rounded-sm"></div>
              <span>Approved</span>
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none" className="text-black">
                <path d="M0 3L4.5 0L4.5 6L0 3Z" fill="currentColor" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Timesheet Table Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">
          Recent timesheet
        </h3>
        <ReusableTable
          columns={recentTimesheetColumns}
          data={recentTimesheets}
          itemsPerPage={5}
          showPagination={false}
          headerBgColor="bg-gray-100"
          stripedRows={true}
        />
      </div>
    </div>
  );
}
