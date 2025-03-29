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
    const listing = await Product.create({
      title,
      description,
      price,
      quantity,
      category,
      location,
      images,
      seller: req.user._id,
      status: 'available'
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ message: 'Failed to create listing' });
  }
};

// Get saved listings
const getSavedListings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedListings');
    res.json(user.savedListings);
  } catch (error) {
    console.error('Error fetching saved listings:', error);
    res.status(500).json({ message: 'Failed to fetch saved listings' });
  }
};

// Save a listing
const saveListing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const listing = await Product.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (user.savedListings.includes(listing._id)) {
      return res.status(400).json({ message: 'Listing already saved' });
    }

    user.savedListings.push(listing._id);
    await user.save();

    res.json({ message: 'Listing saved successfully' });
  } catch (error) {
    console.error('Error saving listing:', error);
    res.status(500).json({ message: 'Failed to save listing' });
  }
};

// Remove saved listing
const removeSavedListing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
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
  getAllListings,
  getRecentListings,
  createListing,
  getSavedListings,
  saveListing,
  removeSavedListing
};
