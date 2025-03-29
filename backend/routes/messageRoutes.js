const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const {
  sendMessage,
  getMessages,
  markAsRead,
  deleteMessage
} = require('../controllers/messageController');

// All routes require authentication
router.use(isAuthenticated);

// Send a message
router.post('/', sendMessage);

// Get all messages for the current user
router.get('/', getMessages);

// Mark a message as read
router.put('/:messageId/read', markAsRead);

// Delete a message
router.delete('/:messageId', deleteMessage);

module.exports = router; 