import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { FaPlus, FaMinus } from 'react-icons/fa';
import ReusableTable from '../../components/ReusableTable';
import { apiFetch } from '../../libs/apiFetch';
import { toast } from 'react-toastify';

export default function CompanyView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('access_plan');
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [companyData, setCompanyData] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        email: '',
        phone: '',
        ownerName: '',
        slug: '',
    });

    // Store original data for comparison
    const [originalData, setOriginalData] = useState({
        formData: {},
        accessPlanData: [],
        userLimit: 0,
    });

    const [accessPlanData, setAccessPlanData] = useState([
        { id: 1, feature: 'User can login', key: 'user_can_login', status: false },
        { id: 2, feature: 'Commission', key: 'commission', status: false },
        { id: 3, feature: 'Template can add', key: 'template_can_add', status: false },
    ]);

    const [userLimit, setUserLimit] = useState(0);
    const [companyUsers, setCompanyUsers] = useState([]);

    // Track if form has changes
    const [hasChanges, setHasChanges] = useState(false);

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
                const initialFormData = {
                    name: business.name || '',
                    address: business.address || '',
                    email: business.email || '',
                    phone: business.phone || '',
                    ownerName: business.owner?.name || '',
                    slug: business.slug || '',
                };
                setFormData(initialFormData);

                // Set access plan data from permissions
                const initialAccessPlan = [
                    { id: 1, feature: 'User can login', key: 'user_can_login', status: !!business.permission?.user_can_login },
                    { id: 2, feature: 'Commission', key: 'commission', status: !!business.permission?.commission },
                    { id: 3, feature: 'Template can add', key: 'template_can_add', status: !!business.permission?.template_can_add },
                ];
                setAccessPlanData(initialAccessPlan);

                const initialUserLimit = business.permission?.user_limit || 0;
                setUserLimit(initialUserLimit);

                // Store original data for comparison
                setOriginalData({
                    formData: { ...initialFormData },
                    accessPlanData: JSON.parse(JSON.stringify(initialAccessPlan)),
                    userLimit: initialUserLimit,
                });

                // Set company users and fetch role data
                if (business.users && Array.isArray(business.users)) {
                    console.log('Company users from API:', business.users);

                    // Fetch role data for each user
                    const usersWithRoles = await Promise.all(
                        business.users.map(async (user) => {
                            console.log('Processing user:', user);
                            let roleName = 'N/A';

                            // If user has role_id, fetch role details
                            if (user.role_id) {
                                console.log(`Fetching role for user ${user.name} with role_id: ${user.role_id}`);
                                try {
                                    const roleResponse = await apiFetch(`/role/${user.role_id}`, {
                                        method: 'GET',
                                    });

                                    if (roleResponse.ok) {
                                        const roleData = await roleResponse.json();
                                        console.log(`Role data for ${user.name}:`, roleData);
                                        roleName = roleData.data?.name || roleData.name || 'N/A';
                                    } else {
                                        console.error(`Failed to fetch role ${user.role_id}:`, roleResponse.status);
                                    }
                                } catch (error) {
                                    console.error(`Error fetching role for user ${user.id}:`, error);
                                }
                            } else if (user.role?.name) {
                                // Fallback to nested role object if available
                                console.log(`Using nested role.name for ${user.name}:`, user.role.name);
                                roleName = user.role.name;
                            } else if (user.role) {
                                console.log(`Using direct role for ${user.name}:`, user.role);
                                roleName = user.role;
                            } else {
                                console.log(`No role data found for ${user.name}`);
                            }

                            return {
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                phone: user.phone || 'N/A',
                                role: roleName,
                            };
                        })
                    );

                    console.log('Users with roles:', usersWithRoles);
                    setCompanyUsers(usersWithRoles);
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

    // Check if form has changes
    useEffect(() => {
        const formChanged = JSON.stringify(formData) !== JSON.stringify(originalData.formData);
        const accessPlanChanged = JSON.stringify(accessPlanData) !== JSON.stringify(originalData.accessPlanData);
        const userLimitChanged = userLimit !== originalData.userLimit;

        setHasChanges(formChanged || accessPlanChanged || userLimitChanged);
    }, [formData, accessPlanData, userLimit, originalData]);

    // Block navigation when there are unsaved changes
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            hasChanges && currentLocation.pathname !== nextLocation.pathname
    );

    const handleToggle = (id) => {
        setAccessPlanData(prev => prev.map(item =>
            item.id === id ? { ...item, status: !item.status } : item
        ));
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleUserLimitChange = (increment) => {
        if (increment) {
            setUserLimit(prev => prev + 1);
        } else {
            setUserLimit(prev => prev > 0 ? prev - 1 : 0);
        }
    };

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            // Prepare update payload with all fields at root level
            const updatePayload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                user_limit: userLimit,
            };

            // Add each permission as a separate field
            accessPlanData.forEach(item => {
                updatePayload[item.key] = item.status ? 1 : 0;
            });

            console.log('Update Payload:', updatePayload);

            const response = await apiFetch(`/business/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatePayload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update company');
            }

            const result = await response.json();
            console.log('Update Response:', result);
            toast.success('Company updated successfully!');

            // Refresh data and reset change tracking
            await fetchCompanyData();
            setHasChanges(false);

        } catch (error) {
            console.error('Error updating company:', error);
            toast.error(error.message || 'Failed to update company');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = () => {
        if (hasChanges) {
            if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                navigate(-1);
            }
        } else {
            navigate(-1);
        }
    };

    const userColumns = [
        { key: 'no', label: 'No', className: 'text-left', render: (_, index) => index + 1 },
        { key: 'name', label: 'Name', className: 'text-left' },
        { key: 'email', label: 'Email', className: 'text-left' },
        { key: 'phone', label: 'Phone', className: 'text-left' },
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
                            <label className="text-sm font-semibold text-gray-700">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                readOnly
                                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm cursor-not-allowed"
                                placeholder="Company Email"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Phone</label>
                            <input
                                type="text"
                                value={formData.phone}
                                readOnly
                                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm cursor-not-allowed"
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
                                                onClick={() => handleUserLimitChange(true)}
                                                className="w-6 h-6 rounded flex items-center justify-center border border-[#1B654A] text-[#1B654A] hover:bg-[#E6F4F1] transition-colors"
                                            >
                                                <FaPlus size={10} />
                                            </button>
                                            <button
                                                onClick={() => handleUserLimitChange(false)}
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

                    {/* Action Buttons at Bottom */}
                    <div className="flex justify-center gap-4 mt-8">
                        <button
                            onClick={handleUpdate}
                            disabled={isUpdating || !hasChanges}
                            className="px-10 py-2.5 bg-[#10B981] text-white rounded-md text-sm font-semibold hover:bg-[#059669] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? 'Updating...' : 'Update'}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-10 py-2.5 bg-[#FFF5F5] text-[#FF5A5A] rounded-md text-sm font-semibold hover:bg-[#FFEAEA] transition-colors shadow-sm"
                        >
                            Back
                        </button>
                    </div>
                </div >
            )}

            {/* Navigation Blocker Modal */}
            {
                blocker.state === "blocked" && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Unsaved Changes</h3>
                            <p className="text-gray-600 mb-6">
                                You have unsaved changes. Are you sure you want to leave this page?
                            </p>
                            <div className="flex gap-4 justify-end">
                                <button
                                    onClick={() => blocker.reset()}
                                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    Stay
                                </button>
                                <button
                                    onClick={() => blocker.proceed()}
                                    className="px-6 py-2.5 bg-[#FF5A5A] text-white rounded-lg text-sm font-semibold hover:bg-[#E54545] transition-colors"
                                >
                                    Leave
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

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
        </div >
    );
}
