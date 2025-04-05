const axios = require('axios');

// M-Pesa API credentials
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const BUSINESS_SHORT_CODE = process.env.MPESA_SHORTCODE;
const PASSKEY = process.env.MPESA_PASSKEY;
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL;

// Helper function to get OAuth token
const getOAuthToken = async () => {
  try {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting OAuth token:', error);
    throw error;
  }
};

// Generate timestamp
const getTimestamp = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hour}${minutes}${seconds}`;
};

// Initialize M-Pesa payment
const initializePayment = async (req, res) => {
  try {
    const { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ message: 'Phone number and amount are required' });
    }

    // Format phone number (remove leading 0 or +254)
    const formattedPhone = phone.replace(/^(0|\+254)/, '254');
    
    // Get OAuth token
    const token = await getOAuthToken();
    
    // Generate timestamp
    const timestamp = getTimestamp();
    
    // Generate password
    const password = Buffer.from(
      `${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`
    ).toString('base64');

    // Prepare STK push request
    const stkPushRequest = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: BUSINESS_SHORT_CODE,
      PhoneNumber: formattedPhone,
      CallBackURL: CALLBACK_URL,
      AccountReference: 'AgriLink Payment',
      TransactionDesc: 'Product Purchase'
    };

    // Make STK push request
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      stkPushRequest,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('M-Pesa Payment Error:', error.response?.data || error.message);
    res.status(500).json({
      message: 'Payment initiation failed',
      error: error.response?.data || error.message
    });
  }
};

// Handle M-Pesa callback
const confirmPayment = async (req, res) => {
  try {
    const { Body } = req.body;
    
    // Log the callback data
    console.log('M-Pesa Callback Data:', JSON.stringify(Body, null, 2));

    // Extract relevant information
    const { stkCallback } = Body;
    const { ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata.Item.reduce((acc, item) => {
        acc[item.Name] = item.Value;
        return acc;
      }, {});

      // Here you would typically:
      // 1. Update the order status in your database
      // 2. Send confirmation to the user
      // 3. Update inventory
      
      console.log('Payment successful:', metadata);
    } else {
      console.log('Payment failed:', ResultDesc);
    }

    // Always respond with success to M-Pesa
    res.json({ ResultCode: 0, ResultDesc: 'Callback received successfully' });
  } catch (error) {
    console.error('M-Pesa Callback Error:', error);
    res.status(500).json({ message: 'Error processing callback' });
  }
};

module.exports = {
  initializePayment,
  confirmPayment
}; 