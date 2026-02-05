import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../libs/apiFetch";
import { toast } from "react-toastify";

export default function UserProfileView() {
  const { userName } = useParams();
  const location = useLocation();
  const { userId, isInternal } = location.state || {};
  const navigate = useNavigate();
  const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [permissions, setPermissions] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await apiFetch('/profile', { method: 'GET' });
        const result = await response.json();
        if (result.success && result.data && result.data.business) {
          setPermissions(result.data.business.permission);
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };
    fetchPermissions();
  }, []);

  const buildImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("data:")) {
      return path;
    }
    const normalizedBase = IMAGE_BASE_URL
      ? IMAGE_BASE_URL.replace(/\/+$/, "")
      : "";
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    return normalizedBase ? `${normalizedBase}/${normalizedPath}` : path;
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        let response;
        if (isInternal) {
          response = await apiFetch(`/internaluser/${userId}`, { method: "GET" });
        } else {
          response = await apiFetch(`/user/${userId}`, { method: "GET" });
        }

        if (!response.ok) {
          // If isInternal was true and failed, or if it wasn't specified but failed, try the other one as fallback?
          // For now let's just use the direct logic. If isInternal is true, we use internaluser/${userId}
          throw new Error("Failed to load user profile");
        }
        const result = await response.json();
        if (result.success && result.data) {
          const data = result.data;
          setUserData(data);
          const profilePath =
            data.image || data.profile_image || data.profileImage || null;
          const signaturePath =
            data.signature || data.signature_image || data.signatureImage || null;
          setProfileImage(buildImageUrl(profilePath));
          setSignaturePreview(buildImageUrl(signaturePath));
        } else {
          throw new Error(result.message || "Failed to load user profile");
        }
      } catch (error) {
        console.error("User profile load error:", error);
        toast.error(error.message || "Failed to load user profile");
        navigate("/user/userlist");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    } else {
      toast.error("User id missing for profile view");
      navigate("/user/userlist");
    }
  }, [userId, navigate, userName]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-gray-500">Loading user profile...</div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const roleName =
    userData.roles && userData.roles[0]
      ? userData.roles[0].name
      : userData.role || "User";
  const statusLabel =
    userData.active === 1 || userData.active === true ? "Active" : "Inactive";

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">User Profile</h2>
        <button
          type="button"
          onClick={() => navigate("/user/userlist")}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-[#5069E5] transition-colors"
        >
          Back to list
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Column - Profile Image */}
        <div className="w-full lg:w-[420px] flex-shrink-0">
          <div className="rounded-lg shadow-sm bg-white p-4">
            <div className="w-full h-[420px] rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("User profile image failed:", e.target.src);
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Name</p>
              <p className="text-gray-800 font-medium">{userData.name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="text-gray-800 font-medium">
                {userData.email || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Phone</p>
              <p className="text-gray-800 font-medium">
                {userData.phone || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Role</p>
              <p className="text-gray-800 font-medium">{roleName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <p className="text-gray-800 font-medium">{statusLabel}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Gender</p>
              <p className="text-gray-800 font-medium">
                {userData.gender || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Marital Status</p>
              <p className="text-gray-800 font-medium">
                {userData.marital_status || "-"}
              </p>
            </div>
          </div>

          {/* Internal User Specific Fields */}
          {isInternal && userData && (!permissions || permissions.commission === 1) && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Commission Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Commission On</p>
                  <p className="text-gray-800 font-medium">
                    {userData.commission_on
                      ? userData.commission_on.split('-').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Rate Type</p>
                  <p className="text-gray-800 font-medium">
                    {userData.rate_type
                      ? userData.rate_type.charAt(0).toUpperCase() + userData.rate_type.slice(1)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Rate</p>
                  <p className="text-gray-800 font-medium">
                    {userData.rate
                      ? `${userData.rate}${userData.rate_type === 'percentage' ? '%' : ''}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Recursive</p>
                  <p className="text-gray-800 font-medium">
                    {userData.recuesive === 1 || userData.recuesive === '1' || userData.recuesive === true
                      ? "Yes"
                      : "No"}
                  </p>
                </div>
                {!(userData.recuesive === 1 || userData.recuesive === '1' || userData.recuesive === true) && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Month</p>
                    <p className="text-gray-800 font-medium">
                      {userData.month
                        ? userData.month.charAt(0).toUpperCase() + userData.month.slice(1)
                        : "-"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Client Assignment Details - For regular users with an assigned client */}
          {!isInternal && userData?.user_details?.party_id && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Client Assignment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Invoice To</p>
                  <p className="text-gray-800 font-medium">{userData.user_details.invoice_to || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {userData.user_details.invoice_to === 'Vendor' ? 'Vendor Name' : 'Client Name'}
                  </p>
                  <p className="text-gray-800 font-medium">
                    {userData.user_details.party?.name || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Client Rate</p>
                  <p className="text-gray-800 font-medium">${userData.user_details.client_rate || "0"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Timesheet Period</p>
                  <p className="text-gray-800 font-medium">
                    {userData.user_details.time_sheet_period
                      ? userData.user_details.time_sheet_period.charAt(0).toUpperCase() + userData.user_details.time_sheet_period.slice(1)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Start Date</p>
                  <p className="text-gray-800 font-medium">{userData.user_details.start_date || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">End Date</p>
                  <p className="text-gray-800 font-medium">{userData.user_details.end_date || "-"}</p>
                </div>
                {userData.user_details.account_manager?.name && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Account Manager</p>
                    <p className="text-gray-800 font-medium">{userData.user_details.account_manager.name}</p>
                  </div>
                )}
                {userData.user_details.business_development_manager?.name && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">BD Manager</p>
                    <p className="text-gray-800 font-medium">{userData.user_details.business_development_manager.name}</p>
                  </div>
                )}
                {userData.user_details.recruiter?.name && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Recruiter</p>
                    <p className="text-gray-800 font-medium">{userData.user_details.recruiter.name}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Signature - Only for regular users, not internal users */}
          {!isInternal && (
            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-2">Signature</p>
              <div className="w-full h-48 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                {signaturePreview ? (
                  <img
                    src={signaturePreview}
                    alt="Signature"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      console.error("Signature failed to load:", e.target.src);
                    }}
                  />
                ) : (
                  <div className="text-gray-400 text-sm">No signature</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

