const express = require('express');
const router = express.Router();
const { validateQuery, schemas } = require('../middleware/validation');
const deadstockService = require('../services/deadstockService');

// GET /api/deadstock - Get dead stock analysis
router.get('/', validateQuery(schemas.deadstockQuery), async (req, res, next) => {
  try {
    const {
      daysSinceLastSale = 90,
      minQuantity = 1,
      category,
      limit = 100
    } = req.query;

    const result = await deadstockService.getDeadStockAnalysis({
      daysSinceLastSale: parseInt(daysSinceLastSale),
      minQuantity: parseInt(minQuantity),
      category,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/deadstock/summary - Get summary statistics
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await deadstockService.getDeadStockSummary();
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/deadstock/categories - Get dead stock by category
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await deadstockService.getDeadStockByCategory();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
