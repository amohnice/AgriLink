const express = require("express");
const { initializePayment, confirmPayment } = require("../controllers/mpesaController");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

// Protected M-Pesa routes
router.post("/pay", isAuthenticated, initializePayment);
router.post("/callback", confirmPayment);

module.exports = router;
