const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer ID is required']
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Branch ID is required']
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: [true, 'Table ID is required']
  },
  dateTime: {
    type: Date,
    required: [true, 'Reservation date/time is required']
  },
  duration: {
    type: Number,
    default: 120, // duration in minutes, default 2 hours
    min: [30, 'Minimum duration is 30 minutes'],
    max: [300, 'Maximum duration is 5 hours']
  },
  partySize: {
    type: Number,
    required: [true, 'Party size is required'],
    min: [1, 'Party size must be at least 1']
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'confirmed'
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for conflict checking and queries
reservationSchema.index({ customerId: 1 });
reservationSchema.index({ tableId: 1, dateTime: 1 });
reservationSchema.index({ branchId: 1, dateTime: 1 });
reservationSchema.index({ status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
