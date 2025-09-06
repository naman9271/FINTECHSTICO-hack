const axios = require('axios');

const API_BASE = 'http://localhost:8000';

class BackendTester {
  
  async runTests() {
    console.log('🧪 Testing Backend API Endpoints...\n');
    
    try {
      await this.testHealthEndpoint();
      await this.testDeadstockEndpoint();
      await this.testQueryEndpoint();
      await this.testRecommendationEndpoint();
      
      console.log('\n✅ All tests passed! Backend is working correctly.');
    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
    }
  }
  
  async testHealthEndpoint() {
    console.log('1. Testing Health Endpoint...');
    const response = await axios.get(`${API_BASE}/api/health`);
    
    if (response.status === 200 && response.data.status === 'ok') {
      console.log('   ✅ Health check passed');
    } else {
      throw new Error('Health check failed');
    }
  }
  
  async testDeadstockEndpoint() {
    console.log('2. Testing Dead Stock Analysis...');
    const response = await axios.get(`${API_BASE}/api/deadstock`, {
      params: {
        daysSinceLastSale: 90,
        minQuantity: 1,
        limit: 10
      }
    });
    
    if (response.status === 200 && response.data.success) {
      const { summary, items } = response.data.data;
      console.log(`   ✅ Found ${summary.totalItems} dead stock items`);
      console.log(`   💰 Total value: $${summary.totalDeadStockValue.toFixed(2)}`);
    } else {
      throw new Error('Dead stock analysis failed');
    }
  }
  
  async testQueryEndpoint() {
    console.log('3. Testing Natural Language Query...');
    
    // Test predefined query (works without OpenAI)
    const response = await axios.post(`${API_BASE}/api/query`, {
      question: "Show me the most expensive products"
    });
    
    if (response.status === 200 && response.data.success) {
      const results = response.data.data.results;
      console.log(`   ✅ Query executed, returned ${results.length} results`);
    } else {
      throw new Error('Natural language query failed');
    }
  }
  
  async testRecommendationEndpoint() {
    console.log('4. Testing Recommendations...');
    
    // First get a product ID
    const productsResponse = await axios.get(`${API_BASE}/api/deadstock?limit=1`);
    
    if (productsResponse.data.data.items.length > 0) {
      const productId = productsResponse.data.data.items[0].productId;
      
      const response = await axios.post(`${API_BASE}/api/recommendations/${productId}`);
      
      if (response.status === 200 && response.data.success) {
        const recommendation = response.data.data;
        console.log(`   ✅ Recommendation generated: ${recommendation.strategy}`);
      } else {
        throw new Error('Recommendation generation failed');
      }
    } else {
      console.log('   ⚠️  No products available for recommendation test');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new BackendTester();
  tester.runTests().catch(console.error);
}

module.exports = BackendTester;
