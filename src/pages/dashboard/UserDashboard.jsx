import React, { useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaChevronLeft, FaChevronRight, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ReusableTable from "../../components/ReusableTable";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [filterPeriod, setFilterPeriod] = useState("Weekly");
  const [currentDate] = useState(new Date()); // Current date
  const [calendarMonth, setCalendarMonth] = useState(new Date()); // Current month

  // Get current date info
  const dayNumber = currentDate.getDate();
  const dayName = currentDate.toLocaleDateString("en-US", { weekday: "short" });
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long" });

  // Hours bar chart data - matching image exactly
  const hoursData = [
    { day: "Sat", daily: 3.5, extra: 0, vacation: 0 },
    { day: "Sun", daily: 0.5, extra: 2.5, vacation: 0 }, // Small daily + extra on top
    { day: "Mon", daily: 8.5, extra: 0, vacation: 0 },
    { day: "Thurs", daily: 4, extra: 0, vacation: 0 },
    { day: "Wed", daily: 0, extra: 0, vacation: 4 }, // Vacation only
    { day: "Tues", daily: 6, extra: 2, vacation: 0 }, // Daily + extra on top
    { day: "Fri", daily: 7.5, extra: 0, vacation: 0 },
  ];

  // Pie chart data - matching image exactly (50%, 25%, 25%)
  const pieData = [
    { name: "Approved", value: 50, color: "#1B654A" }, // Dark green - largest slice (~50%)
    { name: "Pending", value: 25, color: "#F46B6A" }, // Light pink (~25%)
    { name: "Rejected", value: 25, color: "#E5D416" }, // Light yellow (~25%)
  ];

  // Recent timesheet data
  const recentTimesheets = [
    {
      id: 1,
      client: "Jane Cooper",
      startDate: "16 Sep 2025",
      endDate: "21 Sep 2025",
      status: "Pending",
    },
    {
      id: 2,
      client: "Jane Cooper",
      startDate: "16 Sep 2025",
      endDate: "21 Sep 2025",
      status: "Reject",
    },
    {
      id: 3,
      client: "Jane Cooper",
      startDate: "16 Sep 2025",
      endDate: "21 Sep 2025",
      status: "Approved",
    },
    {
      id: 4,
      client: "Jane Cooper",
      startDate: "16 Sep 2025",
      endDate: "21 Sep 2025",
      status: "Approved",
    },
    {
      id: 5,
      client: "Jane Cooper",
      startDate: "16 Sep 2025",
      endDate: "21 Sep 2025",
      status: "Approved",
    },
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 border-dashed";
      case "Reject":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Calendar functions
  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    const today = new Date();

    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const dateObj = new Date(year, month - 1, day);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
      days.push({ day, isCurrentMonth: false, isToday: false, isWeekend });
    }

    // Current month days
    const isCurrentMonth =
      today.getFullYear() === year && today.getMonth() === month;
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(year, month, i);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
      const isToday = isCurrentMonth && i === today.getDate();
      days.push({ day: i, isCurrentMonth: true, isToday, isWeekend });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const dateObj = new Date(year, month + 1, i);
      const dayOfWeek = dateObj.getDay();
      const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
      days.push({ day: i, isCurrentMonth: false, isToday: false, isWeekend });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
    );
  };

  const calendarDays = getCalendarDays();
  const calendarMonthName = calendarMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Table columns for Recent Timesheet
  const recentTimesheetColumns = [
    {
      key: "client",
      label: "Client",
      className: "text-left",
    },
    {
      key: "startDate",
      label: "Start date",
      className: "text-left",
    },
    {
      key: "endDate",
      label: "End date",
      className: "text-left",
    },
    {
      key: "status",
      label: "Status",
      className: "text-left",
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

  return (
    <div className="w-full pb-10">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-200">
            <span className="text-2xl font-bold text-gray-700">
              {dayNumber}
            </span>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              {dayName}, {monthName}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/timesheet/create")}
          className="flex items-center gap-2 px-4 py-2 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-medium"
        >
          <FaPlus size={14} />
          Create timesheet
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Hours Bar Chart Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-700">Hours</h3>
            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-[#5069E5] transition-colors">
                <span>{filterPeriod}</span>
                <IoMdArrowDropdown size={16} />
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={hoursData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barSize={40}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                horizontal={true}
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#666", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                tick={{ fill: "#666", fontSize: 12 }}
              />
              <Tooltip cursor={false} />
              <Bar
                dataKey="daily"
                stackId="a"
                fill="#D9DFFF"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="extra"
                stackId="a"
                fill="#F46B6A"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="vacation"
                stackId="a"
                fill="#1B654A"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#D9DFFF] rounded"></div>
              <span className="text-sm text-gray-700">Daily</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#F46B6A] rounded"></div>
              <span className="text-sm text-gray-700">Extra</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#1B654A] rounded"></div>
              <span className="text-sm text-gray-700">Vacation</span>
            </div>
          </div>
        </div>

        {/* Time sheet Analytics Pie Chart Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4">
            Time sheet Analytics
          </h3>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
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
              <svg
                width="6"
                height="6"
                viewBox="0 0 6 6"
                fill="none"
                className="text-black"
              >
                <path d="M0 3L4.5 0L4.5 6L0 3Z" fill="black" />
              </svg>
              <div className="w-3 h-3 bg-[#1B654A] rounded-sm"></div>
              <span>Approved</span>
              <svg
                width="6"
                height="6"
                viewBox="0 0 6 6"
                fill="none"
                className="text-black"
              >
                <path d="M0 3L4.5 0L4.5 6L0 3Z" fill="black" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar and Recent Timesheet Row - Using Flex */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar Section - Smaller Width */}
        <div className="bg-white rounded-lg shadow-sm p-4 lg:w-[320px] flex-shrink-0">
          <h3 className="text-base font-bold text-gray-700 mb-3">Calendar</h3>
          <div className="bg-[#E0E7FF] rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={handlePrevMonth}
                className="p-0.5 hover:bg-white/50 rounded transition-colors"
              >
                <FaChevronLeft className="text-gray-700" size={12} />
              </button>
              <h4 className="text-sm font-semibold text-gray-800">
                {calendarMonthName}
              </h4>
              <button
                onClick={handleNextMonth}
                className="p-0.5 hover:bg-white/50 rounded transition-colors"
              >
                <FaChevronRight className="text-gray-700" size={12} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 mb-1.5">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => {
                const isWeekend = index === 5 || index === 6; // Friday and Saturday
                return (
                  <div
                    key={index}
                    className={`text-center text-xs font-medium py-0.5 ${
                      isWeekend ? "text-red-500" : "text-gray-700"
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((dayObj, index) => {
                return (
                  <div
                    key={index}
                    className={`aspect-square flex items-center justify-center text-xs cursor-pointer transition-colors ${
                      dayObj.isToday
                        ? "bg-[#5069E5] text-white rounded-full font-semibold"
                        : dayObj.isCurrentMonth
                        ? dayObj.isWeekend
                          ? "text-red-500"
                          : "text-gray-800"
                        : dayObj.isWeekend
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
                  >
                    {dayObj.day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent timesheet Table Section - Takes Remaining Space */}
        <div className="bg-white rounded-lg shadow-sm p-6 flex-1">
          <h3 className="text-lg font-bold text-gray-700 mb-4">
            Recent timesheet
          </h3>
          {/* Reusable Table */}
          <ReusableTable
            columns={recentTimesheetColumns}
            data={recentTimesheets}
            itemsPerPage={5}
            showPagination={false}
            headerBgColor="bg-gray-100"
            stripedRows={false}
          />
        </div>
      </div>
    </div>
  );
}
