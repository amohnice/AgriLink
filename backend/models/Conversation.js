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
      type: Date
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

conversationSchema.index({ participants: 1 }, { unique: true });

module.exports = mongoose.model("Conversation", conversationSchema);
