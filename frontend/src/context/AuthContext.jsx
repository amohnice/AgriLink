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
      const userData = await getCurrentUser();
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
      const credentials = {
        email: String(email),
        password: String(password)
      };
      
      const response = await login(credentials);
      
      // The response is already the data object from the API call
      const { token, user } = response;
      localStorage.setItem("token", token);
      setUser(user);
      return user;
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
      
      // The response is already the data object from the API call
      const { token, user } = response;
      if (!token || !user) {
        throw new Error('Missing token or user data in response');
      }
      
      localStorage.setItem("token", token);
      setUser(user);
      return user;
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
