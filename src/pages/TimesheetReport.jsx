import React, { useMemo, useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import ReusableTable from "../components/ReusableTable";
import { useLocation, useParams } from "react-router-dom";

export default function TimesheetReport() {
  const { timesheetId } = useParams();
  const location = useLocation();
  const [filterPeriod, setFilterPeriod] = useState("Weekly");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const baseRows = useMemo(() => {
    return Array.from({ length: 10 }, (_, index) => ({
      id: `${timesheetId || "ts"}-${index + 1}`,
      no: String(index + 1).padStart(2, "0"),
      timePeriod: "15 Sep 2025 to 21 Sep 2025",
      dailyHours: "8:00",
      extraHours: "0:00",
      vacationHours: "0:00",
      totalHours: "8:00",
      client: "Naresh Vyas",
    }));
  }, [timesheetId]);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return baseRows;
    const value = searchTerm.trim().toLowerCase();
    return baseRows.filter((row) => row.client.toLowerCase().includes(value));
  }, [baseRows, searchTerm]);

  const columns = [
    { key: "no", label: "Serial", className: "text-left w-[8%]" },
    { key: "timePeriod", label: "Time period", className: "text-left" },
    { key: "dailyHours", label: "Daily hours", className: "text-left" },
    { key: "extraHours", label: "Extra hours", className: "text-left" },
    { key: "vacationHours", label: "Vacation hours", className: "text-left" },
    { key: "totalHours", label: "Total hours", className: "text-left" },
  ];

  const filterOptions = ["Weekly", "Monthly", "Yearly"];

  return (
    <div className="w-full pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-lg font-bold text-gray-700">Report</h3>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-[#5069E5] transition-colors cursor-pointer justify-between min-w-[120px]"
            >
              <span>{filterPeriod}</span>
              <IoMdArrowDropdown className="text-gray-500" size={20} />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                ></div>
                <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-20 min-w-[120px]">
                  {filterOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setFilterPeriod(option);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-[#E0E7FF] transition-colors ${
                        filterPeriod === option
                          ? "bg-[#E0E7FF] text-[#5069E5]"
                          : "text-gray-800"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative w-full sm:w-[260px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by client"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800 pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>
      </div>

      <ReusableTable
        columns={columns}
        data={filteredRows}
        itemsPerPage={10}
        headerBgColor="bg-[#E0E7FF]"
        stripedRows={true}
      />
    </div>
  );
}

