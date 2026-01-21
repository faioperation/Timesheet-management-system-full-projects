import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaMinus } from 'react-icons/fa';
import ReusableTable from '../../components/ReusableTable';
import { apiFetch } from '../../libs/apiFetch';
import { toast } from 'react-toastify';

export default function CompanyView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('access_plan');
    const [isLoading, setIsLoading] = useState(true);
    const [companyData, setCompanyData] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        email: '',
        phone: '',
        ownerName: '',
        slug: '',
    });

    const [accessPlanData, setAccessPlanData] = useState([
        { id: 1, feature: 'User can login', key: 'user_can_login', status: false },
        { id: 2, feature: 'Commission', key: 'commission', status: false },
        { id: 3, feature: 'Template can add', key: 'template_can_add', status: false },
        { id: 4, feature: 'QB integration', key: 'qb_integration', status: false },
    ]);

    const [userLimit, setUserLimit] = useState(0);
    const [companyUsers, setCompanyUsers] = useState([]);

    // Fetch company data on component mount
    useEffect(() => {
        fetchCompanyData();
    }, [id]);

    const fetchCompanyData = async () => {
        setIsLoading(true);
        try {
            const response = await apiFetch(`/business/${id}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch company data');
            }

            const result = await response.json();

            if (result.data) {
                const business = result.data;

                // Set form data
                setFormData({
                    name: business.name || '',
                    address: business.address || '',
                    email: business.email || '',
                    phone: business.phone || '',
                    ownerName: business.owner?.name || '',
                    slug: business.slug || '',
                });

                // Set access plan data from permissions
                if (business.permission) {
                    setAccessPlanData([
                        { id: 1, feature: 'User can login', key: 'user_can_login', status: !!business.permission.user_can_login },
                        { id: 2, feature: 'Commission', key: 'commission', status: !!business.permission.commission },
                        { id: 3, feature: 'Template can add', key: 'template_can_add', status: !!business.permission.template_can_add },
                        { id: 4, feature: 'QB integration', key: 'qb_integration', status: !!business.permission.qb_integration },
                    ]);
                    setUserLimit(business.permission.user_limit || 0);
                }

                // Set company users
                if (business.users && Array.isArray(business.users)) {
                    setCompanyUsers(business.users.map(user => ({
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role || 'N/A',
                    })));
                }

                setCompanyData(business);
            }

        } catch (error) {
            console.error('Error fetching company data:', error);
            toast.error('Failed to load company data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = (id) => {
        setAccessPlanData(prev => prev.map(item =>
            item.id === id ? { ...item, status: !item.status } : item
        ));
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const userColumns = [
        { key: 'no', label: 'No', className: 'text-left', render: (_, index) => index + 1 },
        { key: 'name', label: 'Name', className: 'text-left' },
        { key: 'email', label: 'Email', className: 'text-left' },
        { key: 'role', label: 'Role', className: 'text-left' },
    ];

    return (
        <div className="w-full pb-10">
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-[#5069E5]/20 border-t-[#5069E5] rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500 text-sm">Loading company data...</p>
                    </div>
                </div>
            ) : (
                <div className="bg-[#F8FAFC] min-h-screen p-8 rounded-2xl">
                    {/* Basic Info Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Company Name<span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#5069E5]"
                                placeholder="Enter Company Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Email<span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#5069E5]"
                                placeholder="Company Email"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Phone<span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#5069E5]"
                                placeholder="Phone Number"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Owner Name</label>
                            <input
                                type="text"
                                value={formData.ownerName}
                                disabled
                                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm cursor-not-allowed"
                                placeholder="Owner Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-[#5069E5]"
                                placeholder="Address"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Slug</label>
                            <input
                                type="text"
                                value={formData.slug}
                                disabled
                                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm cursor-not-allowed"
                                placeholder="Slug"
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
            )}

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
