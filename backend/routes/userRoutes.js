const express = require("express");
const router = express.Router();
const { getUserById, updateUser } = require("../controllers/userController");
const auth = require("../middleware/auth");

// Protected routes
router.get("/:id", auth, getUserById);
router.put("/:id", auth, updateUser);

module.exports = router;
