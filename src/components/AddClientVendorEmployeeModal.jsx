import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const AddClientVendorEmployeeModal = ({ isOpen, onClose, type = 'Client' }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    zipCode: '',
    address: '',
    remark: '',
  });

  // Reset form when modal opens/closes or type changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        phone: '',
        zipCode: '',
        address: '',
        remark: '',
      });
    }
  }, [isOpen, type]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.name || !formData.phone || !formData.zipCode) {
      alert('Please fill in all required fields');
      return;
    }

    // Save logic here
    console.log(`Save ${type}:`, formData);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  // Get title based on type
  const getTitle = () => {
    switch (type) {
      case 'Client':
        return 'Add New Client';
      case 'Vendor':
        return 'Add New Vendor';
      case 'Employee':
        return 'Add New Employee';
      default:
        return 'Add New Client';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{getTitle()}</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* First Row: Name, Phone, Zip Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Client Name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Client Phone"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zip Code<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder="Enter zip code"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
              </div>
            </div>

            {/* Second Row: Address, Remark */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter address"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remark
                </label>
                <textarea
                  value={formData.remark}
                  onChange={(e) => handleInputChange('remark', e.target.value)}
                  placeholder="Enter remark"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800 resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Buttons */}
        <div className="flex justify-start gap-4 p-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-medium"
          >
            Save
          </button>
          <button
            onClick={handleClose}
            className="px-6 py-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddClientVendorEmployeeModal;

