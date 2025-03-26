const express = require("express");
const router = express.Router();
const { getProducts, createProduct, getProductById } = require("../controllers/productController");
const auth = require("../middleware/auth");

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected routes
router.post("/", auth, createProduct);

module.exports = router;
