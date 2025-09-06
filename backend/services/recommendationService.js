const { Product, Inventory, SalesOrder } = require('../models');
const moment = require('moment');

class RecommendationService {
  
  /**
   * Generate actionable recommendation for a specific product
   */
  async generateRecommendation(productId) {
    try {
      // Get product with inventory and sales data
      const productData = await this.getProductAnalysisData(productId);
      
      if (!productData) {
        return {
          strategy: 'Error',
          details: 'Product not found.',
          expectedOutcome: '',
          confidence: 0
        };
      }
      
      // Apply decision tree logic
      return this.applyRecommendationRules(productData);
      
    } catch (error) {
      throw new Error(`Failed to generate recommendation: ${error.message}`);
    }
  }
  
  /**
   * Get comprehensive product analysis data
   */
  async getProductAnalysisData(productId) {
    try {
      const pipeline = [
        { $match: { _id: productId } },
        
        // Lookup inventory
        {
          $lookup: {
            from: 'inventories',
            localField: '_id',
            foreignField: 'productId',
            as: 'inventory'
          }
        },
        
        // Lookup recent sales (last 30 days)
        {
          $lookup: {
            from: 'salesorders',
            let: { productId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$productId', '$$productId'] },
                  orderDate: { $gte: moment().subtract(30, 'days').toDate() }
                }
              }
            ],
            as: 'recentSales'
          }
        },
        
        // Lookup all sales for trend analysis
        {
          $lookup: {
            from: 'salesorders',
            let: { productId: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$productId', '$$productId'] } } },
              { $sort: { orderDate: -1 } }
            ],
            as: 'allSales'
          }
        },
        
        // Add computed fields
        {
          $addFields: {
            inventory: { $arrayElemAt: ['$inventory', 0] },
            recentSalesCount: { $size: '$recentSales' },
            totalSalesCount: { $size: '$allSales' },
            lastSaleDate: { $arrayElemAt: ['$allSales.orderDate', 0] },
            profitMargin: {
              $cond: {
                if: { $gt: ['$sellingPrice', 0] },
                then: {
                  $divide: [
                    { $subtract: ['$sellingPrice', '$purchasePrice'] },
                    '$sellingPrice'
                  ]
                },
                else: 0
              }
            }
          }
        },
        
        // Add more analysis fields
        {
          $addFields: {
            totalValue: { $multiply: ['$inventory.quantity', '$purchasePrice'] },
            monthlyStorageCost: { $multiply: ['$inventory.storageCostPerDay', 30] },
            daysSinceLastSale: {
              $cond: {
                if: '$lastSaleDate',
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
        }
      ];
      
      const result = await Product.aggregate(pipeline);
      return result[0] || null;
      
    } catch (error) {
      throw new Error(`Failed to get product analysis data: ${error.message}`);
    }
  }
  
  /**
   * Apply business rules to generate recommendations
   */
  applyRecommendationRules(data) {
    const {
      totalValue = 0,
      monthlyStorageCost = 0,
      profitMargin = 0,
      recentSalesCount = 0,
      daysSinceLastSale = null,
      inventory = {},
      category = 'Unknown'
    } = data;
    
    const quantity = inventory.quantity || 0;
    const storageCostRatio = totalValue > 0 ? (monthlyStorageCost / totalValue) : 0;
    
    let strategy, details, expectedOutcome, confidence;
    
    // Rule 1: Low value, high storage cost ratio
    if (totalValue < 50 && storageCostRatio > 0.1) {
      strategy = 'Liquidate';
      details = `This low-value item (total value $${totalValue.toFixed(2)}) has a high relative storage cost ($${monthlyStorageCost.toFixed(2)}/month, ${(storageCostRatio * 100).toFixed(1)}% of value). It's more cost-effective to clear the stock quickly through liquidation sales or donations.`;
      expectedOutcome = 'Free up cash flow and eliminate ongoing storage costs. Recover 10-30% of inventory value.';
      confidence = 0.9;
    }
    
    // Rule 2: High margin, no recent sales
    else if (recentSalesCount === 0 && profitMargin > 0.4) {
      const discountPercentage = Math.min(25, Math.floor(profitMargin * 50));
      strategy = `Aggressive Discount (${discountPercentage}%)`;
      details = `The product has a high profit margin (${(profitMargin * 100).toFixed(1)}%) but has not sold recently. A ${discountPercentage}% discount could stimulate demand while maintaining profitability.`;
      expectedOutcome = 'Generate sales and convert stagnant inventory into revenue. Maintain positive margins.';
      confidence = 0.8;
    }
    
    // Rule 3: Slow-moving, low margin items
    else if (recentSalesCount < 3 && profitMargin < 0.2) {
      strategy = 'Bundle with Bestseller';
      details = `This is a slow-moving, low-margin item (${(profitMargin * 100).toFixed(1)}% margin, ${recentSalesCount} recent sales). Bundling it with popular products can increase its perceived value and help clear inventory without direct discounting.`;
      expectedOutcome = 'Increase sales volume of the slow-moving item and potentially boost overall order value.';
      confidence = 0.7;
    }
    
    // Rule 4: Seasonal items (category-based)
    else if (this.isSeasonalCategory(category) && daysSinceLastSale > 180) {
      strategy = 'Seasonal Promotion';
      details = `This appears to be a seasonal item in the ${category} category with no recent sales (${daysSinceLastSale} days). Plan a targeted seasonal promotion during the appropriate period.`;
      expectedOutcome = 'Capitalize on seasonal demand patterns to move inventory at optimal times.';
      confidence = 0.6;
    }
    
    // Rule 5: High quantity, moderate performance
    else if (quantity > 100 && recentSalesCount > 0 && recentSalesCount < 10) {
      strategy = 'Volume Discount';
      details = `Large inventory quantity (${quantity} units) with moderate sales activity (${recentSalesCount} recent sales). Offer volume discounts to B2B customers or bulk buyers.`;
      expectedOutcome = 'Reduce inventory levels while maintaining reasonable margins through volume sales.';
      confidence = 0.65;
    }
    
    // Rule 6: Long-term dead stock
    else if (daysSinceLastSale > 365) {
      strategy = 'Write-off Consideration';
      details = `No sales for over a year (${daysSinceLastSale} days). Consider writing off this inventory for tax purposes or donating to charity for goodwill.`;
      expectedOutcome = 'Tax benefits and improved cash flow management. Clear warehouse space.';
      confidence = 0.75;
    }
    
    // Default: Monitor
    else {
      strategy = 'Monitor';
      details = 'This product does not currently meet the criteria for urgent action. Continue to monitor its sales velocity and inventory levels. Consider reviewing pricing strategy or marketing efforts.';
      expectedOutcome = 'Maintain current strategy while gathering more data for future decisions.';
      confidence = 0.5;
    }
    
    return {
      strategy,
      details,
      expectedOutcome,
      confidence,
      analysisData: {
        totalValue,
        monthlyStorageCost,
        profitMargin: profitMargin * 100,
        recentSalesCount,
        daysSinceLastSale,
        storageCostRatio: storageCostRatio * 100,
        quantity
      },
      generatedAt: new Date()
    };
  }
  
  /**
   * Check if category is seasonal
   */
  isSeasonalCategory(category) {
    const seasonalCategories = [
      'clothing', 'fashion', 'seasonal', 'holiday', 'sports',
      'outdoor', 'garden', 'toys', 'gifts'
    ];
    return seasonalCategories.some(seasonal => 
      category.toLowerCase().includes(seasonal)
    );
  }
  
  /**
   * Get bulk recommendations for multiple products
   */
  async getBulkRecommendations(productIds = [], limit = 10) {
    try {
      let products;
      
      if (productIds.length > 0) {
        // Validate product IDs
        const validIds = productIds.filter(id => /^[0-9a-fA-F]{24}$/.test(id));
        products = await Product.find({ _id: { $in: validIds } }).limit(limit);
      } else {
        // Get products that likely need recommendations (no recent sales)
        const cutoffDate = moment().subtract(60, 'days').toDate();
        
        const pipeline = [
          {
            $lookup: {
              from: 'salesorders',
              let: { productId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$productId', '$$productId'] },
                    orderDate: { $gte: cutoffDate }
                  }
                }
              ],
              as: 'recentSales'
            }
          },
          {
            $match: {
              recentSales: { $size: 0 }
            }
          },
          { $limit: limit }
        ];
        
        products = await Product.aggregate(pipeline);
      }
      
      const recommendations = await Promise.all(
        products.map(async (product) => {
          const recommendation = await this.generateRecommendation(product._id);
          return {
            productId: product._id,
            productName: product.productName,
            sku: product.sku,
            category: product.category,
            recommendation
          };
        })
      );
      
      return recommendations;
      
    } catch (error) {
      throw new Error(`Failed to get bulk recommendations: ${error.message}`);
    }
  }
}

module.exports = new RecommendationService();
