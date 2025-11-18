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

/**
 * Generic fetch wrapper dengan auto authentication
 */
async function apiFetch(endpoint, options = {}) {
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || "Something went wrong",
        error: data.error,
      };
    }

    return data;
  } catch (error) {
    if (error.status === 401) {
      // Token expired or invalid
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
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
      });
    },

    register: async (email, password, role) => {
      return apiFetch("/auth/register/admin", {
        method: "POST",
        body: JSON.stringify({ email, password, role }),
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

      return apiFetch(`/customers/pending${queryString ? `?${queryString}` : ""}`);
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

    getStatistics: async () => {
      return apiFetch("/call-logs/statistics");
    },
  },

  // Users endpoints (admin only)
  users: {
    delete: async (id) => {
      return apiFetch(`/auth/users/${id}`, {
        method: "DELETE",
      });
    },
  },
};

export default api;
