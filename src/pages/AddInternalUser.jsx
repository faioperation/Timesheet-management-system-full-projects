import React, { useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiFetch } from "../libs/apiFetch";

const ROLE_OPTIONS = [
  { label: "Business Development Manager", value: "bd_manager" },
  { label: "Account Manager", value: "account_manager" },
  { label: "Recruiter", value: "recruiter" },
];

const COMMISSION_ON_OPTIONS = [
  { label: "Gross margin", value: "gross-margin" },
  { label: "Net margin", value: "net-margin" },
];
const RATE_TYPE_OPTIONS = [
  { label: "Percentage", value: "percentage" },
  { label: "Fixed", value: "fixed" },
];
const MONTH_OPTIONS = [
  { label: "On all month", value: "on all month" },
  { label: "January", value: "january" },
  { label: "February", value: "february" },
  { label: "March", value: "march" },
  { label: "April", value: "april" },
  { label: "May", value: "may" },
  { label: "June", value: "june" },
  { label: "July", value: "july" },
  { label: "August", value: "august" },
  { label: "September", value: "september" },
  { label: "October", value: "october" },
  { label: "November", value: "november" },
  { label: "December", value: "december" },
];

export default function AddInternalUser() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "Male",
    role: "bd_manager",
    commissionOn: "gross-margin",
    rateType: "percentage",
    rate: "",
    recursive: true,
    recursiveMonth: "january",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateRequired = () => {
    const errors = {};
    const isBlank = (value) =>
      value === null ||
      value === undefined ||
      (typeof value === "string" && !value.trim());

    if (isBlank(formData.name)) errors.name = "Name is required";
    if (isBlank(formData.email)) errors.email = "Email is required";
    if (isBlank(formData.phone)) errors.phone = "Phone is required";
    if (isBlank(formData.role)) errors.role = "Role is required";
    if (isBlank(formData.commissionOn))
      errors.commissionOn = "Commission on is required";
    if (isBlank(formData.rateType))
      errors.rateType = "Rate type is required";

    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateRequired();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone);
      if (formData.gender) {
        payload.append("gender", formData.gender.toLowerCase());
      }
      payload.append("role", formData.role);
      payload.append("commission_on", formData.commissionOn);
      payload.append("rate_type", formData.rateType);
      payload.append("rate", String(Number(formData.rate) || 0));
      payload.append("recuesive", formData.recursive ? "1" : "0");
      if (formData.recursive) {
        payload.append("month", "all_months");
      } else if (formData.recursiveMonth) {
        payload.append("month", formData.recursiveMonth);
      }

      const response = await apiFetch("/internaluser", {
        method: "POST",
        body: payload,
      });

      const contentType = response.headers.get("content-type") || "";
      let result = {};
      if (contentType.includes("application/json")) {
        result = await response.json().catch(() => ({}));
      } else {
        const text = await response.text().catch(() => "");
        if (text) {
          result = { message: text };
        }
      }

      if (!response.ok || !result.success) {
        const errorMessage =
          (result && (result.message || result.error)) ||
          (result && result.errors && Object.values(result.errors)[0]) ||
          `Failed to create internal user (status ${response.status})`;
        throw new Error(
          Array.isArray(errorMessage) ? errorMessage[0] : errorMessage
        );
      }

      toast.success("Internal user created successfully");
      navigate("/user/userlist");
    } catch (error) {
      console.error("Error creating internal user:", error);
      toast.error(error.message || "Failed to create internal user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/user/userlist");
  };

  return (
    <div className="w-full pb-10">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-black mb-6">Add Internal User</h2>

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
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-800 ${fieldErrors.name
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-300 focus:ring-[#5069E5]"
                }`}
              placeholder="Enter name"
            />
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
            )}
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
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-800 ${fieldErrors.email
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-300 focus:ring-[#5069E5]"
                }`}
              placeholder="Enter email"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
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
                  className={`w-full px-4 py-2.5 pl-10 border rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-800 ${fieldErrors.phone
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300 focus:ring-[#5069E5]"
                    }`}
                  placeholder="Enter phone"
                />
              </div>
              {fieldErrors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.phone}
                </p>
              )}
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
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 appearance-none bg-white text-gray-800 pr-10 cursor-pointer ${fieldErrors.role
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:ring-[#5069E5]"
                  }`}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <IoMdArrowDropdown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                size={20}
              />
            </div>
            {fieldErrors.role && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.role}</p>
            )}
          </div>

          {/* Commission Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission on<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.commissionOn}
                  onChange={(e) =>
                    handleInputChange("commissionOn", e.target.value)
                  }
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 appearance-none bg-white text-gray-800 pr-10 cursor-pointer ${fieldErrors.commissionOn
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300 focus:ring-[#5069E5]"
                    }`}
                >
                  {COMMISSION_ON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <IoMdArrowDropdown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  size={20}
                />
              </div>
              {fieldErrors.commissionOn && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.commissionOn}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate type<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.rateType}
                  onChange={(e) => handleInputChange("rateType", e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 appearance-none bg-white text-gray-800 pr-10 cursor-pointer ${fieldErrors.rateType
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300 focus:ring-[#5069E5]"
                    }`}
                >
                  {RATE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <IoMdArrowDropdown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  size={20}
                />
              </div>
              {fieldErrors.rateType && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldErrors.rateType}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate
              </label>
              <input
                type="number"
                value={formData.rate}
                onChange={(e) => handleInputChange("rate", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
                placeholder="00.00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recursive
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.recursive}
                  onChange={() =>
                    handleInputChange("recursive", !formData.recursive)
                  }
                  className="checkbox checkbox-sm text-[#5069E5] border-gray-300"
                />
                <span className="text-sm text-gray-700">Recursive</span>
              </div>
              <div className="mt-2 relative">
                {formData.recursive ? (
                  <input
                    type="text"
                    value="All months"
                    readOnly
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-indigo-50 text-gray-800"
                  />
                ) : (
                  <>
                    <select
                      value={formData.recursiveMonth}
                      onChange={(e) =>
                        handleInputChange("recursiveMonth", e.target.value)
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                    >
                      {MONTH_OPTIONS.filter(
                        (option) => option.value !== "on all month"
                      ).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <IoMdArrowDropdown
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                      size={20}
                    />
                  </>
                )}
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
              {isSubmitting ? "Adding..." : "Add internal user"}
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
    </div>
  );
}
