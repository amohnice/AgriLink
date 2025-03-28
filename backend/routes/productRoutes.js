const express = require("express");
const router = express.Router();
const { getProducts, createProduct, getProductById } = require("../controllers/productController");
const auth = require("../middleware/auth");
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected routes
router.post("/", auth, upload.array('images', 5), createProduct);

module.exports = router;
