import React, { useState, useEffect } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { FaPlus } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { apiFetch } from '../libs/apiFetch';
import AddClientVendorEmployeeModal from '../components/AddClientVendorEmployeeModal';

export default function AssignClientDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, clientId } = location.state || {};
  const [clients, setClients] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [internalUsers, setInternalUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('Client');
  const [pendingSelectType, setPendingSelectType] = useState(null);
  const [formData, setFormData] = useState({
    invoiceTo: 'Client',
    clientId: clientId || '',
    vendorId: '',
    clientRate: '',
    timesheetPeriod: 'Weekly',
    startDate: '',
    endDate: '',
    recursive: false,
    recursiveMonth: '',
    other: '',
    otherRateType: 'Percentage',
    employeeType: 'W2',
    w2: '',
    payTax: '',
    employeeId: '',
    employeeRate: '',
    accountManager: '',
    accountManagerCommission: '',
    accountManagerCommissionOn: 'Gross margin',
    accountManagerRateType: 'Percentage',
    bdManager: '',
    bdManagerCommission: '',
    bdManagerCommissionOn: 'Gross margin',
    bdManagerRateType: 'Fixed',
    recruiter: '',
    recruiterCommission: '',
    recruiterCommissionOn: 'Gross margin',
    recruiterRateType: 'Percentage',
  });

  const handleInputChange = (field, value) => {
    // List of fields that should not be negative
    const numericFields = [
      'clientRate', 'other', 'w2', 'payTax', 'employeeRate',
      'accountManagerCommission', 'bdManagerCommission', 'recruiterCommission'
    ];

    if (numericFields.includes(field) && value < 0) {
      return; // Do nothing if value is negative
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const fetchClients = async () => {
    const response = await apiFetch('/clients', { method: 'GET' });
    if (!response.ok) {
      throw new Error('Failed to fetch clients');
    }
    const result = await response.json();
    const data = result.success && result.data ? result.data : [];
    return data.map(item => ({
      id: item.id,
      name: item.name || '',
    }));
  };

  const fetchVendors = async () => {
    const response = await apiFetch('/vendors', { method: 'GET' });
    if (!response.ok) {
      throw new Error('Failed to fetch vendors');
    }
    const result = await response.json();
    const data = result.success && result.data ? result.data : [];
    return data.map(item => ({
      id: item.id,
      name: item.name || '',
    }));
  };

  const fetchEmployees = async () => {
    const response = await apiFetch('/employees', { method: 'GET' });
    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }
    const result = await response.json();
    const data = result.success && result.data ? result.data : [];
    return data.map(item => ({
      id: item.id,
      name: item.name || '',
    }));
  };

  const fetchInternalUsers = async () => {
    const response = await apiFetch('/internalusers', { method: 'GET' });
    if (!response.ok) {
      throw new Error('Failed to fetch internal users');
    }
    const result = await response.json();
    const data = result.success && result.data ? result.data : [];
    return data.map(item => ({
      id: item.id,
      name: item.name || '',
      role: (item.role || '').toLowerCase(),
    }));
  };

  const refreshParties = async () => {
    try {
      const [clientsData, vendorsData, employeesData, internalUsersData] = await Promise.all([
        fetchClients(),
        fetchVendors(),
        fetchEmployees(),
        fetchInternalUsers(),
      ]);
      setClients(clientsData);
      setVendors(vendorsData);
      setEmployees(employeesData);
      setInternalUsers(internalUsersData);
      if (pendingSelectType === 'Client' && clientsData.length > 0) {
        setFormData(prev => ({
          ...prev,
          clientId: clientsData[clientsData.length - 1].id,
        }));
        setPendingSelectType(null);
      }
      if (pendingSelectType === 'Vendor' && vendorsData.length > 0) {
        setFormData(prev => ({
          ...prev,
          vendorId: vendorsData[vendorsData.length - 1].id,
        }));
        setPendingSelectType(null);
      }
      if (pendingSelectType === 'Employee' && employeesData.length > 0) {
        setFormData(prev => ({
          ...prev,
          employeeId: employeesData[employeesData.length - 1].id,
        }));
        setPendingSelectType(null);
      }
    } catch (error) {
      console.error('Error fetching parties:', error);
      toast.error('Failed to load client/vendor list');
    }
  };

  useEffect(() => {
    refreshParties();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!userId) {
        toast.error('Missing user information for assignment');
        return;
      }

      // First, fetch user data to get user_details.id
      const userResponse = await apiFetch(`/user/${userId}`, {
        method: 'GET',
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();
      const userDetailsId = userData.data?.user_details?.id;

      if (!userDetailsId) {
        throw new Error('User details not found. Please contact support.');
      }

      console.log('User Details ID:', userDetailsId);

      // Build payload based on provided API contract
      const isW2 = formData.employeeType === 'W2';
      const payload = {
        party_id:
          formData.invoiceTo === 'Vendor'
            ? formData.vendorId || null
            : formData.clientId || null,
        client_rate: Number(formData.clientRate) || 0,
        other_rate: Number(formData.other) || 0,
        w2: isW2 ? Number(formData.w2) || 0 : 0,
        ptax: isW2 ? Number(formData.payTax) || 0 : 0,
        c2c_or_other: !isW2 ? Number(formData.employeeRate) || 0 : 0,
        employee_id: !isW2 ? formData.employeeId || null : null,
        time_sheet_period: (formData.timesheetPeriod || '').toLowerCase(),
        start_date: formData.startDate || null,
        end_date: formData.endDate || null,
        account_manager_id: formData.accountManager || null,
        account_manager_commission: Number(formData.accountManagerCommission) || 0,
        business_development_manager_id: formData.bdManager || null,
        business_development_manager_commission: Number(formData.bdManagerCommission) || 0,
        recruiter_id: formData.recruiter || null,
        recruiter_commission: Number(formData.recruiterCommission) || 0,
        invoice_to: formData.invoiceTo || 'Client',
      };

      console.log('Assign Client Payload:', payload);

      const response = await apiFetch(`/user-details/${userDetailsId}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        const message = result && (result.message || result.error);
        throw new Error(message || 'Failed to assign client details');
      }

      toast.success('Client details updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });

      // Navigate to userlist after a short delay
      setTimeout(() => {
        navigate('/user/userlist');
      }, 500);
    } catch (error) {
      console.error('Error assigning client details:', error);
      toast.error(error.message || 'Failed to update client details');
    }
  };

  const handleCancel = () => {
    navigate('/user/userlist');
  };

  return (
    <div className="w-full pb-10">
      <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
        <div className="flex flex-col gap-2 mb-6">
          <h2 className="text-2xl font-bold text-black">Update client details</h2>
          <p className="text-sm text-gray-500">
            Assign a client or vendor and set rates, dates, and commissions.
          </p>
        </div>

        <div className="space-y-8">
          {/* Top Section - Row 1 */}
          <div className="rounded-lg ">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Assignment</h3>
            <div className="flex items-center gap-4">
              {/* Invoice to */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice to<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.invoiceTo}
                    onChange={(e) => handleInputChange('invoiceTo', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                  >
                    <option value="Client">Client</option>
                    <option value="Vendor">Vendor</option>
                  </select>
                  <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>
              {/* Client name */}
              {formData.invoiceTo === 'Client' && (
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client name<span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={formData.clientId}
                        onChange={(e) => handleInputChange('clientId', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                      >
                        <option value="">Select client</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                      <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setModalType('Client');
                        setPendingSelectType('Client');
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-2.5 rounded-md bg-[#E0E7FF] text-[#5069E5] hover:bg-[#c7d2fe] font-medium transition-colors"
                    >
                      <FaPlus size={14} />
                    </button>
                  </div>
                </div>
              )}
              {/* Vendor name */}
              {formData.invoiceTo === 'Vendor' && (
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor name<span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={formData.vendorId}
                        onChange={(e) => handleInputChange('vendorId', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                      >
                        <option value="">Select vendor</option>
                        {vendors.map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.name}
                          </option>
                        ))}
                      </select>
                      <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setModalType('Vendor');
                        setPendingSelectType('Vendor');
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-2.5 rounded-md bg-[#E0E7FF] text-[#5069E5] hover:bg-[#c7d2fe] font-medium transition-colors"
                    >
                      <FaPlus size={14} />
                    </button>
                  </div>
                </div>
              )}
              {/* Client rate */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.clientRate}
                  onChange={(e) => handleInputChange('clientRate', e.target.value)}
                  placeholder="Enter rate"
                  min="0"
                  step="any"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Top Section - Row 2 */}
          <div className="rounded-lg ">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Schedule</h3>
            <div className="flex items-center gap-4">
              {/* Timesheet period */}
              <div className='w-full'>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timesheet period<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.timesheetPeriod}
                    onChange={(e) => handleInputChange('timesheetPeriod', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-weekly">Bi-weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                  <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>
              {/* Start date */}
              <div className='w-full'>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start date<span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
              </div>
              {/* End date */}
              <div className='w-full'>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End date<span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Top Section - Row 3 */}
          <div className="rounded-lg ">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Other Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Other */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other
                </label>
                <input
                  type="number"
                  value={formData.other}
                  onChange={(e) => handleInputChange('other', e.target.value)}
                  placeholder="Enter other rate"
                  min="0"
                  step="any"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
              </div>
              {/* Other rate type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other rate type<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.otherRateType}
                    onChange={(e) => handleInputChange('otherRateType', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Fixed">Fixed</option>
                  </select>
                  <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>
              {/* Recursive */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recursive
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.recursive}
                      onChange={() => handleCheckboxChange('recursive')}
                      className="w-4 h-4 text-[#5069E5] focus:ring-[#5069E5] focus:ring-2 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Recursive</span>
                  </label>
                  <div className="relative flex-1">
                    {formData.recursive ? (
                      <input
                        type="text"
                        value="All months"
                        readOnly
                        disabled
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 cursor-not-allowed"
                      />
                    ) : (
                      <>
                        <select
                          value={formData.recursiveMonth}
                          onChange={(e) => handleInputChange('recursiveMonth', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                        >
                          <option value="">Select month</option>
                          <option value="1">January</option>
                          <option value="2">February</option>
                          <option value="3">March</option>
                          <option value="4">April</option>
                          <option value="5">May</option>
                          <option value="6">June</option>
                          <option value="7">July</option>
                          <option value="8">August</option>
                          <option value="9">September</option>
                          <option value="10">October</option>
                          <option value="11">November</option>
                          <option value="12">December</option>
                        </select>
                        <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div></div>
            </div>
          </div>

          <div className='flex items-center gap-8'>
            {/* Middle Section - Radio Buttons */}
            <div className="rounded-lg ">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Employee Type</h3>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="employeeType"
                    value="W2"
                    checked={formData.employeeType === 'W2'}
                    onChange={(e) => handleInputChange('employeeType', e.target.value)}
                    className="w-4 h-4 text-[#5069E5] focus:ring-[#5069E5] focus:ring-2"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">W2</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="employeeType"
                    value="1099 C2C"
                    checked={formData.employeeType === '1099 C2C'}
                    onChange={(e) => handleInputChange('employeeType', e.target.value)}
                    className="w-4 h-4 text-[#5069E5] focus:ring-[#5069E5] focus:ring-2"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">1099 C2C</span>
                </label>
              </div>
            </div>

            {/* Middle Section - Row 2 */}
            <div className="flex-1 rounded-lg ">
              <h3 className="text-base font-semibold text-gray-800 mb-4">Employee Details</h3>
              <div className="flex items-center gap-4">
                {formData.employeeType === 'W2' ? (
                  <>
                    {/* W2 */}
                    <div className='w-full'>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        W2<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.w2}
                        onChange={(e) => handleInputChange('w2', e.target.value)}
                        placeholder="Enter W2"
                        min="0"
                        step="any"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                      />
                    </div>
                    {/* Pay tax */}
                    <div className='w-full'>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pay tax<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.payTax}
                        onChange={(e) => handleInputChange('payTax', e.target.value)}
                        placeholder="Enter amount"
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Employee */}
                    <div className='w-full'>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee<span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <select
                            value={formData.employeeId}
                            onChange={(e) => handleInputChange('employeeId', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                          >
                            <option value="">Select employee</option>
                            {employees.map((employee) => (
                              <option key={employee.id} value={employee.id}>
                                {employee.name}
                              </option>
                            ))}
                          </select>
                          <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setModalType('Employee');
                            setPendingSelectType('Employee');
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-2.5 rounded-md bg-[#E0E7FF] text-[#5069E5] hover:bg-[#c7d2fe] font-medium transition-colors"
                        >
                          <FaPlus size={14} />
                        </button>
                      </div>
                    </div>
                    {/* Employee rate */}
                    <div className='w-full'>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee rate<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.employeeRate}
                        onChange={(e) => handleInputChange('employeeRate', e.target.value)}
                        placeholder="Enter rate"
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section - Commission Details */}
          <div className="rounded-lg  space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Commission Details</h3>

            {/* Account manager */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account manager<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.accountManager}
                    onChange={(e) => handleInputChange('accountManager', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                  >
                    <option value="">Select</option>
                    {internalUsers
                      .filter(user => user.role === 'ac_manager')  // Fixed: was 'account_manager'
                      .map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                  </select>
                  <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.accountManagerCommission}
                  onChange={(e) => handleInputChange('accountManagerCommission', e.target.value)}
                  placeholder="Enter commission"
                  min="0"
                  step="any"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission on<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.accountManagerCommissionOn}
                    onChange={(e) => handleInputChange('accountManagerCommissionOn', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                  >
                    <option value="Gross margin">Gross margin</option>
                    <option value="Revenue">Revenue</option>
                  </select>
                  <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate type<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.accountManagerRateType}
                    onChange={(e) => handleInputChange('accountManagerRateType', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Fixed">Fixed</option>
                  </select>
                  <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>
            </div>

            {/* BD Manager */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BD Manager<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.bdManager}
                    onChange={(e) => handleInputChange('bdManager', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                  >
                    <option value="">Select</option>
                    {internalUsers
                      .filter(user => user.role === 'bd_manager')
                      .map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                  </select>
                  <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.bdManagerCommission}
                  onChange={(e) => handleInputChange('bdManagerCommission', e.target.value)}
                  placeholder="Enter commission"
                  min="0"
                  step="any"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission on<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.bdManagerCommissionOn}
                    onChange={(e) => handleInputChange('bdManagerCommissionOn', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                  >
                    <option value="Gross margin">Gross margin</option>
                    <option value="Revenue">Revenue</option>
                  </select>
                  <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate type<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.bdManagerRateType}
                    onChange={(e) => handleInputChange('bdManagerRateType', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Fixed">Fixed</option>
                  </select>
                  <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>
            </div>

            {/* Recruiter */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recruiter<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.recruiter}
                    onChange={(e) => handleInputChange('recruiter', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                  >
                    <option value="">Select</option>
                    {internalUsers
                      .filter(user => user.role === 'recruiter')
                      .map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                  </select>
                  <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.recruiterCommission}
                  onChange={(e) => handleInputChange('recruiterCommission', e.target.value)}
                  placeholder="Enter commission"
                  min="0"
                  step="any"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission on<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.recruiterCommissionOn}
                    onChange={(e) => handleInputChange('recruiterCommissionOn', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                  >
                    <option value="Gross margin">Gross margin</option>
                    <option value="Revenue">Revenue</option>
                  </select>
                  <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate type<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.recruiterRateType}
                    onChange={(e) => handleInputChange('recruiterRateType', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Fixed">Fixed</option>
                  </select>
                  <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-medium"
            >
              Assign client details
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <AddClientVendorEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        onSuccess={() => {
          setIsModalOpen(false);
          refreshParties();
        }}
      />
    </div>
  );
}

