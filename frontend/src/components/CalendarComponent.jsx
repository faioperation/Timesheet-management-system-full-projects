"use client";
import React, { useState } from "react";
import { FaCaretLeft, FaCaretRight, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function CalendarComponent({className}) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const isToday = (day) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  return (
    <div className={`${className}`}>
      <h2 className="font-medium text-[#0C0C0D] font-roboto text-[20px] mb-4">Calendar</h2>

      <div className=" rounded-xl p-4 bg-white" >
        {/* Header (Month / Year) */}
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-full hover:bg-gray-200 transition"
          >
            <FaCaretLeft size={24} className="text-[#3D3D40]" />
          </button>
          <div className="text-center font-medium text-[#0C0C0D] font-roboto text-[20px]">
            {monthNames[currentMonth]}, {currentYear}
          </div>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-full hover:bg-gray-200 transition"
          >
            <FaCaretRight size={24} className="text-[#3D3D40]" />
           
          </button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-4 w-[324px py-1.5 px-4 text-center   rounded-full  text-[#3D3D40] bg-[#E6E8F2] text-sm font-medium">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-7 gap-4  p-4 mt-3 font-roboto w-[324px rounded-[15px] bg-[#D9DFFF]">
          {days.map((day, index) => (
            <div
              key={index}
              className={`text-center py-3.5  transition cursor-pointer w- ${
                day === null
                  ? "opacity-0"
                  : isToday(day)
                  ? "bg-[#5069E5] text-white font-semibol rounded-full "
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
