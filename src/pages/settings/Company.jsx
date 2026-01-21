import React, { useState, useEffect } from 'react';
import { FaEdit, FaLock, FaBuilding, FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa';
import { apiFetch, Image_BASE_URL } from '../../libs/apiFetch';
import { toast } from 'react-toastify';

export default function Company() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    id: null,
  });

  const [permissions, setPermissions] = useState({
    user_can_login: false,
    commission: false,
    template_can_add: false,
    qb_integration: false,
    user_limit: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    setIsLoading(true);
    try {
      // 1. Get logged-in user email from cookies
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null;
      };
      const userEmail = decodeURIComponent(getCookie("user_email") || "");
      console.log('Logged-in user email:', userEmail);

      // 2. Fetch all businesses
      console.log('Fetching all businesses from /business');
      const response = await apiFetch('/business', { method: 'GET' });

      let result;
      try {
        result = await response.json();
      } catch (e) {
        result = {};
      }
      console.log(`Business list result (Status: ${response.status}):`, result);

      if (!response.ok) {
        throw new Error(result.message || `Failed to fetch business list (Status: ${response.status})`);
      }

      const businesses = result.data || (Array.isArray(result) ? result : []);

      // 3. Filter to find the business belonging to this user
      const myBusiness = businesses.find(b =>
        (b.owner?.email === userEmail) ||
        (b.email === userEmail) ||
        (b.users && b.users.some(u => u.email === userEmail))
      ) || businesses[0]; // Fallback to first if no exact match

      if (myBusiness) {
        const business = myBusiness;
        setFormData({
          name: business.name || '',
          address: business.address || '',
          id: business.id
        });

        // Set permissions (read-only)
        if (business.permission) {
          setPermissions({
            user_can_login: !!business.permission.user_can_login,
            commission: !!business.permission.commission,
            template_can_add: !!business.permission.template_can_add,
            qb_integration: !!business.permission.qb_integration,
            user_limit: business.permission.user_limit || 0
          });
        }

        if (business.logo) {
          const normalizedBase = Image_BASE_URL ? Image_BASE_URL.replace(/\/+$/, "") : "";
          const normalizedPath = business.logo.startsWith("/") ? business.logo.slice(1) : business.logo;
          setLogoPreview(normalizedBase ? `${normalizedBase}/${normalizedPath}` : business.logo);
        }
      } else {
        throw new Error(result.message || 'No data found for this company');
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      toast.error(error.message || 'Failed to load company details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.id) return;
    setIsUpdating(true);
    try {
      const formDataPayload = new FormData();
      formDataPayload.append('name', formData.name);
      formDataPayload.append('address', formData.address);
      if (logoFile) {
        formDataPayload.append('logo', logoFile);
      }

      const response = await apiFetch(`/business/${formData.id}`, {
        method: 'POST', // Backend typically uses POST with _method=PUT or just POST for multipart
        body: formDataPayload,
      });

      if (!response.ok) throw new Error('Failed to update company');

      toast.success('Company updated successfully!');
      fetchCompanyData(); // Refresh data
      setLogoFile(null);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update company details');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5069E5]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Column - Logo & Permissions */}
        <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaBuilding className="text-[#5069E5]" /> Company Logo
            </h3>
            <div className="flex flex-col items-center mb-6">
              <div className="w-full h-[250px] rounded-lg overflow-hidden mb-4 bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Company Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-gray-400 text-sm">No logo uploaded</span>
                )}
              </div>
            </div>

            <label className="w-full">
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              <button
                type="button"
                className="w-full bg-[#5069E5] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#3d52c7] transition-colors"
                onClick={() => document.querySelector('input[type="file"]').click()}
              >
                Change Logo
              </button>
            </label>
          </div>

          {/* Read-only Permissions Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaShieldAlt className="text-[#5069E5]" /> Company Permissions
            </h3>
            <div className="space-y-4">
              {[
                { label: 'User Login', status: permissions.user_can_login },
                { label: 'Commissions', status: permissions.commission },
                { label: 'Email Templates', status: permissions.template_can_add },
                { label: 'QuickBooks Integration', status: permissions.qb_integration },
              ].map((perm, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{perm.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${perm.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {perm.status ? 'Enabled' : 'Disabled'}
                    </span>
                    <FaLock className="text-gray-400" size={12} />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-t border-gray-100">
                <span className="text-sm font-medium text-gray-600">User Limit</span>
                <span className="text-sm font-bold text-[#5069E5]">{permissions.user_limit} Users</span>
              </div>
              <p className="text-[10px] text-gray-400 italic mt-2 text-center">
                * Permissions are managed by the System Administrator and cannot be edited.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Details Form */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6 h-fit">
          <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
            Company Settings
          </h2>

          <div className="space-y-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800 pr-10"
                  placeholder="Enter Company Name"
                />
                <FaEdit className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <FaMapMarkerAlt size={12} /> Address
              </label>
              <div className="relative">
                <textarea
                  rows={4}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800 pr-10 resize-none"
                  placeholder="Street, City, Zip code"
                />
                <FaEdit className="absolute right-3 top-6 text-gray-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={handleSubmit}
                disabled={isUpdating}
                className="px-8 py-3 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-all font-semibold shadow-lg shadow-[#5069E5]/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


