const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }],
    lastMessage: {
      type: String,
      default: ""
    },
    lastMessageTimestamp: {
      type: Date,
      default: Date.now
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: new Map()
    }
  },
  {
    timestamps: true
  }
);

// Add a method to check if a conversation exists
conversationSchema.statics.findByParticipants = async function(userId1, userId2) {
  return this.findOne({
    participants: { $all: [userId1, userId2] }
  });
};

// Add a method to create a new conversation
conversationSchema.statics.createConversation = async function(userId1, userId2) {
  try {
    // First check if conversation exists
    const existingConversation = await this.findByParticipants(userId1, userId2);
    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation with sorted participant IDs to ensure consistency
    const sortedParticipants = [userId1, userId2].sort();
    const conversation = new this({
      participants: sortedParticipants,
      unreadCounts: new Map([
        [userId1.toString(), 0],
        [userId2.toString(), 0]
      ])
    });

    try {
      return await conversation.save();
    } catch (error) {
      // If we get a duplicate key error, try to find the conversation again
      if (error.code === 11000) {
        const existingConv = await this.findByParticipants(userId1, userId2);
        if (existingConv) {
          return existingConv;
        }
      }
      throw error;
    }
  } catch (error) {
    console.error("Error in createConversation:", error);
    throw error;
  }
};

// Create a compound unique index on participants array
conversationSchema.index({ participants: 1 }, { 
  unique: true,
  collation: { locale: 'simple', strength: 2 }
});

module.exports = mongoose.model("Conversation", conversationSchema);
