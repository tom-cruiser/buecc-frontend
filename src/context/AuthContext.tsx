// Enhanced AuthContext with token helper
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import config from '../config/config';
const API_BASE_URL = config.API_ENDPOINT;

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
  getToken: () => string | null; // Add token helper
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function to get token
  const getToken = (): string | null => {
    return localStorage.getItem("token");
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    const token = getToken();
    if (!token) {
      console.log("No token found in localStorage");
      return false;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      } else {
        console.log("Token verification failed:", res.status);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      const storedUser = localStorage.getItem("user");
      const token = getToken();

      console.log("Initializing auth - Token exists:", !!token);
      console.log("Initializing auth - Stored user exists:", !!storedUser);

      if (storedUser && token) {
        try {
          const isValid = await checkAuthStatus();
          if (!isValid) {
            setUser(null);
          }
        } catch (error) {
          console.error("Failed to verify auth status:", error);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      throw new Error("Please enter a valid email address");
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        switch (res.status) {
          case 400:
            throw new Error("Invalid email or password format");
          case 401:
            throw new Error("Invalid email or password");
          case 403:
            throw new Error("Access denied. Admin privileges required.");
          case 429:
            throw new Error("Too many login attempts. Please try again later.");
          case 500:
            throw new Error("Server error. Please try again later.");
          default:
            throw new Error(data.message || "Login failed");
        }
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid response from server");
      }

      console.log("Login successful - Token received:", !!data.token);
      console.log("Login response user:", data.user);

      if (!data.user.role) {
        console.warn(
          "Warning: User role is missing. Please check your backend user data."
        );
      } else if (data.user.role !== "admin") {
        throw new Error("Access denied. Admin privileges required.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      console.log(
        "Token stored successfully:",
        !!localStorage.getItem("token")
      );
    } catch (error: any) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to server. Please check your connection."
        );
      }
      throw error;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      console.log("Logged out - Token removed");
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/admin/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuthStatus,
        getToken, // Expose token helper
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
