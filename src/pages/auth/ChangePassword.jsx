import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import { RiLock2Fill } from "react-icons/ri";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../libs/apiFetch";
import { toast } from "react-toastify";

export default function ChangePassword() {
    const [viewPass, setViewPass] = useState(false);
    const [viewConfirmPass, setViewConfirmPass] = useState(false);
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const password = watch("password");

    useEffect(() => {
        // Get email from localStorage
        const storedEmail = localStorage.getItem("reset_email");
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            toast.error("No email found. Please start from forgot password page.");
            navigate("/forgot-password");
        }
    }, [navigate]);

    const onSubmit = async (formData) => {
        setIsLoading(true);
        try {
            const res = await apiFetch("/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    password: formData.password,
                    password_confirmation: formData.confirmPassword,
                }),
            });

            const result = await res.json();

            if (res.ok) {
                toast.success("Password changed successfully!");
                localStorage.removeItem("reset_email");
                setTimeout(() => {
                    navigate("/login");
                }, 100);
            } else {
                let errorMessage = result.message || "Failed to change password";
                if (result.errors) {
                    const firstError = Object.values(result.errors)[0];
                    errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
                }
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error("Change Password Error", error);
            let errorMsg = error.message || "An unexpected error occurred";
            if (errorMsg === "Failed to fetch") {
                errorMsg = "Server connection failed. Please check your internet or try again later.";
            }
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex justify-center items-center text-black p-4">
            <div className="bg-[#FFFFFF] w-full max-w-[600px] min-h-[500px] py-6 sm:py-8 z-10 border border-[#CED2E5] shadow relative rounded-[16px] overflow-auto">
                <Link to={"/login"}>
                    <div className="bg-[#F2F4FF] p-2 sm:p-3 inline-flex rounded-[8px] absolute top-4 sm:top-5 right-4 sm:right-5 z-20">
                        <RxCross2 className="text-xl sm:text-2xl font-black text-[#F46B6A]"  />
                    </div>
                </Link>

                <div className="w-full h-full flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-24 py-6 sm:py-8 md:py-10">
                    <p className="text-center text-5xl sm:text-6xl md:text-7xl text-[#5069E5] w-full flex justify-center">
                        <RiLock2Fill  />
                    </p>
                    <div className="w-full max-w-[411px] text-center mt-6 sm:mt-9">
                        <h2 className="text-2xl sm:text-3xl font-semibold pb-4">Change Password</h2>
                        <p className="text-base sm:text-lg md:text-xl text-[#3D3D40]">Keep your account secure by updating your password.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="w-full mt-8">
                        <fieldset className="fieldset text-black relative">
                            <legend className="fieldset-legend text-black">New Password</legend>
                            <input
                                type={viewPass ? "text" : "password"}
                                className="input py-4 border-[#CED2E5] bg-white w-full -mt-1 focus:outline-none pr-8"
                                placeholder="Enter your new password"
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 6,
                                        message: "Password must be at least 6 characters",
                                    },
                                })}
                             />
                            <p
                                className="absolute z-20 top-1/2 right-2 -translate-y-1/2 text-xl text-[#6D6E73] cursor-pointer"
                                onClick={() => setViewPass(!viewPass)}
                            >
                                {viewPass ? <AiFillEye  /> : <AiFillEyeInvisible  />}
                            </p>
                            {errors.password && (
                                <span className="text-red-600 text-sm">{errors.password.message}</span>
                            )}
                        </fieldset>

                        <fieldset className="fieldset text-black relative mt-4">
                            <legend className="fieldset-legend text-black">Confirm New Password</legend>
                            <input
                                type={viewConfirmPass ? "text" : "password"}
                                className="input py-4 border-[#CED2E5] bg-white w-full -mt-1 focus:outline-none pr-8"
                                placeholder="Confirm your new password"
                                {...register("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: (value) => value === password || "Passwords do not match",
                                })}
                             />
                            <p
                                className="absolute z-20 top-1/2 right-2 -translate-y-1/2 text-xl text-[#6D6E73] cursor-pointer"
                                onClick={() => setViewConfirmPass(!viewConfirmPass)}
                            >
                                {viewConfirmPass ? <AiFillEye  /> : <AiFillEyeInvisible  />}
                            </p>
                            {errors.confirmPassword && (
                                <span className="text-red-600 text-sm">{errors.confirmPassword.message}</span>
                            )}
                        </fieldset>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[#5069E5] mt-6 sm:mt-9 text-white w-full py-3 sm:py-4 rounded-[4px] font-semibold text-base sm:text-lg md:text-xl cursor-pointer hover:bg-[#3d52c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Changing Password...</span>
                                </div>
                            ) : (
                                "Change Password"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
