import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiAlertCircle } from 'react-icons/fi';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { MdOutlineDynamicFeed } from 'react-icons/md';
import ReusableTable from '../../components/ReusableTable';

export default function CompanyList() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const companyData = [
        { id: 1, name: 'Flores, Juanita', address: 'Port Sigmund', status: 'Verify', active: 'active_alert' },
        { id: 2, name: 'Nguyen, Shane', address: 'Lake Evan', status: 'Verify', active: 'active_alert' },
        { id: 3, name: 'Miles, Esther', address: '97607 Josiah Fields', status: 'Verify', active: 'active_alert' },
        { id: 4, name: 'Henry, Arthur', address: '580 Shaniya Viaduct', status: 'Verify', active: 'inactive_alert' },
        { id: 5, name: 'Cooper, Kristin', address: 'North Lloydbury', status: 'Unverified', active: 'alert_action' },
        { id: 6, name: 'Nguyen, Shane', address: '0709 Kub Street', status: 'Unverified', active: 'inactive_action' },
        { id: 7, name: 'Black, Marvin', address: 'North Lloydbury', status: 'Verify', active: 'active_alert' },
    ];

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
                    switch (type) {
                        case 'active_alert':
                            return (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full border-2 border-[#1B654A] flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#1B654A]"></div>
                                    </div>
                                    <div className="w-5 h-5 rounded-full bg-[#F97316] flex items-center justify-center text-white text-[10px] font-bold">
                                        !
                                    </div>
                                </div>
                            );
                        case 'inactive_alert':
                            return (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full border-2 border-[#F97316] flex items-center justify-center">
                                        {/* Empty or dot? The image shows orange border with dot */}
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></div>
                                    </div>
                                    <div className="w-5 h-5 rounded-full bg-[#F97316] flex items-center justify-center text-white text-[10px] font-bold">
                                        !
                                    </div>
                                </div>
                            );
                        case 'alert_action':
                            return (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-[#F97316] flex items-center justify-center text-white text-[10px] font-bold">
                                        !
                                    </div>
                                    <div className="w-5 h-5 flex items-center justify-center text-[#5069E5]">
                                        <MdOutlineDynamicFeed size={20} />
                                    </div>
                                </div>
                            );
                        case 'inactive_action':
                            return (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full border-2 border-[#F97316] flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></div>
                                    </div>
                                    <div className="w-5 h-5 flex items-center justify-center text-[#5069E5]">
                                        <MdOutlineDynamicFeed size={20} />
                                    </div>
                                </div>
                            );
                        default:
                            return null;
                    }
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
        <div className="w-full pb-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Company List</h2>
                <div className="relative w-64">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search Company"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#5069E5] text-sm"
                    />
                </div>
            </div>

            <div className="bg-[#F8FAFC] rounded-2xl p-6 shadow-sm">
                <ReusableTable
                    columns={columns}
                    data={filteredData}
                    itemsPerPage={7}
                    showPagination={true}
                    headerBgColor="bg-transparent"
                    stripedRows={false}
                    tableClassName="company-list-table"
                />
            </div>

            <style jsx="true">{`
        .company-list-table table thead tr th {
          border-bottom: 1px solid #F1F5F9;
          font-weight: 600;
          color: #64748B;
          text-transform: none;
          font-size: 0.875rem;
        }
        .company-list-table table tbody tr td {
          padding-top: 1.5rem;
          padding-bottom: 1.5rem;
          color: #334155;
          font-size: 0.875rem;
          background-color: transparent !important;
        }
        .company-list-table table tbody tr {
          border-bottom: 1px solid #F1F5F9;
        }
        .company-list-table table tbody tr:last-child {
          border-bottom: none;
        }
      `}</style>
        </div>
    );
}
