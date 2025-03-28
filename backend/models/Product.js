const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "KES",
      enum: ["KES"],
    },
    category: {
      type: String,
      required: true,
      enum: ["vegetables", "fruits", "grains", "dairy", "meat", "other"],
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    images: [{
      url: {
        type: String,
        required: true
      },
      filename: {
        type: String,
        required: true
      }
    }],
    location: {
      type: String,
      required: true,
    },
    blockchainTxHash: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["available", "sold", "reserved"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
