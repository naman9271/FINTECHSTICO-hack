const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const moment = require('moment');
require('dotenv').config();

// Import models
const { User, Product, Inventory, SalesOrder } = require('../models');
const { connectDB } = require('../config/database');

// Configuration
const CONFIG = {
  NUM_USERS: 1,
  NUM_PRODUCTS: 200,
  NUM_ORDERS: 5000,
  CATEGORIES: [
    'Electronics', 'Clothing', 'Home & Kitchen', 'Books', 
    'Sports', 'Toys', 'Beauty', 'Automotive', 'Health',
    'Garden', 'Office', 'Pet Supplies'
  ],
  LOCATIONS: ['Warehouse-A', 'Warehouse-B', 'Warehouse-C', 'Store-1', 'Store-2'],
  PRODUCT_ARCHETYPES: {
    'bestseller': { salesProb: 0.8, dateRangeDays: 365 },
    'seasonal': { salesProb: 0.5, dateRangeDays: 90 },
    'slow_mover': { salesProb: 0.1, dateRangeDays: 365 },
    'dead_stock': { salesProb: 0.01, dateRangeDays: 365 }
  }
};

class DataSeeder {
  
  async seed() {
    try {
      console.log('🌱 Starting data seeding process...');
      
      // Connect to MongoDB
      await connectDB();
      
      // Clear existing data
      await this.clearExistingData();
      
      // Create test user
      const user = await this.createTestUser();
      
      // Generate products
      const products = await this.generateProducts(user._id);
      
      // Generate inventory for products
      await this.generateInventory(products);
      
      // Generate sales orders
      await this.generateSalesOrders(products);
      
      console.log('✅ Data seeding completed successfully!');
      console.log(`📊 Created: ${CONFIG.NUM_PRODUCTS} products, ${CONFIG.NUM_ORDERS} orders`);
      
      await this.displaySummary();
      
    } catch (error) {
      console.error('❌ Seeding failed:', error);
    } finally {
      await mongoose.connection.close();
      console.log('🔌 Database connection closed');
    }
  }
  
  // Database connection is now handled by imported connectDB function
  
  async clearExistingData() {
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      SalesOrder.deleteMany({}),
      Inventory.deleteMany({}),
      Product.deleteMany({}),
      User.deleteMany({})
    ]);
    console.log('✅ Existing data cleared');
  }
  
  async createTestUser() {
    console.log('👤 Creating test user...');
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: 'hashed_password_here'
    });
    await user.save();
    console.log('✅ Test user created');
    return user;
  }
  
  async generateProducts(userId) {
    console.log(`📦 Generating ${CONFIG.NUM_PRODUCTS} products...`);
    const products = [];
    
    for (let i = 0; i < CONFIG.NUM_PRODUCTS; i++) {
      const purchasePrice = this.randomFloat(5, 200);
      const markupMultiplier = this.randomFloat(1.2, 3.5);
      
      const product = new Product({
        userId,
        sku: `SKU-${String(i + 1).padStart(4, '0')}`,
        productName: this.generateProductName(),
        category: this.randomChoice(CONFIG.CATEGORIES),
        purchasePrice: Math.round(purchasePrice * 100) / 100,
        sellingPrice: Math.round(purchasePrice * markupMultiplier * 100) / 100,
        description: faker.commerce.productDescription()
      });
      
      await product.save();
      products.push(product);
      
      if ((i + 1) % 50 === 0) {
        console.log(`   Generated ${i + 1}/${CONFIG.NUM_PRODUCTS} products`);
      }
    }
    
    console.log('✅ Products generated');
    return products;
  }
  
  async generateInventory(products) {
    console.log('📦 Generating inventory records...');
    
    for (const product of products) {
      const inventory = new Inventory({
        productId: product._id,
        quantity: this.randomInt(0, 500),
        location: this.randomChoice(CONFIG.LOCATIONS),
        storageCostPerDay: this.randomFloat(0.01, 0.5)
      });
      
      await inventory.save();
    }
    
    console.log('✅ Inventory records generated');
  }
  
  async generateSalesOrders(products) {
    console.log(`🛒 Generating ${CONFIG.NUM_ORDERS} sales orders...`);
    
    // Assign archetypes to products
    const productArchetypes = {};
    const archetypeKeys = Object.keys(CONFIG.PRODUCT_ARCHETYPES);
    
    products.forEach(product => {
      productArchetypes[product._id.toString()] = this.randomChoice(archetypeKeys);
    });
    
    let ordersCreated = 0;
    
    for (let i = 0; i < CONFIG.NUM_ORDERS; i++) {
      const product = this.randomChoice(products);
      const archetype = productArchetypes[product._id.toString()];
      const archetypeInfo = CONFIG.PRODUCT_ARCHETYPES[archetype];
      
      // Decide if this product should have a sale based on its archetype
      if (Math.random() < archetypeInfo.salesProb) {
        let daysAgo = this.randomInt(1, archetypeInfo.dateRangeDays);
        
        // Special handling for seasonal items
        if (archetype === 'seasonal') {
          const seasonStart = this.randomChoice([30, 120, 210, 300]); // Seasonal periods
          daysAgo = this.randomInt(seasonStart, seasonStart + 60);
        }
        
        const orderDate = moment().subtract(daysAgo, 'days').toDate();
        const quantitySold = this.randomInt(1, 10);
        const priceVariation = this.randomFloat(0.9, 1.1); // ±10% price variation
        const unitPrice = Math.round(product.sellingPrice * priceVariation * 100) / 100;
        
        const salesOrder = new SalesOrder({
          productId: product._id,
          quantitySold,
          unitPrice,
          totalPrice: Math.round(quantitySold * unitPrice * 100) / 100,
          orderDate,
          customerInfo: {
            name: faker.person.fullName(),
            email: faker.internet.email(),
            location: faker.location.city()
          },
          status: this.randomChoice(['confirmed', 'shipped', 'delivered']),
          notes: Math.random() > 0.7 ? faker.lorem.sentence() : undefined
        });
        
        await salesOrder.save();
        ordersCreated++;
        
        if (ordersCreated % 500 === 0) {
          console.log(`   Generated ${ordersCreated} sales orders`);
        }
      }
    }
    
    console.log(`✅ Generated ${ordersCreated} sales orders`);
  }
  
  async displaySummary() {
    console.log('\n📊 Database Summary:');
    console.log('==================');
    
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const inventoryCount = await Inventory.countDocuments();
    const orderCount = await SalesOrder.countDocuments();
    
    console.log(`Users: ${userCount}`);
    console.log(`Products: ${productCount}`);
    console.log(`Inventory Records: ${inventoryCount}`);
    console.log(`Sales Orders: ${orderCount}`);
    
    // Category breakdown
    const categoryBreakdown = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📈 Products by Category:');
    categoryBreakdown.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count}`);
    });
    
    // Recent sales summary
    const recentSales = await SalesOrder.countDocuments({
      orderDate: { $gte: moment().subtract(30, 'days').toDate() }
    });
    
    console.log(`\n📅 Sales in last 30 days: ${recentSales}`);
    
    // Total inventory value
    const totalValue = await Inventory.aggregate([
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
          totalValue: { $sum: { $multiply: ['$quantity', '$product.purchasePrice'] } }
        }
      }
    ]);
    
    if (totalValue.length > 0) {
      console.log(`💰 Total Inventory Value: $${totalValue[0].totalValue.toFixed(2)}`);
    }
    
    console.log('\n🎉 Ready to start the application!');
    console.log('Run: npm run dev');
  }
  
  // Utility methods
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  generateProductName() {
    const adjectives = ['Premium', 'Deluxe', 'Professional', 'Smart', 'Advanced', 'Essential', 'Ultra', 'Compact'];
    const nouns = ['Widget', 'Gadget', 'Device', 'Tool', 'System', 'Kit', 'Set', 'Product'];
    
    if (Math.random() > 0.5) {
      return `${this.randomChoice(adjectives)} ${faker.commerce.productName()}`;
    } else {
      return `${faker.commerce.productName()} ${this.randomChoice(nouns)}`;
    }
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  const seeder = new DataSeeder();
  seeder.seed();
}

module.exports = DataSeeder;
