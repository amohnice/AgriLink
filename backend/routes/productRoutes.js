const express = require("express");
const router = express.Router();
const { getProducts, createProduct, getProductById, updateProduct, getRecentProducts, getSavedProducts, saveProduct, unsaveProduct } = require("../controllers/productController");
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
router.get("/recent", getRecentProducts);
router.get("/saved", isAuthenticated, getSavedProducts);

// Protected routes for saving/unsaving
router.post("/:id/save", isAuthenticated, saveProduct);
router.delete("/:id/save", isAuthenticated, unsaveProduct);

// Product CRUD routes
router.get("/:id", getProductById);
router.post("/", isAuthenticated, upload.array('images', 5), createProduct);
router.put("/:id", isAuthenticated, upload.array('images', 5), updateProduct);

module.exports = router;
