import { apiFetch } from "../../libs/apiFetch";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  AiFillEye,
  AiFillEyeInvisible,
  AiOutlineCheckCircle,
} from "react-icons/ai";
import { toast } from "react-toastify";

export default function SignUp() {
  const [viewPass, setViewPass] = useState(false);
  const [viewConPass, setViewConPass] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (formData) => {
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Password not matched");
      return;
    }

    const fd = new FormData();
    fd.append("name", formData.firstName + " " + formData.lastName);
    fd.append("email", formData.email);
    fd.append("company_name", formData.companyName);
    fd.append("phone", formData.mobile);
    fd.append("password", formData.password);

    try {
      const res = await apiFetch("/register", {
        method: "POST",
        body: fd,
      });

      const result = await res.json();

      if (result.success === true) {
        toast.success("Registration Successful!", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
        setTimeout(() => navigate("/login"), 2000);
      } else {
        // Handle specific error statuses or validation errors
        let errorMessage = result.message || "Registration Failed";
        
        if (result.errors) {
          const firstError = Object.values(result.errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        }

        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    } catch (error) {
      let errorMsg = error.message || "An unexpected error occurred";
      
      if (errorMsg === "Failed to fetch") {
        errorMsg = "Server connection failed. Please check your internet or try again later.";
      }

      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
    } finally {
      reset();
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#F8FAFC] text-black p-4 sm:p-6 lg:p-10 font-['Inter',_sans-serif]">

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[#5069E5]/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#F46B6A]/5 blur-[120px]"></div>
      </div>

      <div className="bg-white w-full max-w-[1240px] z-10 border border-[#E2E8F0] shadow-2xl rounded-[24px] grid grid-cols-1 lg:grid-cols-2 overflow-hidden animate-in fade-in zoom-in duration-500">
        {/* Banner Section */}
        <div className="relative hidden lg:block overflow-hidden group">
          <img
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={"/assets/signupbanner.png"}
            alt="Signup page banner"
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">
              Start your journey with us
            </h2>
            <p className="text-lg text-blue-100/90 leading-relaxed max-w-md">
              Manage your team efficiently and track time with precision. Join
              thousands of businesses today.
            </p>
            <div className="mt-8 flex gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <AiOutlineCheckCircle className="text-green-400" />
                <span className="text-sm font-medium">Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <AiOutlineCheckCircle className="text-green-400" />
                <span className="text-sm font-medium">
                  No credit card required
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="px-6 sm:px-10 lg:px-16 py-10 lg:py-14 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0F172A] mb-2 tracking-tight">
              Create an Account
            </h1>
            <p className="text-[#64748B]">
              Fill in the details below to get started
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 w-full"
          >
            {/* First Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#334155] px-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 rounded-xl border ${errors.firstName ? "border-red-400 focus:ring-red-100" : "border-[#CBD5E1] focus:border-[#5069E5] focus:ring-[#5069E5]/10"} bg-white text-gray-900 transition-all outline-none focus:ring-4`}
                placeholder="John"
                {...register("firstName", {
                  required: "First name is required",
                })}
              />
              {errors.firstName && (
                <span className="text-xs font-medium text-red-500 mt-1 ml-1">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#334155] px-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 rounded-xl border ${errors.lastName ? "border-red-400 focus:ring-red-100" : "border-[#CBD5E1] focus:border-[#5069E5] focus:ring-[#5069E5]/10"} bg-white text-gray-900 transition-all outline-none focus:ring-4`}
                placeholder="Doe"
                {...register("lastName", { required: "Last name is required" })}
              />
              {errors.lastName && (
                <span className="text-xs font-medium text-red-500 mt-1 ml-1">
                  {errors.lastName.message}
                </span>
              )}
            </div>

            {/* Company Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#334155] px-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 rounded-xl border ${errors.companyName ? "border-red-400 focus:ring-red-100" : "border-[#CBD5E1] focus:border-[#5069E5] focus:ring-[#5069E5]/10"} bg-white text-gray-900 transition-all outline-none focus:ring-4`}
                placeholder="Acme Corp"
                {...register("companyName", {
                  required: "Company name is required",
                })}
              />
              {errors.companyName && (
                <span className="text-xs font-medium text-red-500 mt-1 ml-1">
                  {errors.companyName.message}
                </span>
              )}
            </div>

            {/* Mobile */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#334155] px-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className={`w-full px-4 py-3 rounded-xl border ${errors.mobile ? "border-red-400 focus:ring-red-100" : "border-[#CBD5E1] focus:border-[#5069E5] focus:ring-[#5069E5]/10"} bg-white text-gray-900 transition-all outline-none focus:ring-4`}
                placeholder="+1 (555) 000-0000"
                {...register("mobile", {
                  required: "Mobile number is required",
                })}
              />
              {errors.mobile && (
                <span className="text-xs font-medium text-red-500 mt-1 ml-1">
                  {errors.mobile.message}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
              <label className="text-sm font-semibold text-[#334155] px-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={`w-full px-4 py-3 rounded-xl border ${errors.email ? "border-red-400 focus:ring-red-100" : "border-[#CBD5E1] focus:border-[#5069E5] focus:ring-[#5069E5]/10"} bg-white text-gray-900 transition-all outline-none focus:ring-4`}
                placeholder="john@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <span className="text-xs font-medium text-red-500 mt-1 ml-1">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-sm font-semibold text-[#334155] px-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={viewPass ? "text" : "password"}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.password ? "border-red-400 focus:ring-red-100" : "border-[#CBD5E1] focus:border-[#5069E5] focus:ring-[#5069E5]/10"} bg-white text-gray-900 transition-all outline-none focus:ring-4 pr-12`}
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters" },
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94A3B8] hover:text-[#5069E5] transition-colors"
                  onClick={() => setViewPass(!viewPass)}
                >
                  {viewPass ? (
                    <AiFillEye size={22} />
                  ) : (
                    <AiFillEyeInvisible size={22} />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs font-medium text-red-500 mt-1 ml-1">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-sm font-semibold text-[#334155] px-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={viewConPass ? "text" : "password"}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword ? "border-red-400 focus:ring-red-100" : "border-[#CBD5E1] focus:border-[#5069E5] focus:ring-[#5069E5]/10"} bg-white text-gray-900 transition-all outline-none focus:ring-4 pr-12`}
                  placeholder="••••••••"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94A3B8] hover:text-[#5069E5] transition-colors"
                  onClick={() => setViewConPass(!viewConPass)}
                >
                  {viewConPass ? (
                    <AiFillEye size={22} />
                  ) : (
                    <AiFillEyeInvisible size={22} />
                  )}
                </button>
              </div>
              {(errors.confirmPassword || error) && (
                <span className="text-xs font-medium text-red-500 mt-1 ml-1">
                  {errors.confirmPassword?.message || error}
                </span>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="col-span-1 sm:col-span-2 mt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    className="peer hidden"
                    {...register("tearmsCondition", {
                      required: "You must accept the terms",
                    })}
                  />
                  <div className="h-5 w-5 border-2 border-[#CBD5E1] rounded peer-checked:bg-[#5069E5] peer-checked:border-[#5069E5] transition-all"></div>
                  <AiOutlineCheckCircle className="absolute inset-0 text-white opacity-0 peer-checked:opacity-100 transition-opacity p-0.5" />
                </div>
                <span className="text-sm text-[#64748B] leading-snug">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="text-[#5069E5] font-medium hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className="text-[#5069E5] font-medium hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.tearmsCondition && (
                <span className="text-xs font-medium text-red-500 block mt-1 ml-8">
                  {errors.tearmsCondition.message}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <div className="col-span-1 sm:col-span-2 pt-4">
              <button
                type="submit"
                className="w-full bg-[#5069E5] hover:bg-[#3E52C1] active:scale-[0.98] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#5069E5]/20 transition-all duration-200"
              >
                Create Account
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#64748B] font-medium">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#5069E5] font-bold hover:underline decoration-2 underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


