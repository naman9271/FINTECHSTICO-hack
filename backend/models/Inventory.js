const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  storageCostPerDay: {
    type: Number,
    required: true,
    min: 0
  },
  reservedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for available quantity
inventorySchema.virtual('availableQuantity').get(function() {
  return Math.max(0, this.quantity - this.reservedQuantity);
});

// Virtual for monthly storage cost
inventorySchema.virtual('monthlyStorageCost').get(function() {
  return this.storageCostPerDay * 30;
});

// Virtual for total storage cost
inventorySchema.virtual('totalStorageCost').get(function() {
  return this.quantity * this.storageCostPerDay;
});

// Indexes for performance
inventorySchema.index({ productId: 1 });
inventorySchema.index({ location: 1 });
inventorySchema.index({ quantity: 1 });

// Update lastUpdated on save
inventorySchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Ensure virtual fields are serialized
inventorySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);
