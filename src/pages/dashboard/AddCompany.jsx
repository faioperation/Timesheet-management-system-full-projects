import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import { AiFillEye, AiFillEyeInvisible, AiOutlineCheckCircle, AiOutlinePlusCircle } from "react-icons/ai";
import { FiChevronDown } from "react-icons/fi";
import { apiFetch } from "../../libs/apiFetch";

export default function AddCompany() {
    const navigate = useNavigate();
    const [viewPass, setViewPass] = useState(false);
    const [viewConPass, setViewConPass] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        defaultValues: {
            gender: "Male",
            maritalStatus: "Single",
            role: "Business Admin"
        }
    });

    const password = watch("password");

    const onSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            // Create FormData object (API expects form-data, not JSON)
            const formDataPayload = new FormData();
            formDataPayload.append('name', formData.adminName);
            formDataPayload.append('email', formData.email);
            formDataPayload.append('password', formData.password);
            formDataPayload.append('phone', formData.phone);
            formDataPayload.append('address', formData.address || '');
            formDataPayload.append('gender', formData.gender.toLowerCase());  // Convert to lowercase
            formDataPayload.append('marital_status', formData.maritalStatus.toLowerCase());  // Convert to lowercase
            formDataPayload.append('company_name', formData.companyName);
            formDataPayload.append('role_id', '2');  // Business Admin role ID

            console.log('Add Company FormData:');
            for (let [key, value] of formDataPayload.entries()) {
                console.log(`${key}: ${value}`);
            }

            const response = await apiFetch("/business", {
                method: "POST",
                body: formDataPayload,  // Send FormData (no Content-Type header needed)
            });

            const contentType = response.headers.get("content-type");
            let result;
            if (contentType && contentType.includes("application/json")) {
                result = await response.json();
            } else {
                const text = await response.text();
                throw new Error(text || "Failed to parse server response");
            }

            console.log('Add Company Response:', result);

            if (response.ok) {
                toast.success("Company Added Successfully!", {
                    position: "top-right",
                    theme: "colored"
                });
                setTimeout(() => navigate("/dashboard/company"), 1500);
            } else {
                console.error('API Error:', result);
                
                // Handle validation error messages if present (Laravel format)
                if (result && result.errors) {
                    Object.values(result.errors).flat().forEach((msg) => {
                        toast.error(msg, {
                            position: "top-right",
                            theme: "colored"
                        });
                    });
                } else {
                    const message = result?.message || result?.error || "Failed to add company";
                    toast.error(message, {
                        position: "top-right",
                        theme: "colored"
                    });
                }
            }
        } catch (error) {
            console.error('Catch Error:', error);
            toast.error(`Error: ${error.message || "An unexpected error occurred"}`, {
                position: "top-right",
                theme: "colored"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full h-full font-['Inter',_sans-serif]">
            <ToastContainer />

            <div className="flex items-center justify-between mb-8 px-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#0F172A] mb-1 tracking-tight">Add New Company</h1>
                    <p className="text-[#64748B] text-sm font-medium">Create a new business admin and company profile</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="px-5 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm font-bold text-[#64748B] hover:border-[#5069E5] hover:text-[#5069E5] transition-all shadow-sm active:scale-95"
                >
                    Back to List
                </button>
            </div>

            <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-xl shadow-[#5069E5]/5 overflow-hidden mx-4 mb-10">
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 lg:p-12">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">

                        {/* Business Admin Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-[#334155] px-1 uppercase tracking-wider">
                                Business Admin Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`w-full px-4 py-3.5 rounded-xl border ${errors.adminName ? 'border-red-400 focus:ring-red-100' : 'border-[#E2E8F0] focus:border-[#5069E5] focus:ring-[#5069E5]/10'} bg-[#F8FAFC]/50 text-gray-900 transition-all outline-none focus:ring-4`}
                                placeholder="Naresh Vyas"
                                {...register("adminName", { 
                                    required: "Name is required",
                                    maxLength: { value: 100, message: "Name cannot exceed 100 characters" }
                                })}
                            />
                            {errors.adminName && (
                                <span className="text-xs font-semibold text-red-500 mt-1 ml-1">{errors.adminName.message}</span>
                            )}
                        </div>

                        {/* Company Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-[#334155] px-1 uppercase tracking-wider">
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`w-full px-4 py-3.5 rounded-xl border ${errors.companyName ? 'border-red-400 focus:ring-red-100' : 'border-[#E2E8F0] focus:border-[#5069E5] focus:ring-[#5069E5]/10'} bg-[#F8FAFC]/50 text-gray-900 transition-all outline-none focus:ring-4`}
                                placeholder="Tech Innovators Inc."
                                {...register("companyName", { 
                                    required: "Company name is required",
                                    maxLength: { value: 100, message: "Company name cannot exceed 100 characters" }
                                })}
                            />
                            {errors.companyName && (
                                <span className="text-xs font-semibold text-red-500 mt-1 ml-1">{errors.companyName.message}</span>
                            )}
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-[#334155] px-1 uppercase tracking-wider">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                className={`w-full px-4 py-3.5 rounded-xl border ${errors.email ? 'border-red-400 focus:ring-red-100' : 'border-[#E2E8F0] focus:border-[#5069E5] focus:ring-[#5069E5]/10'} bg-[#F8FAFC]/50 text-gray-900 transition-all outline-none focus:ring-4`}
                                placeholder="example@gmail.com"
                                {...register("email", {
                                    required: "Email is required",
                                    maxLength: { value: 100, message: "Email cannot exceed 100 characters" },
                                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" }
                                })}
                            />
                            {errors.email && (
                                <span className="text-xs font-semibold text-red-500 mt-1 ml-1">{errors.email.message}</span>
                            )}
                        </div>

                        {/* Mobile */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-[#334155] px-1 uppercase tracking-wider">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                className={`w-full px-4 py-3.5 rounded-xl border ${errors.phone ? 'border-red-400 focus:ring-red-100' : 'border-[#E2E8F0] focus:border-[#5069E5] focus:ring-[#5069E5]/10'} bg-[#F8FAFC]/50 text-gray-900 transition-all outline-none focus:ring-4`}
                                placeholder="1234567890"
                                {...register("phone", { 
                                    required: "Phone is required",
                                    maxLength: { value: 20, message: "Phone cannot exceed 20 characters" }
                                })}
                                onInput={(e) => {
                                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                                }}
                            />
                            {errors.phone && (
                                <span className="text-xs font-semibold text-red-500 mt-1 ml-1">{errors.phone.message}</span>
                            )}
                        </div>

                        {/* Gender */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-[#334155] px-1 uppercase tracking-wider">
                                Gender
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-3.5 rounded-xl border border-[#E2E8F0] focus:border-[#5069E5] focus:ring-[#5069E5]/10 bg-[#F8FAFC]/50 text-gray-900 transition-all outline-none focus:ring-4 appearance-none cursor-pointer font-medium"
                                    {...register("gender")}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#64748B]">
                                    <FiChevronDown size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Marital Status */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-[#334155] px-1 uppercase tracking-wider">
                                Marital Status
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-3.5 rounded-xl border border-[#E2E8F0] focus:border-[#5069E5] focus:ring-[#5069E5]/10 bg-[#F8FAFC]/50 text-gray-900 transition-all outline-none focus:ring-4 appearance-none cursor-pointer font-medium"
                                    {...register("maritalStatus")}
                                >
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Widowed">Widowed</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#64748B]">
                                    <FiChevronDown size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                            <label className="text-sm font-bold text-[#334155] px-1 uppercase tracking-wider">
                                Address
                            </label>
                            <textarea
                                rows={3}
                                className="w-full px-4 py-3.5 rounded-xl border border-[#E2E8F0] focus:border-[#5069E5] focus:ring-[#5069E5]/10 bg-[#F8FAFC]/50 text-gray-900 transition-all outline-none focus:ring-4 resize-none"
                                placeholder="123 Business Avenue, Suite 100..."
                                {...register("address", { 
                                    maxLength: { value: 255, message: "Address cannot exceed 255 characters" }
                                })}
                            />
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-[#334155] px-1 uppercase tracking-wider">
                                Admin Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={viewPass ? "text" : "password"}
                                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.password ? 'border-red-400 focus:ring-red-100' : 'border-[#E2E8F0] focus:border-[#5069E5] focus:ring-[#5069E5]/10'} bg-[#F8FAFC]/50 text-gray-900 transition-all outline-none focus:ring-4 pr-12`}
                                    placeholder="••••••••"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: { value: 6, message: "Min 6 characters" }
                                    })}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94A3B8] hover:text-[#5069E5] transition-colors"
                                    onClick={() => setViewPass(!viewPass)}
                                >
                                    {viewPass ? <AiFillEye size={22} /> : <AiFillEyeInvisible size={22} />}
                                </button>
                            </div>
                            {errors.password && (
                                <span className="text-xs font-semibold text-red-500 mt-1 ml-1">{errors.password.message}</span>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-[#334155] px-1 uppercase tracking-wider">
                                Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={viewConPass ? "text" : "password"}
                                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.confirmPassword ? 'border-red-400 focus:ring-red-100' : 'border-[#E2E8F0] focus:border-[#5069E5] focus:ring-[#5069E5]/10'} bg-[#F8FAFC]/50 text-gray-900 transition-all outline-none focus:ring-4 pr-12`}
                                    placeholder="••••••••"
                                    {...register("confirmPassword", {
                                        required: "Confirm password is required",
                                        validate: (val) => val === password || "Passwords do not match"
                                    })}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94A3B8] hover:text-[#5069E5] transition-colors"
                                    onClick={() => setViewConPass(!viewConPass)}
                                >
                                    {viewConPass ? <AiFillEye size={22} /> : <AiFillEyeInvisible size={22} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <span className="text-xs font-semibold text-red-500 mt-1 ml-1">{errors.confirmPassword.message}</span>
                            )}
                        </div>

                    </div>

                    <div className="mt-12 flex justify-end gap-5">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-10 py-4 border border-[#E2E8F0] rounded-xl font-bold text-[#64748B] hover:bg-[#F8FAFC] transition-all active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-10 py-4 bg-[#5069E5] hover:bg-[#3E52C1] text-white rounded-xl font-bold flex items-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-[#5069E5]/20 disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Adding Company...</span>
                                </>
                            ) : (
                                <>
                                    <AiOutlinePlusCircle size={22} />
                                    <span>Add Company</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
