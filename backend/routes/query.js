const express = require('express');
const router = express.Router();
const { validateRequest, schemas } = require('../middleware/validation');
const queryService = require('../services/queryService');

// POST /api/query - Process natural language queries
router.post('/', validateRequest(schemas.nlQuery), async (req, res, next) => {
  try {
    const { query } = req.body;
    
    const result = await queryService.processNaturalLanguageQuery(query);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/query/examples - Get example queries
router.get('/examples', (req, res) => {
  const examples = [
    {
      question: "Show me the top 10 most expensive products",
      description: "Returns products sorted by selling price in descending order"
    },
    {
      question: "Which products had no sales in the last 6 months?",
      description: "Finds products with zero sales in the specified timeframe"
    },
    {
      question: "How many electronics items do we have in stock?",
      description: "Counts total inventory for electronics category"
    },
    {
      question: "What is the total value of products in the toys category?",
      description: "Calculates total inventory value for toys"
    },
    {
      question: "Show me products with high storage costs",
      description: "Lists products with above-average storage costs"
    },
    {
      question: "Which products have the highest profit margins?",
      description: "Shows products sorted by profit margin percentage"
    }
  ];
  
  res.json({
    success: true,
    data: examples
  });
});

module.exports = router;
