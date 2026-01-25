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

const salesAnalyticsData = [
    { name: "Gross revenue", value: 350 },
    { name: "Revenue", value: 100 },
    { name: "Gross margin", value: 100 },
    { name: "Net margin", value: 200 },
    { name: "Commission", value: 200 },
    { name: "Others", value: 350 },
];

const COLORS = ["#E5D416", "#D9DFFF", "#58CC02", "#5069E5", "#555659", "#F46B6A"];

const revenueVsExpenseData = [
    { month: "Jan", revenue: 40, expense: 20 },
    { month: "Feb", revenue: 20, expense: 15 },
    { month: "Mar", revenue: 52, expense: 30 },
    { month: "Apr", revenue: 38, expense: 25 },
    { month: "May", revenue: 42, expense: 28 },
    { month: "Jun", revenue: 75, expense: 45 },
    { month: "July", revenue: 98, expense: 55 },
    { month: "Aug", revenue: 52, expense: 35 },
    { month: "Sep", revenue: 68, expense: 40 },
    { month: "Oct", revenue: 35, expense: 25 },
    { month: "Nov", revenue: 92, expense: 50 },
    { month: "Dec", revenue: 60, expense: 35 },
];

const revenueReportData = Array.from({ length: 9 }, (_, i) => ({
    no: i + 1,
    name: "User4 071/vendoe4",
    totalHours: "0.00",
    revenue: "0.00",
    totalExpense: "0.00",
    gMargin: "0.00",
    totalCommission: "0.00",
    nMargin: "0.00",
    acmComm: "0.00",
    recCo: "0.00",
}));

const reportColumns = [
    { key: "no", label: <div className="flex items-center gap-1">No <IoMdArrowDropdown size={14} className="opacity-50" /></div>, className: "text-left w-16" },
    { key: "name", label: <div className="flex items-center gap-1">Name/Customer <IoMdArrowDropdown size={14} className="opacity-50" /></div>, className: "text-left font-semibold" },
    { key: "totalHours", label: <div className="flex items-center justify-center gap-1">Total Hours <IoMdArrowDropdown size={14} className="opacity-50" /></div>, className: "text-center" },
    { key: "revenue", label: <div className="flex items-center justify-center gap-1">Revenue <IoMdArrowDropdown size={14} className="opacity-50" /></div>, className: "text-center" },
    { key: "totalExpense", label: <div className="flex items-center justify-center gap-1">Total Expense <IoMdArrowDropdown size={14} className="opacity-50" /></div>, className: "text-center" },
    { key: "gMargin", label: <div className="flex items-center justify-center gap-1">G.Margin <IoMdArrowDropdown size={14} className="opacity-50" /></div>, className: "text-center" },
    { key: "totalCommission", label: <div className="flex items-center justify-center gap-1">Total Commisision <IoMdArrowDropdown size={14} className="opacity-50" /></div>, className: "text-center" },
    { key: "nMargin", label: <div className="flex items-center justify-center gap-1">N.Margin <IoMdArrowDropdown size={14} className="opacity-50" /></div>, className: "text-center" },
    { key: "acmComm", label: <div className="flex items-center justify-center gap-1">ACM Comm <IoMdArrowDropdown size={14} className="opacity-50" /></div>, className: "text-center" },
    { key: "recCo", label: <div className="flex items-center justify-center gap-1">Rec Co <IoMdArrowDropdown size={14} className="opacity-50" /></div>, className: "text-center" },
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
                    if (user) params.append('user_id', user.id);
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

    // Prepare pie data from summary
    const pieData = dashboardData ? [
        { name: "Gross revenue", value: dashboardData.summary.total_gross_revenue },
        { name: "Revenue", value: dashboardData.summary.total_net_margin },
        { name: "Gross margin", value: dashboardData.summary.total_gross_margin },
        { name: "Net margin", value: dashboardData.summary.total_net_margin },
        { name: "Commission", value: dashboardData.summary.total_commission },
    ] : salesAnalyticsData;

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
                                data={dashboardData ? dashboardData.chart : revenueVsExpenseData}
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
                            <p className="text-[42px] font-black text-[#0F172A] leading-none">$ {dashboardData ? dashboardData.summary.total_expense : '0.00'}</p>
                            <div className="flex items-center gap-1 text-[#4ADE80] text-lg font-bold">
                                <IoMdArrowDropup className="text-2xl" />
                                <span>12%</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
                        {/* Colored labels list */}
                        <div className="flex flex-col gap-6 w-full xl:w-auto">
                            {(dashboardData ? [
                                { name: "Gross revenue", color: "#F87171", value: dashboardData.summary.total_gross_revenue },
                                { name: "Revenue", color: "#9CA3AF", value: dashboardData.summary.total_net_margin },
                                { name: "Gross margin", color: "#A5B4FC", value: dashboardData.summary.total_gross_margin },
                                { name: "Net margin", color: "#A3E635", value: dashboardData.summary.total_net_margin },
                                { name: "Commission", color: "#FDE047", value: dashboardData.summary.total_commission },
                            ] : [
                                { name: "Gross revenue", color: "#F87171" },
                                { name: "Revenue", color: "#9CA3AF" },
                                { name: "Gross margin", color: "#A5B4FC" },
                                { name: "Net margin", color: "#A3E635" },
                                { name: "Commission", color: "#FDE047" },
                            ]).map((item, i) => (
                                <div key={i} className="flex flex-col">
                                    <span
                                        style={{ color: item.color }}
                                        className="text-[17px] font-bold"
                                    >
                                        {item.name}
                                    </span>
                                    {dashboardData && (
                                        <span className="text-[14px] font-medium text-gray-400">
                                            $ {item.value >= 1000 ? (item.value/1000).toFixed(1) + 'k' : item.value}
                                        </span>
                                    )}
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
                                    {dashboardData ? (dashboardData.summary.total_gross_revenue >= 1000 ? (dashboardData.summary.total_gross_revenue/1000).toFixed(1) + 'k' : dashboardData.summary.total_gross_revenue) : '0'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Report Table - EXACT IMAGE MATCH */}
            <div className="mt-8">
                {/* Table Header Controls */}
                <div className="flex justify-between items-center mb-6 px-2">
                    <div className="relative">
                        <button className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-[#5069E5] transition-all">
                            <span>Display all</span>
                            <IoMdArrowDropdown size={18} />
                        </button>
                    </div>

                    <div className="relative w-[300px]">
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#5069E5] focus:ring-1 focus:ring-[#5069E5]/20 transition-all font-medium"
                        />
                        <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                </div>

                {/* Table Component */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                    <ReusableTable
                        columns={[
                            { label: "NO", key: "no", className: "w-16" },
                            { label: "USER/CLIENT", key: "name_customer" },
                            { label: "TOTAL HOURS", key: "total_hours" },
                            { label: "REVENUE", key: "revenue" },
                            { label: "TOTAL EXPENSE", key: "total_expense" },
                            { label: "G.MARGIN", key: "gross_margin" },
                            { label: "TOTAL COMMISSION", key: "total_commission" },
                            { label: "N.MARGIN", key: "net_margin" },
                            { label: "ACM COMM", key: "acm_comm" },
                            { label: "REC CO", key: "rec_co" },
                        ]}
                        data={(dashboardData ? dashboardData.table : []).map((item, index) => ({
                            ...item,
                            no: index + 1,
                            name_customer: (
                                <div className="flex flex-col">
                                    <span className="text-[#0F172A] font-bold text-sm tracking-tight">{item.consultant_name}</span>
                                    <span className="text-gray-400 text-[11px] font-medium">{item.client_name}</span>
                                </div>
                            ),
                            total_hours: <span className="font-bold text-[#0F172A]">{item.total_hours?.toFixed(2) || '0.00'}</span>,
                            revenue: <span className="font-bold text-[#0F172A]">{item.revenue?.toFixed(2) || '0.00'}</span>,
                            total_expense: <span className="font-bold text-[#0F172A]">{item.total_expense?.toFixed(2) || '0.00'}</span>,
                            gross_margin: <span className="font-bold text-[#0F172A]">{item.gross_margin?.toFixed(2) || '0.00'}</span>,
                            total_commission: <span className="font-bold text-[#0F172A]">{item.total_commission?.toFixed(2) || '0.00'}</span>,
                            net_margin: <span className="font-bold text-blue-600">{item.net_margin?.toFixed(2) || '0.00'}</span>,
                            acm_comm: <span className="font-bold text-[#0F172A]">{item.am_commission?.toFixed(2) || '0.00'}</span>,
                            rec_co: <span className="font-bold text-[#0F172A]">{item.rec_commission?.toFixed(2) || '0.00'}</span>,
                        }))}
                        itemsPerPage={10}
                        showPagination={true}
                        headerBgColor="bg-[#F8FAFF]"
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
