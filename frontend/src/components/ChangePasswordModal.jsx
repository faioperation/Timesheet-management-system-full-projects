import React, { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { IoMdClose } from "react-icons/io";
import { FaLock } from "react-icons/fa";
import { apiFetch } from "../libs/apiFetch";
import { toast } from "react-toastify";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    current_password: "",
    password: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.current_password || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch("/change-password", {
        method: "POST",
        body: JSON.stringify({
          old_password: formData.current_password,
          new_password: formData.password,
          new_password_confirmation: formData.confirmPassword,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Handle validation errors
        if (response.status === 422 && result.errors) {
          const errorMessages = Object.values(result.errors).flat().join(", ");
          const errorMsg = errorMessages || result.message || "Validation failed";
          setError(errorMsg);
          toast.error(errorMsg);
          return;
        }
        
        const errorMsg = result.message || "Failed to change password";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      if (result.success) {
        toast.success("Password changed successfully");
        setFormData({ current_password: "", password: "", confirmPassword: "" });
        setError("");
        onClose();
      } else {
        const errorMsg = result.message || "Failed to change password";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMsg = error.message || "Failed to change password";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-pink-100 hover:bg-pink-200 transition-colors z-10"
        >
          <IoMdClose className="text-red-500" size={20} />
        </button>

        {/* Modal Content */}
        <div className="p-8">
          {/* Lock Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FaLock className="text-blue-600" size={32} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-black text-center mb-2">
            Change Password
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-center mb-6 text-sm">
            Keep your account secure by updating your password.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password Field */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Current Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={formData.current_password}
                  onChange={(e) =>
                    handleInputChange("current_password", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-gray-50 text-gray-800 pr-10"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  {showCurrentPassword ? (
                    <AiFillEye size={20} />
                  ) : (
                    <AiFillEyeInvisible size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* New Password Field */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                New Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-gray-50 text-gray-800 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  {showPassword ? (
                    <AiFillEye size={20} />
                  ) : (
                    <AiFillEyeInvisible size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Confirm password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-gray-50 text-gray-800 pr-10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <AiFillEye size={20} />
                  ) : (
                    <AiFillEyeInvisible size={20} />
                  )}
                </button>
              </div>
              {error && (
                <p className="text-red-600 text-sm mt-1">{error}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#5069E5] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#3d52c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

