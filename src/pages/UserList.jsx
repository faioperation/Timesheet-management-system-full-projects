import React, { useState, useMemo, useEffect } from 'react';
import { FaPlus, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ReusableTable from '../components/ReusableTable';
import AddClientVendorEmployeeModal from '../components/AddClientVendorEmployeeModal';
import { apiFetch } from '../libs/apiFetch';
import { toast } from 'react-toastify';

export default function UserList() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('User');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientData, setClientData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [allUsersData, setAllUsersData] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const handlePartyCreated = async () => {
    // refresh current active tab data after create
    try {
      if (activeFilter === 'Client') {
        const response = await apiFetch('/clients', { method: 'GET' });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const mappedData = result.data.map(item => ({
              id: item.id,
              name: item.name || '',
              phone: item.phone || '',
              address: item.address || '',
              zip_code: item.zip_code || '',
              remarks: item.remarks ?? null,
            }));
            setClientData(mappedData);
          }
        }
      }

      if (activeFilter === 'Vendor') {
        const response = await apiFetch('/vendors', { method: 'GET' });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const mappedData = result.data.map(item => ({
              id: item.id,
              name: item.name || '',
              phone: item.phone || '',
              address: item.address || '',
              zip_code: item.zip_code || '',
              remarks: item.remarks ?? null,
            }));
            setVendorData(mappedData);
          }
        }
      }

      if (activeFilter === 'Employee') {
        const response = await apiFetch('/employees', { method: 'GET' });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const mappedData = result.data.map(item => ({
              id: item.id,
              name: item.name || '',
              phone: item.phone || '',
              address: item.address || '',
              zip_code: item.zip_code || '',
              remarks: item.remarks ?? null,
            }));
            setEmployeeData(mappedData);
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing party list:', error);
      toast.error('Failed to refresh list');
    }
  };

  // Fetch data from API based on active filter
  useEffect(() => {
    const fetchData = async () => {
      setIsFetching(true);
      try {
        if (activeFilter === 'Client') {
          const response = await apiFetch('/clients', {
            method: 'GET',
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const mappedData = result.data.map(item => ({
                id: item.id,
                name: item.name || '',
                phone: item.phone || '',
                address: item.address || '',
                zip_code: item.zip_code || '',
                remarks: item.remarks ?? null,
              }));
              setClientData(mappedData);
            }
          } else {
            throw new Error('Failed to fetch clients');
          }
        } else if (activeFilter === 'Vendor') {
          const response = await apiFetch('/vendors', {
            method: 'GET',
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              // Map API response to match table structure
              const mappedData = result.data.map(item => ({
                id: item.id,
                name: item.name || '',
                phone: item.phone || '',
                address: item.address || '',
                zip_code: item.zip_code || '',
                remarks: item.remarks ?? null,
              }));
              setVendorData(mappedData);
            }
          } else {
            throw new Error('Failed to fetch vendors');
          }
        } else if (activeFilter === 'Employee') {
          const response = await apiFetch('/employees', {
            method: 'GET',
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              // Map API response to match table structure
              const mappedData = result.data.map(item => ({
                id: item.id,
                name: item.name || '',
                phone: item.phone || '',
                address: item.address || '',
                zip_code: item.zip_code || '',
                remarks: item.remarks ?? null,
              }));
              setEmployeeData(mappedData);
            }
          } else {
            throw new Error('Failed to fetch employees');
          }
        } else if (activeFilter === 'User') {
          // Fetch user details assignments
          const response = await apiFetch('/user-details', {
            method: 'GET',
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              // Extract unique user_ids from user-details response
              const userIds = [...new Set(result.data.map(item => item.user_id).filter(Boolean))];
              
              // Fetch user data for each user_id in parallel
              const userDataPromises = userIds.map(async (userId) => {
                try {
                  const userResponse = await apiFetch(`/user/${userId}`, {
                    method: 'GET',
                  });
                  
                  if (userResponse.ok) {
                    const userResult = await userResponse.json();
                    return userResult.success && userResult.data ? userResult.data : null;
                  }
                  return null;
                } catch (error) {
                  console.error(`Error fetching user ${userId}:`, error);
                  return null;
                }
              });

              const userDataArray = await Promise.all(userDataPromises);
              
              // Create a map of user_id to user data for quick lookup
              const userDataMap = {};
              userDataArray.forEach((userData, index) => {
                if (userData) {
                  userDataMap[userIds[index]] = userData;
                }
              });

              // Map user-details data with fetched user data
              const mappedData = result.data.map(item => {
                const userDetailsUser = item.user || {};
                const fetchedUser = userDataMap[item.user_id] || {};
                
                // Use fetched user data if available, otherwise fallback to user-details user data
                const user = Object.keys(fetchedUser).length > 0 ? fetchedUser : userDetailsUser;
                const primaryRole = user.roles && user.roles[0] ? user.roles[0].name : null;

                return {
                  id: item.id,
                  name: user.name || '',
                  email: user.email || '',
                  phone: user.phone || '',
                  role: primaryRole || 'User',
                  status: item.active ? 'Active' : 'Inactive',
                };
              });

              setAllUsersData(mappedData);
            } else {
              setAllUsersData([]);
            }
          } else {
            throw new Error('Failed to fetch user details');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [activeFilter]);


  


  const filteredData = useMemo(() => {
    if (activeFilter === 'Client') {
      return clientData;
    }
    if (activeFilter === 'Vendor') {
      return vendorData;
    }
    if (activeFilter === 'Employee') {
      return employeeData;
    }
    // For User tab, return user data
    return allUsersData;
  }, [activeFilter, clientData, vendorData, employeeData, allUsersData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleAddUser = () => {
    if (activeFilter === 'Client' || activeFilter === 'Vendor' || activeFilter === 'Employee') {
      setIsModalOpen(true);
    } else {
      navigate('/user/add');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleView = (row) => {
    console.log('View clicked for:', row);
    // Navigate to view user page or open modal
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);

  };

  const getRoleClass = (role) => {
    switch (role) {
      case 'Admin':
        return 'text-blue-600';
      case 'Supervisor':
        return 'text-yellow-600';
      default:
        return 'text-gray-700';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'On vacation':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRemarkColor = (remark) => {
    switch (remark) {
      case 'Process':
        return 'text-yellow-600';
      case 'Hold':
        return 'text-red-600';
      case 'Discard':
        return 'text-red-600';
      case 'Partial Invoice':
        return 'text-green-600';
      case 'No Remark':
      default:
        return 'text-gray-700';
    }
  };


  const clientColumns = [
    {
      key: 'name',
      label: 'Name',
      className: 'text-left',
    },
    {
      key: 'phone',
      label: 'Phone',
      className: 'text-left',
    },
    {
      key: 'address',
      label: 'Address',
      className: 'text-left',
    },
    {
      key: 'zip_code',
      label: 'Zip code',
      className: 'text-left',
      render: (row) => row.zip_code || row.zipCode || '-',
    },
    {
      key: 'remark',
      label: 'Remark',
      className: 'text-left',
      render: (row) => {
        const remarkValue = row.remarks ?? row.remark ?? null;
        if (!remarkValue || (typeof remarkValue === 'string' && !remarkValue.trim())) {
          return <span className="text-sm font-medium text-gray-400">-</span>;
        }
        const display = typeof remarkValue === 'string' ? remarkValue.trim() : remarkValue;
        return (
          <span className={`text-sm font-medium ${getRemarkColor(display)}`}>
            {display}
          </span>
        );
      },
    },
  ];


  const userColumns = [
    {
      key: 'name',
      label: 'Name',
      className: 'text-left',
    },
    {
      key: 'email',
      label: 'Email',
      className: 'text-left',
    },
    {
      key: 'phone',
      label: 'Phone',
      className: 'text-left',
    },
    {
      key: 'role',
      label: 'Role',
      className: 'text-left',
      render: (row) => (
        <span className={`text-sm font-medium ${getRoleClass(row.role)}`}>
          {row.role}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      className: 'text-left',
      render: (row) => (
        <span className={`px-3 py-1 inline-flex items-center rounded text-xs font-medium ${getStatusBadgeClass(row.status)}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      className: 'text-left',
      render: (row) => (
        <button
          onClick={() => handleView(row)}
          className="flex items-center gap-1 text-[#5069E5] hover:text-[#3d52c7] font-medium transition-colors"
        >
          <FaEye size={14} />
          <span>View</span>
        </button>
      ),
    },
  ];


  const columns = (activeFilter === 'Client' || activeFilter === 'Vendor' || activeFilter === 'Employee') ? clientColumns : userColumns;

  const filterTabs = ['User', 'Client', 'Vendor', 'Employee'];

  const getAddButtonText = () => {
    switch (activeFilter) {
      case 'User':
        return 'Add User';
      case 'Employee':
        return 'Add Employee';
      case 'Vendor':
        return 'Add Vendor';
      case 'Client':
        return 'Add Client';
      default:
        return 'Add User';
    }
  };

  return (
    <div className="w-full pb-10">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">

        <div className="flex gap-2">
          {filterTabs.map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`
                px-6 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  activeFilter === filter
                    ? 'bg-[#E0E7FF] text-[#5069E5]'
                    : 'bg-white text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {filter}
            </button>
          ))}
        </div>

        <button
          onClick={handleAddUser}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-medium whitespace-nowrap"
        >
          <FaPlus size={14} />
          {getAddButtonText()}
        </button>
      </div>


      {isFetching ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading data...</div>
        </div>
      ) : (
        <ReusableTable
          key={activeFilter}
          columns={columns}
          data={filteredData}
          itemsPerPage={10}
          onPageChange={handlePageChange}
          headerBgColor="bg-gray-100"
          stripedRows={true}
        />
      )}


      <AddClientVendorEmployeeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        type={activeFilter}
        onSuccess={handlePartyCreated}
      />
    </div>
  );
}
