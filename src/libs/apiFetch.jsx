const BASE_URL = "/api";
// Use import.meta.env for Vite environment variables
// VITE_ prefix is required for client-side access
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise = null;

const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const setCookie = (name, value, days = 7) => {
  const isSecure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isSecure ? "Secure; " : "";
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; path=/; expires=${expires.toUTCString()}; ${secureFlag}SameSite=Strict`;
};

const clearCookies = () => {
  const isSecure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isSecure ? "Secure; " : "";
  const expires = "Thu, 01 Jan 1970 00:00:00 UTC";

  document.cookie = `auth_token=; path=/; expires=${expires}; ${secureFlag}SameSite=Strict`;
  document.cookie = `user_role=; path=/; expires=${expires}; ${secureFlag}SameSite=Strict`;
  document.cookie = `user_name=; path=/; expires=${expires}; ${secureFlag}SameSite=Strict`;
  document.cookie = `user_email=; path=/; expires=${expires}; ${secureFlag}SameSite=Strict`;
};

const redirectToLogin = () => {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

const refreshToken = async () => {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include", // Include cookies for refresh token
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const result = await response.json();

      if (result.success && result.data && result.data.token) {
        // Update auth_token cookie with new token
        setCookie("auth_token", result.data.token);
        
        // Update other user data if provided
        if (result.data.user) {
          if (result.data.user.role) {
            setCookie("user_role", result.data.user.role);
          }
          if (result.data.user.name) {
            setCookie("user_name", result.data.user.name);
          }
          if (result.data.user.email) {
            setCookie("user_email", result.data.user.email);
          }
        }

        return result.data.token;
      } else {
        throw new Error("Invalid refresh response");
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      clearCookies();
      redirectToLogin();
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getCookie("auth_token");

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't retry refresh endpoint
  if (endpoint === "/refresh") {
    return fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If 401 Unauthorized, try to refresh token
  if (response.status === 401) {
    try {
      const newToken = await refreshToken();
      
      // Retry the original request with new token
      headers["Authorization"] = `Bearer ${newToken}`;
      response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (error) {
      // Refresh failed, user will be redirected to login
      throw error;
    }
  }

  return response;
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
