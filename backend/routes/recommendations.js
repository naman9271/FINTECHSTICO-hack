const express = require('express');
const router = express.Router();
const { validateRequest, schemas } = require('../middleware/validation');
const recommendationService = require('../services/recommendationService');

// POST /api/recommendations/:productId - Get recommendation for specific product
router.post('/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    // Validate productId format
    if (!/^[0-9a-fA-F]{24}$/.test(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID format'
      });
    }
    
    const recommendation = await recommendationService.generateRecommendation(productId);
    
    res.json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/recommendations/bulk - Get recommendations for multiple products
router.get('/bulk', async (req, res, next) => {
  try {
    const { productIds, limit = 10 } = req.query;
    
    let ids = [];
    if (productIds) {
      ids = Array.isArray(productIds) ? productIds : productIds.split(',');
    }
    
    const recommendations = await recommendationService.getBulkRecommendations(ids, parseInt(limit));
    
    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/recommendations/strategies - Get available recommendation strategies
router.get('/strategies', (req, res) => {
  const strategies = [
    {
      name: 'Liquidate',
      description: 'Sell at any price to free up space and capital',
      applicableWhen: 'Low value items with high storage costs'
    },
    {
      name: 'Aggressive Discount',
      description: 'Apply significant discount to stimulate demand',
      applicableWhen: 'High margin products with no recent sales'
    },
    {
      name: 'Bundle with Bestseller',
      description: 'Combine with popular items to increase sales',
      applicableWhen: 'Slow-moving, low-margin items'
    },
    {
      name: 'Seasonal Promotion',
      description: 'Wait for appropriate season and promote heavily',
      applicableWhen: 'Seasonal items outside their peak period'
    },
    {
      name: 'Monitor',
      description: 'Continue monitoring without immediate action',
      applicableWhen: 'Items that don\'t meet urgent action criteria'
    }
  ];
  
  res.json({
    success: true,
    data: strategies
  });
});

module.exports = router;
