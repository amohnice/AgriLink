const Product = require("../models/Product");
const User = require("../models/User");
const path = require('path');

// Get all listings
const getAllListings = async (req, res) => {
  try {
    const listings = await Product.find({ status: 'available' })
      .sort({ createdAt: -1 })
      .populate('seller', 'name email')
      .exec();

    res.json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ message: 'Failed to fetch listings' });
  }
};

// Create a new listing
const createListing = async (req, res) => {
  try {
    const { title, description, price, quantity, category, location } = req.body;

    // Validate required fields
    if (!title || !description || !price || !quantity || !category || !location) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        missing: {
          title: !title,
          description: !description,
          price: !price,
          quantity: !quantity,
          category: !category,
          location: !location
        }
      });
    }

    // Validate price and quantity
    if (price <= 0 || quantity <= 0) {
      return res.status(400).json({ 
        message: 'Price and quantity must be greater than 0' 
      });
    }

    // Handle image uploads
    const images = req.files ? req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename
    })) : [];

    // Create new listing
    const listing = new Product({
      title,
      description,
      price: Number(price),
      quantity: Number(quantity),
      category,
      location,
      images,
      seller: req.user.id,
      status: 'available'
    });

    await listing.save();

    // Populate seller information
    await listing.populate('seller', 'name email');

    res.status(201).json(listing);
  } catch (error) {
    console.error('Error creating listing:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ 
      message: 'Failed to create listing',
      error: error.message 
    });
  }
};

// Get recent listings
const getRecentListings = async (req, res) => {
  try {
    const listings = await Product.find({ status: 'available' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('seller', 'name email')
      .exec();

    res.json(listings);
  } catch (error) {
    console.error('Error fetching recent listings:', error);
    res.status(500).json({ message: 'Failed to fetch recent listings' });
  }
};

// Get saved listings for a user
const getSavedListings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'savedListings',
        populate: {
          path: 'seller',
          select: 'name email'
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.savedListings || []);
  } catch (error) {
    console.error('Error fetching saved listings:', error);
    res.status(500).json({ message: 'Failed to fetch saved listings' });
  }
};

// Save a listing
const saveListing = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const listing = await Product.findById(req.params.id);

    if (!user || !listing) {
      return res.status(404).json({ message: 'User or listing not found' });
    }

    if (!user.savedListings.includes(listing._id)) {
      user.savedListings.push(listing._id);
      await user.save();
    }

    res.json({ message: 'Listing saved successfully' });
  } catch (error) {
    console.error('Error saving listing:', error);
    res.status(500).json({ message: 'Failed to save listing' });
  }
};

// Remove saved listing
const removeSavedListing = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.savedListings = user.savedListings.filter(
      id => id.toString() !== req.params.id
    );
    await user.save();

    res.json({ message: 'Listing removed from saved items' });
  } catch (error) {
    console.error('Error removing saved listing:', error);
    res.status(500).json({ message: 'Failed to remove saved listing' });
  }
};

module.exports = {
  createListing,
  getRecentListings,
  getSavedListings,
  saveListing,
  removeSavedListing,
  getAllListings
};
