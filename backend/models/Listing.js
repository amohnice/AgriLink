const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'g', 'l', 'ml', 'piece', 'dozen', 'bundle']
  },
  category: {
    type: String,
    required: true,
    enum: ['fruits', 'vegetables', 'grains', 'dairy', 'meat', 'other']
  },
  images: [{
    type: String,
    required: true
  }],
  location: {
    type: String,
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
listingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing; 