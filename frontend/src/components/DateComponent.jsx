import React from "react";

const DateComponent = () => {
  const today = new Date();


  const date = today.getDate();

  
  const dayName = today.toLocaleDateString("en-US", { weekday: "short" });


  const monthName = today.toLocaleDateString("en-US", { month: "long" });

  return (
    <div className=" p-4 border w-[25%] flex items-center gap-4">
      
      <div className=" w-30 h-30 bg-white text-[#0C0C0D] font-roboto font-semibold text-[32px] rounded-full border border-[#CED2E5] flex items-center justify-center ">{date}</div>

      
      <div className="font-roboto font-medium text-[#0C0C0D] text-[20px] flex flex-col">
        {dayName}, <span className="text-[#3D3D40] text-[16px]">{monthName}</span>
      </div>
    </div>
  );
};

export default DateComponent;
