import React, { useState, useEffect } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../libs/apiFetch";
import { toast, ToastContainer } from "react-toastify";

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "Male",
    role: "User",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiFetch(`/user/${id}`, { method: "GET" });
        if (!response.ok) throw new Error("Failed to fetch user data");
        const result = await response.json();
        if (result.success && result.data) {
          const u = result.data;
          const roleMapReverse = {
            2: "Business Admin",
            3: "Supervisor",
            4: "User",
          };
          const roleId = u.roles && u.roles[0] ? u.roles[0].id : 4;
          
          setFormData({
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            gender: u.gender ? u.gender.charAt(0).toUpperCase() + u.gender.slice(1) : "Male",
            role: roleMapReverse[roleId] || "User",
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
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

      const roleMap = {
        "Business Admin": 2,
        Supervisor: 3,
        User: 4,
      };
      const roleId = roleMap[formData.role] || 4;
      payload.append("role_id", String(roleId));

      const response = await apiFetch(`/user/${id}`, {
        method: "POST", // Using POST with _method=PUT because of FormData
        body: payload,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update user");
      }

      toast.success("User updated successfully");
      setTimeout(() => navigate("/user/userlist"), 1500);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.message || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center text-gray-500">Loading user data...</div>;
  }

  return (
    <div className="w-full pb-10">
      <ToastContainer />
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-black mb-6">Edit User</h2>

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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800"
              >
                <option value="Supervisor">Supervisor</option>
                <option value="User">User</option>
                <option value="Business Admin">Business Admin</option>
              </select>
              <IoMdArrowDropdown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-medium disabled:opacity-60"
            >
              {isSubmitting ? "Updating..." : "Update User"}
            </button>
            <button
              onClick={() => navigate("/user/userlist")}
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
