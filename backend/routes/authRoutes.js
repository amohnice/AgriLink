const express = require("express");
const router = express.Router();
const { getCurrentUser } = require("../controllers/authController");
const { loginUser, registerUser } = require("../controllers/userController");
const auth = require("../middleware/auth");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/me", auth, getCurrentUser);

module.exports = router; 