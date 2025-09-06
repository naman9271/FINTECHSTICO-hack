"""
Simple test script to verify the backend functionality
Run this after setting up the database and generating mock data
"""
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.db import AsyncSessionLocal
from services.deadstock import get_dead_stock_analysis
from services.recommendations import generate_recommendation

async def test_backend():
    """Test core backend functionality"""
    print("🧪 Testing Backend Functionality...")
    
    async with AsyncSessionLocal() as db:
        try:
            # Test 1: Dead stock analysis
            print("\n1. Testing Dead Stock Analysis...")
            result = await get_dead_stock_analysis(db, days_since_last_sale=90, min_quantity=1)
            print(f"✅ Found {result['summary']['total_items']} dead stock items")
            print(f"   Total value: ${result['summary']['total_dead_stock_value']:,.2f}")
            
            # Test 2: Recommendations
            if result['items']:
                print("\n2. Testing Recommendations...")
                first_product_id = result['items'][0]['product_id']
                recommendation = await generate_recommendation(db, first_product_id)
                print(f"✅ Recommendation for product {first_product_id}: {recommendation['strategy']}")
            
            print("\n🎉 All tests passed! Backend is working correctly.")
            
        except Exception as e:
            print(f"❌ Test failed: {e}")
            return False
    
    return True

if __name__ == "__main__":
    success = asyncio.run(test_backend())
