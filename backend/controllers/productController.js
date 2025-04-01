const Product = require("../models/Product");
const { predictPrice } = require("../models/pricePredictionModel");
const blockchain = require("../utils/blockchain");

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("seller", "name email")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name email");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create product
const createProduct = async (req, res) => {
  try {
    const { title, description, price, quantity, category, location } = req.body;

    // Handle image uploads
    const images = req.files ? req.files.map(file => ({
      url: file.path,
      filename: file.filename
    })) : [];

    const product = await Product.create({
      seller: req.user.id,
      title,
      description,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      category,
      location,
      images
    });

    // Record on blockchain if enabled
    if (blockchain.isEnabled()) {
      try {
        const txHash = await blockchain.recordTransaction(
          req.user.id,
          "0x0", // Contract address or null address
          product._id.toString(),
          0 // No value transfer for creation
        );
        if (txHash) {
          product.blockchainTxHash = txHash;
          await product.save();
        }
      } catch (blockchainError) {
        console.warn("Failed to record on blockchain:", blockchainError);
        // Continue without blockchain record
      }
    }

    await product.populate("seller", "name email");
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ 
      message: "Server error",
      details: error.message 
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user is the seller
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to edit this listing" });
    }

    // Handle image uploads if any
    const images = req.files ? req.files.map(file => ({
      url: file.path,
      filename: file.filename
    })) : product.images;

    // Update fields
    product.title = req.body.title || product.title;
    product.description = req.body.description || product.description;
    product.price = req.body.price ? parseFloat(req.body.price) : product.price;
    product.quantity = req.body.quantity ? parseInt(req.body.quantity) : product.quantity;
    product.category = req.body.category || product.category;
    product.location = req.body.location || product.location;
    product.images = images;

    const updatedProduct = await product.save();
    await updatedProduct.populate("seller", "name email");
    
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ 
      message: "Server error",
      details: error.message 
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct
};
