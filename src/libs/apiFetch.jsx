const BASE_URL = "/api";

export const apiFetch = (endpoint, options = {}) => {
  const getCookie = (name) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const token = getCookie("auth_token");

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
};

/**
 * Logout utility function
 * Clears authentication cookies and redirects to login
 * @param {Object} options - Optional configuration
 * @param {Function} options.navigate - React Router navigate function (optional)
 * @param {boolean} options.callApi - Whether to call logout API endpoint (default: false)
 * @returns {Promise<void>}
 */
export const logout = async (options = {}) => {
  const { navigate, callApi = false } = options;

  try {
    // Optionally call logout API endpoint
    if (callApi) {
      try {
        await apiFetch("/logout", {
          method: "POST",
        });
      } catch (error) {
        // Continue with client-side cleanup even if API call fails
        console.error("Logout API call failed:", error);
      }
    }

    // Clear cookies - handle both secure and non-secure contexts
    const isSecure =
      typeof window !== "undefined" && window.location.protocol === "https:";
    const secureFlag = isSecure ? "Secure; " : "";
    const expires = "Thu, 01 Jan 1970 00:00:00 UTC";

    // Clear auth_token cookie
    document.cookie = `auth_token=; path=/; expires=${expires}; ${secureFlag}SameSite=Strict`;
    // Clear user_role cookie
    document.cookie = `user_role=; path=/; expires=${expires}; ${secureFlag}SameSite=Strict`;
    // Clear user_name cookie
    document.cookie = `user_name=; path=/; expires=${expires}; ${secureFlag}SameSite=Strict`;
    // Clear user_email cookie
    document.cookie = `user_email=; path=/; expires=${expires}; ${secureFlag}SameSite=Strict`;

    // Navigate to login page
    if (navigate) {
      navigate("/login");
    } else {
      // Fallback to window.location if navigate is not provided
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  } catch (error) {
    console.error("Logout error:", error);
    // Still try to clear cookies and redirect even if there's an error
    const isSecure =
      typeof window !== "undefined" && window.location.protocol === "https:";
    const secureFlag = isSecure ? "Secure; " : "";
    const expires = "Thu, 01 Jan 1970 00:00:00 UTC";

    document.cookie = `auth_token=; path=/; expires=${expires}; ${secureFlag}SameSite=Strict`;
    document.cookie = `user_role=; path=/; expires=${expires}; ${secureFlag}SameSite=Strict`;
    document.cookie = `user_name=; path=/; expires=${expires}; ${secureFlag}SameSite=Strict`;
    document.cookie = `user_email=; path=/; expires=${expires}; ${secureFlag}SameSite=Strict`;

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
};
