import React, { useState, useMemo, useEffect } from 'react';
import { FaPlus, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ReusableTable from '../components/ReusableTable';
import AddClientVendorEmployeeModal from '../components/AddClientVendorEmployeeModal';

export default function UserList() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('User');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample client data for Client tab - matching the image
  const clientData = [
    {
      id: 1,
      name: 'Jenny Wilson',
      email: 'jessica.hanson@example.com',
      phone: '(629) 555-0129',
      address: 'Naperville',
      zipCode: '9523',
      remark: 'No Remark',
    },
    {
      id: 2,
      name: 'Courtney Henry',
      email: 'curtis.weaver@example.com',
      phone: '(201) 555-0124',
      address: 'Pembroke Pines',
      zipCode: '1082',
      remark: 'Process',
    },
    {
      id: 3,
      name: 'Leslie Alexander',
      email: 'debbie.baker@example.com',
      phone: '(209) 555-0104',
      address: 'Naperville',
      zipCode: '4300',
      remark: 'Hold',
    },
    {
      id: 4,
      name: 'Marvin McKinney',
      email: 'dolores.chambers@example.com',
      phone: '(308) 555-0121',
      address: 'Fairfield',
      zipCode: '1082',
      remark: 'Discard',
    },
    {
      id: 5,
      name: 'Floyd Miles',
      email: 'michael.mitc@example.com',
      phone: '(302) 555-0107',
      address: 'Austin',
      zipCode: '4300',
      remark: 'Partial Invoice',
    },
    {
      id: 6,
      name: 'Jane Cooper',
      email: 'deanna.curtis@example.com',
      phone: '(702) 555-0122',
      address: 'Fairfield',
      zipCode: '4300',
      remark: 'No Remark',
    },
    {
      id: 7,
      name: 'Cameron Williamson',
      email: 'debra.holt@example.com',
      phone: '(229) 555-0109',
      address: 'Toledo',
      zipCode: '1082',
      remark: 'No Remark',
    },
    {
      id: 8,
      name: 'Kathryn Murphy',
      email: 'sara.cruz@example.com',
      phone: '(270) 555-0117',
      address: 'Orange',
      zipCode: '6800',
      remark: 'Discard',
    },
    {
      id: 9,
      name: 'Eleanor Pena',
      email: 'alma.lawson@example.com',
      phone: '(252) 555-0126',
      address: 'Orange',
      zipCode: '6800',
      remark: 'Hold',
    },
    {
      id: 10,
      name: 'Kristin Watson',
      email: 'michelle.rivera@example.com',
      phone: '(405) 555-0128',
      address: 'Austin',
      zipCode: '6725',
      remark: 'Hold',
    },
    {
      id: 11,
      name: 'Cody Fisher',
      email: 'willie.jennings@example.com',
      phone: '(480) 555-0103',
      address: 'Fairfield',
      zipCode: '6725',
      remark: 'Process',
    },
    {
      id: 12,
      name: 'Dianne Russell',
      email: 'georgia.young@example.com',
      phone: '(219) 555-0114',
      address: 'Orange',
      zipCode: '9523',
      remark: 'Process',
    },
    // Add more data for pagination
    ...Array.from({ length: 238 }, (_, index) => ({
      id: 13 + index,
      name: `Client ${13 + index}`,
      email: `client${13 + index}@example.com`,
      phone: `(${Math.floor(Math.random() * 900) + 100}) 555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      address: ['Naperville', 'Fairfield', 'Austin', 'Orange', 'Toledo', 'Pembroke Pines'][index % 6],
      zipCode: ['9523', '1082', '4300', '6800', '6725'][index % 5],
      remark: ['No Remark', 'Process', 'Hold', 'Discard', 'Partial Invoice'][index % 5],
    })),
  ];

  // Sample vendor data for Vendor tab - same structure as client
  const vendorData = [
    {
      id: 1,
      name: 'Jenny Wilson',
      email: 'jessica.hanson@example.com',
      phone: '(629) 555-0129',
      address: 'Naperville',
      zipCode: '9523',
      remark: 'No Remark',
    },
    {
      id: 2,
      name: 'Courtney Henry',
      email: 'curtis.weaver@example.com',
      phone: '(201) 555-0124',
      address: 'Pembroke Pines',
      zipCode: '1082',
      remark: 'Process',
    },
    {
      id: 3,
      name: 'Leslie Alexander',
      email: 'debbie.baker@example.com',
      phone: '(209) 555-0104',
      address: 'Naperville',
      zipCode: '4300',
      remark: 'Hold',
    },
    {
      id: 4,
      name: 'Marvin McKinney',
      email: 'dolores.chambers@example.com',
      phone: '(308) 555-0121',
      address: 'Fairfield',
      zipCode: '1082',
      remark: 'Discard',
    },
    {
      id: 5,
      name: 'Floyd Miles',
      email: 'michael.mitc@example.com',
      phone: '(302) 555-0107',
      address: 'Austin',
      zipCode: '4300',
      remark: 'Partial Invoice',
    },
    {
      id: 6,
      name: 'Jane Cooper',
      email: 'deanna.curtis@example.com',
      phone: '(702) 555-0122',
      address: 'Fairfield',
      zipCode: '4300',
      remark: 'No Remark',
    },
    {
      id: 7,
      name: 'Cameron Williamson',
      email: 'debra.holt@example.com',
      phone: '(229) 555-0109',
      address: 'Toledo',
      zipCode: '1082',
      remark: 'No Remark',
    },
    {
      id: 8,
      name: 'Kathryn Murphy',
      email: 'sara.cruz@example.com',
      phone: '(270) 555-0117',
      address: 'Orange',
      zipCode: '6800',
      remark: 'Discard',
    },
    {
      id: 9,
      name: 'Eleanor Pena',
      email: 'alma.lawson@example.com',
      phone: '(252) 555-0126',
      address: 'Orange',
      zipCode: '6800',
      remark: 'Hold',
    },
    {
      id: 10,
      name: 'Kristin Watson',
      email: 'michelle.rivera@example.com',
      phone: '(405) 555-0128',
      address: 'Austin',
      zipCode: '6725',
      remark: 'Hold',
    },
    {
      id: 11,
      name: 'Cody Fisher',
      email: 'willie.jennings@example.com',
      phone: '(480) 555-0103',
      address: 'Fairfield',
      zipCode: '6725',
      remark: 'Process',
    },
    {
      id: 12,
      name: 'Dianne Russell',
      email: 'georgia.young@example.com',
      phone: '(219) 555-0114',
      address: 'Orange',
      zipCode: '9523',
      remark: 'Process',
    },
    // Add more data for pagination
    ...Array.from({ length: 238 }, (_, index) => ({
      id: 13 + index,
      name: `Vendor ${13 + index}`,
      email: `vendor${13 + index}@example.com`,
      phone: `(${Math.floor(Math.random() * 900) + 100}) 555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      address: ['Naperville', 'Fairfield', 'Austin', 'Orange', 'Toledo', 'Pembroke Pines'][index % 6],
      zipCode: ['9523', '1082', '4300', '6800', '6725'][index % 5],
      remark: ['No Remark', 'Process', 'Hold', 'Discard', 'Partial Invoice'][index % 5],
    })),
  ];

  // Sample employee data for Employee tab - same structure as client
  const employeeData = [
    {
      id: 1,
      name: 'Jenny Wilson',
      email: 'jessica.hanson@example.com',
      phone: '(629) 555-0129',
      address: 'Naperville',
      zipCode: '9523',
      remark: 'No Remark',
    },
    {
      id: 2,
      name: 'Courtney Henry',
      email: 'curtis.weaver@example.com',
      phone: '(201) 555-0124',
      address: 'Pembroke Pines',
      zipCode: '1082',
      remark: 'Process',
    },
    {
      id: 3,
      name: 'Leslie Alexander',
      email: 'debbie.baker@example.com',
      phone: '(209) 555-0104',
      address: 'Naperville',
      zipCode: '4300',
      remark: 'Hold',
    },
    {
      id: 4,
      name: 'Marvin McKinney',
      email: 'dolores.chambers@example.com',
      phone: '(308) 555-0121',
      address: 'Fairfield',
      zipCode: '1082',
      remark: 'Discard',
    },
    {
      id: 5,
      name: 'Floyd Miles',
      email: 'michael.mitc@example.com',
      phone: '(302) 555-0107',
      address: 'Austin',
      zipCode: '4300',
      remark: 'Partial Invoice',
    },
    {
      id: 6,
      name: 'Jane Cooper',
      email: 'deanna.curtis@example.com',
      phone: '(702) 555-0122',
      address: 'Fairfield',
      zipCode: '4300',
      remark: 'No Remark',
    },
    {
      id: 7,
      name: 'Cameron Williamson',
      email: 'debra.holt@example.com',
      phone: '(229) 555-0109',
      address: 'Toledo',
      zipCode: '1082',
      remark: 'No Remark',
    },
    {
      id: 8,
      name: 'Kathryn Murphy',
      email: 'sara.cruz@example.com',
      phone: '(270) 555-0117',
      address: 'Orange',
      zipCode: '6800',
      remark: 'Discard',
    },
    {
      id: 9,
      name: 'Eleanor Pena',
      email: 'alma.lawson@example.com',
      phone: '(252) 555-0126',
      address: 'Orange',
      zipCode: '6800',
      remark: 'Hold',
    },
    {
      id: 10,
      name: 'Kristin Watson',
      email: 'michelle.rivera@example.com',
      phone: '(405) 555-0128',
      address: 'Austin',
      zipCode: '6725',
      remark: 'Hold',
    },
    {
      id: 11,
      name: 'Cody Fisher',
      email: 'willie.jennings@example.com',
      phone: '(480) 555-0103',
      address: 'Fairfield',
      zipCode: '6725',
      remark: 'Process',
    },
    {
      id: 12,
      name: 'Dianne Russell',
      email: 'georgia.young@example.com',
      phone: '(219) 555-0114',
      address: 'Orange',
      zipCode: '9523',
      remark: 'Process',
    },
    // Add more data for pagination
    ...Array.from({ length: 238 }, (_, index) => ({
      id: 13 + index,
      name: `Employee ${13 + index}`,
      email: `employee${13 + index}@example.com`,
      phone: `(${Math.floor(Math.random() * 900) + 100}) 555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      address: ['Naperville', 'Fairfield', 'Austin', 'Orange', 'Toledo', 'Pembroke Pines'][index % 6],
      zipCode: ['9523', '1082', '4300', '6800', '6725'][index % 5],
      remark: ['No Remark', 'Process', 'Hold', 'Discard', 'Partial Invoice'][index % 5],
    })),
  ];

  // Sample user data matching the image
  const allUsersData = [
    {
      id: 1,
      name: 'Wade Warren',
      email: 'wade.warren@example.com',
      phone: '(307) 555-0133',
      role: 'User',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Kristin Watson',
      email: 'kristin.watson@example.com',
      phone: '(307) 555-0134',
      role: 'User',
      status: 'On vacation',
    },
    {
      id: 3,
      name: 'Jenny Wilson',
      email: 'jenny.wilson@example.com',
      phone: '(307) 555-0135',
      role: 'User',
      status: 'Active',
    },
    {
      id: 4,
      name: 'Dianne Russell',
      email: 'dianne.russell@example.com',
      phone: '(307) 555-0136',
      role: 'Admin',
      status: 'Active',
    },
    {
      id: 5,
      name: 'Leslie Alexander',
      email: 'leslie.alexander@example.com',
      phone: '(307) 555-0137',
      role: 'Supervisor',
      status: 'On vacation',
    },
    {
      id: 6,
      name: 'Ronald Richards',
      email: 'ronald.richards@example.com',
      phone: '(307) 555-0138',
      role: 'Supervisor',
      status: 'Active',
    },
    {
      id: 7,
      name: 'Devon Lane',
      email: 'devon.lane@example.com',
      phone: '(307) 555-0139',
      role: 'Supervisor',
      status: 'Active',
    },
    {
      id: 8,
      name: 'Guy Hawkins',
      email: 'guy.hawkins@example.com',
      phone: '(307) 555-0140',
      role: 'User',
      status: 'On vacation',
    },
    {
      id: 9,
      name: 'Alma Lawson',
      email: 'alma.lawson@example.com',
      phone: '(252) 555-0126',
      role: 'User',
      status: 'Active',
    },
    {
      id: 10,
      name: 'Deanna Curtis',
      email: 'deanna.curtis@example.com',
      phone: '(252) 555-0127',
      role: 'User',
      status: 'Active',
    },
    {
      id: 11,
      name: 'Jane Cooper',
      email: 'jane.cooper@example.com',
      phone: '(252) 555-0128',
      role: 'User',
      status: 'Active',
    },
    {
      id: 12,
      name: 'Robert Fox',
      email: 'robert.fox@example.com',
      phone: '(252) 555-0129',
      role: 'User',
      status: 'Active',
    },
    // Add more data for pagination
    ...Array.from({ length: 238 }, (_, index) => ({
      id: 13 + index,
      name: `User ${13 + index}`,
      email: `user${13 + index}@example.com`,
      phone: `(${Math.floor(Math.random() * 900) + 100}) 555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      role: ['User', 'Admin', 'Supervisor'][index % 3],
      status: index % 4 === 0 ? 'On vacation' : 'Active',
    })),
  ];

  // Filter data based on active filter
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
  }, [activeFilter]);

  useEffect(() => {
    // Reset to first page when filter changes
    setCurrentPage(1);
  }, [activeFilter]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleAddUser = () => {
    // Only open modal for Client, Vendor, Employee tabs
    if (activeFilter === 'Client' || activeFilter === 'Vendor' || activeFilter === 'Employee') {
      setIsModalOpen(true);
    } else {
      // Navigate to add user page for User tab
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
    // Fetch data for the page here if needed
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
        return 'text-red-600'; // Most are red, but can be blue too
      case 'Partial Invoice':
        return 'text-green-600';
      case 'No Remark':
      default:
        return 'text-gray-700';
    }
  };

  // Client columns (when Client tab is active)
  const clientColumns = [
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
      key: 'address',
      label: 'Address',
      className: 'text-left',
    },
    {
      key: 'zipCode',
      label: 'Zip code',
      className: 'text-left',
    },
    {
      key: 'remark',
      label: 'Remark',
      className: 'text-left',
      render: (row) => (
        <span className={`text-sm font-medium ${getRemarkColor(row.remark)}`}>
          {row.remark}
        </span>
      ),
    },
  ];

  // User columns (for User, Vendor, Employee tabs)
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

  // Use different columns based on active filter
  const columns = (activeFilter === 'Client' || activeFilter === 'Vendor' || activeFilter === 'Employee') ? clientColumns : userColumns;

  const filterTabs = ['User', 'Client', 'Vendor', 'Employee'];

  // Get button text based on active filter
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
      {/* Top Section with Filter Tabs and Add User Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Filter Tabs */}
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

        {/* Add Button - Text changes based on active filter */}
        <button
          onClick={handleAddUser}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-medium whitespace-nowrap"
        >
          <FaPlus size={14} />
          {getAddButtonText()}
        </button>
      </div>

      {/* Table */}
      <ReusableTable
        key={activeFilter} // Reset pagination when filter changes
        columns={columns}
        data={filteredData}
        itemsPerPage={10}
        onPageChange={handlePageChange}
        headerBgColor="bg-gray-100"
        stripedRows={true}
      />

      {/* Add Client/Vendor/Employee Modal */}
      <AddClientVendorEmployeeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        type={activeFilter}
      />
    </div>
  );
}

