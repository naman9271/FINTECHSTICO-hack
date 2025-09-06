const { Product, Inventory, SalesOrder } = require('../models');
const moment = require('moment');

class DeadstockService {
  
  /**
   * Get comprehensive dead stock analysis
   */
  async getDeadStockAnalysis({ daysSinceLastSale = 90, minQuantity = 1, category = null, limit = 100 }) {
    try {
      const cutoffDate = moment().subtract(daysSinceLastSale, 'days').toDate();
      
      // Build aggregation pipeline
      const matchStage = {
        $match: {
          quantity: { $gte: minQuantity }
        }
      };
      
      const pipeline = [
        matchStage,
        // Join with products
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        
        // Filter by category if specified
        ...(category ? [{ $match: { 'product.category': category } }] : []),
        
        // Lookup last sale date
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
        
        // Add computed fields
        {
          $addFields: {
            lastSaleDate: { $arrayElemAt: ['$lastSale.orderDate', 0] },
            totalValue: { $multiply: ['$quantity', '$product.purchasePrice'] },
            monthlyStorageCost: { $multiply: ['$storageCostPerDay', 30] },
            profitMargin: {
              $cond: {
                if: { $gt: ['$product.sellingPrice', 0] },
                then: {
                  $multiply: [
                    { $divide: [
                      { $subtract: ['$product.sellingPrice', '$product.purchasePrice'] },
                      '$product.sellingPrice'
                    ]},
                    100
                  ]
                },
                else: 0
              }
            }
          }
        },
        
        // Filter by last sale date
        {
          $match: {
            $or: [
              { lastSaleDate: { $exists: false } },
              { lastSaleDate: null },
              { lastSaleDate: { $lte: cutoffDate } }
            ]
          }
        },
        
        // Add days since last sale
        {
          $addFields: {
            daysSinceLastSale: {
              $cond: {
                if: { $ifNull: ['$lastSaleDate', false] },
                then: {
                  $floor: {
                    $divide: [
                      { $subtract: [new Date(), '$lastSaleDate'] },
                      86400000 // milliseconds in a day
                    ]
                  }
                },
                else: null
              }
            }
          }
        },
        
        // Project final fields
        {
          $project: {
            productId: '$product._id',
            sku: '$product.sku',
            productName: '$product.productName',
            category: '$product.category',
            purchasePrice: '$product.purchasePrice',
            sellingPrice: '$product.sellingPrice',
            quantity: 1,
            totalValue: 1,
            lastSaleDate: 1,
            daysSinceLastSale: 1,
            monthlyStorageCost: 1,
            profitMargin: 1,
            location: 1
          }
        },
        
        // Sort by total value descending
        { $sort: { totalValue: -1 } },
        
        // Limit results
        { $limit: limit }
      ];
      
      const items = await Inventory.aggregate(pipeline);
      
      // Calculate summary statistics
      const summary = await this.calculateDeadStockSummary(items);
      
      return {
        summary,
        items,
        criteria: {
          daysSinceLastSale,
          minQuantity,
          category,
          analyzedAt: new Date()
        }
      };
      
    } catch (error) {
      throw new Error(`Failed to analyze dead stock: ${error.message}`);
    }
  }
  
  /**
   * Calculate summary statistics for dead stock
   */
  async calculateDeadStockSummary(items) {
    const summary = {
      totalItems: items.length,
      totalDeadStockValue: 0,
      estimatedTotalMonthlyStorageCost: 0,
      potentialProfitLoss: 0,
      averageDaysSinceLastSale: 0,
      categoryBreakdown: {}
    };
    
    let totalDays = 0;
    let itemsWithSales = 0;
    
    items.forEach(item => {
      summary.totalDeadStockValue += item.totalValue || 0;
      summary.estimatedTotalMonthlyStorageCost += item.monthlyStorageCost || 0;
      
      const potentialProfit = (item.sellingPrice - item.purchasePrice) * item.quantity;
      summary.potentialProfitLoss += potentialProfit;
      
      if (item.daysSinceLastSale) {
        totalDays += item.daysSinceLastSale;
        itemsWithSales++;
      }
      
      // Category breakdown
      if (!summary.categoryBreakdown[item.category]) {
        summary.categoryBreakdown[item.category] = {
          count: 0,
          totalValue: 0
        };
      }
      summary.categoryBreakdown[item.category].count++;
      summary.categoryBreakdown[item.category].totalValue += item.totalValue || 0;
    });
    
    summary.averageDaysSinceLastSale = itemsWithSales > 0 ? Math.round(totalDays / itemsWithSales) : 0;
    
    return summary;
  }
  
  /**
   * Get dead stock summary without detailed items
   */
  async getDeadStockSummary() {
    const quickAnalysis = await this.getDeadStockAnalysis({ limit: 1000 });
    return quickAnalysis.summary;
  }
  
  /**
   * Get dead stock breakdown by category
   */
  async getDeadStockByCategory() {
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
          $group: {
            _id: '$product.category',
            totalItems: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            totalValue: { $sum: { $multiply: ['$quantity', '$product.purchasePrice'] } },
            totalStorageCost: { $sum: { $multiply: ['$storageCostPerDay', 30] } }
          }
        },
        {
          $project: {
            category: '$_id',
            totalItems: 1,
            totalQuantity: 1,
            totalValue: 1,
            totalStorageCost: 1,
            _id: 0
          }
        },
        { $sort: { totalValue: -1 } }
      ];
      
      return await Inventory.aggregate(pipeline);
    } catch (error) {
      throw new Error(`Failed to get category breakdown: ${error.message}`);
    }
  }
}

module.exports = new DeadstockService();
