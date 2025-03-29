import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create a single axios instance
export const api = axios.create({
  baseURL: API_URL + "/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log("Adding token to request:", token);
      config.headers.Authorization = `Bearer ${token}`;
    }
  return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Handle Token Expiration
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.data);
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    
    // Only redirect to login if:
    // 1. It's a 401 error
    // 2. We're not already on the login page
    // 3. It's not the login request itself
    if (error.response?.status === 401 && 
        !window.location.pathname.includes('/login') &&
        !error.config.url.includes('/auth/login')) {
      console.warn("⚠ Token expired or unauthorized. Logging out...");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Fetch Products
export const getProducts = async () => {
  try {
    const response = await api.get("/products");
    return response.data;
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
};

// Fetch Listings (using products endpoint)
export const fetchListings = async () => {
  try {
    const response = await api.get("/products");
    return response.data;
  } catch (error) {
    console.error("Error fetching listings:", error.response?.data || error.message);
    return [];
  }
};

// Create a new listing
export const createListing = async (listingData) => {
  try {
    const response = await api.post("/products", listingData);
    return response.data;
  } catch (error) {
    console.error("Error creating listing:", error);
    throw error;
  }
};

// Update Listing (Protected)
export const updateListing = async (id, listingData) => {
  try {
    const response = await api.put(`/products/${id}`, listingData);
    return response.data;
  } catch (error) {
    console.error("Error updating listing:", error);
    throw error;
  }
};

// Delete Listing (Protected)
export const deleteListing = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting listing:", error);
    throw error;
  }
};

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

// User Profile APIs
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get user profile:", error.response?.data || error.message);
    return null;
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await api.put(`/api/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Failed to update user profile:", error.response?.data || error.message);
    return null;
  }
};

// Chat functions
export const fetchConversations = async () => {
  try {
    const response = await api.get("/chat/conversations");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const fetchMessages = async (conversationId) => {
  try {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createConversation = async (participantId) => {
  try {
    if (!participantId) {
      throw new Error("Participant ID is required");
    }
    
    console.log("Creating conversation with participant:", participantId);
    const response = await api.post("/chat/conversations", { participantId });
    console.log("Conversation created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating conversation:", error.response?.data || error.message);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error("Failed to create conversation. Please try again.");
  }
};

export const sendMessage = async (conversationId, data) => {
  try {
    console.log('Sending message with data:', {
      conversationId,
      dataType: data instanceof FormData ? 'FormData' : typeof data,
      data: data instanceof FormData ? 'FormData object' : data
    });

    let requestData;
    let headers = {};

    if (data instanceof FormData) {
      // For image uploads
      requestData = data;
      // Don't set Content-Type for FormData, let browser set it with boundary
    } else {
      // For text messages
      requestData = new FormData();
      requestData.append('text', data);
    }

    console.log('Making request with:', {
      url: `/chat/conversations/${conversationId}/messages`,
      method: 'POST',
      headers,
      data: requestData instanceof FormData ? 'FormData object' : requestData
    });

    const response = await api.post(
      `/chat/conversations/${conversationId}/messages`,
      requestData,
      { headers }
    );

    console.log('Message sent successfully:', response.data);
    return response;
  } catch (error) {
    console.error('Error sending message:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    throw error;
  }
};

// Admin API functions
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching dashboard statistics' };
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching users' };
  }
};

export const getPendingSellers = async () => {
  try {
    const response = await api.get('/admin/pending-sellers');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching pending sellers' };
  }
};

export const approveSeller = async (userId) => {
  try {
    const response = await api.put(`/admin/approve-seller/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error approving seller' };
  }
};

export const suspendUser = async (userId) => {
  try {
    const response = await api.put(`/admin/suspend-user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error suspending user' };
  }
};

export const activateUser = async (userId) => {
  try {
    const response = await api.put(`/admin/activate-user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error activating user' };
  }
};
