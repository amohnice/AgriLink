const axios = require("axios");
const base64 = require("base-64");
require("dotenv").config();

const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL } = process.env;

const getAuthToken = async () => {
  const auth = base64.encode(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`);
  const response = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    headers: { Authorization: `Basic ${auth}` },
  });
  return response.data.access_token;
};

const initiatePayment = async (phone, amount) => {
  const token = await getAuthToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  const password = base64.encode(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`);

  const response = await axios.post(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: "AgriLink",
      TransactionDesc: "Payment for produce",
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data;
};

module.exports = { initiatePayment };
