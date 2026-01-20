import React, { useState, useRef, useEffect } from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { HiOutlineSelector } from "react-icons/hi";
import { IoWalletOutline } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { apiFetch } from "../../libs/apiFetch";
import ReusableTable from "../../components/ReusableTable";

const timeSheetAnalyticsData = [
    { name: "Approved", value: 400, color: "#1E5F43" },
    { name: "Submitted", value: 250, color: "#F2E8A0" },
    { name: "Rejected", value: 350, color: "#F3C1C1" },
];

const consultantChartData = [
    { month: "Jan", w2: 32, c2c: 8 },
    { month: "Feb", w2: 15, c2c: 5 },
    { month: "Mar", w2: 48, c2c: 0 },
    { month: "Apr", w2: 32, c2c: 8 },
    { month: "May", w2: 70, c2c: 5 },
    { month: "Jun", w2: 32, c2c: 8 },
    { month: "July", w2: 20, c2c: 10 },
    { month: "Aug", w2: 30, c2c: 8 },
    { month: "Sep", w2: 38, c2c: 0 },
    { month: "Oct", w2: 36, c2c: 8 },
    { month: "Nov", w2: 60, c2c: 8 },
    { month: "Dec", w2: 80, c2c: 5 },
];

const timesheetData = Array.from({ length: 5 }, (_, i) => ({
    no: (i + 1).toString().padStart(2, '0'),
    name: "user4 0711/vendor4",
    dailyHours: "0.00",
    extraHours: "0.00",
    vacationHours: "0.00",
    totalHours: "0.00",
    status: "W2 Consultant",
    action: <button className="text-[#374151] font-bold underline hover:text-[#5069E5] transition-colors">View</button>,
}));

const timesheetColumns = [
    { key: "no", label: <div className="flex items-center gap-2">Sl no <HiOutlineSelector size={14} className="opacity-50" /></div>, className: "text-left w-20" },
    { key: "name", label: <div className="flex items-center gap-2">Name/Client <HiOutlineSelector size={14} className="opacity-50" /></div>, className: "text-left font-medium" },
    { key: "dailyHours", label: <div className="flex items-center justify-center gap-2">Daily Hours <HiOutlineSelector size={14} className="opacity-50" /></div>, className: "text-center" },
    { key: "extraHours", label: <div className="flex items-center justify-center gap-2">Extra Hours <HiOutlineSelector size={14} className="opacity-50" /></div>, className: "text-center" },
    { key: "vacationHours", label: <div className="flex items-center justify-center gap-2">Vacation Hours <HiOutlineSelector size={14} className="opacity-50" /></div>, className: "text-center" },
    { key: "totalHours", label: <div className="flex items-center justify-center gap-2">Total Hours <HiOutlineSelector size={14} className="opacity-50" /></div>, className: "text-center" },
    { key: "status", label: <div className="flex items-center justify-center gap-2">Status <HiOutlineSelector size={14} className="opacity-50" /></div>, className: "text-center" },
    { key: "action", label: <div className="flex items-center justify-center gap-2">Action <HiOutlineSelector size={14} className="opacity-50" /></div>, className: "text-center" },
];

const ConsultantFilterDropdown = ({ label, value, options, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col gap-1.5" ref={dropdownRef}>
            <span className="text-[13px] font-bold text-gray-700 ml-1">{label}</span>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between gap-3 px-5 py-2.5 bg-[#E0E7FF] rounded-lg text-[15px] text-[#312E81] hover:bg-[#D1D5DB] transition-all font-bold min-w-[140px]"
                >
                    <span>{value}</span>
                    <IoMdArrowDropdown size={20} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 max-h-[250px] overflow-y-auto custom-scrollbar">
                        {options.map((option, index) => (
                            <div
                                key={index}
                                onClick={() => {
                                    onSelect(option);
                                    setIsOpen(false);
                                }}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-[#EEF2FF] hover:text-[#5069E5] cursor-pointer transition-colors"
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const SimpleDropdown = ({ value, options, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-[#5069E5] transition-colors font-medium min-w-[110px] justify-between"
            >
                <span>{value}</span>
                <IoMdArrowDropdown size={18} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[250px] overflow-y-auto custom-scrollbar">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            onClick={() => {
                                onSelect(option);
                                setIsOpen(false);
                            }}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-[#E0E7FF] hover:text-[#5069E5] cursor-pointer"
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ConsultantDetailModal = ({ isOpen, onClose, data }) => {
    if (!isOpen || !data) return null;

    const InfoRow = ({ label, value }) => (
        <div className="flex items-center py-2 border-b border-gray-50 last:border-0 min-h-[44px]">
            <span className="text-[14px] text-gray-500 w-[180px] flex-shrink-0">{label} :</span>
            <span className="text-[14px] font-semibold text-gray-800">{value || "-"}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[1280px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="flex justify-between items-center px-10 py-6">
                    <h2 className="text-2xl font-bold text-gray-900">Consultant Information</h2>
                    <div className="flex items-center gap-4">
                        <button className="px-8 py-2 bg-[#5069E5] text-white rounded-lg font-bold hover:bg-[#4054B2] transition-colors shadow-lg shadow-indigo-100">
                            Edit
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 p-2 rounded-full">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Content - 3 Column Layout from Image */}
                <div className="px-10 pb-12 grid grid-cols-1 md:grid-cols-3 gap-16">
                    {/* Column 1 */}
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Consultant Information</h3>
                        <InfoRow label="Consultant Name" value={data.name} />
                        <InfoRow label="Consultant Email" value="vyasnaresh+u11@gmail.com" />
                        <InfoRow label="Client Name" value="Bangladesh" />
                        <InfoRow label="Vendor Name" value="Bangladesh" />
                        <InfoRow label="Employer Name" value="" />
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Consultant Information</h3>
                        <InfoRow label="Start Date" value="Sep-11-2024" />
                        <InfoRow label="End Date" value="Dec-07-2025" />
                        <InfoRow label="Employer Phone" value="" />
                        <InfoRow label="Address" value="" />
                        <InfoRow label="Account Manager Name" value="ACM1 NV" />
                        <InfoRow label="BD Manager Name" value="not available" />
                        <InfoRow label="Recruiter Name" value="recruiter 1 NV" />
                    </div>

                    {/* Column 3 */}
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Consultant Information</h3>
                        <InfoRow label="Client Rate" value="50.0" />
                        <InfoRow label="Consultant Rate" value="0.0" />
                        <InfoRow label="W2" value="30.0" />
                        <InfoRow label="ptax" value="15.0%" />
                        <InfoRow label="Account Manager Commision" value="1.0 Fix" />
                        <InfoRow label="BD Commission" value="1.0 Fix" />
                        <InfoRow label="Recruiter Commision" value="1.0 Fix" />
                        <InfoRow label="C2C Other" value="1.0 Fix" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function HoursDashboard() {
    const [selectedYear, setSelectedYear] = useState("2025");
    const [selectedUser, setSelectedUser] = useState("User 11 NV");
    const [selectedClient, setSelectedClient] = useState("Bangladesh");

    const [revenueFilter, setRevenueFilter] = useState("Monthly");
    const [salesFilter, setSalesFilter] = useState("Monthly");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedConsultant, setSelectedConsultant] = useState(null);
    const filterOptions = ["Monthly", "Weekly", "Yearly"];

    const years = Array.from({ length: 16 }, (_, i) => (2020 + i).toString());
    const users = ["User 11 NV", "User 12 NV", "User 13 NV", "John Doe", "Jane Smith"];
    const clients = ["Bangladesh", "USA", "UK", "Canada", "Germany"];

    // Dynamic date data for the header circle
    const today = new Date();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'short' });
    const monthName = today.toLocaleDateString('en-US', { month: 'long' });
    const dayNumber = today.getDate();

    return (
        <div className="w-full pb-10 font-['Inter',_sans-serif] min-h-screen">
            {/* Header Section - Replicated from Consultant Dashboard */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 px-2">
                <div className="flex items-center gap-6">
                    {/* Date Circle */}
                    <div className="w-[100px] h-[100px] rounded-full border border-blue-50 bg-white flex items-center justify-center shadow-sm">
                        <span className="text-[32px] font-black text-[#0F172A]">{dayNumber}</span>
                    </div>
                    <div>
                        <h1 className="text-[20px] font-black text-[#0F172A] leading-tight">{dayName}</h1>
                        <p className="text-[#64748B] text-base font-medium">{monthName}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <ConsultantFilterDropdown
                        label="Select Year"
                        value={selectedYear}
                        options={years}
                        onSelect={setSelectedYear}
                    />
                    <ConsultantFilterDropdown
                        label="Select User"
                        value={selectedUser}
                        options={users}
                        onSelect={setSelectedUser}
                    />
                    <ConsultantFilterDropdown
                        label="Select Client"
                        value={selectedClient}
                        options={clients}
                        onSelect={setSelectedClient}
                    />
                </div>
            </div>

            {/* Main Content Grid - Replicated from Consultant Dashboard */}
            <div className="px-2 grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                {/* Hours Analysis Bar Chart - Replicated Bar Chart Pattern */}
                <div className="lg:col-span-3 bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-bold text-[#374151]">Hours Analytics</h3>
                        <SimpleDropdown
                            value={revenueFilter}
                            options={filterOptions}
                            onSelect={setRevenueFilter}
                        />
                    </div>

                    <div className="flex-1 h-[340px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={consultantChartData}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                barSize={40}
                            >
                                <CartesianGrid
                                    strokeDasharray="0"
                                    stroke="#F3F4F6"
                                    horizontal={true}
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: "#6B7280", fontSize: 13, fontWeight: 500 }}
                                    dy={15}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: "#6B7280", fontSize: 13, fontWeight: 500 }}
                                    domain={[0, 100]}
                                    ticks={[0, 20, 40, 60, 80, 100]}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar
                                    dataKey="w2"
                                    stackId="a"
                                    fill="#DDE2FF"
                                    radius={[0, 0, 0, 0]}
                                />
                                <Bar
                                    dataKey="c2c"
                                    stackId="a"
                                    fill="#F87171"
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex justify-center gap-10 mt-10">
                        <div className="flex items-center gap-3">
                            <span className="text-[15px] font-bold text-[#374151]">Billable</span>
                            <div className="w-4 h-4 bg-[#DDE2FF] rounded-md"></div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[15px] font-bold text-[#374151]">Non-billable</span>
                            <div className="w-4 h-4 bg-[#F87171] rounded-md"></div>
                        </div>
                    </div>
                </div>

                {/* Timesheet Status Pie Chart - Replicated Pie Chart Pattern */}
                <div className="lg:col-span-2 bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-[#0F172A]">Timesheet Breakdown</h2>
                        <SimpleDropdown
                            value={salesFilter}
                            options={filterOptions}
                            onSelect={setSalesFilter}
                        />
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="w-[320px] h-[320px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={timeSheetAnalyticsData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={0}
                                        outerRadius={150}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {timeSheetAnalyticsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Custom Legend */}
                        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 mt-8">
                            {timeSheetAnalyticsData.map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div
                                        className="w-5 h-5 rounded-md"
                                        style={{ backgroundColor: item.color }}
                                    ></div>
                                    <span className="text-[17px] font-medium text-[#4B5563]">{item.name}</span>
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 1.5L6.5 5L3 8.5" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hours Detailed Table - Replicated Table Pattern */}
            <div className="px-2 mt-12">
                <div className="flex flex-col gap-6 mb-8 px-2">
                    <div className="flex items-center gap-3">
                        <button className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-[#374151] hover:bg-gray-50 transition-colors shadow-sm">
                            Excel
                        </button>
                        <button className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-[#374151] hover:bg-gray-50 transition-colors shadow-sm">
                            PDF
                        </button>
                    </div>
                    <h2 className="text-[20px] font-black text-[#0F172A]">Detailed Hours Log</h2>
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <ReusableTable
                        columns={timesheetColumns}
                        data={timesheetData}
                        itemsPerPage={10}
                        showPagination={true}
                        headerBgColor="bg-[#F1F5FF]"
                        stripedRows={false}
                        tableClassName="text-[15px]"
                        onRowClick={(row) => {
                            setSelectedConsultant(row);
                            setIsModalOpen(true);
                        }}
                    />
                </div>
            </div>

            <ConsultantDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedConsultant}
            />
        </div>
    );
}
