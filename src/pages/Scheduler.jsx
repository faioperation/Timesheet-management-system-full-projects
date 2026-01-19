import React, { useMemo, useState } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function Scheduler() {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedDay, setSelectedDay] = useState(currentDay);

  const handlePreviousMonth = () => {
    setSelectedMonth((prev) => {
      if (prev === 0) {
        setSelectedYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => {
      if (prev === 11) {
        setSelectedYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

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
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Calendar */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-700">Scheduler</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-50 rounded-lg p-1 mr-2">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-white hover:text-[#5069E5] rounded-md transition-all text-gray-500"
                  title="Previous Month"
                >
                  <FaChevronLeft size={14} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-white hover:text-[#5069E5] rounded-md transition-all text-gray-500"
                  title="Next Month"
                >
                  <FaChevronRight size={14} />
                </button>
              </div>

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
                  {Array.from({ length: 201 }, (_, i) => 1900 + i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <IoMdArrowDropdown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4 text-center text-sm font-bold text-gray-500 uppercase tracking-wider">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-2 bg-gray-50 rounded-lg">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="h-20" />;
              }
              const isToday = day === currentDay && selectedMonth === currentMonth && selectedYear === currentYear;
              const isPast = new Date(selectedYear, selectedMonth, day) < new Date(currentYear, currentMonth, currentDay);
              const isSelected = day === selectedDay;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`h-20 p-3 rounded-lg border-2 text-lg font-semibold transition-all duration-200 flex flex-col items-start justify-start ${isSelected
                    ? 'bg-[#5069E5] text-white border-[#5069E5] shadow-lg shadow-indigo-100 scale-[1.02]'
                    : isToday
                      ? 'bg-white text-[#5069E5] border-[#5069E5] bg-indigo-50/10'
                      : isPast
                        ? 'bg-gray-50 text-gray-400 border-gray-100'
                        : 'bg-white text-gray-700 border-gray-100 hover:border-[#5069E5] hover:shadow-md'
                    }`}
                >
                  <div className="flex justify-between w-full items-start">
                    <span>{day}</span>
                    {isToday && (
                      <span className="text-[10px] bg-[#5069E5] text-white px-2 py-0.5 rounded-full uppercase font-bold">
                        Today
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column - Timesheet Details */}
        <div className="w-full lg:w-[400px] bg-white rounded-lg shadow-sm p-6 h-fit sticky top-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h3 className="text-xl font-bold text-gray-800">Timesheet Details</h3>
            <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wider">
              {selectedDay ? 'Selected Day' : 'No Date Selected'}
            </div>
          </div>

          <div className="space-y-5">
            {/* Main Info Card */}
            <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-indigo-500 uppercase font-bold tracking-widest mb-1">Date</p>
                  <p className="text-sm font-bold text-gray-800">
                    {selectedDay ? `${selectedDay} ${months[selectedMonth]} ${selectedYear}` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-indigo-500 uppercase font-bold tracking-widest mb-1">Client Name</p>
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {selectedDay ? "Global Tech Solutions" : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Hours Grid */}
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-indigo-200 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <span className="font-bold text-xs">DH</span>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 font-bold">Daily Hours</p>
                      <p className="text-lg font-black text-gray-800">{selectedDay ? "08:00" : "00:00"}</p>
                    </div>
                  </div>
                  <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>
                  <div className="text-right">
                    <span className="text-[10px] text-green-500 bg-green-50 px-2 py-0.5 rounded-full font-bold">Active</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-orange-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                    <span className="font-bold text-xs">EH</span>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 font-bold">Extra Hours</p>
                    <p className="text-lg font-black text-gray-800">{selectedDay ? "02:00" : "00:00"}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-purple-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                    <span className="font-bold text-xs">VA</span>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 font-bold">Vacation</p>
                    <p className="text-lg font-black text-gray-800">{selectedDay ? "00:00" : "00:00"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
