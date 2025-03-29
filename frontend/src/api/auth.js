import { api } from './api';

// Auth API functions
export const registerUser = async (userData) => {
  try {
    console.log("Registering user:", userData);
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    throw error.response?.data || { message: 'Registration failed' };
  }
};

export const loginUser = async (credentials) => {
  try {
    console.log("Logging in with:", credentials);
    const response = await api.post('/auth/login', credentials);
    console.log("Login response:", response.data);
    
    // Ensure we have the expected data structure
    if (!response.data || !response.data.token) {
      throw new Error('Invalid response from server');
    }
    
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || { message: 'Login failed' };
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Logout failed' };
  }
};

export const getCurrentUser = async () => {
  try {
    console.log("Getting current user...");
    const response = await api.get('/auth/me');
    console.log("Current user response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Get current user error:", error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to get user data' };
  }
};
