import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiAlertCircle } from 'react-icons/fi';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { MdOutlineDynamicFeed } from 'react-icons/md';
import ReusableTable from '../../components/ReusableTable';
import { apiFetch } from '../../libs/apiFetch';
import { toast } from 'react-toastify';

export default function CompanyList() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [companyData, setCompanyData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBusinessData();
    }, []);

    const fetchBusinessData = async () => {
        setIsLoading(true);
        try {
            const response = await apiFetch('/business', {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch business data');
            }

            const result = await response.json();

            if (result.data) {
                // Transform data to match table structure
                const transformedData = result.data.map(business => ({
                    id: business.id,
                    name: business.name, // Company name
                    email: business.email, // Company email (non-editable by company)
                    phone: business.phone,
                    ownerName: business.owner?.name || 'N/A', // Owner name from data.owner.name
                    status: business.status,
                    // Keep original data for reference
                    owner: business.owner,
                    permission: business.permission,
                    users: business.users
                }));
                return setCompanyData(transformedData);
            }

        } catch (error) {
            console.error('Error fetching business data:', error);
            toast.error('Failed to load company data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleActive = async (id) => {
        const company = companyData.find(item => item.id === id);
        if (!company) {
            console.error('Company not found:', id);
            return;
        }

        const currentStatus = company.status?.toLowerCase();
        const newActiveState = currentStatus !== 'active';
        const statusValue = newActiveState ? 'active' : 'inactive';

        console.log('Toggling business:', { id, currentState: company.status, newState: statusValue });

        // Optimistically update UI
        setCompanyData(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, status: statusValue };
            }
            return item;
        }));

        try {
            const response = await apiFetch(`/business/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: statusValue,
                }),
            });

            console.log('API Response status:', response.status);

            // Parse response
            const result = await response.json().catch(() => ({}));
            console.log('API Response data:', result);

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update status');
            }

            toast.success(`Business status updated to ${statusValue}`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.message || 'Failed to update status');
            // Revert on error
            setCompanyData(prev => prev.map(item => {
                if (item.id === id) {
                    return { ...item, status: company.status };
                }
                return item;
            }));
        }
    };

    const columns = [
        { key: 'no', label: 'No', className: 'text-left font-medium', render: (_, index) => index + 1 },
        {
            key: 'name',
            label: 'Company Name',
            className: 'text-left',
            render: (row) => (
                <span className="font-medium text-gray-900">{row.name}</span>
            )
        },
        {
            key: 'email',
            label: 'Email',
            className: 'text-left',
            render: (row) => (
                <span className="text-gray-700 text-sm">{row.email}</span>
            )
        },
        {
            key: 'phone',
            label: 'Phone',
            className: 'text-left',
            render: (row) => (
                <span className="text-gray-700 text-sm">{row.phone}</span>
            )
        },
        {
            key: 'ownerName',
            label: 'Owner Name',
            className: 'text-left',
            render: (row) => (
                <span className="text-gray-700 text-sm">{row.ownerName}</span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            className: 'text-left',
            render: (row) => (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.status === 'Verified'
                    ? 'bg-[#E6F4F1] text-[#1B654A]'
                    : 'bg-[#FFF2E6] text-[#F97316]'
                    }`}>
                    {row.status}
                </span>
            ),
        },
        {
            key: 'action',
            label: 'Action',
            className: 'text-left',
            render: (row) => {
                const is_active_state = row.status?.toLowerCase() === 'active';

                return (
                    <div className="flex items-center gap-3">
                        {/* Toggle Switch */}
                        <div
                            onClick={() => handleToggleActive(row.id)}
                            className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${is_active_state ? 'bg-[#1B654A]' : 'bg-gray-300'}`}
                            title={is_active_state ? 'Active' : 'Inactive'}
                        >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${is_active_state ? 'left-6' : 'left-1'}`}></div>
                        </div>

                        {/* View/Update Button */}
                        <button
                            onClick={() => navigate(`/dashboard/company/view/${row.id}`)}
                            className="px-4 py-1.5 bg-[#5069E5] text-white rounded-lg text-xs font-semibold hover:bg-[#3d52c7] transition-colors"
                        >
                            View/Update
                        </button>
                    </div>
                );
            },
        },
    ];

    const filteredData = companyData.filter(company =>
        company.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.ownerName?.toLowerCase().includes(searchQuery.toLowerCase())
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
                        placeholder="Search by name, email, phone, or owner..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5069E5]/20 focus:border-[#5069E5] text-sm shadow-sm transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-[#5069E5]/20 border-t-[#5069E5] rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500 text-sm">Loading company data...</p>
                        </div>
                    </div>
                ) : companyData.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <FiAlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-sm">No companies found</p>
                        </div>
                    </div>
                ) : (
                    <ReusableTable
                        columns={columns}
                        data={filteredData}
                        itemsPerPage={7}
                        showPagination={true}
                        headerBgColor="bg-[#F8FAFC]"
                        stripedRows={false}
                        tableClassName="company-list-table"
                    />
                )}
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
