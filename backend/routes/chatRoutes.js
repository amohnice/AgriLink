const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const mongoose = require("mongoose");

// Get all conversations for the current user
router.get("/conversations", auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate("participants", "name role")
    .sort({ lastMessageTimestamp: -1 });

    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== req.user.id.toString()
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
        unread: conv.unreadCounts.get(req.user.id.toString()) || 0
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
router.get("/conversations/:conversationId/messages", auth, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Verify user is part of the conversation
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const messages = await Message.find({ conversationId: req.params.conversationId })
      .sort({ createdAt: 1 })
      .populate("sender", "name");

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ 
      message: "Error fetching messages",
      error: error.message
    });
  }
});

// Create a new conversation
router.post("/conversations", auth, async (req, res) => {
  try {
    const { participantId } = req.body;
    
    console.log("Creating conversation request:", {
      currentUserId: req.user.id,
      participantId
    });
    
    // Validate participantId
    if (!participantId) {
      return res.status(400).json({ message: "Participant ID is required" });
    }

    // Validate if participantId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ message: "Invalid participant ID" });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: "Participant not found" });
    }

    // Convert participantId to ObjectId
    const participantObjectId = new mongoose.Types.ObjectId(participantId);
    const currentUserId = new mongoose.Types.ObjectId(req.user.id);

    // Prevent self-conversation
    if (participantObjectId.equals(currentUserId)) {
      return res.status(400).json({ message: "Cannot create conversation with yourself" });
    }

    // Create or find conversation using the static method
    console.log("Creating conversation with participants:", {
      currentUserId: currentUserId.toString(),
      participantId: participantObjectId.toString()
    });

    const conversation = await Conversation.createConversation(currentUserId, participantObjectId);
    
    if (!conversation) {
      return res.status(500).json({ message: "Failed to create or find conversation" });
    }

    console.log("Conversation created/found:", conversation._id);

    // Populate participant information
    await conversation.populate("participants", "name role");

    const otherParticipant = conversation.participants.find(
      p => !p._id.equals(currentUserId)
    );

    if (!otherParticipant) {
      return res.status(500).json({ message: "Failed to find other participant" });
    }

    const response = {
      id: conversation._id,
      participant: {
        id: otherParticipant._id,
        name: otherParticipant.name,
        role: otherParticipant.role
      },
      lastMessage: conversation.lastMessage || "",
      timestamp: conversation.lastMessageTimestamp || new Date(),
      unread: 0
    };

    console.log("Sending response:", response);
    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ 
      message: "Error creating conversation",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Send a message
router.post("/conversations/:conversationId/messages", auth, async (req, res) => {
  try {
    const { text } = req.body;
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Verify user is part of the conversation
    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const message = new Message({
      conversationId: req.params.conversationId,
      sender: req.user.id,
      text
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = text;
    conversation.lastMessageTimestamp = new Date();
    
    // Update unread counts for other participants
    conversation.participants.forEach(participantId => {
      if (participantId.toString() !== req.user.id.toString()) {
        const currentCount = conversation.unreadCounts.get(participantId.toString()) || 0;
        conversation.unreadCounts.set(participantId.toString(), currentCount + 1);
      }
    });

    await conversation.save();

    // Populate sender information
    await message.populate("sender", "_id name");

    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ 
      message: "Error sending message",
      error: error.message
    });
  }
});

module.exports = router;
