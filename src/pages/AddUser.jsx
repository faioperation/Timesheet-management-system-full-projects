import React, { useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaEye, FaEyeSlash, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import UserSuccessModal from "../components/UserSuccessModal";
import { apiFetch } from "../libs/apiFetch";
import { toast } from "react-toastify";

export default function AddUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "Male",
    role: "User",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUserId, setCreatedUserId] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.role ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password and Confirm Password do not match");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("password", formData.password);
      payload.append("phone", formData.phone);
      if (formData.gender)
        payload.append("gender", formData.gender.toLowerCase());

      // Map role text to backend role_id (based on seed data: 2=Business Admin/Admin, 3=Supervisor/Staff, 4=User)
      const roleMap = {
        Admin: 2,
        Supervisor: 3,
        User: 4,
      };
      const roleId = roleMap[formData.role] || 4;
      payload.append("role_id", String(roleId));

      const response = await apiFetch("/user", {
        method: "POST",
        body: payload,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        // Handle validation error messages if present
        if (result && result.errors) {
          const firstError = Object.values(result.errors)[0];
          const message = Array.isArray(firstError)
            ? firstError[0]
            : firstError;
          throw new Error(message || "Failed to create user");
        }

        const message = result && (result.message || result.error);
        throw new Error(message || "Failed to create user");
      }

      toast.success("User created successfully");

      // Save created user ID (backend may return it in data or user)
      const newUserId =
        (result.data && (result.data.id || result.data.user_id)) ||
        (result.user && result.user.id) ||
        null;
      setCreatedUserId(newUserId);

      setShowSuccessModal(true);

      // Reset form (keep createdUserId so we can use it in modal navigation)
      setFormData({
        name: "",
        email: "",
        phone: "",
        gender: "Male",
        role: "User",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/user/userlist");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="w-full pb-10">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-black mb-6">Add User</h2>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
              placeholder="Enter name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
              placeholder="Enter email"
            />
          </div>

          {/* Phone and Gender Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaEdit
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                  placeholder="Enter phone"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <div className="relative">
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
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
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
                <option value="Supervisor">Supervisor</option>
              </select>
              <IoMdArrowDropdown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={20}
              />
            </div>
          </div>

          {/* Password and Confirm Password Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <FaEye size={16} />
                  ) : (
                    <FaEyeSlash size={16} />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <FaEye size={16} />
                  ) : (
                    <FaEyeSlash size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding..." : "Add user"}
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <UserSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        userId={createdUserId}
      />
    </div>
  );
}
