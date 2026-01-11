import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
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

      // Handle error responses that might not be JSON
      const contentType = res.headers.get("content-type");
      let result;
      
      if (contentType && contentType.includes("application/json")) {
        try {
          result = await res.json();
        } catch (error) {
          // If JSON parsing fails, clone the response and get text
          const clonedRes = res.clone();
          const text = await clonedRes.text();
          throw new Error(`API Error (${res.status}): ${text || res.statusText || 'Failed to parse response'}`);
        }
      } else {
        // If response is not JSON, get text instead
        const text = await res.text();
        throw new Error(`API Error (${res.status}): ${text || res.statusText || 'Unknown error'}`);
      }

      if (res.status === 401 || res.status === 403) {
        toast.error(result.message || "Login Failed", {
          position: "top-right",
          autoClose: 3000,
        });
      } else if (res.ok) {
        // Set cookie expiry based on Remember Me checkbox
        const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7; // 30 days or 7 days
        const isSecure = window.location.protocol === 'https:';

        document.cookie = `auth_token=${result.token}; path=/; max-age=${maxAge}; ${isSecure ? 'Secure;' : ''} SameSite=Strict`;
        if (result.role) {
          document.cookie = `user_role=${result.role}; path=/; max-age=${maxAge}; ${isSecure ? 'Secure;' : ''} SameSite=Strict`;
        }
        // Store user name and email in cookies if available
        if (result.user?.name || result.name) {
          const userName = result.user?.name || result.name;
          document.cookie = `user_name=${encodeURIComponent(userName)}; path=/; max-age=${maxAge}; ${isSecure ? 'Secure;' : ''} SameSite=Strict`;
        }
        if (result.user?.email || result.email) {
          const userEmail = result.user?.email || result.email;
          document.cookie = `user_email=${encodeURIComponent(userEmail)}; path=/; max-age=${maxAge}; ${isSecure ? 'Secure;' : ''} SameSite=Strict`;
        }

        toast.success("Login Successful", {
          position: "top-right",
          autoClose: 3000,
        });

        // Redirect based on role
        const dashboardPath = getRoleBasedDashboard(result.role || 'User');
        navigate(dashboardPath);
      } else {
        toast.error(result.message || "Something went wrong", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Login Error", error);
      toast.error(`Error: ${error.message || "An unexpected error occurred"}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center p-4">
      <div className="fixed top-0 left-0 w-full h-1/2 bg-[url('/assets/loginbanner.png')] bg-no-repeat bg-cover bg-center z-0"></div>
      <div className="bg-[#FFFFFF] w-full max-w-[600px] min-h-[500px] max-h-[600px] h-auto z-10 border border-[#CED2E5] shadow rounded-[16px] overflow-auto">
        <div className="w-full h-full flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-24 py-6 sm:py-8 md:py-10">
          <div className="w-full max-w-[295px] text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl font-semibold pb-4 text-black">
              Welcome Back to ManageTP - 3.2.6 !
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-[#3D3D40]">
              Sign in to continue to Time Sheet
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full mb-2">
            <fieldset className="fieldset text-black mb-4">
              <legend className="fieldset-legend text-black">Email</legend>
              <input
                type="email"
                className="input py-4 border-[#CED2E5] bg-white w-full -mt-1 text-black focus:outline-none"
                placeholder="example@gmail.com"
                name="email"
                {...register("email", { required: true })}
               />
              {errors.email && (
                <span className="text-red-600">Email is required</span>
              )}
            </fieldset>

            <fieldset className="fieldset text-black relative">
              <legend className="fieldset-legend text-black">Password</legend>
              <input
                type={`${viewPass ? "text" : "password"}`}
                className="input py-4 border-[#CED2E5] bg-white w-full -mt-1  focus:outline-none pr-8"
                placeholder="Enter your password"
                name="password"
                {...register("password", { required: true })}
               />
              {errors.password && (
                <span className="text-red-600">Password is required</span>
              )}
              <p
                className="absolute z-20 top-1/2 right-2 -translate-y-1/2 text-xl text-[#6D6E3] cursor-pointer"
                onClick={() => setViewPass(!viewPass)}
              >
                {viewPass ? <AiFillEye  /> : <AiFillEyeInvisible  />}
              </p>
            </fieldset>
            <div className="flex items-center gap-x-2 mb-8">
              <div>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox checkbox-sm text-black bg-[#F0F0F2] border-none -mt-[2px]"
                 />
              </div>
              <p className="text-[#6D6E73]">Remember me</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#5069E5] text-white w-full py-3 sm:py-4 rounded-[4px] font-semibold text-base sm:text-lg md:text-xl cursor-pointer hover:bg-[#3d52c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="text-center text-base text-black space-y-2">
            <p className="text-[#0D2080]">
              <Link to="/forgot-password">Forgot password?</Link>
            </p>
            <p>
              Don't have an account ?{" "}
              <span className="text-[#0D2080]">
                <Link to="/signup">Sign up</Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
