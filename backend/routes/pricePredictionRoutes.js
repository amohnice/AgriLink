const express = require("express");
const router = express.Router();
const { predictPrice } = require("../models/pricePredictionModel");

// Predict price based on user input
router.get("/predict/:month", async (req, res) => {
  const month = parseInt(req.params.month);
  if (isNaN(month) || month < 1 || month > 12) {
    return res.status(400).json({ error: "Invalid month. Use 1-12." });
  }

  const price = await predictPrice(month);
  res.json({ month, predictedPrice: price });
});

module.exports = router;
