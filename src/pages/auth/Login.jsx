import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { AiFillEye, AiFillEyeInvisible, AiOutlineCheckCircle, AiOutlineLogin } from "react-icons/ai";
import { useForm } from "react-hook-form";
import { apiFetch } from "../../libs/apiFetch";
import { toast } from "react-toastify";
import { getRoleBasedDashboard } from "../../libs/roleUtils";

export default function Login() {
  const [viewPass, setViewPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const contentType = res.headers.get("content-type");
      let result;

      if (contentType && contentType.includes("application/json")) {
        result = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`API Error (${res.status}): ${text || res.statusText || 'Unknown error'}`);
      }

      if (res.ok) {
        // Check if user status is approved
        const userStatus = result.status || result.user?.status;

        if (userStatus && userStatus.toLowerCase() !== 'approved') {
          toast.warning('Your account is currently under review. Please wait for approval.', {
            position: "top-right",
            autoClose: 5000,
            theme: "colored"
          });
          return; // Don't proceed with login
        }

        const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7;
        const isSecure = window.location.protocol === 'https:';

        document.cookie = `auth_token=${result.token}; path=/; max-age=${maxAge}; ${isSecure ? 'Secure;' : ''} SameSite=Strict`;
        if (result.token) {
          window.localStorage.setItem("access_token", result.token);
        }
        if (result.role) {
          document.cookie = `user_role=${result.role}; path=/; max-age=${maxAge}; ${isSecure ? 'Secure;' : ''} SameSite=Strict`;
        }
        if (result.user?.name || result.name) {
          const userName = result.user?.name || result.name;
          document.cookie = `user_name=${encodeURIComponent(userName)}; path=/; max-age=${maxAge}; ${isSecure ? 'Secure;' : ''} SameSite=Strict`;
        }
        if (result.user?.email || result.email) {
          const userEmail = result.user?.email || result.email;
          document.cookie = `user_email=${encodeURIComponent(userEmail)}; path=/; max-age=${maxAge}; ${isSecure ? 'Secure;' : ''} SameSite=Strict`;
        }

        toast.success("Login Successful!", {
          position: "top-right",
          autoClose: 2000,
          theme: "colored"
        });

        const dashboardPath = getRoleBasedDashboard(result.role || 'User');
        setTimeout(() => navigate(dashboardPath), 1000);
      } else {
        // Handle specific error statuses
        let errorMessage = result.message || "Something went wrong";
        
        // If it's a validation error (422), extract the first error message
        if (res.status === 422 && result.errors) {
          const firstError = Object.values(result.errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        }

        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
          theme: "colored"
        });
      }
    } catch (error) {
      let errorMsg = error.message || "An unexpected error occurred";
      
      // Handle browser's "Failed to fetch" (network errors)
      if (errorMsg === "Failed to fetch") {
        errorMsg = "Server connection failed. Please check your internet or try again later.";
      }

      toast.error(errorMsg, {
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
            alt="Login page banner"
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-12 text-white">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Welcome Back to ManageTP</h2>
            <p className="text-lg text-blue-100/90 leading-relaxed max-w-sm">
              Your comprehensive solution for seamless time management and team productivity.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20">
                <AiOutlineCheckCircle className="text-green-400" size={20} />
                <span className="text-sm font-medium">Real-time collaboration</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20">
                <AiOutlineCheckCircle className="text-green-400" size={20} />
                <span className="text-sm font-medium">Secure data encryption</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="px-6 sm:px-10 lg:px-16 py-12 lg:py-20 flex flex-col justify-center">
          <div className="mb-10">
            <div className="w-12 h-12 bg-[#5069E5] rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-[#5069E5]/30">
              <AiOutlineLogin size={26} />
            </div>
            <h1 className="text-3xl font-bold text-[#0F172A] mb-2 tracking-tight">Login to your account</h1>
            <p className="text-[#64748B]">Welcome back! Please enter your details.</p>
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

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-[#334155]">
                  Password <span className="text-red-500">*</span>
                </label>
                <Link to="/forgot-password" size="sm" className="text-sm font-bold text-[#5069E5] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={viewPass ? "text" : "password"}
                  className={`w-full px-4 py-3.5 rounded-xl border ${errors.password ? 'border-red-400 focus:ring-red-100' : 'border-[#CBD5E1] focus:border-[#5069E5] focus:ring-[#5069E5]/10'} bg-white text-gray-900 transition-all outline-none focus:ring-4 pr-12`}
                  placeholder="••••••••"
                  {...register("password", { required: "Password is required" })}
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
                <span className="text-xs font-medium text-red-500 mt-1 ml-1">{errors.password.message}</span>
              )}
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="peer hidden"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <div className="h-5 w-5 border-2 border-[#CBD5E1] rounded peer-checked:bg-[#5069E5] peer-checked:border-[#5069E5] transition-all"></div>
                  <AiOutlineCheckCircle className="absolute inset-0 text-white opacity-0 peer-checked:opacity-100 transition-opacity p-0.5" />
                </div>
                <span className="text-sm font-medium text-[#64748B]">Remember for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#5069E5] hover:bg-[#3E52C1] active:scale-[0.98] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#5069E5]/20 transition-all duration-200 disabled:opacity-70 disabled:active:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[#64748B] font-medium">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#5069E5] font-bold hover:underline decoration-2 underline-offset-4">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
