import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { apiFetch } from "../../libs/apiFetch";
import { toast, ToastContainer } from "react-toastify";
import { AiOutlineCheckCircle, AiOutlineSafety } from "react-icons/ai";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [resendCount, setResendCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const storedEmail = localStorage.getItem("reset_email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      toast.error("No email found. Please start from forgot password page.", {
        theme: "colored"
      });
      navigate("/forgot-password");
    }
  }, [navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus on the last filled input or the first empty one
    const nextIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error("Please enter all 6 digits", { theme: "colored" });
      return;
    }

    setIsVerifying(true);
    try {
      const res = await apiFetch("/otp-varification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("OTP verified successfully!", { theme: "colored" });
        setTimeout(() => {
          navigate("/change-password");
        }, 1000);
      } else {
        toast.error(result.message || "Invalid OTP", { theme: "colored" });
      }
    } catch (error) {
      console.error("Verify OTP Error", error);
      toast.error(`Error: ${error.message || "An unexpected error occurred"}`, { theme: "colored" });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0 || isResending) return;

    if (resendCount >= 3) {
      toast.error("Maximum resend attempts reached. Please try again later.", { theme: "colored" });
      return;
    }

    setIsResending(true);

    try {
      const res = await apiFetch("/forget-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("OTP resent successfully!", { theme: "colored" });
        setResendCount((prev) => prev + 1);
        setTimer(60);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(result.message || "Failed to resend OTP", { theme: "colored" });
      }
    } catch (error) {
      console.error("Resend OTP Error", error);
      toast.error(`Error: ${error.message || "An unexpected error occurred"}`, { theme: "colored" });
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#F8FAFC] text-black p-4 sm:p-6 lg:p-10 font-['Inter',_sans-serif]">
      <ToastContainer />

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
            alt="OTP verification banner"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2080]/80 via-transparent to-transparent flex flex-col justify-end p-12 text-white">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Verify Your Identity</h2>
            <p className="text-lg text-blue-100/90 leading-relaxed max-w-sm">
              We've sent a 6-digit code to your email. Enter it below to continue with password reset.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20">
                <AiOutlineCheckCircle className="text-green-400" size={20} />
                <span className="text-sm font-medium">Secure verification</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20">
                <AiOutlineCheckCircle className="text-green-400" size={20} />
                <span className="text-sm font-medium">Code expires in 10 minutes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="px-6 sm:px-10 lg:px-16 py-12 lg:py-20 flex flex-col justify-center">
          <div className="mb-10">
            <div className="w-12 h-12 bg-[#5069E5] rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-[#5069E5]/30">
              <AiOutlineSafety size={26} />
            </div>
            <h1 className="text-3xl font-bold text-[#0F172A] mb-2 tracking-tight">Enter Verification Code</h1>
            <p className="text-[#64748B]">
              We sent a code to{" "}
              <span className="text-[#5069E5] font-semibold">{email || "your email"}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 sm:w-14 sm:h-14 text-center text-2xl border-2 border-[#CBD5E1] rounded-xl bg-white text-[#5069E5] font-bold focus:outline-none focus:border-[#5069E5] focus:ring-4 focus:ring-[#5069E5]/10 transition-all"
                  placeholder="0"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-[#5069E5] hover:bg-[#3E52C1] active:scale-[0.98] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#5069E5]/20 transition-all duration-200 disabled:opacity-70 disabled:active:scale-100"
            >
              {isVerifying ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify Code"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#64748B] font-medium mb-2">
              Didn't receive the code?{" "}
              <button
                onClick={handleResendOTP}
                disabled={timer > 0 || isResending}
                className={`text-[#5069E5] font-bold ${timer > 0 || isResending
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:underline decoration-2 underline-offset-4"
                  }`}
              >
                {isResending
                  ? "Sending..."
                  : timer > 0
                    ? `Resend (${formatTime(timer)})`
                    : "Resend Code"}
              </button>
            </p>
            {resendCount > 0 && (
              <p className="text-xs text-[#94A3B8] mt-2">
                Attempts: {resendCount}/3
              </p>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link to="/forgot-password" className="text-[#64748B] font-medium hover:text-[#5069E5] transition-colors">
              ← Back to forgot password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
