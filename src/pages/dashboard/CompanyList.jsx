import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiAlertCircle } from 'react-icons/fi';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { MdOutlineDynamicFeed } from 'react-icons/md';
import ReusableTable from '../../components/ReusableTable';

export default function CompanyList() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const [companyData, setCompanyData] = useState([
        { id: 1, name: 'Flores, Juanita', address: 'Port Sigmund', status: 'Verify', active: 'active_alert' },
        { id: 2, name: 'Nguyen, Shane', address: 'Lake Evan', status: 'Verify', active: 'active_alert' },
        { id: 3, name: 'Miles, Esther', address: '97607 Josiah Fields', status: 'Verify', active: 'active_alert' },
        { id: 4, name: 'Henry, Arthur', address: '580 Shaniya Viaduct', status: 'Verify', active: 'inactive_alert' },
        { id: 5, name: 'Cooper, Kristin', address: 'North Lloydbury', status: 'Unverified', active: 'alert_action' },
        { id: 6, name: 'Nguyen, Shane', address: '0709 Kub Street', status: 'Unverified', active: 'inactive_action' },
        { id: 7, name: 'Black, Marvin', address: 'North Lloydbury', status: 'Verify', active: 'active_alert' },
    ]);

    const handleToggleActive = (id) => {
        setCompanyData(prev => prev.map(item => {
            if (item.id === id) {
                let nextActive = item.active;
                if (item.active === 'active_alert') nextActive = 'inactive_alert';
                else if (item.active === 'inactive_alert') nextActive = 'active_alert';
                else if (item.active === 'alert_action') nextActive = 'inactive_action';
                else if (item.active === 'inactive_action') nextActive = 'alert_action';
                return { ...item, active: nextActive };
            }
            return item;
        }));
    };

    const columns = [
        { key: 'no', label: 'No', className: 'text-left font-medium', render: (_, index) => index + 1 },
        { key: 'name', label: 'Name', className: 'text-left' },
        { key: 'address', label: 'Address', className: 'text-left' },
        {
            key: 'status',
            label: 'Status',
            className: 'text-left',
            render: (row) => (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.status === 'Verify'
                    ? 'bg-[#E6F4F1] text-[#1B654A]'
                    : 'bg-[#FFF2E6] text-[#F97316]'
                    }`}>
                    {row.status}
                </span>
            ),
        },
        {
            key: 'active',
            label: 'Active',
            className: 'text-left',
            render: (row) => {
                const renderIcon = (type) => {
                    const isActive = type.startsWith('active') || type === 'alert_action';
                    const hasAlert = type.endsWith('alert') || type === 'alert_action' || type === 'inactive_action'; // Adjust mapping logic if needed

                    // Specific mapping based on your previous icon logic:
                    // active_alert -> isActive = true, icon = alert
                    // inactive_alert -> isActive = false, icon = alert
                    // alert_action -> isActive = true, icon = action
                    // inactive_action -> isActive = false, icon = action

                    const is_active_state = type.startsWith('active') || type === 'alert_action';

                    return (
                        <div className="flex items-center justify-center">
                            {/* Toggle Switch */}
                            <div
                                onClick={() => handleToggleActive(row.id)}
                                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${is_active_state ? 'bg-[#1B654A]' : 'bg-gray-300'
                                    }`}
                            >
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${is_active_state ? 'left-6' : 'left-1'
                                    }`}></div>
                            </div>
                        </div>
                    );
                };
                return renderIcon(row.active);
            },
        },
        {
            key: 'action',
            label: 'Action',
            className: 'text-left',
            render: (row) => (
                <button
                    onClick={() => navigate(`/dashboard/company/view/${row.id}`)}
                    className="px-4 py-1.5 bg-[#5069E5] text-white rounded-lg text-xs font-semibold hover:bg-[#3d52c7] transition-colors"
                >
                    View
                </button>
            ),
        },
    ];

    const filteredData = companyData.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full pb-10 px-4 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#1E293B]">Company List</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage and monitor all registered companies</p>
                </div>
                <div className="relative w-full md:w-80 group">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#5069E5] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5069E5]/20 focus:border-[#5069E5] text-sm shadow-sm transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <ReusableTable
                    columns={columns}
                    data={filteredData}
                    itemsPerPage={7}
                    showPagination={true}
                    headerBgColor="bg-[#F8FAFC]"
                    stripedRows={false}
                    tableClassName="company-list-table"
                />
            </div>

            <style jsx="true">{`
        .company-list-table table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .company-list-table table thead tr th {
          background-color: #F8FAFC;
          border-bottom: 2px solid #F1F5F9;
          font-weight: 600;
          color: #64748B;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          padding: 1rem 1.5rem;
        }
        .company-list-table table tbody tr td {
          padding: 1.25rem 1.5rem;
          color: #334155;
          font-size: 0.875rem;
          border-bottom: 1px solid #F1F5F9;
          background-color: transparent !important;
          transition: background-color 0.2s ease;
        }
        .company-list-table table tbody tr:hover td {
          background-color: #F8FAFC !important;
        }
        .company-list-table table tbody tr:last-child td {
          border-bottom: none;
        }
        
        /* Custom scrollbar for table if needed */
        .company-list-table {
          overflow-x: auto;
        }
      `}</style>
        </div>
    );
}
