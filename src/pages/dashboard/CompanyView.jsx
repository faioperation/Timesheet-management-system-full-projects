import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaMinus } from 'react-icons/fa';
import ReusableTable from '../../components/ReusableTable';

export default function CompanyView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('access_plan');
    const [userLimit, setUserLimit] = useState(25);

    const [formData, setFormData] = useState({
        name: 'Naresh Vyas', // Mock data
        address: 'Lake Evan',
        folder: 'company_folder_01',
        details: 'Details about the company',
    });

    const [accessPlanData, setAccessPlanData] = useState([
        { id: 1, feature: 'User can login', status: false },
        { id: 2, feature: 'Commission', status: true },
        { id: 3, feature: 'Template can add', status: false },
        { id: 4, feature: 'QB integration', status: true },
    ]);

    const handleToggle = (id) => {
        setAccessPlanData(prev => prev.map(item =>
            item.id === id ? { ...item, status: !item.status } : item
        ));
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const companyUsers = [
        { id: 1, name: 'Flores, Juanita', email: 'jessica.hanson@example.com', role: 'Admin' },
        { id: 2, name: 'Nguyen, Shane', email: 'bill.sanders@example.com', role: 'Lake Evan' },
    ];

    const userColumns = [
        { key: 'no', label: 'No', className: 'text-left', render: (_, index) => index + 1 },
        { key: 'name', label: 'Name', className: 'text-left' },
        { key: 'email', label: 'Email', className: 'text-left' },
        { key: 'role', label: 'Role', className: 'text-left' },
    ];

    return (
        <div className="w-full pb-10">
            <div className="bg-[#F8FAFC] min-h-screen p-8 rounded-2xl">
                {/* Basic Info Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Name<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#5069E5]"
                            placeholder="Enter Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Address<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#5069E5]"
                            placeholder="Address"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">File Folder<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={formData.folder}
                            onChange={(e) => handleInputChange("folder", e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#5069E5]"
                            placeholder="Enter folder"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Details<span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={formData.details}
                            onChange={(e) => handleInputChange("details", e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#5069E5]"
                            placeholder="Details"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mb-10">
                    <button className="px-10 py-2.5 bg-[#5069E5] text-white rounded-md text-sm font-semibold hover:bg-[#3d52c7] transition-colors">
                        Add user
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-10 py-2.5 bg-[#FFF5F5] text-[#FF5A5A] rounded-md text-sm font-semibold hover:bg-[#FFEAEA] transition-colors"
                    >
                        Cancel
                    </button>
                </div>

                {/* Tabs Container */}
                <div className="mb-6">
                    <div className="inline-flex bg-white rounded-full p-1 border border-gray-100 shadow-sm">
                        <button
                            onClick={() => setActiveTab('access_plan')}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'access_plan'
                                ? 'bg-[#5069E5] text-white'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            Access plan
                        </button>
                        <button
                            onClick={() => setActiveTab('user_list')}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'user_list'
                                ? 'bg-[#5069E5] text-white'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            Company user list
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {activeTab === 'access_plan' ? (
                        <div className="divide-y divide-gray-50">
                            {accessPlanData.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-12 py-5 px-8 items-center hover:bg-gray-50/50 transition-colors">
                                    <div className="col-span-1 text-sm font-bold text-gray-700">{index + 1}</div>
                                    <div className="col-span-3 text-sm font-medium text-gray-600">{item.feature}</div>
                                    <div className="col-span-8 flex justify-start">
                                        <div
                                            onClick={() => handleToggle(item.id)}
                                            className={`flex items-center gap-2 px-1 py-1 rounded-full border cursor-pointer transition-all ${item.status ? 'bg-[#E6F4F1] border-[#1B654A]' : 'bg-[#FEF2F2] border-[#F46B6A]'
                                                }`}>
                                            {!item.status && <div className="w-5 h-5 rounded-full bg-[#FF0000]"></div>}
                                            <span className={`text-xs font-bold px-2 select-none ${item.status ? 'text-[#1B654A]' : 'text-[#FF0000]'}`}>
                                                {item.status ? 'Yes' : 'No'}
                                            </span>
                                            {item.status && <div className="w-5 h-5 rounded-full bg-[#1B654A]"></div>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="grid grid-cols-12 py-5 px-8 items-center hover:bg-gray-50/50 transition-colors">
                                <div className="col-span-1 text-sm font-bold text-gray-700">5</div>
                                <div className="col-span-3 text-sm font-medium text-gray-600">User limit</div>
                                <div className="col-span-8 flex items-center gap-4">
                                    <span className="text-xl font-bold text-gray-800">{userLimit}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setUserLimit(userLimit + 1)}
                                            className="w-6 h-6 rounded flex items-center justify-center border border-[#1B654A] text-[#1B654A] hover:bg-[#E6F4F1] transition-colors"
                                        >
                                            <FaPlus size={10} />
                                        </button>
                                        <button
                                            onClick={() => userLimit > 0 && setUserLimit(userLimit - 1)}
                                            className="w-6 h-6 rounded flex items-center justify-center border border-[#F46B6A] text-[#F46B6A] hover:bg-[#FEF2F2] transition-colors"
                                        >
                                            <FaMinus size={10} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <ReusableTable
                            columns={userColumns}
                            data={companyUsers}
                            showPagination={false}
                            stripedRows={false}
                            headerBgColor="bg-transparent"
                            tableClassName="company-user-table"
                        />
                    )}
                </div>
            </div>

            <style jsx="true">{`
        .company-user-table table thead tr th {
          border-bottom: 1px solid #F1F5F9;
          font-weight: 600;
          color: #64748B;
          text-transform: none;
          font-size: 0.875rem;
          padding: 1.25rem 2rem;
        }
        .company-user-table table tbody tr td {
          padding: 1.5rem 2rem;
          color: #334155;
          font-size: 0.875rem;
          border-bottom: 1px solid #F1F5F9;
          background-color: transparent !important;
        }
        .company-user-table table tbody tr:last-child td {
          border-bottom: none;
        }
      `}</style>
        </div>
    );
}
