import React, { useState, useEffect, useRef } from "react";
import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { IoWalletOutline } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { apiFetch } from "../../libs/apiFetch";
import ReusableTable from "../../components/ReusableTable";

const COLORS = ["#E5D416", "#D9DFFF", "#58CC02", "#5069E5", "#555659", "#F46B6A"];

const reportColumns = [
    { key: "no", label: "No", className: "text-left w-16" },
    { key: "name", label: "Name/Customer", className: "text-left font-semibold" },
    { key: "totalHours", label: "Total Hours", className: "text-center" },
    { key: "revenue", label: "Revenue", className: "text-center" },
    { key: "gMargin", label: "G.Margin", className: "text-center" },
    { key: "totalCommission", label: "Commission", className: "text-center" },
    { key: "nMargin", label: "N.Margin", className: "text-center font-bold text-[#5069E5]" },
    { key: "action", label: "Action", className: "text-center w-24" },
];

const FilterDropdown = ({ label, value, options, onSelect }) => {
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
        <div className="flex flex-col gap-1 relative" ref={dropdownRef}>
            <span className="text-[12px] font-semibold text-gray-800">{label}</span>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="bg-[#E0E7FF] px-4 py-2.5 rounded-lg flex items-center justify-between gap-3 min-w-[140px] cursor-pointer hover:bg-[#D1D5DB]/30 transition-colors"
            >
                <span className="text-[#374151] font-medium text-sm truncate max-w-[120px]">
                    {value}
                </span>
                <IoMdArrowDropdown className="text-gray-600 flex-shrink-0" size={18} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
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

    const SummaryCard = ({ label, value, colorClass = "text-[#0F172A]" }) => (
        <div className="bg-[#F8FAFF] rounded-2xl p-5 border border-gray-100/50 flex flex-col gap-1 shadow-sm">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
            <span className={`text-xl font-black ${colorClass}`}>{value}</span>
        </div>
    );

    const InfoRow = ({ label, value }) => (
        <div className="flex items-center py-2.5 border-b border-gray-50 last:border-0 min-h-[46px]">
            <span className="text-[13px] text-gray-500 w-[170px] flex-shrink-0 font-medium">{label} :</span>
            <span className="text-[14px] font-bold text-[#0F172A]">{value ?? "-"}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-hidden">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[1240px] max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="flex justify-between items-center px-10 py-7 border-b border-gray-100">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-full bg-[#5069E5] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-100">
                            {data.user_info?.name?.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-[22px] font-black text-[#0F172A] tracking-tight">{data.user_info?.name}</h2>
                            <p className="text-gray-400 text-sm font-semibold">{data.user_info?.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-[#F87171] transition-all bg-gray-50 p-2.5 rounded-full hover:bg-red-50">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar overscroll-contain">
                    {/* NEW: Summary Cards Section */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
                        <SummaryCard label="Total Hours" value={data.summary?.total_hours?.toFixed(2)} />
                        <SummaryCard label="Total Revenue" value={`$ ${data.summary?.total_gross_revenue?.toFixed(2)}`} colorClass="text-green-600" />
                        <SummaryCard label="Total Expense" value={`$ ${data.summary?.total_expense?.toFixed(2)}`} colorClass="text-red-500" />
                        <SummaryCard label="Gross Margin" value={`$ ${data.summary?.total_gross_margin?.toFixed(2)}`} />
                        <SummaryCard label="Net Margin" value={`$ ${data.summary?.total_net_margin?.toFixed(2)}`} colorClass="text-[#5069E5]" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
                        {/* Group 1: General Info */}
                        <div className="space-y-1">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-7 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div> General Information
                            </h3>
                            <InfoRow label="Phone" value={data.user_info?.phone} />
                            <InfoRow label="Gender" className="capitalize" value={data.user_info?.gender} />
                            <InfoRow label="Address" value={data.user_info?.address} />
                            <InfoRow label="Status" value={<span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-black uppercase tracking-tighter">{data.user_info?.status}</span>} />
                        </div>

                        {/* Group 2: Assignment */}
                        <div className="space-y-1">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-7 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div> Assignment Details
                            </h3>
                            <InfoRow label="Client" value={data.user_detail?.client?.name} />
                            <InfoRow label="Vendor" value={data.user_detail?.vendor?.name} />
                            <InfoRow label="Account Manager" value={data.user_detail?.account_manager?.name || "N/A"} />
                            <InfoRow label="BD Manager" value={data.user_detail?.bd_manager?.name || "N/A"} />
                            <InfoRow label="Recruiter" value={data.user_detail?.recruiter?.name || "N/A"} />
                        </div>

                        {/* Group 3: Financials */}
                        <div className="space-y-1">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-7 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div> Rates & Commissions
                            </h3>
                            <InfoRow label="Client Rate" value={`$ ${data.user_detail?.client_rate || "0.00"}`} />
                            <InfoRow label="W2 Rate" value={`$ ${data.user_detail?.w2 || "0.00"}`} />
                            <InfoRow label="PTAX" value={`${data.user_detail?.ptax || "0"}%`} />
                            <InfoRow label="Consultant Rate" value={`$ ${data.user_detail?.consultant_rate || "0.00"}`} />
                            <InfoRow label="AM Commission" value={`$ ${data.user_detail?.account_manager_commission || "0.00"}`} />
                            <InfoRow label="BDM Commission" value={`$ ${data.user_detail?.business_development_manager_commission || "0.00"}`} />
                        </div>
                    </div>

                    {/* Timesheet Table Section */}
                    <div>
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div> Timesheet History
                        </h3>
                        <div className="overflow-hidden border border-gray-100 rounded-[20px] shadow-sm">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-[#F8FAFF]">
                                        <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Period</th>
                                        <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Hours</th>
                                        <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross Revenue</th>
                                        <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">G. Margin</th>
                                        <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest font-bold">N. Margin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.timesheets?.map((ts, idx) => (
                                        <tr key={idx} className="border-t border-gray-50 hover:bg-gray-50 transition-colors group">
                                            <td className="px-8 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-bold text-[#0F172A]">{ts.period}</span>
                                                    <span className="text-[10px] text-gray-400 font-semibold tracking-tight">#{ts.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center text-[13px] font-bold text-[#0F172A]">{ts.total_hours?.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-center text-[13px] font-bold text-green-600">$ {ts.revenue?.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-center text-[13px] font-bold text-[#0F172A]">$ {ts.gross_margin?.toFixed(2)}</td>
                                            <td className="px-8 py-4 text-right text-[14px] font-black text-[#5069E5]">$ {ts.net_margin?.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-10 py-6 border-t border-gray-100 flex justify-end">
                    <button onClick={onClose} className="px-8 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function RevenueDashboard() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState("All month");
    const [selectedConsultantType, setSelectedConsultantType] = useState("All");
    const [selectedUser, setSelectedUser] = useState("All user");
    const [users, setUsers] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedConsultant, setSelectedConsultant] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const years = Array.from({ length: 16 }, (_, i) => (2020 + i).toString());
    const months = [
        "All month", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const consultantTypes = ["All", "W2", "C2C"];

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await apiFetch("/users", { method: "GET" });
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && Array.isArray(result.data)) {
                        // Filter to only show users with the 'User' role
                        const filteredUsers = result.data.filter(u => 
                            u.roles && u.roles.some(role => role.name === 'User')
                        );
                        console.log('=== FETCHED USERS FROM API ===');
                        console.table(filteredUsers.map(u => ({id: u.id, name: u.name, email: u.email, business_id: u.business_id})));
                        setUsers(filteredUsers);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (selectedYear) params.append('year', selectedYear);
                if (selectedMonth !== "All month") {
                    const monthIdx = months.indexOf(selectedMonth); // index 0 is "All month", so Jan is 1
                    params.append('month', `${selectedYear}-${monthIdx < 10 ? '0' : ''}${monthIdx}`);
                }
                if (selectedConsultantType !== "All") params.append('consultant_type', selectedConsultantType);
                if (selectedUser !== "All user") {
                    const user = users.find(u => u.name === selectedUser);
                    console.log('Selected User:', selectedUser);
                    console.log('Found User Object:', user);
                    if (user) {
                        console.log('Appending user_id:', user.id);
                        params.append('user_id', user.id);
                    }
                }

                const response = await apiFetch(`/revenue/dashboard-data?${params.toString()}`, { method: "GET" });
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        setDashboardData(result.data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [selectedYear, selectedMonth, selectedConsultantType, selectedUser, users]);

    // Prepare pie data from summary (show zeros if no data)
    const pieData = dashboardData ? [
        { name: "Gross revenue", value: dashboardData.summary.total_gross_revenue || 0 },
        { name: "Revenue", value: dashboardData.summary.total_net_margin || 0 },
        { name: "Gross margin", value: dashboardData.summary.total_gross_margin || 0 },
        { name: "Net margin", value: dashboardData.summary.total_net_margin || 0 },
        { name: "Commission", value: dashboardData.summary.total_commission || 0 },
    ] : [
        { name: "Gross revenue", value: 0 },
        { name: "Revenue", value: 0 },
        { name: "Gross margin", value: 0 },
        { name: "Net margin", value: 0 },
        { name: "Commission", value: 0 },
    ];

    // Dynamic date for header
    const currentDate = new Date();
    const day = currentDate.getDate();
    const dayName = currentDate.toLocaleDateString("en-US", { weekday: "short" }) + ",";
    const monthName = currentDate.toLocaleDateString("en-US", { month: "long" });

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "Approved":
                return "bg-green-100 text-green-800 border-green-200";
            case "Pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200 border-dashed";
            case "Reject":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <div className={`w-full pb-10 min-h-screen ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Header Section - EXACT IMAGE MATCH */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 px-2">
                {/* Left Side: Date Circle and Text */}
                <div className="flex items-center gap-6">
                    <div className="w-[100px] h-[100px] rounded-full bg-white border border-[#5069E5]/10 shadow-[0_0_15px_rgba(80,105,229,0.05)] flex items-center justify-center">
                        <span className="text-[32px] font-black text-[#0F172A]">{day}</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-[#0F172A] leading-tight">{dayName}</h1>
                        <p className="text-[#64748B] text-base font-medium">{monthName}</p>
                    </div>
                </div>

                {/* Right Side: Filters */}
                <div className="flex flex-wrap items-center gap-4">
                    <FilterDropdown
                        label="Select Year"
                        value={selectedYear}
                        options={years}
                        onSelect={setSelectedYear}
                    />
                    <FilterDropdown
                        label="Month"
                        value={selectedMonth}
                        options={months}
                        onSelect={setSelectedMonth}
                    />
                    <FilterDropdown
                        label="Consultant type"
                        value={selectedConsultantType}
                        options={consultantTypes}
                        onSelect={setSelectedConsultantType}
                    />
                    <FilterDropdown
                        label="User"
                        value={selectedUser}
                        options={["All user", ...users.map(u => u.name)]}
                        onSelect={setSelectedUser}
                    />
                </div>
            </div>

            {/* Main Content Grid - 60/40 Split */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                {/* Revenue Analysis Area Chart - 60% Width */}
                <div className="lg:col-span-3 bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-bold text-[#0F172A]">Revenue</h3>
                    </div>

                    <div className="flex-1 h-[340px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={dashboardData?.chart || []}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#5069E5" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#5069E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="0"
                                    stroke="#E2E8F0"
                                    horizontal={true}
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="label"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: "#64748B", fontSize: 13, fontWeight: 500 }}
                                    dy={15}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }}
                                    tickFormatter={(value) => value === 0 ? "0" : `$ ${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#5069E5', strokeWidth: 1 }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#5069E5"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    stroke="#EAB308"
                                    strokeWidth={2}
                                    fillOpacity={0.1}
                                    fill="#EAB308"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex justify-center gap-8 mt-10">
                        <div className="flex items-center gap-2.5">
                            <div className="w-3 h-3 bg-[#5069E5] rounded-full"></div>
                            <span className="text-sm text-[#0F172A] font-bold">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-3 h-3 bg-[#EAB308] rounded-full"></div>
                            <span className="text-sm text-gray-500 font-medium">Expense</span>
                        </div>
                    </div>
                </div>

                {/* Sales Analytics Section - 40% Width - EXACT IMAGE MATCH */}
                <div className="lg:col-span-2 bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-[#0F172A]">Sales analytics</h2>
                    </div>

                    {/* Total Expense Card */}
                    <div className="bg-[#F8FAFF] rounded-2xl p-6 flex flex-col gap-3 mb-10 border border-blue-50/50">
                        <div className="flex items-center gap-2 text-gray-500">
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                                <IoWalletOutline className="text-[#F87171] text-xl" />
                            </div>
                            <span className="font-semibold text-sm">Total expense</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="text-[42px] font-black text-[#0F172A] leading-none">$ {dashboardData?.summary?.total_expense?.toFixed(2) || '0.00'}</p>
                            <div className="flex items-center gap-1 text-[#4ADE80] text-lg font-bold">
                                <IoMdArrowDropup className="text-2xl" />
                                <span>12%</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
                        {/* Colored labels list */}
                        <div className="flex flex-col gap-6 w-full xl:w-auto">
                            {[
                                { name: "Gross revenue", color: "#F87171", value: dashboardData?.summary?.total_gross_revenue || 0 },
                                { name: "Revenue", color: "#9CA3AF", value: dashboardData?.summary?.total_net_margin || 0 },
                                { name: "Gross margin", color: "#A5B4FC", value: dashboardData?.summary?.total_gross_margin || 0 },
                                { name: "Net margin", color: "#A3E635", value: dashboardData?.summary?.total_net_margin || 0 },
                                { name: "Commission", color: "#FDE047", value: dashboardData?.summary?.total_commission || 0 },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col">
                                    <span
                                        style={{ color: item.color }}
                                        className="text-[17px] font-bold"
                                    >
                                        {item.name}
                                    </span>
                                    <span className="text-[14px] font-medium text-gray-400">
                                        $ {item.value >= 1000 ? (item.value/1000).toFixed(1) + 'k' : item.value.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Donut Chart */}
                        <div className="w-[260px] h-[260px] flex-shrink-0 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={95}
                                        outerRadius={125}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">TOTAL</span>
                                <span className="text-2xl font-black text-[#0F172A]">
                                    {dashboardData?.summary?.total_gross_revenue >= 1000 ? (dashboardData.summary.total_gross_revenue/1000).toFixed(1) + 'k' : (dashboardData?.summary?.total_gross_revenue?.toFixed(2) || '0.00')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Report Table - EXACT IMAGE MATCH */}
            <div className="mt-8">
                {/* Table Header Controls */}
                <div className="flex justify-end items-center mb-6 px-2">
                    <div className="relative w-[300px]">
                        <input
                            type="text"
                            placeholder="Search by name or email"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5069E5] focus:ring-1 focus:ring-[#5069E5]/20 transition-all font-medium"
                        />
                        <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                </div>

                {/* Simplified Table View */}
                <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
                    <ReusableTable
                        columns={reportColumns}
                        data={dashboardData?.table
                            ?.filter(group => {
                                const search = searchTerm.toLowerCase();
                                return (
                                    group.user_info?.name?.toLowerCase().includes(search) ||
                                    group.user_info?.email?.toLowerCase().includes(search)
                                );
                            })
                            ?.map((group, i) => ({
                            no: i + 1,
                            name: (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#E0E7FF] text-[#5069E5] flex items-center justify-center font-bold text-xs">
                                        {group.user_info?.name?.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-[#0F172A]">{group.user_info?.name}</span>
                                        <span className="text-[10px] text-gray-400 font-medium">{group.user_info?.email}</span>
                                    </div>
                                </div>
                            ),
                            totalHours: group.summary?.total_hours?.toFixed(2),
                            revenue: `$ ${group.summary?.total_gross_revenue?.toFixed(2)}`,
                            gMargin: `$ ${group.summary?.total_gross_margin?.toFixed(2)}`,
                            totalCommission: `$ ${group.summary?.total_commission?.toFixed(2)}`,
                            nMargin: `$ ${group.summary?.total_net_margin?.toFixed(2)}`,
                            action: (
                                <button
                                    onClick={() => {
                                        setSelectedConsultant(group);
                                        setIsModalOpen(true);
                                    }}
                                    className="px-4 py-1.5 bg-[#E0E7FF] text-[#5069E5] rounded-lg text-xs font-black hover:bg-[#5069E5] hover:text-white transition-all"
                                >
                                    View
                                </button>
                            )
                        })) || []}
                        headerBgColor="bg-gray-50/50"
                        itemsPerPage={10}
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
