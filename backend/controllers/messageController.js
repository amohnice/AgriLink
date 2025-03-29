const Message = require('../models/Message');
const User = require('../models/User');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user._id;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Create new message
    const message = await Message.create({
      sender: senderId,
      recipient: recipientId,
      content
    });

    // Populate sender and recipient details
    await message.populate([
      { path: 'sender', select: 'name email' },
      { path: 'recipient', select: 'name email' }
    ]);

    // Try to emit socket event if available
    const io = req.app.get('io');
    if (io) {
      try {
        io.to(recipientId.toString()).emit('newMessage', message);
        console.log('Socket event emitted successfully');
      } catch (socketError) {
        console.error('Socket.IO error:', socketError);
        // Continue without socket notification
      }
    } else {
      console.log('Socket.IO not available for real-time updates');
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ 
      message: 'Error sending message',
      error: error.message 
    });
  }
};

// Get messages for a user
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all messages where user is either sender or recipient
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }]
    })
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      message: 'Error fetching messages',
      error: error.message 
    });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({
      _id: messageId,
      recipient: userId
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.read = true;
    await message.save();

    res.json(message);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ 
      message: 'Error marking message as read',
      error: error.message 
    });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({
      _id: messageId,
      sender: userId
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.deleteOne();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ 
      message: 'Error deleting message',
      error: error.message 
    });
  }
}; 