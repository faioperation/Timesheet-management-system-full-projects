import React, { useState, useEffect } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { IoMdArrowDropdown } from 'react-icons/io';
import { FaPaperclip } from 'react-icons/fa';
import { apiFetch } from '../../libs/apiFetch';
import { toast } from 'react-toastify';

export default function Profile() {
  const [formData, setFormData] = useState({
    name: 'Naresh Vyas',
    email: 'example@gmail.com',
    mobile: '+889737671565',
    gender: 'Male',
    maritalStatus: 'Single',
    password: '********',
    signature: null,
  });
  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    mobile: false,
    password: false,
  });
  const [profileImage, setProfileImage] = useState('/assets/profilePlaceholder.png');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load user data from cookies or API
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
      return null;
    };

    const userName = getCookie('user_name');
    const userEmail = getCookie('user_email');

    if (userName) setFormData(prev => ({ ...prev, name: userName }));
    if (userEmail) setFormData(prev => ({ ...prev, email: userEmail }));

    // You can fetch more user data from API here
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = (field) => {
    setIsEditing(prev => ({ ...prev, [field]: true }));
  };

  const handleSave = async (field) => {
    setIsLoading(true);
    try {
      // API call to update the field
      // await apiFetch('/user/update', { method: 'POST', body: JSON.stringify({ [field]: formData[field] }) });
      setIsEditing(prev => ({ ...prev, [field]: false }));
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
    } catch (error) {
      toast.error(`Failed to update ${field}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
      // You can upload the image to server here
      toast.success('Profile image uploaded successfully');
    }
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, signature: file }));
      // You can upload the signature to server here
      toast.success('Signature uploaded successfully');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-black mb-6">Update Profile</h2>
      
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Column - Profile Picture */}
        <div className="w-full lg:w-[500px] flex-shrink-0">
          <div className="rounded-lg shadow-sm">
            <div className="flex flex-col items-center">
              <div className="w-full h-[500px]  rounded-lg overflow-hidden mb-4 bg-gray-100 border border-gray-200">
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  className="w-full bg-[#5069E5] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#3d52c7] transition-colors cursor-pointer"
                  onClick={() => document.querySelector('input[type="file"]').click()}
                >
                  Upload Image
                </button>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Form Fields */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6 lg:p-8">
          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing.name}
                  onBlur={() => isEditing.name && handleSave('name')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] disabled:bg-gray-50 text-gray-800 pr-10"
                  placeholder="Enter your name"
                />
                <button
                  type="button"
                  onClick={() => isEditing.name ? handleSave('name') : handleEdit('name')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5069E5] transition-colors"
                >
                  <FiEdit2 size={18} />
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing.email}
                  onBlur={() => isEditing.email && handleSave('email')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] disabled:bg-gray-50 text-gray-800 pr-10"
                  placeholder="Enter your email"
                />
                <button
                  type="button"
                  onClick={() => isEditing.email ? handleSave('email') : handleEdit('email')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5069E5] transition-colors"
                >
                  <FiEdit2 size={18} />
                </button>
              </div>
            </div>

            {/* Mobile Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  disabled={!isEditing.mobile}
                  onBlur={() => isEditing.mobile && handleSave('mobile')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] disabled:bg-gray-50 text-gray-800 pr-10"
                  placeholder="Enter your mobile number"
                />
                <button
                  type="button"
                  onClick={() => isEditing.mobile ? handleSave('mobile') : handleEdit('mobile')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5069E5] transition-colors"
                >
                  <FiEdit2 size={18} />
                </button>
              </div>
            </div>

            {/* Gender Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <div className="relative">
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <IoMdArrowDropdown 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  size={20}
                />
              </div>
            </div>

            {/* Marital Status Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marital Status
              </label>
              <div className="relative">
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
                <IoMdArrowDropdown 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  size={20}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={isEditing.password ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={!isEditing.password}
                  onBlur={() => isEditing.password && handleSave('password')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] disabled:bg-gray-50 text-gray-800 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => isEditing.password ? handleSave('password') : handleEdit('password')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5069E5] transition-colors"
                >
                  <FiEdit2 size={18} />
                </button>
              </div>
            </div>

            {/* Signature Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signature
              </label>
              <div className="relative">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-500 cursor-pointer hover:border-[#5069E5] transition-colors flex items-center justify-between">
                    <span className="text-gray-500">
                      {formData.signature ? formData.signature.name : 'No file choosen'}
                    </span>
                    <FaPaperclip className="text-gray-500" size={18} />
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
