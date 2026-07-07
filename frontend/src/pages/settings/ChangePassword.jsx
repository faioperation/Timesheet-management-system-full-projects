import React, { useState } from "react";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { apiFetch } from "../../libs/apiFetch";
import { toast } from "react-toastify";

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!formData.old_password || !formData.new_password || !formData.new_password_confirmation) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.new_password.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    if (formData.new_password !== formData.new_password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch("/change-password", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Password updated successfully");
        setFormData({
          old_password: "",
          new_password: "",
          new_password_confirmation: "",
        });
      } else {
        throw new Error(result.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Information Banner */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 mb-4">
            <FiLock size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Password Security</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Ensure your account stays secure by using a strong password. We recommend a mix of letters, numbers, and symbols.
          </p>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center gap-2 text-xs text-indigo-600 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
              Minimum 8 characters
            </li>
            <li className="flex items-center gap-2 text-xs text-indigo-600 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
              At least one special character
            </li>
          </ul>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm p-6 lg:p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h2>
        
        <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-2xl">
          {/* Old Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Old Password
            </label>
            <div className="relative">
              <input
                type={showPassword.old ? "text" : "password"}
                name="old_password"
                value={formData.old_password}
                onChange={handleInputChange}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-12"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('old')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
              >
                {showPassword.old ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? "text" : "password"}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-12"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  {showPassword.new ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  name="new_password_confirmation"
                  value={formData.new_password_confirmation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-12"
                  placeholder="Repeat new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  {showPassword.confirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto min-w-[200px] bg-indigo-600 text-white py-4 px-10 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
