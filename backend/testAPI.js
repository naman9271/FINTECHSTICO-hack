const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing API endpoints...\n');
    
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health:', healthResponse.data);
    
    // Test deadstock endpoint
    console.log('\n2. Testing deadstock endpoint...');
    const deadstockResponse = await axios.get('http://localhost:5000/api/deadstock/summary');
    console.log('✅ Deadstock Summary:', deadstockResponse.data);
    
    // Test query endpoint
    console.log('\n3. Testing query endpoint...');
    const queryResponse = await axios.post('http://localhost:5000/api/query', {
      query: 'Show me all products'
    });
    console.log('✅ Query:', queryResponse.data);
    
    // Test recommendations endpoint
    console.log('\n4. Testing recommendations endpoint...');
    const recommendationsResponse = await axios.get('http://localhost:5000/api/recommendations');
    console.log('✅ Recommendations:', recommendationsResponse.data);
    
  } catch (error) {
    console.error('❌ API Test failed:', error.response?.data || error.message);
  }
}

testAPI();
