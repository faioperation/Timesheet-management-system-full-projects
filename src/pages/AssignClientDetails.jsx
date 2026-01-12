import React, { useState } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function AssignClientDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    invoiceTo: 'Client',
    clientName: '',
    vendorName: '',
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
    payTax: 'Percentage',
    consultantRate: '',
    employee: '',
    employeePhone: '',
    zipCode: '',
    accountManager: '',
    accountManagerCommission: '',
    accountManagerCommissionOn: 'Gross margin',
    accountManagerRateType: 'Percentage',
    accountManagerRecursive: true,
    accountManagerRecursiveMonth: '',
    bdManager: '',
    bdManagerCommission: '',
    bdManagerCommissionOn: 'Gross margin',
    bdManagerRateType: 'Fixed',
    bdManagerRecursive: false,
    bdManagerRecursiveMonth: '',
    recruiter: '',
    recruiterCommission: '',
    recruiterCommissionOn: 'Gross margin',
    recruiterRateType: 'Percentage',
    recruiterRecursive: false,
    recruiterRecursiveMonth: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = () => {
    console.log('Update client details:', formData);
    // Save logic here
    // Show success toast message
    toast.success('Client details updated successfully!', {
      position: 'top-right',
      autoClose: 3000,
    });
    // Navigate to userlist after a short delay
    setTimeout(() => {
      navigate('/user/userlist');
    }, 500);
  };

  const handleCancel = () => {
    navigate('/user/userlist');
  };

  return (
    <div className="w-full pb-10">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-black mb-6">Update client details</h2>

        <div className="space-y-6">
          {/* Top Section - Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Invoice to */}
            <div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client name<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Select client"
                  className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
              </div>
            </div>
            {/* Vendor name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor name<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  value={formData.vendorName}
                  onChange={(e) => handleInputChange('vendorName', e.target.value)}
                  placeholder="Select vendor"
                  className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
              </div>
            </div>
            {/* Client rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client rate<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.clientRate}
                onChange={(e) => handleInputChange('clientRate', e.target.value)}
                placeholder="Enter client rate"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
              />
            </div>
          </div>

          {/* Top Section - Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Timesheet period */}
            <div>
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
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
                <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
              </div>
            </div>
            {/* Start date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start date<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                placeholder="dd/mm/yy"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
              />
            </div>
            {/* End date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End date<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                placeholder="dd/mm/yy"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
              />
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
                {formData.recursive && (
                  <div className="relative flex-1">
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
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Section - Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Other */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other
              </label>
              <input
                type="text"
                value={formData.other}
                onChange={(e) => handleInputChange('other', e.target.value)}
                placeholder="Enter c2c/other"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
              />
            </div>
            {/* Other rate type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other rate type<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.otherRateType}
                onChange={(e) => handleInputChange('otherRateType', e.target.value)}
                placeholder="Percentage"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
              />
            </div>
            <div></div>
            <div></div>
          </div>

          {/* Middle Section - Radio Buttons */}
          <div className="flex gap-6">
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

          {/* Middle Section - Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* W2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                W2<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.w2}
                onChange={(e) => handleInputChange('w2', e.target.value)}
                placeholder="Enter W2"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
              />
            </div>
            {/* Pay tax */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pay tax<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.payTax}
                onChange={(e) => handleInputChange('payTax', e.target.value)}
                placeholder="Percentage"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
              />
            </div>
            {/* Consultant rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultant rate<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.consultantRate}
                onChange={(e) => handleInputChange('consultantRate', e.target.value)}
                placeholder="Enter consultant rate"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
              />
            </div>
            <div></div>
          </div>

          {/* Middle Section - Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Employee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  value={formData.employee}
                  onChange={(e) => handleInputChange('employee', e.target.value)}
                  placeholder="Select employee"
                  className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
              </div>
            </div>
            {/* Employee phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee phone<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.employeePhone}
                onChange={(e) => handleInputChange('employeePhone', e.target.value)}
                placeholder="Enter"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
              />
            </div>
            {/* Zip code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip code<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder="Enter Zip code"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
              />
            </div>
            <div></div>
          </div>

          {/* Bottom Section - Commission Details */}
          <div className="space-y-6 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Commission Details</h3>

            {/* Account manager */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
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
                    <option value="Manager 1">Manager 1</option>
                    <option value="Manager 2">Manager 2</option>
                  </select>
                  <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.accountManagerCommission}
                  onChange={(e) => handleInputChange('accountManagerCommission', e.target.value)}
                  placeholder="Enter commission"
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
              <div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.accountManagerRecursive}
                      onChange={() => handleCheckboxChange('accountManagerRecursive')}
                      className="w-4 h-4 text-[#5069E5] focus:ring-[#5069E5] focus:ring-2 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Recursive</span>
                  </label>
                  {formData.accountManagerRecursive ? (
                    <button
                      type="button"
                      className="px-4 py-2.5 bg-[#E0E7FF] text-[#5069E5] rounded-lg hover:bg-[#D0D7EF] transition-colors font-medium text-sm"
                    >
                      On all month
                    </button>
                  ) : (
                    <div className="relative flex-1">
                      <select
                        value={formData.accountManagerRecursiveMonth}
                        onChange={(e) => handleInputChange('accountManagerRecursiveMonth', e.target.value)}
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
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BD Manager */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
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
                    <option value="BD Manager 1">BD Manager 1</option>
                    <option value="BD Manager 2">BD Manager 2</option>
                  </select>
                  <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.bdManagerCommission}
                  onChange={(e) => handleInputChange('bdManagerCommission', e.target.value)}
                  placeholder="Enter commission"
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
              <div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.bdManagerRecursive}
                      onChange={() => handleCheckboxChange('bdManagerRecursive')}
                      className="w-4 h-4 text-[#5069E5] focus:ring-[#5069E5] focus:ring-2 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Recursive</span>
                  </label>
                  {formData.bdManagerRecursive ? (
                    <button
                      type="button"
                      className="px-4 py-2.5 bg-[#E0E7FF] text-[#5069E5] rounded-lg hover:bg-[#D0D7EF] transition-colors font-medium text-sm"
                    >
                      On all month
                    </button>
                  ) : (
                    <div className="relative flex-1">
                      <select
                        value={formData.bdManagerRecursiveMonth}
                        onChange={(e) => handleInputChange('bdManagerRecursiveMonth', e.target.value)}
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
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recruiter */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
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
                    <option value="Recruiter 1">Recruiter 1</option>
                    <option value="Recruiter 2">Recruiter 2</option>
                  </select>
                  <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.recruiterCommission}
                  onChange={(e) => handleInputChange('recruiterCommission', e.target.value)}
                  placeholder="Enter commission"
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
              <div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.recruiterRecursive}
                      onChange={() => handleCheckboxChange('recruiterRecursive')}
                      className="w-4 h-4 text-[#5069E5] focus:ring-[#5069E5] focus:ring-2 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Recursive</span>
                  </label>
                  {formData.recruiterRecursive ? (
                    <button
                      type="button"
                      className="px-4 py-2.5 bg-[#E0E7FF] text-[#5069E5] rounded-lg hover:bg-[#D0D7EF] transition-colors font-medium text-sm"
                    >
                      On all month
                    </button>
                  ) : (
                    <div className="relative flex-1">
                      <select
                        value={formData.recruiterRecursiveMonth}
                        onChange={(e) => handleInputChange('recruiterRecursiveMonth', e.target.value)}
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
                    </div>
                  )}
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
              Update client details
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
    </div>
  );
}

