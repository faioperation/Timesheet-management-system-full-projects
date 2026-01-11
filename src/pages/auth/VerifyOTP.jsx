import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../libs/apiFetch";
import { toast, ToastContainer } from "react-toastify";

export default function verifyOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [resendCount, setResendCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem("reset_email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      toast.error("No email found. Please start from forgot password page.");
      navigate("/forgot-password");
    }
  }, [router]);

  useEffect(() => {
    // Timer countdown
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error("Please enter all 6 digits");
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
        toast.success("OTP verified successfully!");
        // Don't remove email yet - needed for change password page
        setTimeout(() => {
          navigate("/change-password");
        }, 1000);
      } else {
        toast.error(result.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("Verify OTP Error", error);
      toast.error(`Error: ${error.message || "An unexpected error occurred"}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0 || isResending) return;

    if (resendCount >= 3) {
      toast.error("Maximum resend attempts reached. Redirecting to login...");
      localStorage.removeItem("reset_email");
      setTimeout(() => {
        navigate("/change-password");
      }, 2000);
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
        toast.success("OTP resent successfully!");
        setResendCount((prev) => prev + 1);
        setTimer(60); // 1 minute timer
        setOtp(["", "", "", "", "", ""]); // Clear OTP inputs
        inputRefs.current[0]?.focus();
      } else {
        toast.error(result.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP Error", error);
      toast.error(`Error: ${error.message || "An unexpected error occurred"}`);
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
    <div className="h-screen flex justify-center items-center text-black p-4">
      <ToastContainer />
      <div className="bg-[#FFFFFF] w-full max-w-[600px] min-h-[500px] max-h-[600px] h-auto z-10 border border-[#CED2E5] shadow rounded-[16px] relative overflow-auto">
        <Link to={"/forgot-password"}>
          <div className="bg-[#F2F4FF] p-2 sm:p-3 inline-flex rounded-[8px] absolute top-4 sm:top-5 right-4 sm:right-5 z-20">
            <RxCross2 className="text-xl sm:text-2xl font-black text-[#F46B6A]" />
          </div>
        </Link>

        <div className="w-full h-full flex flex-col justify-center items-center px-4 sm:px-8 md:px-12 lg:px-24 py-6 sm:py-8 md:py-10">
          <div className="w-full max-w-[411px] text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold pb-4">
              OTP Verification
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#3D3D40]">
              We have sent a One-Time Password (OTP) to your email:{" "}
              <span className="text-[#5069E5] font-semibold break-all">
                {email || "example@gmail.com"}
              </span>
              . Please enter it below to verify.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full mt-6 sm:mt-8 mb-3">
            <fieldset className="fieldset text-black w-full flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 flex-wrap">
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
                  className="w-[45px] h-[45px] sm:w-[50px] sm:h-[50px] md:w-[60px] md:h-[60px] text-center text-xl sm:text-2xl border-2 border-[#CED2E5] rounded-lg bg-white text-[#5069E5] font-bold focus:outline-none focus:border-[#5069E5] transition-colors"
                  placeholder="0"
                />
              ))}
            </fieldset>

            <button
              type="submit"
              disabled={isVerifying}
              className="bg-[#5069E5] text-white w-full py-3 sm:py-4 rounded-[4px] font-semibold text-base sm:text-lg md:text-xl cursor-pointer hover:bg-[#3d52c7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isVerifying ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify OTP"
              )}
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base">
            <p>Didn't receive your code?</p>
            <button
              onClick={handleResendOTP}
              disabled={timer > 0 || isResending}
              className={`text-[#5069E5] font-semibold ${
                timer > 0 || isResending
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:cursor-pointer hover:underline"
              }`}
            >
              {isResending
                ? "Sending..."
                : timer > 0
                ? `Resend OTP (${formatTime(timer)})`
                : "Resend OTP"}
            </button>
          </div>
          {resendCount > 0 && (
            <p className="text-xs sm:text-sm text-[#6D6E73] mt-2">
              Resend attempts: {resendCount}/3
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
