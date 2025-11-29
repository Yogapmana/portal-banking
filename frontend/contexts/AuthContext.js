"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import api from "../lib/api";

const AuthContext = createContext({});

// Helper functions for cookies
const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage and cookie on mount
  useEffect(() => {
    const storedToken = getCookie("token") || localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        // Check if token is expired
        const decoded = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          // Token expired, try to refresh (refresh token is in httpOnly cookie)
          handleTokenRefresh();
        } else {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Ensure cookie is set
          setCookie("token", storedToken);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  // Handle token refresh
  const handleTokenRefresh = async () => {
    try {
      // Refresh token is in httpOnly cookie, no need to send it
      const response = await api.auth.refresh();

      if (response.success) {
        const newToken = response.data.accessToken;

        setToken(newToken);
        localStorage.setItem("token", newToken);
        setCookie("token", newToken);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
    }
  };

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    // Save to both localStorage and cookie
    // Refresh token is automatically saved in httpOnly cookie by backend
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setCookie("token", userToken);
  };

  const logout = async () => {
    try {
      // Call logout API to revoke refresh token (cookie will be sent automatically)
      await api.auth.logout();
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local logout even if API fails
    }

    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    deleteCookie("token");
    // httpOnly cookie will be cleared by backend
    router.push("/login");
  };

  const isAdmin = () => {
    return user?.role === "ADMIN";
  };

  const isSalesManager = () => {
    return user?.role === "SALES_MANAGER";
  };

  const isSales = () => {
    return user?.role === "SALES";
  };

  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value = {
    user,
    token,
    refreshToken,
    loading,
    login,
    logout,
    handleTokenRefresh,
    isAdmin,
    isSalesManager,
    isSales,
    hasRole,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
