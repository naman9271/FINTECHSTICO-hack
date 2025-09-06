const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const { validateRequest, schemas } = require('../middleware/validation');

// GET /api/products - Get all products with optional filtering
router.get('/', async (req, res, next) => {
  try {
    const { category, status, search, limit = 50, skip = 0 } = req.query;
    
    let filter = {};
    
    // Add category filter
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Add status filter
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    // Add search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const products = await Product.find(filter)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 });
    
    const total = await Product.countDocuments(filter);
    
    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/products - Create new product
router.post('/', async (req, res, next) => {
  try {
    const productData = req.body;
    
    // Check if SKU already exists
    const existingSku = await Product.findOne({ sku: productData.sku });
    if (existingSku) {
      return res.status(400).json({
        success: false,
        error: 'Product with this SKU already exists'
      });
    }
    
    const product = new Product(productData);
    await product.save();
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    next(error);
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if SKU is being updated and if it conflicts with existing product
    if (updateData.sku) {
      const existingSku = await Product.findOne({ 
        sku: updateData.sku, 
        _id: { $ne: id } 
      });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          error: 'Product with this SKU already exists'
        });
      }
    }
    
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    next(error);
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/categories/list - Get unique categories
router.get('/categories/list', async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    
    res.json({
      success: true,
      data: categories.filter(category => category && category.trim() !== '')
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/products/:id/status - Update product status
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'inactive', 'discontinued'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be active, inactive, or discontinued'
      });
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product,
      message: 'Product status updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
