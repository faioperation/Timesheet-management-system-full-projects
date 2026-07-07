"use client";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FaArrowLeft, FaArrowRight, FaCaretLeft, FaCaretRight } from "react-icons/fa";

const COLORS = ["#1B654A", "#F46B6A", "#E5D416"];
const STATUS = ["Approved", "Pending", "Rejected"];

export default function PieChartComponent({className}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % STATUS.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + STATUS.length) % STATUS.length);
  };

  const data = [
    { name: "Approved", value: activeIndex === 0 ? 45 : 45 },
    { name: "Pending", value: activeIndex === 1 ? 30 : 30 },
    { name: "Rejected", value: activeIndex === 2 ? 25 : 25 },
  ];

  const currentStatus = STATUS[activeIndex];
  
  const handleClick = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div className={`   flex flex-col items-center relative ${className}`}>
      <h2 className="font-semibold font-roboto text-black mb-3">Time sheet Analytics</h2>

      
      <ResponsiveContainer width={330} height={330} >
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={140}
            fill="#8884d8"
            dataKey="value"
            labelLine={false}
            onClick={handleClick}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index]}
                style={{
                  transformOrigin: "center",
                  transform:
                    activeIndex === index ? "scale(1.1)" : "scale(1.0)",
                  transition: "transform 0.4s ease, opacity 0.4s ease",
                  opacity: activeIndex === index ? 1 : 0.4,
                }}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      
      <div className="mt-6 flex items-center gap-2">
        
        <button
          onClick={handlePrev}
          className={` text-[#3D3D40]  ${
            activeIndex === 0 ? "invisible" : "visible"
          }`}
        >
         <FaCaretLeft size={24} />
        </button>

        
        <div
          key={currentStatus}
          className="flex flex-row gap-2 items-center text-center transition-all duration-500 ease-in-out"
        >
          <div
            className={`w-4 h-4 rounded ${
              currentStatus === "Approved"
                ? "bg-[#1B654A]"
                : currentStatus === "Pending"
                ? "bg-[#F46B6A]"
                : "bg-[#E5D416]"
            }`}
          ></div>
          <p className="font-roboto font-semibold text-[#3D3D40]">{currentStatus}</p>
        </div>

        
        <button
          onClick={handleNext}
          className=" text-[#3D3D40]"
        >
          <FaCaretRight size={24} />
         
        </button>
      </div>
    </div>
  );
}
