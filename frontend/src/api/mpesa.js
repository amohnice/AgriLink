import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const initiateMpesaPayment = async (phone, amount) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Add some logging to debug
    console.log('Initiating M-Pesa payment:', {
      phone,
      amount,
      url: `${API_URL}/mpesa/pay`
    });

    const response = await axios.post(
      `${API_URL}/mpesa/pay`, 
      { 
        phone, 
        amount 
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('M-Pesa response:', response.data);

    // Check if the response contains the expected M-Pesa data
    if (response.data && response.data.ResponseCode === "0") {
      return response.data;
    } else {
      throw new Error(response.data.ResponseDescription || 'Payment initiation failed');
    }
  } catch (error) {
    console.error("M-Pesa Payment Error:", error.response?.data || error.message);
    throw error;
  }
};
