const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  description: {
    type: String,
    maxlength: 1000
  },
  supplier: {
    type: String,
    maxlength: 200
  },
  lastRestocked: {
    type: Date
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.price && this.cost) {
    return ((this.price - this.cost) / this.price * 100).toFixed(2);
  }
  return 0;
});

// Indexes for performance
productSchema.index({ userId: 1, sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
