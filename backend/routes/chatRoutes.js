const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const auth = require("../middleware/authMiddleware");

// Get all conversations for the current user
router.get("/conversations", auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
    .populate("participants", "name role")
    .sort({ lastMessageTimestamp: -1 });

    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== req.user._id.toString()
      );
      return {
        id: conv._id,
        participant: {
          id: otherParticipant._id,
          name: otherParticipant.name,
          role: otherParticipant.role
        },
        lastMessage: conv.lastMessage,
        timestamp: conv.lastMessageTimestamp,
        unread: conv.unreadCounts.get(req.user._id.toString()) || 0
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching conversations" });
  }
});

// Get messages for a specific conversation
router.get("/conversations/:conversationId/messages", auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Verify user is part of the conversation
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const messages = await Message.find({
      conversationId: req.params.conversationId
    })
    .sort({ createdAt: -1 })
    .limit(50);

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId: req.params.conversationId,
        sender: { $ne: req.user._id },
        read: false
      },
      { read: true }
    );

    // Update unread count
    await Conversation.updateOne(
      { _id: req.params.conversationId },
      { $set: { [`unreadCounts.${req.user._id}`]: 0 } }
    );

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// Create or get a conversation with another user
router.post("/conversations", auth, async (req, res) => {
  try {
    const { participantId } = req.body;
    
    // Find existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] }
    }).populate("participants", "name role");

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [req.user._id, participantId],
        unreadCounts: new Map([[participantId, 0], [req.user._id, 0]])
      });
      conversation = await conversation.populate("participants", "name role");
    }

    const otherParticipant = conversation.participants.find(
      p => p._id.toString() !== req.user._id.toString()
    );

    res.json({
      id: conversation._id,
      participant: {
        id: otherParticipant._id,
        name: otherParticipant.name,
        role: otherParticipant.role
      },
      lastMessage: conversation.lastMessage,
      timestamp: conversation.lastMessageTimestamp,
      unread: conversation.unreadCounts.get(req.user._id.toString()) || 0
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating conversation" });
  }
});

// Send a message in a conversation
router.post("/conversations/:conversationId/messages", auth, async (req, res) => {
  try {
    const { text } = req.body;
    const conversation = await Conversation.findById(req.params.conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Verify user is part of the conversation
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Create message
    const message = await Message.create({
      conversationId: conversation._id,
      sender: req.user._id,
      text
    });

    // Update conversation
    const otherParticipantId = conversation.participants.find(
      p => p.toString() !== req.user._id.toString()
    );

    await Conversation.updateOne(
      { _id: conversation._id },
      {
        lastMessage: text,
        lastMessageTimestamp: new Date(),
        $inc: { [`unreadCounts.${otherParticipantId}`]: 1 }
      }
    );

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: "Error sending message" });
  }
});

module.exports = router;
