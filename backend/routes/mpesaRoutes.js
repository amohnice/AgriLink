const express = require("express");
const { initiatePayment } = require("../utils/mpesaService");

const router = express.Router();

router.post("/pay", async (req, res) => {
  try {
    const { phone, amount } = req.body;
    const response = await initiatePayment(phone, amount);
    res.json(response);
  } catch (error) {
    console.error("M-Pesa Payment Error:", error);
    res.status(500).json({ message: "Payment failed", error });
  }
});

module.exports = router;
