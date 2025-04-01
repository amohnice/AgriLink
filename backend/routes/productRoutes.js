const express = require("express");
const router = express.Router();
const { getProducts, createProduct, getProductById, updateProduct } = require("../controllers/productController");
const { isAuthenticated } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected routes
router.post("/", isAuthenticated, upload.array('images', 5), createProduct);
router.put("/:id", isAuthenticated, upload.array('images', 5), updateProduct);

module.exports = router;
