const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const { isAuthenticated } = require("../middleware/auth");
const mongoose = require("mongoose");
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });

// Get all conversations for the current user
router.get("/conversations", isAuthenticated, async (req, res) => {
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
        lastMessage: conv.lastMessage || "",
        timestamp: conv.lastMessageTimestamp,
        unread: conv.unreadCounts.get(req.user._id.toString()) || 0
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ 
      message: "Error fetching conversations",
      error: error.message
    });
  }
});

// Get messages for a specific conversation
router.get("/conversations/:conversationId/messages", isAuthenticated, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    })
    .populate("sender", "name role")
    .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// Create a new conversation
router.post("/conversations", isAuthenticated, async (req, res) => {
  try {
    const { participantId } = req.body;

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] }
    });

    if (existingConversation) {
      return res.json(existingConversation);
    }

    // Create new conversation
    const conversation = await Conversation.create({
      participants: [req.user._id, participantId],
      lastMessage: "",
      lastMessageTimestamp: new Date(),
      unreadCounts: new Map([
        [req.user._id.toString(), 0],
        [participantId, 0]
      ])
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ message: "Error creating conversation" });
  }
});

// Send a message
router.post("/conversations/:conversationId/messages", isAuthenticated, upload.single("image"), async (req, res) => {
  try {
    const { text } = req.body;
    const conversationId = req.params.conversationId;

    // Validate that either text or image is provided
    if (!text && !req.file) {
      return res.status(400).json({ message: "Message must contain either text or an image" });
    }

    // Get the conversation to find the recipient
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Find the recipient (the other participant)
    const recipient = conversation.participants.find(
      p => p.toString() !== req.user._id.toString()
    );

    // Create message
    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      text: text || "",
      image: req.file ? {
        url: req.file.path,
        filename: req.file.filename
      } : undefined
    });

    // Update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text || "Image message",
      lastMessageTimestamp: new Date(),
      $inc: {
        [`unreadCounts.${recipient}`]: 1
      }
    });

    // Populate sender information
    await message.populate("sender", "name role");

    // Emit socket event for real-time updates
    req.app.get('io').to(recipient.toString()).emit('message received', {
      conversationId,
      message
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ 
      message: "Error sending message",
      error: error.message 
    });
  }
});

// Mark messages as read
router.put("/conversations/:conversationId/read", isAuthenticated, async (req, res) => {
  try {
    const conversationId = req.params.conversationId;

    // Update unread count for the current user
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: {
        [`unreadCounts.${req.user._id}`]: 0
      }
    });

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: req.user._id },
        read: false
      },
      { read: true }
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Error marking messages as read" });
  }
});

module.exports = router;
