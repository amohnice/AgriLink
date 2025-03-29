const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createListing,
  getRecentListings,
  getSavedListings,
  saveListing,
  removeSavedListing,
  getAllListings
} = require('../controllers/listingController');
const isFarmer = require('../middleware/isFarmer');

// Public routes
router.get('/', getAllListings);
router.get('/recent', getRecentListings);

// Protected routes
router.get('/saved', isAuthenticated, getSavedListings);
router.post('/:id/save', isAuthenticated, saveListing);
router.delete('/:id/save', isAuthenticated, removeSavedListing);

// Farmer-only routes
router.post('/', isAuthenticated, isFarmer, upload.array('images', 5), createListing);

module.exports = router;
