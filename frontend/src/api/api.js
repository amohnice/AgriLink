import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"; // Backend URL

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach Token to Requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle Token Expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
    const response = await api.get("/api/products");
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error.response?.data || error.message);
    return [];
  }
};

// Fetch Listings (using products endpoint)
export const fetchListings = async () => {
  try {
    const response = await api.get("/api/products");
    return response.data;
  } catch (error) {
    console.error("Error fetching listings:", error.response?.data || error.message);
    return [];
  }
};

// Create a new listing
export const createListing = async (listingData) => {
  try {
    const formData = new FormData();
    
    // Append all non-image fields
    Object.keys(listingData).forEach(key => {
      if (key !== 'images') {
        formData.append(key, listingData[key]);
      }
    });

    // Append images
    if (listingData.images && listingData.images.length > 0) {
      listingData.images.forEach((image, index) => {
        formData.append('images', image);
      });
    }

    const response = await api.post('/api/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating listing:', error.response?.data || error.message);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to create listing. Please try again.');
  }
};

// Update Listing (Protected)
export const updateListing = async (id, listingData) => {
  try {
    const response = await api.put(`/api/products/${id}`, listingData);
    return response.data;
  } catch (error) {
    console.error("Error updating listing:", error.response?.data || error.message);
    return null;
  }
};

// Delete Listing (Protected)
export const deleteListing = async (id) => {
  try {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting listing:", error.response?.data || error.message);
    return null;
  }
};

// User Authentication
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/api/auth/register", userData);
    return response;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error("Registration failed:", errorMessage);
    const formattedError = new Error(errorMessage);
    formattedError.response = error.response;
    throw formattedError;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/api/auth/login", credentials);
    localStorage.setItem("token", response.data.token);
    return response;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post("/api/auth/logout");
    localStorage.removeItem("token");
    return response.data;
  } catch (error) {
    console.error("Logout failed:", error.response?.data || error.message);
    return null;
  }
};

// Get Current User
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/api/auth/me");
    return response.data;
  } catch (error) {
    console.error("Failed to get user data:", error.response?.data || error.message);
    throw error;
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
    const response = await api.get("/api/chat/conversations");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const fetchMessages = async (conversationId) => {
  try {
    const response = await api.get(`/api/chat/conversations/${conversationId}/messages`);
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
    const response = await api.post("/api/chat/conversations", { participantId });
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

export const sendMessage = async (conversationId, text) => {
  try {
    const response = await api.post(
      `/api/chat/conversations/${conversationId}/messages`,
      { text }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
