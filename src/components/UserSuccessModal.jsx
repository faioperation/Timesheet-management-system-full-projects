import React from "react";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const UserSuccessModal = ({ isOpen, onClose, userId }) => {
  const navigate = useNavigate();

  const handleAssignClient = () => {
    // Navigate to assign client details page
    onClose();
    navigate("/user/assign-client-details", {
      state: { userId },
    });
  };

  const handleClose = () => {
    onClose();
    navigate("/user/userlist");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="rounded-lg shadow-xl w-full max-w-md min-h-[500px] p-10 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-green-50 to-white"
        style={{
          backgroundImage: "url('/assets/popup.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Illustration Section */}
        <div className="relative mb-6 w-24 h-24">
          {/* Profile Picture Circle with userIcon */}
          <div className="w-24 h-24 rounded-full flex items-center justify-center relative z-10">
            <img
              src="/assets/userIcon.png"
              alt="User Icon"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* Success Message - Two lines */}
        <h2 className="text-2xl font-bold text-black mb-8 text-center leading-tight">
          User has been registered
          <br />
          successfully
        </h2>

        {/* Buttons - Stacked vertically */}
        <div className="flex flex-col gap-4 w-full">
          <button
            onClick={handleAssignClient}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#5069E5] text-white rounded-lg hover:bg-[#3d52c7] transition-colors font-bold"
          >
            <span>Assign client details</span>
            <FaArrowRight size={14} />
          </button>
          <button
            onClick={handleClose}
            className="w-full px-6 py-3 bg-[#F46B6A] bg-opacity-20 text-[#F46B6A] rounded-lg hover:bg-opacity-30 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSuccessModal;
