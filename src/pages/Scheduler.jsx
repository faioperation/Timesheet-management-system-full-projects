import React, { useMemo, useState } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';

export default function Scheduler() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [selectedMonth, selectedYear]);

  return (
    <div className="w-full pb-10">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-700">Scheduler</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#5069E5] cursor-pointer"
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
              <IoMdArrowDropdown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
            </div>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="appearance-none border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#5069E5] cursor-pointer"
              >
                {Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <IoMdArrowDropdown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4 text-center text-sm font-medium text-gray-600">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="h-12" />;
            }
            const isSelected = day === selectedDay;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`h-12 rounded-lg border text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#5069E5] text-white border-[#5069E5]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#5069E5]'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
