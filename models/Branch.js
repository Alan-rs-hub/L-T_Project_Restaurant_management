const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true,
    minlength: 2,
    maxlength: 150
  },
  address: {
    type: String,
    required: [true, 'Branch address is required'],
    trim: true
  },
  seatingCapacity: {
    type: Number,
    required: [true, 'Seating capacity is required'],
    min: [1, 'Seating capacity must be at least 1']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

branchSchema.index({ name: 1 });

module.exports = mongoose.model('Branch', branchSchema);
