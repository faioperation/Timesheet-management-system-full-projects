"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Sat", daily: 3, extra: 0, vacation: 0 },
  { day: "Sun", daily: 1, extra: 2, vacation: 0 },
  { day: "Mon", daily: 6, extra: 0, vacation: 0 },
  { day: "Tues", daily: 3, extra: 0, vacation: 0 },
  { day: "Wed", daily: 0, extra: 0, vacation: 4 },
  { day: "Thurs", daily: 2, extra: 2, vacation: 0 },
  { day: "Fri", daily: 5, extra: 0, vacation: 0 },
];

export default function BarChartComponent() {
  return (
    <div className=" w-[90%]  ">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-medium text-[20px] font-roboto text-[#0C0C0D]">Hours</h2>
        <select className=" font-roboto px-2 py-1 text-[#3D3D40]">
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
      </div>

      {/* ✅ Stacked Bar Chart */}
      <ResponsiveContainer width="100%" height={350} className="bg-white rounded-2xl ">
        <BarChart data={data} barSize={40}  >
          <XAxis dataKey="day" tickLine={false} axisLine={false}  />
          <YAxis tickLine={false} axisLine={false}  />
          <Tooltip cursor={false}  />
          {/* stackId="a" দিলে সব বার একটার উপর আরেকটা উঠবে */}
          <Bar dataKey="daily" fill="#D9DFFF" radius={[4, 4, 4, 4]} stackId="a"   />
          <Bar dataKey="extra" fill="#F46B6A" radius={[4, 4, 4, 4]} stackId="a"  />
          <Bar dataKey="vacation" fill="#1B654A" radius={[4, 4, 4, 4]} stackId="a"    />
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-4 mt-4 justify-center">
        <div className="flex items-center gap-1 text-[#3D3D40] font-roboto">
        Daily  <span className="w-4 h-4 bg-[#D9DFFF] rounded"></span> 
        </div>
        <div className="flex items-center gap-1 text-[#3D3D40] font-roboto">
         Extra <span className="w-4 h-4 bg-[#F46B6A] rounded"></span> 
        </div>
        <div className="flex items-center gap-1 text-[#3D3D40] font-roboto">
          Vacation <span className="w-4 h-4 bg-[#1B654A] rounded"></span> 
        </div>
      </div>
    </div>
  );
}
