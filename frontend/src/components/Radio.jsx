"use client";
import { useState } from "react";

export default function CustomRadio() {
  const [selected, setSelected] = useState("W2");

  return (
    <div className="flex items-center gap-8 ">
      {/* Radio 1 */}
      <label
        className={`flex items-center gap-2  py-3 rounded-xl  cursor-pointer transition 
        ${selected === "W2" ? "" : ""}`}
      >
        <input
          type="radio"
          name="plan"
          value="W2"
          checked={selected === "W2"}
          onChange={() => setSelected("W2")}
          className="hidden"
        />
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center 
          ${selected === "W2" ? "border-[#5069E5]/30 " : "border-[#DFE0E5] "}`}
        >
          <div className={`w-3 h-3 bg-[#5069E5] rounded-full ${selected === "W2" ? "bg-[#5069E5] " : "bg-[#DFE0E5] "}`}></div>
        </div>
        <span className={`font-roboto font-medium ${selected === "W2" ? "text-[#6D6E73] ": "text-[#0C0C0D]"}`}>W2</span>
      </label>

      {/* Radio 2 */}
      <label
        className={`flex items-center gap-2  py-3 rounded-xl cursor-pointer transition-all 
        ${selected === "1099 C2C" ? "" : ""}`}
      >
        <input
          type="radio"
          name="plan"
          value="1099 C2C"
          checked={selected === "1099 C2C"}
          onChange={() => setSelected("1099 C2C")}
          className="hidden"
        />
        <div
          className={`w-5 h-5 rounded-full border-2  flex items-center justify-center 
          ${selected === "1099 C2C" ? "border-[#5069E5]/30" : "border-[#DFE0E5]"}`}
        >
          <div className={`w-3 h-3 bg-[#5069E5] rounded-full ${selected === "1099 C2C" ? "bg-[#5069E5] " : "bg-[#DFE0E5] "}`}></div>
        </div>
         <span className={`font-roboto font-medium ${selected === "1099 C2C" ? "text-[#6D6E73] ": "text-[#0C0C0D]"}`}>1099 C2C</span>
      </label>
    </div>
  );
}
