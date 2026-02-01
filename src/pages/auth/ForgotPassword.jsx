import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { apiFetch } from "../../libs/apiFetch";
import { toast, ToastContainer } from "react-toastify";
import { AiOutlineCheckCircle, AiOutlineMail } from "react-icons/ai";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (formData) => {
        setIsLoading(true);
        try {
            const res = await apiFetch("/forget-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: formData.email }),
            });

            const result = await res.json();

            if (res.ok) {
                toast.success(result.message || "OTP sent successfully to your email", {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored"
                });
                localStorage.setItem('reset_email', formData.email);
                setTimeout(() => {
                    navigate("/verify-otp");
                }, 1000);
            } else {
                toast.error(result.message || "Failed to send OTP", {
                    position: "top-right",
                    autoClose: 3000,
                    theme: "colored"
                });
            }
        } catch (error) {
            console.error("Forgot Password Error", error);
            toast.error(`Error: ${error.message || "An unexpected error occurred"}`, {
                position: "top-right",
                autoClose: 5000,
                theme: "colored"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex justify-center items-center bg-[#F8FAFC] text-black p-4 sm:p-6 lg:p-10 font-['Inter',_sans-serif]">

            {/* Dynamic Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#5069E5]/5 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#F46B6A]/5 blur-[120px]"></div>
            </div>

            <div className="bg-white w-full max-w-[1140px] z-10 border border-[#E2E8F0] shadow-2xl rounded-[24px] grid grid-cols-1 lg:grid-cols-2 overflow-hidden animate-in fade-in zoom-in duration-500">

                {/* Banner Section */}
                <div className="relative hidden lg:block overflow-hidden group">
                    <img
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        src={"/assets/loginbanner.png"}
                        alt="Forgot password banner"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D2080]/80 via-transparent to-transparent flex flex-col justify-end p-12 text-white">
                        <h2 className="text-4xl font-bold mb-4 tracking-tight">Reset Your Password</h2>
                        <p className="text-lg text-blue-100/90 leading-relaxed max-w-sm">
                            Don't worry! It happens. Enter your email and we'll send you a code to reset your password.
                        </p>
                        <div className="mt-8 flex flex-col gap-3">
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20">
                                <AiOutlineCheckCircle className="text-green-400" size={20} />
                                <span className="text-sm font-medium">Quick & secure process</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20">
                                <AiOutlineCheckCircle className="text-green-400" size={20} />
                                <span className="text-sm font-medium">OTP sent instantly</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="px-6 sm:px-10 lg:px-16 py-12 lg:py-20 flex flex-col justify-center">
                    <div className="mb-10">
                        <div className="w-12 h-12 bg-[#5069E5] rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-[#5069E5]/30">
                            <AiOutlineMail size={26} />
                        </div>
                        <h1 className="text-3xl font-bold text-[#0F172A] mb-2 tracking-tight">Forgot Password?</h1>
                        <p className="text-[#64748B]">No worries! Enter your email and we'll send you a reset code.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-[#334155] px-1">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                className={`w-full px-4 py-3.5 rounded-xl border ${errors.email ? 'border-red-400 focus:ring-red-100' : 'border-[#CBD5E1] focus:border-[#5069E5] focus:ring-[#5069E5]/10'} bg-white text-gray-900 transition-all outline-none focus:ring-4`}
                                placeholder="john@example.com"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                            />
                            {errors.email && (
                                <span className="text-xs font-medium text-red-500 mt-1 ml-1">{errors.email.message}</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#5069E5] hover:bg-[#3E52C1] active:scale-[0.98] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#5069E5]/20 transition-all duration-200 disabled:opacity-70 disabled:active:scale-100"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Sending OTP...</span>
                                </div>
                            ) : (
                                "Send OTP"
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-[#64748B] font-medium">
                            Remember your password?{" "}
                            <Link to="/login" className="text-[#5069E5] font-bold hover:underline decoration-2 underline-offset-4">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
