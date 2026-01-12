import React, { useState } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';

export default function Scheduler() {
  const [selectedMonth, setSelectedMonth] = useState(8); // September (0-indexed: 8)
  const [selectedDay, setSelectedDay] = useState(19);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [formData, setFormData] = useState({
    date: '19 Sep 2025',
    dailyHour: '00:00',
    extraHour: '00:00',
    vacation: '00:00',
    remark: 'Important',
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  // Check if a day is Friday (5) or Saturday (6)
  const isWeekend = (day, month, year) => {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
  };

  // Get calendar days for a month
  const getCalendarDays = (month, year) => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isWeekend: isWeekend(day, month, year),
      });
    }

    return days;
  };

  const handleDaySelect = (day) => {
    setSelectedDay(day);
    const date = new Date(selectedYear, selectedMonth, day);
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    setFormData(prev => ({
      ...prev,
      date: formattedDate,
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSetHolidays = () => {
    console.log('Set as holidays clicked');
  };

  const handleSetDefault = () => {
    console.log('Set default clicked');
  };

  const handleEditDefault = () => {
    console.log('Edit default clicked');
  };

  const daysInCurrentMonth = getDaysInMonth(selectedMonth, selectedYear);

  return (
    <div className="w-full pb-10">
      {/* Top Date Selection Bar */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1"></div>
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#5069E5] cursor-pointer"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
            <IoMdArrowDropdown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          </div>
        </div>

        {/* Day Circles Row */}
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: daysInCurrentMonth }, (_, i) => {
            const day = i + 1;
            const isWeekendDay = isWeekend(day, selectedMonth, selectedYear);
            const isSelected = day === selectedDay;

            return (
              <button
                key={day}
                onClick={() => handleDaySelect(day)}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${
                    isSelected
                      ? 'bg-[#5069E5] text-white'
                      : isWeekendDay
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }
                  hover:opacity-80
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Middle Section - Input Fields and Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          {/* Input Fields */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Daily hour</label>
              <input
                type="time"
                value={formData.dailyHour}
                onChange={(e) => handleInputChange('dailyHour', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Extra hour</label>
              <input
                type="time"
                value={formData.extraHour}
                onChange={(e) => handleInputChange('extraHour', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vacation</label>
              <input
                type="time"
                value={formData.vacation}
                onChange={(e) => handleInputChange('vacation', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Remark</label>
              <input
                type="text"
                value={formData.remark}
                onChange={(e) => handleInputChange('remark', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSetHolidays}
              className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium whitespace-nowrap"
            >
              Set as holidays
            </button>
            <button
              onClick={handleSetDefault}
              className="px-6 py-2.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium whitespace-nowrap"
            >
              Set default
            </button>
          </div>
        </div>

        {/* Default Settings Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleSetDefault}
            className="px-6 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
          >
            Set default
          </button>
          <button
            onClick={handleEditDefault}
            className="px-6 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
          >
            Edit default
          </button>
        </div>
      </div>

      {/* Bottom Section - Full Year Calendar */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-end mb-4">
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#5069E5] cursor-pointer"
            >
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
              <option value={2026}>2026</option>
            </select>
            <IoMdArrowDropdown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="mb-4">
          <div className="grid grid-cols-7 gap-1 max-w-4xl">
            {daysOfWeek.map((day, index) => (
              <div
                key={day}
                className={`text-center text-sm font-medium py-2 ${
                  index === 5 || index === 6 // Friday or Saturday
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-700'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Calendar Grids */}
        <div className="space-y-6">
          {months.map((monthName, monthIndex) => {
            const calendarDays = getCalendarDays(monthIndex, selectedYear);
            const rows = [];
            let currentRow = [];

            calendarDays.forEach((dayObj, index) => {
              if (index % 7 === 0 && currentRow.length > 0) {
                rows.push(currentRow);
                currentRow = [];
              }
              currentRow.push(dayObj);
            });

            if (currentRow.length > 0) {
              // Fill remaining cells in last row
              while (currentRow.length < 7) {
                currentRow.push(null);
              }
              rows.push(currentRow);
            }

            return (
              <div key={monthIndex} className="flex gap-4">
                {/* Month Name */}
                <div className="w-24 flex-shrink-0">
                  <h3 className="text-sm font-semibold text-gray-700 pt-2">{monthName}</h3>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 max-w-4xl">
                  {rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-7 gap-1">
                      {row.map((dayObj, dayIndex) => {
                        if (!dayObj) {
                          return (
                            <div
                              key={dayIndex}
                              className="aspect-square flex items-center justify-center text-sm"
                            ></div>
                          );
                        }

                        const { day, isWeekend } = dayObj;
                        return (
                          <div
                            key={dayIndex}
                            className={`
                              aspect-square flex items-center justify-center text-sm font-medium
                              ${
                                isWeekend
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-white text-gray-800'
                              }
                            `}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
