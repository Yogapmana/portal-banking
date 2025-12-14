/**
 * API Utility untuk handle fetch requests dengan authentication
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Get token from localStorage
 */
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let refreshPromise = null;

/**
 * Refresh the access token
 */
async function refreshAccessToken() {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const newToken = data.data.accessToken;
        localStorage.setItem("token", newToken);

        // Set cookie
        const expires = new Date();
        expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
        document.cookie = `token=${newToken};expires=${expires.toUTCString()};path=/`;

        return newToken;
      } else {
        throw new Error("Refresh failed");
      }
    } catch (error) {
      // Clear tokens and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        document.cookie =
          "token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";

        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Generic fetch wrapper dengan auto authentication
 */
async function apiFetch(endpoint, options = {}, retryCount = 0) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, config);

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    const data =
      contentType && contentType.includes("application/json")
        ? await response.json()
        : { message: await response.text() };

    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const resetTime = response.headers.get("X-RateLimit-Reset");

        throw {
          status: 429,
          message:
            data.error ||
            data.message ||
            "Terlalu banyak percobaan. Silakan coba lagi nanti.",
          error: "RATE_LIMIT_EXCEEDED",
          retryAfter: retryAfter,
          resetTime: resetTime,
        };
      }

      // Handle 401 - try to refresh token
      if (
        response.status === 401 &&
        retryCount === 0 &&
        !endpoint.includes("/auth/refresh") &&
        !endpoint.includes("/auth/login")
      ) {
        try {
          await refreshAccessToken();
          // Retry the original request with new token
          return await apiFetch(endpoint, options, retryCount + 1);
        } catch (refreshError) {
          // Refresh failed, will redirect in refreshAccessToken
          throw {
            status: 401,
            message: "Session expired. Please login again.",
            error: "UNAUTHORIZED",
          };
        }
      }

      throw {
        status: response.status,
        message: data.message || data.error || "Something went wrong",
        error: data.error,
      };
    }

    return data;
  } catch (error) {
    // Handle network errors
    if (!error.status) {
      throw {
        status: 0,
        message: "Network error. Please check your connection.",
        error: "NETWORK_ERROR",
      };
    }

    throw error;
  }
}

/**
 * API Methods
 */
export const api = {
  // Auth endpoints
  auth: {
    login: async (email, password) => {
      return apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        credentials: "include", // Send cookies
      });
    },

    refresh: async () => {
      // Refresh token is in httpOnly cookie
      return apiFetch("/auth/refresh", {
        method: "POST",
        credentials: "include", // Send cookies
      });
    },

    logout: async () => {
      // Refresh token is in httpOnly cookie
      return apiFetch("/auth/logout", {
        method: "POST",
        credentials: "include", // Send cookies
      });
    },

    logoutAll: async () => {
      return apiFetch("/auth/logout-all", {
        method: "POST",
        credentials: "include", // Send cookies
      });
    },

    register: async (email, password, role) => {
      return apiFetch("/auth/register/admin", {
        method: "POST",
        body: JSON.stringify({ email, password, role }),
        credentials: "include", // Send cookies
      });
    },

    me: async () => {
      return apiFetch("/auth/me");
    },

    changePassword: async (oldPassword, newPassword) => {
      return apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
    },

    getUsers: async () => {
      return apiFetch("/auth/users");
    },

    getSalesList: async () => {
      return apiFetch("/auth/sales-list");
    },
  },

  // Customer endpoints
  customers: {
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = value;
          }
          return acc;
        }, {})
      ).toString();

      return apiFetch(`/customers${queryString ? `?${queryString}` : ""}`);
    },

    getById: async (id) => {
      return apiFetch(`/customers/${id}`);
    },

    create: async (customerData) => {
      return apiFetch("/customers", {
        method: "POST",
        body: JSON.stringify(customerData),
      });
    },

    update: async (id, customerData) => {
      return apiFetch(`/customers/${id}`, {
        method: "PUT",
        body: JSON.stringify(customerData),
      });
    },

    recalculateScore: async (id) => {
      return apiFetch(`/customers/${id}/recalculate-score`, {
        method: "POST",
      });
    },

    delete: async (id) => {
      return apiFetch(`/customers/${id}`, {
        method: "DELETE",
      });
    },

    assign: async (id, salesId) => {
      return apiFetch(`/customers/${id}/assign`, {
        method: "POST",
        body: JSON.stringify({ salesId }),
      });
    },

    unassign: async (id) => {
      return apiFetch(`/customers/${id}/unassign`, {
        method: "POST",
      });
    },

    bulkAssign: async (customerIds, salesId) => {
      return apiFetch("/customers/bulk-assign", {
        method: "POST",
        body: JSON.stringify({ customerIds, salesId }),
      });
    },

    bulkUnassign: async (customerIds) => {
      return apiFetch("/customers/bulk-unassign", {
        method: "POST",
        body: JSON.stringify({ customerIds }),
      });
    },

    getFilterOptions: async () => {
      return apiFetch("/customers/filters/options");
    },

    getPending: async (params = {}) => {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = value;
          }
          return acc;
        }, {})
      ).toString();

      return apiFetch(
        `/customers/pending${queryString ? `?${queryString}` : ""}`
      );
    },
  },

  // Call logs endpoints
  callLogs: {
    create: async (customerId, callLogData) => {
      return apiFetch("/call-logs", {
        method: "POST",
        body: JSON.stringify({ customerId, ...callLogData }),
      });
    },

    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = value;
          }
          return acc;
        }, {})
      ).toString();

      return apiFetch(`/call-logs${queryString ? `?${queryString}` : ""}`);
    },

    getById: async (id) => {
      return apiFetch(`/call-logs/${id}`);
    },

    getByCustomer: async (customerId) => {
      return apiFetch(`/call-logs/customer/${customerId}`);
    },

    update: async (id, callLogData) => {
      return apiFetch(`/call-logs/${id}`, {
        method: "PUT",
        body: JSON.stringify(callLogData),
      });
    },

    delete: async (id) => {
      return apiFetch(`/call-logs/${id}`, {
        method: "DELETE",
      });
    },

    getStatistics: async (params = {}) => {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = value;
          }
          return acc;
        }, {})
      ).toString();

      return apiFetch(
        `/call-logs/statistics${queryString ? `?${queryString}` : ""}`
      );
    },

    getMyStatistics: async () => {
      return apiFetch("/call-logs/my-statistics");
    },

    getTeamStatistics: async (params = {}) => {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            acc[key] = value;
          }
          return acc;
        }, {})
      ).toString();

      return apiFetch(
        `/call-logs/team-statistics${queryString ? `?${queryString}` : ""}`
      );
    },
  },

  // Users endpoints (admin only)
  users: {
    delete: async (id) => {
      return apiFetch(`/auth/users/${id}`, {
        method: "DELETE",
      });
    },

    update: async (id, userData) => {
      return apiFetch(`/auth/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      });
    },
  },

  // Conversation Guide endpoints
  conversationGuide: {
    get: async (customerId) => {
      return apiFetch(`/conversation-guide/${customerId}`);
    },
  },
};

export default api;
