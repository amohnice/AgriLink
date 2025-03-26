import { useState } from "react";
import { initiateMpesaPayment } from "../api/mpesa";

const PayButton = ({ amount }) => {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePayment = async () => {
    if (!phone) return setMessage("Enter phone number");

    setLoading(true);
    const response = await initiateMpesaPayment(phone, amount);
    setLoading(false);

    if (response && response.ResponseCode === "0") {
      setMessage("Payment request sent to phone.");
    } else {
      setMessage("Payment failed.");
    }
  };

  return (
    <div>
      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter M-Pesa number" />
      <button onClick={handlePayment} disabled={loading}>{loading ? "Processing..." : `Pay KES ${amount}`}</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default PayButton;
