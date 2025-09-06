const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Product, Inventory, SalesOrder } = require('../models');

class QueryService {
  constructor() {
    this.gemini = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
    this.model = this.gemini ? this.gemini.getGenerativeModel({ model: "gemini-pro" }) : null;
  }
  
  /**
   * Process natural language query and return results
   */
  async processNaturalLanguageQuery(question) {
    try {
      // Always try to get actual data first
      const answer = await this.getDataBasedAnswer(question);
      
      return {
        query: question,
        answer: answer,
        error: null
      };
      
    } catch (error) {
      console.error('Error processing query:', error);
      return {
        query: question,
        answer: "I'm sorry, I'm having trouble accessing your data right now. Please try again later.",
        error: error.message
      };
    }
  }
  
  /**
   * Generate answer using Google Gemini
   */
  async generateAnswerWithGemini(question) {
    try {
      // Get current dead stock data to provide context
      const deadStockData = await this.getDeadStockContext();
      
      const prompt = `
You are an AI assistant for a Smart Dead Stock Management Platform. 
Answer the user's question about their inventory and dead stock data based on the following context:

DEAD STOCK DATA SUMMARY:
${JSON.stringify(deadStockData.summary, null, 2)}

SAMPLE DEAD STOCK ITEMS (Top 10):
${JSON.stringify(deadStockData.items.slice(0, 10), null, 2)}

USER QUESTION: ${question}

Please provide a helpful, accurate answer based on the data above. If the question asks for specific numbers, calculations, or trends, use the actual data provided. Be conversational and provide actionable insights where possible.

If the question is asking about:
- "highest dead stock value" or "most expensive": Focus on items with highest totalValue
- "categories at risk": Group by category and show which have most dead stock
- "items not sold": Look at daysSinceLastSale values
- "total potential loss": Sum up relevant values from the data

Always be specific with numbers when available and provide context about what the numbers mean for the business.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
      
    } catch (error) {
      console.error('Error with Gemini API:', error);
      // Instead of generic response, try to answer based on available data
      return await this.getDataBasedAnswer(question);
    }
  }

  /**
   * Get current dead stock context for AI responses
   */
  async getDeadStockContext() {
    try {
      const pipeline = [
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
          $lookup: {
            from: 'salesorders',
            let: { productId: '$productId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$productId', '$$productId'] } } },
              { $sort: { orderDate: -1 } },
              { $limit: 1 }
            ],
            as: 'lastSale'
          }
        },
        {
          $addFields: {
            lastSaleDate: { $arrayElemAt: ['$lastSale.orderDate', 0] },
            totalValue: { $multiply: ['$quantity', '$product.purchasePrice'] },
            monthlyStorageCost: { $multiply: ['$storageCostPerDay', 30] }
          }
        },
        {
          $addFields: {
            daysSinceLastSale: {
              $cond: {
                if: { $ifNull: ['$lastSaleDate', false] },
                then: {
                  $floor: {
                    $divide: [
                      { $subtract: [new Date(), '$lastSaleDate'] },
                      86400000
                    ]
                  }
                },
                else: null
              }
            }
          }
        },
        {
          $match: {
            $or: [
              { lastSaleDate: { $exists: false } },
              { lastSaleDate: null },
              { lastSaleDate: { $lte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } }
            ]
          }
        },
        { $sort: { totalValue: -1 } },
        { $limit: 50 }
      ];

      const items = await Inventory.aggregate(pipeline);
      
      const summary = {
        totalItems: items.length,
        totalDeadStockValue: items.reduce((sum, item) => sum + (item.totalValue || 0), 0),
        averageDaysSinceLastSale: items.reduce((sum, item) => sum + (item.daysSinceLastSale || 0), 0) / items.length,
        categoriesAffected: [...new Set(items.map(item => item.product?.category).filter(Boolean))],
        totalMonthlyStorageCost: items.reduce((sum, item) => sum + (item.monthlyStorageCost || 0), 0)
      };

      return { summary, items };
      
    } catch (error) {
      console.error('Error getting dead stock context:', error);
      return { 
        summary: { totalItems: 0, totalDeadStockValue: 0 }, 
        items: [] 
      };
    }
  }
  
  /**
   * Get data-based answer when Gemini API fails
   */
  async getDataBasedAnswer(question) {
    try {
      const deadStockData = await this.getDeadStockContext();
      const lowerQuestion = question.toLowerCase();
      
      if (lowerQuestion.includes('highest') && lowerQuestion.includes('dead stock')) {
        const topItems = deadStockData.items.slice(0, 5);
        let answer = "Here are the products with the highest dead stock value:\n\n";
        topItems.forEach((item, index) => {
          answer += `${index + 1}. ${item.product?.productName || 'Unknown Product'} - $${(item.totalValue || 0).toLocaleString()}\n`;
        });
        return answer;
      }
      
      if (lowerQuestion.includes('categories') && lowerQuestion.includes('risk')) {
        const categoryStats = {};
        deadStockData.items.forEach(item => {
          const category = item.product?.category || 'Unknown';
          if (!categoryStats[category]) {
            categoryStats[category] = { count: 0, value: 0 };
          }
          categoryStats[category].count++;
          categoryStats[category].value += item.totalValue || 0;
        });
        
        let answer = "Categories most at risk for dead stock:\n\n";
        Object.entries(categoryStats)
          .sort((a, b) => b[1].value - a[1].value)
          .slice(0, 5)
          .forEach(([category, stats], index) => {
            answer += `${index + 1}. ${category}: ${stats.count} items worth $${stats.value.toLocaleString()}\n`;
          });
        return answer;
      }
      
      if (lowerQuestion.includes('6 months') || lowerQuestion.includes('haven\'t sold')) {
        const oldItems = deadStockData.items.filter(item => 
          !item.daysSinceLastSale || item.daysSinceLastSale > 180
        );
        let answer = `Found ${oldItems.length} items that haven't sold in 6+ months:\n\n`;
        oldItems.slice(0, 10).forEach((item, index) => {
          const days = item.daysSinceLastSale || 'Never';
          answer += `${index + 1}. ${item.product?.productName || 'Unknown'} - Last sold: ${days === 'Never' ? 'Never' : days + ' days ago'}\n`;
        });
        return answer;
      }
      
      if (lowerQuestion.includes('total') && (lowerQuestion.includes('loss') || lowerQuestion.includes('value'))) {
        const totalValue = deadStockData.summary.totalDeadStockValue;
        const totalItems = deadStockData.summary.totalItems;
        return `Total potential loss from dead stock: $${totalValue.toLocaleString()} across ${totalItems} items. This represents inventory that hasn't moved in the past 90+ days.`;
      }
      
      // Default response with actual data
      return `Based on your current inventory data: You have ${deadStockData.summary.totalItems} dead stock items worth $${deadStockData.summary.totalDeadStockValue.toLocaleString()}. Average days since last sale: ${Math.round(deadStockData.summary.averageDaysSinceLastSale || 0)} days.`;
      
    } catch (error) {
      console.error('Error getting data-based answer:', error);
      return "I'm having trouble accessing your inventory data right now. Please try again later.";
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
