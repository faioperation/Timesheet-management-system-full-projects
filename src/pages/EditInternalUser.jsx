import React, { useState, useEffect } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { apiFetch } from "../libs/apiFetch";

const ROLE_OPTIONS = [
  { label: "Business Development Manager", value: "bd_manager" },
  { label: "Account Manager", value: "ac_manager" },
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

export default function EditInternalUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const fetchInternalUser = async () => {
      try {
        const response = await apiFetch(`/internaluser/${id}`, { method: "GET" });
        if (!response.ok) throw new Error("Failed to fetch internal user data");
        const result = await response.json();
        if (result.success && result.data) {
          const u = result.data;
          setFormData({
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            gender: u.gender ? u.gender.charAt(0).toUpperCase() + u.gender.slice(1) : "Male",
            role: u.role || "bd_manager",
            commissionOn: u.commission_on || "gross-margin",
            rateType: u.rate_type || "percentage",
            rate: u.rate || "",
            recursive: u.recuesive == 1,
            recursiveMonth: u.month === "all_months" ? "january" : (u.month || "january"),
          });
        }
      } catch (error) {
        console.error("Error fetching internal user:", error);
        toast.error("Failed to load internal user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInternalUser();
  }, [id]);

  const handleInputChange = (field, value) => {
    let finalValue = value;
    if (field === "phone") {
      finalValue = value.replace(/[^0-9]/g, "");
    }
    setFormData((prev) => ({ ...prev, [field]: finalValue }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone);
      if (formData.gender) payload.append("gender", formData.gender.toLowerCase());
      payload.append("role", formData.role);
      payload.append("commission_on", formData.commissionOn);
      payload.append("rate_type", formData.rateType);
      payload.append("rate", String(Number(formData.rate) || 0));
      payload.append("recuesive", formData.recursive ? "1" : "0");
      payload.append("month", formData.recursive ? "all_months" : formData.recursiveMonth);

      const response = await apiFetch(`/internaluser/${id}`, {
        method: "POST",
        body: payload,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update internal user");
      }

      toast.success("Internal user updated successfully");
      setTimeout(() => navigate("/user/userlist"), 1500);
    } catch (error) {
      console.error("Error updating internal user:", error);
      toast.error(error.message || "Failed to update internal user");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center text-gray-500">Loading internal user data...</div>;
  }

  return (
    <div className="w-full pb-10">
      <ToastContainer />
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-black mb-6">Edit Internal User</h2>
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
              <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Commission on*</label>
              <div className="relative">
                <select
                  value={formData.commissionOn}
                  onChange={(e) => handleInputChange("commissionOn", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10"
                >
                  {COMMISSION_ON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rate type*</label>
              <div className="relative">
                <select
                  value={formData.rateType}
                  onChange={(e) => handleInputChange("rateType", e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10"
                >
                  {RATE_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rate*</label>
              <input
                type="number"
                value={formData.rate}
                onChange={(e) => handleInputChange("rate", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-white text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recursive</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={formData.recursive}
                  onChange={() => handleInputChange("recursive", !formData.recursive)}
                  className="checkbox checkbox-sm"
                />
                <span className="text-sm">Recursive</span>
              </div>
              <div className="relative">
                {formData.recursive ? (
                  <input type="text" value="All months" readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" />
                ) : (
                  <>
                    <select
                      value={formData.recursiveMonth}
                      onChange={(e) => handleInputChange("recursiveMonth", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10"
                    >
                      {MONTH_OPTIONS.filter(o => o.value !== "on all month").map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-medium disabled:opacity-60"
            >
              {isSubmitting ? "Updating..." : "Update Internal User"}
            </button>
            <button onClick={() => navigate("/user/userlist")} className="px-6 py-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
