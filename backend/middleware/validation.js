const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  };
};

// Common validation schemas
const schemas = {
  productId: Joi.object({
    productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }),
  
  deadstockQuery: Joi.object({
    daysSinceLastSale: Joi.number().integer().min(1).max(3650).default(90),
    minQuantity: Joi.number().integer().min(0).default(1),
    category: Joi.string().optional(),
    limit: Joi.number().integer().min(1).max(1000).default(100)
  }),
  
  nlQuery: Joi.object({
    query: Joi.string().min(5).max(500).required()
  })
};

module.exports = {
  validateRequest,
  validateQuery,
  schemas
};
