const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const Message = require('../models/Message');
const Transaction = require('../models/Transaction');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      activeSellers,
      activeListings,
      totalTransactions
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'farmer', isApproved: true, status: 'active' }),
      Listing.countDocuments({ status: 'active' }),
      Transaction.countDocuments()
    ]);

    res.json({
      totalUsers,
      activeSellers,
      activeListings,
      totalTransactions
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

// Get all users
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get pending sellers
router.get('/pending-sellers', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const pendingSellers = await User.find({
      role: 'farmer',
      isApproved: false
    })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(pendingSellers);
  } catch (error) {
    console.error('Error fetching pending sellers:', error);
    res.status(500).json({ message: 'Error fetching pending sellers' });
  }
});

// Approve a seller
router.put('/pending-sellers/:sellerId/approve', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.sellerId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'farmer') {
      return res.status(400).json({ message: 'User is not a farmer' });
    }

    user.isApproved = true;
    user.approvedAt = new Date();
    user.approvedBy = req.user._id;
    await user.save();

    // Emit socket event for real-time updates
    req.app.get('io').emit('sellerApproved', user);

    res.json({ message: 'Seller approved successfully' });
  } catch (error) {
    console.error('Error approving seller:', error);
    res.status(500).json({ message: 'Error approving seller' });
  }
});

// Suspend a user
router.put('/users/:userId/suspend', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot suspend an admin user' });
    }

    user.status = 'suspended';
    await user.save();

    // Emit socket event for real-time updates
    req.app.get('io').emit('userStatusChange', user);

    res.json({ message: 'User suspended successfully' });
  } catch (error) {
    console.error('Error suspending user:', error);
    res.status(500).json({ message: 'Error suspending user' });
  }
});

// Activate a user
router.put('/users/:userId/activate', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'active';
    await user.save();

    // Emit socket event for real-time updates
    req.app.get('io').emit('userStatusChange', user);

    res.json({ message: 'User activated successfully' });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({ message: 'Error activating user' });
  }
});

// Get user analytics
router.get('/analytics/users', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({ userGrowth });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ message: 'Error fetching user analytics' });
  }
});

// Get transaction analytics
router.get('/analytics/transactions', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const transactionVolume = await Transaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({ transactionVolume });
  } catch (error) {
    console.error('Error fetching transaction analytics:', error);
    res.status(500).json({ message: 'Error fetching transaction analytics' });
  }
});

// Get listing analytics
router.get('/analytics/listings', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const listingAnalytics = await Listing.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({ listingAnalytics });
  } catch (error) {
    console.error('Error fetching listing analytics:', error);
    res.status(500).json({ message: 'Error fetching listing analytics' });
  }
});

module.exports = router; 