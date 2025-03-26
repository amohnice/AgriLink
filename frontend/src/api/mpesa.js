import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const initiateMpesaPayment = async (phone, amount) => {
  try {
    const response = await axios.post(`${API_URL}/mpesa/pay, { phone, amount }`);
    return response.data;
  } catch (error) {
    console.error("M-Pesa Payment Error:", error.response?.data || error.message);
    return null;
  }
};
