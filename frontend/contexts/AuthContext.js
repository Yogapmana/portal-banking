"use client";

import { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear(); // Clear session storage
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Initial state
const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  LOAD_USER: "LOAD_USER",
  SET_LOADING: "SET_LOADING",
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      };

    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isLoading: false,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        try {
          const parsedUser = JSON.parse(user);
          dispatch({
            type: AUTH_ACTIONS.LOAD_USER,
            payload: parsedUser,
          });
        } catch (error) {
          console.error("Failed to parse user data:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await api.post("/auth/login", { email, password });
      const { user, token } = response.data;

      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login gagal";
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await api.post("/auth/register", { email, password });
      const { user, token } = response.data;

      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Registrasi gagal";
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE });
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear(); // Clear dashboard state
    dispatch({ type: AUTH_ACTIONS.LOGOUT });

    // Redirect to landing page
    window.location.href = "/";
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    api,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};