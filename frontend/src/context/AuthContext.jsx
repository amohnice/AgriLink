import { createContext, useContext, useState, useEffect } from "react";
import { loginUser as login, registerUser as register, getCurrentUser } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      console.log("Fetching user profile...");
      const userData = await getCurrentUser();
      console.log("User profile data:", userData);
      if (userData) {
        setUser(userData);
      } else {
        // If we can't get the user data, clear the token
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    try {
      console.log("Attempting login with:", email);
      const credentials = {
        email: String(email),
        password: String(password)
      };
      
      const response = await login(credentials);
      console.log("Login response:", response);
      
      // The response contains the user data and token directly
      localStorage.setItem("token", response.token);
      setUser(response);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const registerUser = async (email, password, name, role) => {
    try {
      const userData = {
        email: String(email),
        password: String(password),
        name: String(name),
        role: String(role)
      };
      const response = await register(userData);
      
      if (!response || !response.token) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem("token", response.token);
      setUser(response);
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login: loginUser,
    register: registerUser,
    logout,
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
