const express = require("express");
const router = express.Router();
const { getUserById, updateUser } = require("../controllers/userController");
const { isAuthenticated } = require("../middleware/auth");

// Protected routes
router.get("/:id", isAuthenticated, getUserById);
router.put("/:id", isAuthenticated, updateUser);

module.exports = router;
