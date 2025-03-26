const express = require("express");
const { predictPrice } = require("../models/pricePredictionModel");

const router = express.Router();

router.post("/predict", async (req, res) => {
  try {
    const { crop, supply, demand } = req.body;
    const predictedPrice = await predictPrice(supply, demand);
    res.json({ crop, predictedPrice });
  } catch (error) {
    console.error("Prediction Error:", error);
    res.status(500).json({ message: "Prediction failed" });
  }
});

module.exports = router;
