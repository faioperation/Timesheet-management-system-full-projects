import React, { useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaEye, FaEyeSlash, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AddCompany() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        gender: "Male",
        role: "Business Admin",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (
            !formData.name ||
            !formData.email ||
            !formData.phone ||
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

        // Implementation of submission logic would go here
        setIsSubmitting(true);
        setTimeout(() => {
            toast.success("Company added successfully");
            setIsSubmitting(false);
            navigate("/dashboard/system-admin/company");
        }, 1000);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="w-full pb-10">
            <div className="bg-[#F0F0F2] min-h-screen p-6 rounded-lg">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Name<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5069E5] bg-white text-gray-800 placeholder-gray-400"
                            placeholder="Naresh Vyas"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5069E5] bg-white text-gray-800 placeholder-gray-400"
                            placeholder="example@gmail.com"
                        />
                    </div>

                    {/* Phone and Gender Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone<span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none border-r pr-2 border-gray-200">
                                    <FaEdit size={14} />
                                </div>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5069E5] bg-white text-gray-800 placeholder-gray-400"
                                    placeholder="+889737671565"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Gender
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.gender}
                                    onChange={(e) => handleInputChange("gender", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none bg-gray-100 rounded p-0.5">
                                    <IoMdArrowDropdown className="text-gray-500" size={18} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Password and Confirm Password Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => handleInputChange("password", e.target.value)}
                                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5069E5] bg-white text-gray-800"
                                    placeholder="test3124"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Confirm password<span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5069E5] bg-white text-gray-800"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-center gap-4 pt-8">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-10 py-3 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-semibold shadow-sm"
                        >
                            {isSubmitting ? "Adding..." : "Add user"}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-10 py-3 bg-[#FFF5F5] text-[#FF5A5A] rounded-lg hover:bg-[#FFEAEA] transition-colors font-semibold shadow-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
