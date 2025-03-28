const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
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
router.get('/saved', auth, getSavedListings);
router.post('/:id/save', auth, saveListing);
router.delete('/:id/save', auth, removeSavedListing);

// Farmer-only routes
router.post('/', auth, isFarmer, upload.array('images', 5), createListing);

module.exports = router;
