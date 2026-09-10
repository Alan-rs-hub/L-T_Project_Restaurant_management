const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Branch ID is required']
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    minlength: 2,
    maxlength: 150
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: ['appetizer', 'main_course', 'dessert', 'beverage', 'side', 'soup', 'salad', 'special']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0.01, 'Price must be positive']
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index: prevent duplicate item names per branch+category
menuItemSchema.index({ branchId: 1, name: 1, category: 1 }, { unique: true });
menuItemSchema.index({ branchId: 1 });
menuItemSchema.index({ category: 1 });

module.exports = mongoose.model('MenuItem', menuItemSchema);
