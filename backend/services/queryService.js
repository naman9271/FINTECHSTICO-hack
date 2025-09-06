const OpenAI = require('openai');
const { Product, Inventory, SalesOrder } = require('../models');

class QueryService {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null;
  }
  
  /**
   * Process natural language query and return results
   */
  async processNaturalLanguageQuery(question) {
    try {
      // If OpenAI is not configured, fall back to predefined queries
      if (!this.openai) {
        return this.handlePredefinedQueries(question);
      }
      
      // Generate MongoDB aggregation pipeline using AI
      const pipeline = await this.generateMongoQuery(question);
      
      if (!pipeline) {
        return {
          query: question,
          results: [],
          error: 'Could not generate a valid query from the question'
        };
      }
      
      // Execute the query
      const results = await this.executeQuery(pipeline);
      
      return {
        query: question,
        pipeline: JSON.stringify(pipeline, null, 2),
        results,
        error: null
      };
      
    } catch (error) {
      return {
        query: question,
        results: [],
        error: `Error processing query: ${error.message}`
      };
    }
  }
  
  /**
   * Generate MongoDB aggregation pipeline using OpenAI
   */
  async generateMongoQuery(question) {
    try {
      const prompt = this.constructPrompt(question);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0
      });
      
      const generatedQuery = response.choices[0].message.content.trim();
      
      // Extract JSON from the response
      const jsonMatch = generatedQuery.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      const pipeline = JSON.parse(jsonMatch[0]);
      
      // Validate pipeline safety
      if (!this.isValidPipeline(pipeline)) {
        throw new Error('Generated pipeline failed safety validation');
      }
      
      return pipeline;
      
    } catch (error) {
      console.error('Error generating MongoDB query:', error);
      return null;
    }
  }
  
  /**
   * Construct prompt for MongoDB query generation
   */
  constructPrompt(question) {
    return `
You are a MongoDB expert. Convert the natural language question into a MongoDB aggregation pipeline.

Database Schema:
- products: { _id, userId, sku, productName, category, purchasePrice, sellingPrice, createdAt }
- inventories: { _id, productId, quantity, location, storageCostPerDay, createdAt }
- salesorders: { _id, productId, quantitySold, unitPrice, totalPrice, orderDate, status, createdAt }

Rules:
1. Only use READ operations (aggregation pipelines)
2. Return ONLY a valid JSON array representing the MongoDB aggregation pipeline
3. Use $lookup to join collections when needed
4. Use appropriate $match, $group, $sort, $limit stages
5. Include helpful $project stages to format output

Examples:

Question: "Show me the top 5 most expensive products"
Answer: [
  { "$sort": { "sellingPrice": -1 } },
  { "$limit": 5 },
  { "$project": { "productName": 1, "sellingPrice": 1, "sku": 1 } }
]

Question: "How many products do we have in each category?"
Answer: [
  { "$group": { "_id": "$category", "count": { "$sum": 1 } } },
  { "$sort": { "count": -1 } },
  { "$project": { "category": "$_id", "count": 1, "_id": 0 } }
]

Question: "Which products had no sales in the last 90 days?"
Answer: [
  {
    "$lookup": {
      "from": "salesorders",
      "let": { "productId": "$_id" },
      "pipeline": [
        {
          "$match": {
            "$expr": { "$eq": ["$productId", "$$productId"] },
            "orderDate": { "$gte": { "$date": { "$subtract": [new Date(), 7776000000] } } }
          }
        }
      ],
      "as": "recentSales"
    }
  },
  { "$match": { "recentSales": { "$size": 0 } } },
  { "$project": { "productName": 1, "sku": 1, "category": 1 } }
]

New Question: "${question}"
Answer:`;
  }
  
  /**
   * Validate that the generated pipeline is safe
   */
  isValidPipeline(pipeline) {
    if (!Array.isArray(pipeline)) return false;
    
    const allowedOperators = [
      '$match', '$group', '$sort', '$limit', '$skip', '$project',
      '$lookup', '$unwind', '$addFields', '$count', '$facet'
    ];
    
    for (const stage of pipeline) {
      const operators = Object.keys(stage);
      if (!operators.every(op => allowedOperators.includes(op))) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Execute the MongoDB aggregation pipeline
   */
  async executeQuery(pipeline) {
    try {
      // Try executing on products collection first (most common)
      let results = await Product.aggregate(pipeline);
      
      // If no results and pipeline seems inventory-related, try inventory collection
      if (results.length === 0 && this.seemsInventoryRelated(pipeline)) {
        results = await Inventory.aggregate(pipeline);
      }
      
      // If no results and pipeline seems sales-related, try sales collection
      if (results.length === 0 && this.seemsSalesRelated(pipeline)) {
        results = await SalesOrder.aggregate(pipeline);
      }
      
      return results.slice(0, 100); // Limit results for safety
      
    } catch (error) {
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }
  
  /**
   * Check if pipeline is inventory-related
   */
  seemsInventoryRelated(pipeline) {
    const pipelineStr = JSON.stringify(pipeline);
    return pipelineStr.includes('quantity') || 
           pipelineStr.includes('location') || 
           pipelineStr.includes('storage');
  }
  
  /**
   * Check if pipeline is sales-related
   */
  seemsSalesRelated(pipeline) {
    const pipelineStr = JSON.stringify(pipeline);
    return pipelineStr.includes('orderDate') || 
           pipelineStr.includes('quantitySold') || 
           pipelineStr.includes('sales');
  }
  
  /**
   * Handle predefined queries when OpenAI is not available
   */
  async handlePredefinedQueries(question) {
    const normalizedQuestion = question.toLowerCase();
    
    try {
      // Top expensive products
      if (normalizedQuestion.includes('expensive') || normalizedQuestion.includes('highest price')) {
        const results = await Product.find()
          .sort({ sellingPrice: -1 })
          .limit(10)
          .select('productName sellingPrice sku category');
        
        return {
          query: question,
          results,
          pipeline: 'Predefined query: Top expensive products',
          error: null
        };
      }
      
      // Products by category
      if (normalizedQuestion.includes('category') && normalizedQuestion.includes('count')) {
        const results = await Product.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $project: { category: '$_id', count: 1, _id: 0 } }
        ]);
        
        return {
          query: question,
          results,
          pipeline: 'Predefined query: Products by category',
          error: null
        };
      }
      
      // Total inventory value
      if (normalizedQuestion.includes('total') && (normalizedQuestion.includes('value') || normalizedQuestion.includes('worth'))) {
        const results = await Inventory.aggregate([
          {
            $lookup: {
              from: 'products',
              localField: 'productId',
              foreignField: '_id',
              as: 'product'
            }
          },
          { $unwind: '$product' },
          {
            $group: {
              _id: null,
              totalValue: { $sum: { $multiply: ['$quantity', '$product.purchasePrice'] } },
              totalItems: { $sum: '$quantity' }
            }
          }
        ]);
        
        return {
          query: question,
          results,
          pipeline: 'Predefined query: Total inventory value',
          error: null
        };
      }
      
      // Default fallback
      return {
        query: question,
        results: [],
        error: 'OpenAI API key not configured. Only basic predefined queries are supported.'
      };
      
    } catch (error) {
      return {
        query: question,
        results: [],
        error: `Error executing predefined query: ${error.message}`
      };
    }
  }
}

module.exports = new QueryService();
