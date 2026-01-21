import React, { useState, useEffect } from "react";
import { FiEdit2 } from "react-icons/fi";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaPaperclip } from "react-icons/fa";
import { apiFetch, logout } from "../../libs/apiFetch";
import { toast } from "react-toastify";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    phone: false,
  });
  const [imageFile, setImageFile] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageRetry, setProfileImageRetry] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [businessData, setBusinessData] = useState(null);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(true);

  const buildImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("data:")) {
      return path;
    }
    const normalizedBase = IMAGE_BASE_URL
      ? IMAGE_BASE_URL.replace(/\/+$/, "")
      : "";
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    return normalizedBase
      ? `${normalizedBase}/${normalizedPath}`
      : path;
  };

  // Helper function to get auth token
  const getAuthToken = () => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
    };
    return getCookie("auth_token");
  };

  // Helper function to send FormData to profile-edit API
  const updateProfile = async (formDataToSend) => {
    const token = getAuthToken();
    const headers = {
      Accept: "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch("/api/profile-edit", {
      method: "POST",
      headers,
      body: formDataToSend,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const errorMessages = Object.values(errorData.errors).flat().join(", ");
        throw new Error(
          errorMessages || errorData.message || "Validation failed"
        );
      }

      throw new Error(errorData.message || "Failed to update profile");
    }

    return await response.json();
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsFetching(true);
      try {
        const response = await apiFetch("/profile", {
          method: "GET",
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            toast.error("Session expired. Please login again.");
            await logout({ navigate });
            return;
          }
          throw new Error("Failed to load profile");
        }

        const result = await response.json();

        if (result.success && result.data) {
          const data = result.data;

          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            gender: data.gender
              ? data.gender.charAt(0).toUpperCase() +
              data.gender.slice(1).toLowerCase()
              : "",
            maritalStatus: data.marital_status
              ? data.marital_status.charAt(0).toUpperCase() +
              data.marital_status.slice(1).toLowerCase()
              : "",
            signature: data.signature || null,
          });

          // Handle profile image URL
          if (data.image) {
            const profileLink = buildImageUrl(data.image);
            setProfileImage(profileLink || null);
          } else {
            setProfileImage(null);
          }

          // Handle signature URL
          if (data.signature) {
            const signatureUrl = buildImageUrl(data.signature);
            setFormData((prev) => ({ ...prev, signature: data.signature }));
            setSignaturePreview(signatureUrl);
          } else {
            setSignaturePreview(null);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfileData();
  }, []);

  useEffect(() => {
    const fetchBusinessData = async () => {
      setIsLoadingBusiness(true);
      try {
        const response = await apiFetch("/business", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to load business data");
        }

        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          // Assuming we want the first business or the user's business
          setBusinessData(result.data[0]);
        }
      } catch (error) {
        console.error("Error fetching business data:", error);
        // Don't show error toast as business data might be optional
      } finally {
        setIsLoadingBusiness(false);
      }
    };

    fetchBusinessData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
  };

  const handleSave = async (field) => {
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();

      // Map field names to API format
      const fieldMapping = {
        name: "name",
        email: "email",
        mobile: "phone",
        phone: "phone",
      };

      const apiFieldName = fieldMapping[field] || field;

      // Send the field being updated
      if (formData[field] !== undefined && formData[field] !== null) {
        formDataToSend.append(apiFieldName, formData[field]);
      }

      // Always send all existing fields to avoid validation errors
      if (formData.name) formDataToSend.append("name", formData.name);
      if (formData.email) formDataToSend.append("email", formData.email);
      if (formData.phone) formDataToSend.append("phone", formData.phone);
      if (formData.gender) {
        formDataToSend.append("gender", formData.gender.toLowerCase());
      }
      if (formData.maritalStatus) {
        formDataToSend.append(
          "marital_status",
          formData.maritalStatus.toLowerCase()
        );
      }

      const result = await updateProfile(formDataToSend);

      if (result.success) {
        setIsEditing((prev) => ({ ...prev, [field]: false }));
        toast.success(
          `${field.charAt(0).toUpperCase() + field.slice(1)
          } updated successfully`
        );
      } else {
        throw new Error(result.message || `Failed to update ${field}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || `Failed to update ${field}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsLoading(true);
      try {
        // Preview the image
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileImage(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload to server
        const formDataToSend = new FormData();
        formDataToSend.append("image", file);

        // Add other fields
        if (formData.name) formDataToSend.append("name", formData.name);
        if (formData.email) formDataToSend.append("email", formData.email);
        if (formData.phone) formDataToSend.append("phone", formData.phone);
        if (formData.gender)
          formDataToSend.append("gender", formData.gender.toLowerCase());
        if (formData.maritalStatus)
          formDataToSend.append(
            "marital_status",
            formData.maritalStatus.toLowerCase()
          );

        const result = await updateProfile(formDataToSend);

        if (result.success) {
          // Update image URL if returned from API
          if (result.data && result.data.image) {
            const imageUrl = buildImageUrl(result.data.image);
            setProfileImage(imageUrl || null);
          }
          toast.success("Profile image uploaded successfully");
        } else {
          throw new Error(result.message || "Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error(error.message || "Failed to upload profile image");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsLoading(true);
      try {
        // Preview the signature
        const reader = new FileReader();
        reader.onloadend = () => {
          setSignaturePreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Store file reference
        setFormData((prev) => ({ ...prev, signature: file }));

        // Upload to server
        const formDataToSend = new FormData();
        formDataToSend.append("signature", file);

        // Add other fields
        if (formData.name) formDataToSend.append("name", formData.name);
        if (formData.email) formDataToSend.append("email", formData.email);
        if (formData.phone) formDataToSend.append("phone", formData.phone);
        if (formData.gender)
          formDataToSend.append("gender", formData.gender.toLowerCase());
        if (formData.maritalStatus)
          formDataToSend.append(
            "marital_status",
            formData.maritalStatus.toLowerCase()
          );

        const result = await updateProfile(formDataToSend);

        if (result.success) {
          // Update signature URL if returned from API
          if (result.data && result.data.signature) {
            const signatureUrl = buildImageUrl(result.data.signature);
            setSignaturePreview(signatureUrl);
          }
          toast.success("Signature uploaded successfully");
        } else {
          throw new Error(result.message || "Failed to upload signature");
        }
      } catch (error) {
        console.error("Error uploading signature:", error);
        toast.error(error.message || "Failed to upload signature");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isFetching) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-black mb-6">Update Profile</h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading profile data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-black mb-6">Update Profile</h2>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Column - Profile Picture */}
        <div className="w-full lg:w-[500px] flex-shrink-0">
          <div className="rounded-lg shadow-sm">
            <div className="flex flex-col items-center">
              <div className="w-full h-[500px]  rounded-lg overflow-hidden mb-4 bg-gray-100 border border-gray-200">
                <img
                  key={profileImage}
                  src={profileImage || ""}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={async (e) => {
                    console.error("Profile image failed to load:", e.target.src);
                    if (profileImageRetry || !profileImage) {
                      return;
                    }
                    try {
                      const token = getAuthToken();
                      if (!token) return;
                      setProfileImageRetry(true);

                      const imageResponse = await fetch(profileImage, {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });
                      if (!imageResponse.ok) {
                        console.error(
                          "Profile image fetch failed:",
                          imageResponse.status,
                          imageResponse.statusText
                        );
                        return;
                      }
                      const blob = await imageResponse.blob();
                      const objectUrl = URL.createObjectURL(blob);
                      setProfileImage(objectUrl);
                    } catch (error) {
                      console.error("Profile image fetch error:", error);
                    }
                  }}
                  onLoad={() => {
                    console.log("Image loaded successfully:", profileImage);
                  }}
                />
              </div>
              <label className="w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  className="w-full bg-[#5069E5] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#3d52c7] transition-colors cursor-pointer"
                  onClick={() =>
                    document.querySelector('input[type="file"]').click()
                  }
                >
                  Upload Image
                </button>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Form Fields */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6 lg:p-8">
          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={!isEditing.name}
                  onBlur={() => isEditing.name && handleSave("name")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] disabled:bg-gray-50 text-gray-800 pr-10"
                  placeholder="Enter your name"
                />
                <button
                  type="button"
                  onClick={() =>
                    isEditing.name ? handleSave("name") : handleEdit("name")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5069E5] transition-colors"
                >
                  <FiEdit2 size={18} />
                </button>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing.email}
                  onBlur={() => isEditing.email && handleSave("email")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] disabled:bg-gray-50 text-gray-800 pr-10"
                  placeholder="Enter your email"
                />
                <button
                  type="button"
                  onClick={() =>
                    isEditing.email ? handleSave("email") : handleEdit("email")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5069E5] transition-colors"
                >
                  <FiEdit2 size={18} />
                </button>
              </div>
            </div>

            {/* Mobile Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={!isEditing.phone}
                  onBlur={() => isEditing.phone && handleSave("phone")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] disabled:bg-gray-50 text-gray-800 pr-10"
                  placeholder="Enter your mobile number"
                />
                <button
                  type="button"
                  onClick={() =>
                    isEditing.phone ? handleSave("phone") : handleEdit("phone")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5069E5] transition-colors"
                >
                  <FiEdit2 size={18} />
                </button>
              </div>
            </div>

            {/* Gender Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <div className="relative">
                <select
                  value={formData.gender || ""}
                  onChange={async (e) => {
                    handleInputChange("gender", e.target.value);
                    // Auto-save on change
                    setIsLoading(true);
                    try {
                      const formDataToSend = new FormData();
                      formDataToSend.append(
                        "gender",
                        e.target.value.toLowerCase()
                      );
                      if (formData.name)
                        formDataToSend.append("name", formData.name);
                      if (formData.email)
                        formDataToSend.append("email", formData.email);
                      if (formData.phone)
                        formDataToSend.append("phone", formData.phone);
                      if (formData.maritalStatus)
                        formDataToSend.append(
                          "marital_status",
                          formData.maritalStatus.toLowerCase()
                        );

                      const result = await updateProfile(formDataToSend);
                      if (result.success) {
                        toast.success("Gender updated successfully");
                      }
                    } catch (error) {
                      console.error("Error updating gender:", error);
                      toast.error("Failed to update gender");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <IoMdArrowDropdown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  size={20}
                />
              </div>
            </div>

            {/* Marital Status Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marital Status
              </label>
              <div className="relative">
                <select
                  value={formData.maritalStatus || ""}
                  onChange={async (e) => {
                    handleInputChange("maritalStatus", e.target.value);
                    // Auto-save on change
                    setIsLoading(true);
                    try {
                      const formDataToSend = new FormData();
                      formDataToSend.append(
                        "marital_status",
                        e.target.value.toLowerCase()
                      );
                      if (formData.name)
                        formDataToSend.append("name", formData.name);
                      if (formData.email)
                        formDataToSend.append("email", formData.email);
                      if (formData.phone)
                        formDataToSend.append("phone", formData.phone);
                      if (formData.gender)
                        formDataToSend.append(
                          "gender",
                          formData.gender.toLowerCase()
                        );

                      const result = await updateProfile(formDataToSend);
                      if (result.success) {
                        toast.success("Marital status updated successfully");
                      }
                    } catch (error) {
                      console.error("Error updating marital status:", error);
                      toast.error("Failed to update marital status");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] appearance-none bg-white text-gray-800 pr-10 cursor-pointer"
                >
                  <option value="">Select Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
                <IoMdArrowDropdown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  size={20}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value="********"
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5069E5] bg-gray-50 text-gray-800 pr-10 cursor-pointer"
                  placeholder="Click to change password"
                  onClick={() => setIsPasswordModalOpen(true)}
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5069E5] transition-colors"
                >
                  <FiEdit2 size={18} />
                </button>
              </div>
            </div>

            {/* Signature Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Signature
              </label>
              <div className="relative">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-500 cursor-pointer hover:border-[#5069E5] transition-colors flex items-center justify-between">
                    <span className="text-gray-500">
                      {formData.signature &&
                        typeof formData.signature === "object"
                        ? formData.signature.name
                        : formData.signature
                          ? "Signature uploaded"
                          : "No file choosen"}
                    </span>
                    <FaPaperclip className="text-gray-500" size={18} />
                  </div>
                </label>
              </div>

              {/* Signature Preview */}
              {signaturePreview && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Signature Preview
                  </label>
                  <div className="w-full h-48 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                    {signaturePreview.includes("data:image") ||
                      signaturePreview.startsWith("http") ? (
                      <img
                        src={signaturePreview}
                        alt="Signature Preview"
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          // If signature image fails to load, show placeholder
                          e.target.style.display = "none";
                          const placeholder = document.createElement("div");
                          placeholder.className = "text-gray-500 text-sm";
                          placeholder.textContent = "Signature file uploaded";
                          e.target.parentElement.appendChild(placeholder);
                        }}
                      />
                    ) : (
                      <div className="text-gray-500 text-sm">
                        Signature file uploaded
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Business Information Section */}
            {isLoadingBusiness ? (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-center py-4">
                  <div className="text-gray-500 text-sm">Loading business data...</div>
                </div>
              </div>
            ) : businessData ? (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Business Information</h3>
                <div className="space-y-4 p-6 bg-gradient-to-br from-[#5069E5]/5 to-[#5069E5]/10 rounded-lg border border-[#5069E5]/20">
                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <div className="px-4 py-3 bg-white rounded-lg border border-gray-200 text-gray-800 font-medium">
                      {businessData.company_name || businessData.name || 'N/A'}
                    </div>
                  </div>

                  {/* Address */}
                  {businessData.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Address
                      </label>
                      <div className="px-4 py-3 bg-white rounded-lg border border-gray-200 text-gray-800">
                        {businessData.address}
                      </div>
                    </div>
                  )}

                  {/* Status Badges */}
                  <div className="flex gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${businessData.is_active
                          ? 'bg-[#E6F4F1] text-[#1B654A]'
                          : 'bg-gray-200 text-gray-600'
                        }`}>
                        {businessData.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {businessData.is_verified !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Verification:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${businessData.is_verified
                            ? 'bg-[#E6F4F1] text-[#1B654A]'
                            : 'bg-[#FFF2E6] text-[#F97316]'
                          }`}>
                          {businessData.is_verified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
