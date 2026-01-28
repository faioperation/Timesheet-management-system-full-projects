import React, { useState, useEffect } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../libs/apiFetch";
import { toast, ToastContainer } from "react-toastify";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "Male",
    role: "User",
  });
  const [assignedData, setAssignedData] = useState({
    invoiceTo: 'Client',
    clientId: '',
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
  const [clients, setClients] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [internalUsers, setInternalUsers] = useState([]);
  const [userDetailsId, setUserDetailsId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAuxiliaryData = async () => {
    try {
      const [cRes, vRes, eRes, iRes] = await Promise.all([
        apiFetch('/clients', { method: 'GET' }),
        apiFetch('/vendors', { method: 'GET' }),
        apiFetch('/employees', { method: 'GET' }),
        apiFetch('/internalusers', { method: 'GET' }),
      ]);

      if (cRes.ok) {
        const result = await cRes.json();
        setClients(result.data || []);
      }
      if (vRes.ok) {
        const result = await vRes.json();
        setVendors(result.data || []);
      }
      if (eRes.ok) {
        const result = await eRes.json();
        setEmployees(result.data || []);
      }
      if (iRes.ok) {
        const result = await iRes.json();
        setInternalUsers(result.data?.map(item => ({
          id: item.id,
          name: item.name || '',
          role: (item.role || '').toLowerCase(),
          commission_on: item.commission_on || 'Gross margin',
          rate_type: item.rate_type || 'Percentage',
          rate: item.rate || '',
        })) || []);
      }
    } catch (error) {
      console.error("Error fetching auxiliary data:", error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await apiFetch(`/user/${id}`, { method: "GET" });
      if (!response.ok) throw new Error("Failed to fetch user data");
      const result = await response.json();
      if (result.success && result.data) {
        const u = result.data;
        const roleMapReverse = {
          2: "Business Admin",
          3: "Supervisor",
          4: "User",
        };
        const roleId = u.roles && u.roles[0] ? u.roles[0].id : 4;

        setFormData({
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          gender: u.gender ? u.gender.charAt(0).toUpperCase() + u.gender.slice(1) : "Male",
          role: roleMapReverse[roleId] || "User",
        });

        if (u.user_details) {
          const ud = u.user_details;
          setUserDetailsId(ud.id);
          const isW2 = ud.w2 > 0 || ud.ptax > 0 || !ud.employee_id;
          setAssignedData({
            invoiceTo: ud.invoice_to || 'Client',
            clientId: ud.client_id || (ud.invoice_to === 'Client' ? ud.party_id : '') || '',
            vendorId: ud.vendor_id || (ud.invoice_to === 'Vendor' ? ud.party_id : '') || '',
            clientRate: ud.client_rate || '',
            timesheetPeriod: ud.time_sheet_period ? ud.time_sheet_period.charAt(0).toUpperCase() + ud.time_sheet_period.slice(1) : 'Weekly',
            startDate: ud.start_date || '',
            endDate: ud.end_date || '',
            recursive: ud.recursive || false,
            recursiveMonth: ud.recursive_month || '',
            other: ud.other_rate || '',
            otherRateType: ud.other_rate_type || 'Percentage',
            employeeType: ud.employee_id ? '1099 C2C' : 'W2',
            w2: ud.w2 || '',
            payTax: ud.ptax || '',
            employeeId: ud.employee_id || '',
            employeeRate: ud.c2c_or_other || '',
            accountManager: ud.account_manager_id || '',
            accountManagerCommission: ud.account_manager_commission || '',
            accountManagerCommissionOn: ud.account_manager_commission_on || 'Gross margin',
            accountManagerRateType: ud.account_manager_rate_type || 'Percentage',
            bdManager: ud.business_development_manager_id || '',
            bdManagerCommission: ud.business_development_manager_commission || '',
            bdManagerCommissionOn: ud.business_development_manager_commission_on || 'Gross margin',
            bdManagerRateType: ud.business_development_manager_rate_type || 'Fixed',
            recruiter: ud.recruiter_id || '',
            recruiterCommission: ud.recruiter_commission || '',
            recruiterCommissionOn: ud.recruiter_commission_on || 'Gross margin',
            recruiterRateType: ud.recruiter_rate_type || 'Percentage',
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuxiliaryData();
    fetchUser();
  }, [id]);

  const handleInputChange = (field, value) => {
    let finalValue = value;
    if (field === "phone") {
      finalValue = value.replace(/[^0-9]/g, "");
    }
    setFormData((prev) => ({ ...prev, [field]: finalValue }));
  };

  const handleAssignedInputChange = (field, value) => {
    setAssignedData(prev => {
      const newData = { ...prev, [field]: value };

      // Handle N/A selection for managers
      if (field === 'accountManager') {
        if (value === 'NA') {
          newData.accountManagerCommission = '';
          newData.accountManagerCommissionOn = 'Gross margin';
          newData.accountManagerRateType = 'Percentage';
        } else if (value) {
           const manager = internalUsers.find(u => String(u.id) === String(value));
           if (manager) {
             newData.accountManagerCommission = manager.rate || '';
             newData.accountManagerCommissionOn = manager.commission_on || 'Gross margin';
             newData.accountManagerRateType = manager.rate_type || 'Percentage';
           }
        }
      }

      if (field === 'bdManager') {
        if (value === 'NA') {
          newData.bdManagerCommission = '';
          newData.bdManagerCommissionOn = 'Gross margin';
          newData.bdManagerRateType = 'Fixed';
        } else if (value) {
           const manager = internalUsers.find(u => String(u.id) === String(value));
           if (manager) {
             newData.bdManagerCommission = manager.rate || '';
             newData.bdManagerCommissionOn = manager.commission_on || 'Gross margin';
             newData.bdManagerRateType = manager.rate_type || 'Fixed';
           }
        }
      }

      if (field === 'recruiter') {
        if (value === 'NA') {
          newData.recruiterCommission = '';
          newData.recruiterCommissionOn = 'Gross margin';
          newData.recruiterRateType = 'Percentage';
        } else if (value) {
           const manager = internalUsers.find(u => String(u.id) === String(value));
           if (manager) {
             newData.recruiterCommission = manager.rate || '';
             newData.recruiterCommissionOn = manager.commission_on || 'Gross margin';
             newData.recruiterRateType = manager.rate_type || 'Percentage';
           }
        }
      }

      return newData;
    });
  };

  const handleCheckboxChange = (field) => {
    setAssignedData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Update User Basic Info
      const userPayload = new FormData();
      userPayload.append("name", formData.name);
      userPayload.append("email", formData.email);
      userPayload.append("phone", formData.phone);
      if (formData.gender) userPayload.append("gender", formData.gender.toLowerCase());

      const roleMap = {
        "Business Admin": 2,
        Supervisor: 3,
        User: 4,
      };
      const roleId = roleMap[formData.role] || 4;
      userPayload.append("role_id", String(roleId));

      const userResponse = await apiFetch(`/user/${id}`, {
        method: "POST", // Using POST for FormData (will be treated as PUT via _method if needed, but here simple multipart POST works)
        body: userPayload,
      });

      const userResult = await userResponse.json();
      if (!userResponse.ok || !userResult.success) {
        throw new Error(userResult.message || "Failed to update user info");
      }

      // 2. Update Assigned Details
      if (userDetailsId) {
        const isW2 = assignedData.employeeType === 'W2';
        const assignedPayload = {
          party_id: assignedData.invoiceTo === 'Vendor' ? assignedData.vendorId || null : assignedData.clientId || null,
          client_id: assignedData.clientId || null,
          vendor_id: assignedData.vendorId || null,
          client_rate: Number(assignedData.clientRate) || 0,
          other_rate: Number(assignedData.other) || 0,
          w2: isW2 ? Number(assignedData.w2) || 0 : 0,
          ptax: isW2 ? Number(assignedData.payTax) || 0 : 0,
          c2c_or_other: !isW2 ? Number(assignedData.employeeRate) || 0 : 0,
          employee_id: !isW2 ? assignedData.employeeId || null : null,
          time_sheet_period: (assignedData.timesheetPeriod || '').toLowerCase(),
          start_date: assignedData.startDate || null,
          end_date: assignedData.endDate || null,
          account_manager_id: assignedData.accountManager === 'NA' ? null : (assignedData.accountManager || null),
          account_manager_commission: Number(assignedData.accountManagerCommission) || 0,
          business_development_manager_id: assignedData.bdManager === 'NA' ? null : (assignedData.bdManager || null),
          business_development_manager_commission: Number(assignedData.bdManagerCommission) || 0,
          recruiter_id: assignedData.recruiter === 'NA' ? null : (assignedData.recruiter || null),
          recruiter_commission: Number(assignedData.recruiterCommission) || 0,
          invoice_to: assignedData.invoiceTo || 'Client',
        };

        const assignedResponse = await apiFetch(`/user-details/${userDetailsId}`, {
          method: 'POST',
          body: JSON.stringify(assignedPayload),
        });

        const assignedResult = await assignedResponse.json().catch(() => ({}));
        if (!assignedResponse.ok || !assignedResult.success) {
          throw new Error(assignedResult.message || assignedResult.error || 'Failed to update assigned details');
        }
      }

      toast.success("User and assigned details updated successfully");
      setTimeout(() => navigate("/user/userlist"), 1500);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.message || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center text-gray-500">Loading user data...</div>;
  }

  return (
    <div className="w-full pb-10">
      <ToastContainer />
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-black mb-6">Edit User</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name*</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email*</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone*</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <div className="relative">
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role*</label>
            <div className="relative">
              <select
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800"
              >
                <option value="Supervisor">Supervisor</option>
                <option value="User">User</option>
                <option value="Business Admin">Business Admin</option>
              </select>
              <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
            </div>
          </div>

          {/* Assigned Details Section */}
          <div className="pt-8 border-t border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Assigned Details</h3>

            <div className="space-y-8">
              {/* Assignment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice to</label>
                  <div className="relative">
                    <select
                      value={assignedData.invoiceTo}
                      onChange={(e) => handleAssignedInputChange('invoiceTo', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800"
                    >
                      <option value="Client">Client</option>
                      <option value="Vendor">Vendor</option>
                    </select>
                    <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client name</label>
                  <div className="relative">
                    <select
                      value={assignedData.clientId}
                      onChange={(e) => handleAssignedInputChange('clientId', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800"
                    >
                      <option value="">Select client</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vendor name</label>
                  <div className="relative">
                    <select
                      value={assignedData.vendorId}
                      onChange={(e) => handleAssignedInputChange('vendorId', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800"
                    >
                      <option value="">Select vendor</option>
                      {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                    <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Rate</label>
                  <input
                    type="number"
                    value={assignedData.clientRate}
                    onChange={(e) => handleAssignedInputChange('clientRate', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                  />
                </div>
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timesheet period</label>
                  <div className="relative">
                    <select
                      value={assignedData.timesheetPeriod}
                      onChange={(e) => handleAssignedInputChange('timesheetPeriod', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800"
                    >
                      <option value="Weekly">Weekly</option>
                      <option value="Bi-weekly">Bi-weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                    <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start date</label>
                  <input
                    type="date"
                    value={assignedData.startDate}
                    onChange={(e) => handleAssignedInputChange('startDate', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End date</label>
                  <input
                    type="date"
                    value={assignedData.endDate}
                    onChange={(e) => handleAssignedInputChange('endDate', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                  />
                </div>
              </div>

              {/* Employee Type & Details */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Employee Type</label>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="employeeType"
                      value="W2"
                      checked={assignedData.employeeType === 'W2'}
                      onChange={(e) => handleAssignedInputChange('employeeType', e.target.value)}
                      className="w-4 h-4 text-[#5069E5]"
                    />
                    <span className="ml-2 text-sm text-gray-700 font-medium">W2</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="employeeType"
                      value="1099 C2C"
                      checked={assignedData.employeeType === '1099 C2C'}
                      onChange={(e) => handleAssignedInputChange('employeeType', e.target.value)}
                      className="w-4 h-4 text-[#5069E5]"
                    />
                    <span className="ml-2 text-sm text-gray-700 font-medium">1099 C2C</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {assignedData.employeeType === 'W2' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">W2</label>
                        <input
                          type="number"
                          value={assignedData.w2}
                          onChange={(e) => handleAssignedInputChange('w2', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pay tax</label>
                        <input
                          type="number"
                          value={assignedData.payTax}
                          onChange={(e) => handleAssignedInputChange('payTax', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                        <div className="relative">
                          <select
                            value={assignedData.employeeId}
                            onChange={(e) => handleAssignedInputChange('employeeId', e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800"
                          >
                            <option value="">Select employee</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                          </select>
                          <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee rate</label>
                        <input
                          type="number"
                          value={assignedData.employeeRate}
                          onChange={(e) => handleAssignedInputChange('employeeRate', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Commission Details */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-700">Commission Details</h4>

                {/* Account Manager */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account manager</label>
                    <div className="relative">
                      <select
                        value={assignedData.accountManager}
                        onChange={(e) => handleAssignedInputChange('accountManager', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800"
                      >
                        <option value="">Select manager</option>
                        <option value="NA">N/A</option>
                        {internalUsers.filter(u => u.role === 'ac_manager').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                      <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Commission</label>
                    <input
                      type="number"
                      value={assignedData.accountManagerCommission}
                      onChange={(e) => handleAssignedInputChange('accountManagerCommission', e.target.value)}
                      disabled={assignedData.accountManager === 'NA'}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Commission on</label>
                    <div className="relative">
                      <select
                        value={assignedData.accountManagerCommissionOn}
                        onChange={(e) => handleAssignedInputChange('accountManagerCommissionOn', e.target.value)}
                        disabled={assignedData.accountManager === 'NA'}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="Gross margin">Gross margin</option>
                        <option value="Revenue">Revenue</option>
                      </select>
                      <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rate type</label>
                    <div className="relative">
                      <select
                        value={assignedData.accountManagerRateType}
                        onChange={(e) => handleAssignedInputChange('accountManagerRateType', e.target.value)}
                        disabled={assignedData.accountManager === 'NA'}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="Percentage">Percentage</option>
                        <option value="Fixed">Fixed</option>
                      </select>
                      <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                    </div>
                  </div>
                </div>

                {/* BD Manager */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">BD manager</label>
                    <div className="relative">
                      <select
                        value={assignedData.bdManager}
                        onChange={(e) => handleAssignedInputChange('bdManager', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800"
                      >
                        <option value="">Select manager</option>
                        <option value="NA">N/A</option>
                        {internalUsers.filter(u => u.role === 'bd_manager').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                      <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Commission</label>
                    <input
                      type="number"
                      value={assignedData.bdManagerCommission}
                      onChange={(e) => handleAssignedInputChange('bdManagerCommission', e.target.value)}
                      disabled={assignedData.bdManager === 'NA'}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Commission on</label>
                    <div className="relative">
                      <select
                        value={assignedData.bdManagerCommissionOn}
                        onChange={(e) => handleAssignedInputChange('bdManagerCommissionOn', e.target.value)}
                        disabled={assignedData.bdManager === 'NA'}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="Gross margin">Gross margin</option>
                        <option value="Revenue">Revenue</option>
                      </select>
                      <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rate type</label>
                    <div className="relative">
                      <select
                        value={assignedData.bdManagerRateType}
                        onChange={(e) => handleAssignedInputChange('bdManagerRateType', e.target.value)}
                        disabled={assignedData.bdManager === 'NA'}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="Percentage">Percentage</option>
                        <option value="Fixed">Fixed</option>
                      </select>
                      <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                    </div>
                  </div>
                </div>

                {/* Recruiter */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recruiter</label>
                    <div className="relative">
                      <select
                        value={assignedData.recruiter}
                        onChange={(e) => handleAssignedInputChange('recruiter', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800"
                      >
                        <option value="">Select recruiter</option>
                        <option value="NA">N/A</option>
                        {internalUsers.filter(u => u.role === 'recruiter').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                      <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Commission</label>
                    <input
                      type="number"
                      value={assignedData.recruiterCommission}
                      onChange={(e) => handleAssignedInputChange('recruiterCommission', e.target.value)}
                      disabled={assignedData.recruiter === 'NA'}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Commission on</label>
                    <div className="relative">
                      <select
                        value={assignedData.recruiterCommissionOn}
                        onChange={(e) => handleAssignedInputChange('recruiterCommissionOn', e.target.value)}
                        disabled={assignedData.recruiter === 'NA'}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="Gross margin">Gross margin</option>
                        <option value="Revenue">Revenue</option>
                      </select>
                      <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rate type</label>
                    <div className="relative">
                      <select
                        value={assignedData.recruiterRateType}
                        onChange={(e) => handleAssignedInputChange('recruiterRateType', e.target.value)}
                        disabled={assignedData.recruiter === 'NA'}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="Percentage">Percentage</option>
                        <option value="Fixed">Fixed</option>
                      </select>
                      <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-medium disabled:opacity-60"
            >
              {isSubmitting ? "Updating..." : "Update User"}
            </button>
            <button
              onClick={() => navigate("/user/userlist")}
              className="px-6 py-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
