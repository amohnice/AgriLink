const express = require('express');
const router = express.Router();
const {
  createListing,
  getRecentListings,
  getSavedListings,
  saveListing,
  removeSavedListing
} = require('../controllers/listingController');
const auth = require('../middleware/auth');
const isFarmer = require('../middleware/isFarmer');

// Public routes
router.get('/recent', getRecentListings);

// Protected routes
router.get('/saved', auth, getSavedListings);
router.post('/:id/save', auth, saveListing);
router.delete('/:id/save', auth, removeSavedListing);

// Farmer-only routes
router.post('/', auth, isFarmer, createListing);

module.exports = router;
