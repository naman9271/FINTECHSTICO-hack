const mongoose = require('mongoose');

const salesOrderSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantitySold: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  orderDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  customerInfo: {
    name: String,
    email: String,
    location: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'confirmed'
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Validate that totalPrice matches quantitySold * unitPrice
salesOrderSchema.pre('save', function(next) {
  const expectedTotal = this.quantitySold * this.unitPrice;
  if (Math.abs(this.totalPrice - expectedTotal) > 0.01) {
    this.totalPrice = expectedTotal;
  }
  next();
});

// Indexes for performance
salesOrderSchema.index({ productId: 1, orderDate: -1 });
salesOrderSchema.index({ orderDate: -1 });
salesOrderSchema.index({ status: 1 });

// Virtual for days since order
salesOrderSchema.virtual('daysSinceOrder').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.orderDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
salesOrderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('SalesOrder', salesOrderSchema);
