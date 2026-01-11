"use client";
import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { IoWalletOutline } from "react-icons/io5";
import { IoMdArrowDropup } from "react-icons/io";

const data = [
  { name: "Gross revenue", value: 350 },
  { name: "Revenue", value: 100 },
  { name: "Gross margin", value: 100 },
  { name: "Net margin", value: 200 },
  { name: "Commission", value: 200 },
  { name: "Others", value: 350 },
];

const COLORS = ["#E5D416", "#D9DFFF", "#58CC02", "#5069E5", "#555659", "#F46B6A"];

export default function SalesAnalyticsCard() {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleClick = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <div className="p-5 rounded-2xl shadow-md flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-800">Sales analytics</h2>
        <select className="text-sm px-3 py-1 rounded-md text-[#3D3D40] bg-white focus:outline-none">
          <option>Monthly</option>
          <option>Weekly</option>
          <option>Yearly</option>
        </select>
      </div>

      {/* Content */}
      <div className="flex items-center gap-8 p-4 rounded-xl shadow-sm bg-white">
        {/* Left Section */}
        <div>
          <div className="bg-indigo-50 rounded-xl p-4 flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <IoWalletOutline className="text-xl text-indigo-500" />
              <span className="font-medium">Total expense</span>
            </div>
            <div className="flex items-end">
              <p className="text-3xl font-semibold text-gray-800">$532,36</p>
              <p className="flex items-center gap-1 text-green-500 text-sm font-medium">
                <IoMdArrowDropup className="text-lg" /> 12%
              </p>
            </div>
          </div>

          <ul className="text-gray-600 text-sm flex flex-col gap-2">
            {data.map((d, i) => (
              <li
                key={i}
                className={`cursor-pointer transition ${
                  activeIndex === i ? "font-semibold " : ""
                }`}
                onClick={() => setActiveIndex(i)}
              >
                {d.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Right Section - Donut Chart */}
        <div className="w-[200px] h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                onClick={handleClick}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="none"
                    style={{
                      transformOrigin: "center",
                      transform:
                        activeIndex === index ? "scale(1.1)" : "scale(1)",
                    //   opacity: activeIndex === index ? 1 : 0.4,
                      transition: "transform 0.4s ease, opacity 0.4s ease",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
