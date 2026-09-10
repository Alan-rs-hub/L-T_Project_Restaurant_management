const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  itemTotal: {
    type: Number,
    required: true
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
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
  items: {
    type: [orderItemSchema],
    validate: {
      validator: function(v) { return v && v.length > 0; },
      message: 'Order must contain at least one item'
    }
  },
  orderType: {
    type: String,
    enum: ['dine_in', 'takeaway'],
    default: 'dine_in'
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    default: null
  },
  status: {
    type: String,
    enum: ['placed', 'preparing', 'ready', 'served', 'delivered', 'cancelled'],
    default: 'placed'
  },
  billing: {
    subtotal: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    serviceChargeRate: { type: Number, default: 0 },
    serviceChargeAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 }
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  orderNumber: {
    type: String
  }
}, {
  timestamps: true
});

// Auto-generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

orderSchema.index({ customerId: 1 });
orderSchema.index({ branchId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ branchId: 1, status: 1, createdAt: 1 });

module.exports = mongoose.model('Order', orderSchema);
