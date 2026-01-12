import React, { useState } from 'react';
import { FaEdit } from 'react-icons/fa';

export default function Company() {
  const [formData, setFormData] = useState({
    companyName: 'Jack & Co.',
    email: 'example@gmail.com',
    mobile: '+889737671565',
    address: '+889737671565',
    details: '+889737671565',
  });

  const [logoPreview, setLogoPreview] = useState('/assets/companyLogo.png');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    console.log('Update company:', formData);
    // Save logic here
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Column - Logo Section */}
        <div className="w-full lg:w-[400px] flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Company Logo Display */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-full h-[300px] rounded-lg overflow-hidden mb-4 bg-gray-100 border border-gray-200 flex items-center justify-center">
                <img 
                  src={logoPreview} 
                  alt="Company Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center mb-4">
                <span className="text-gray-800 font-semibold text-lg">COMPANY</span>
              </div>
            </div>

            {/* Upload Logo Button */}
            <label className="w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.querySelector('input[type="file"]').click()}
                className="w-full bg-[#5069E5] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#3d52c7] transition-colors cursor-pointer"
              >
                Upload Logo
              </button>
            </label>
          </div>
        </div>

        {/* Right Column - Company Details Form */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-black mb-6">Company Details</h2>

          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
                <FaEdit className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
                <FaEdit className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
                <FaEdit className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address(Street, City, Zip code)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
                <FaEdit className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>

            {/* Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Details
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.details}
                  onChange={(e) => handleInputChange('details', e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                />
                <FaEdit className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-medium"
              >
                Update Company
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

