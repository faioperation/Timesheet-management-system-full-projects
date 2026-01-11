import { Link } from "react-router-dom";
import React, { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../libs/apiFetch";
import { toast, ToastContainer } from "react-toastify";

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
                });
                // Store email for next step if needed
                localStorage.setItem('reset_email', formData.email);
                setTimeout(() => {
                    navigate("/verify-otp");
                }, 1000);
            } else {
                toast.error(result.message || "Failed to send OTP", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error("Forgot Password Error", error);
            toast.error(`Error: ${error.message || "An unexpected error occurred"}`, {
                position: "top-right",
                autoClose: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex justify-center items-center text-black p-4">
            <ToastContainer  />
            <div className="bg-[#FFFFFF] w-full max-w-[600px] min-h-[500px] max-h-[600px] h-auto z-10 border border-[#CED2E5] shadow relative rounded-[16px] overflow-auto">
                <Link to={"/login"}>
                    <div className="bg-[#F2F4FF] p-2 sm:p-3 inline-flex rounded-[8px] absolute top-4 sm:top-5 right-4 sm:right-5 z-20">
                        <RxCross2 className="text-xl sm:text-2xl font-black text-[#F46B6A]"  />
                    </div>
                </Link>

                <div className="w-full h-full flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-24 py-6 sm:py-8 md:py-10">
                    <div className="w-full max-w-[411px] text-center">
                        <h2 className="text-2xl sm:text-3xl font-semibold pb-4">Forgot Your Password?</h2>
                        <p className="text-base sm:text-lg md:text-xl text-[#3D3D40]">
                            Enter your email to receive a One-Time Password (OTP)
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="w-full mt-8">
                        <fieldset className="fieldset text-black mb-8">
                            <legend className="fieldset-legend text-black">Email</legend>
                            <input
                                type="email"
                                className="input py-4 border-[#CED2E5] bg-white w-full -mt-1 text-black focus:outline-none"
                                placeholder="example@gmail.com"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                })}
                             />
                            {errors.email && (
                                <span className="text-red-600 text-sm">{errors.email.message}</span>
                            )}
                        </fieldset>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[#5069E5] text-white w-full py-3 sm:py-4 rounded-[4px] font-semibold text-base sm:text-lg md:text-xl cursor-pointer hover:bg-[#3d52c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Sending...</span>
                                </div>
                            ) : (
                                "Send OTP"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
