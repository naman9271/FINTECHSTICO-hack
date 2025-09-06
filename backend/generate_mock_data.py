import asyncio
import random
from datetime import datetime, timedelta
from faker import Faker
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# --- Configuration ---
DATABASE_URL = "postgresql+asyncpg://user:password@localhost/deadstock_db"
NUM_USERS = 1
NUM_PRODUCTS = 200
NUM_ORDERS = 5000

fake = Faker()

# --- Product Archetypes ---
PRODUCT_CATEGORIES = ["Electronics", "Clothing", "Home & Kitchen", "Books", "Sports", "Toys", "Beauty", "Automotive"]
PRODUCT_ARCHETYPES = {
    'bestseller': {'sales_prob': 0.8, 'date_range_days': 365},
    'seasonal': {'sales_prob': 0.5, 'date_range_days': 90}, # Sells in a 90-day window
    'slow_mover': {'sales_prob': 0.1, 'date_range_days': 365},
    'dead_stock': {'sales_prob': 0.01, 'date_range_days': 365},
}

async def generate_data():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async with engine.connect() as conn:
        print("--- Clearing existing data ---")
        await conn.execute(text("TRUNCATE TABLE sales_orders, inventory_levels, products, users RESTART IDENTITY CASCADE;"))
        await conn.commit()

        # --- Generate Users ---
        print("--- Generating users ---")
        await conn.execute(
            text("INSERT INTO users (username, email, password_hash) VALUES (:username, :email, :password)"),
            [{"username": "testuser", "email": "test@example.com", "password": "hashed_password"}]
        )
        await conn.commit()
        user_id = 1

        # --- Generate Products ---
        print("--- Generating products ---")
        products = []
        for i in range(NUM_PRODUCTS):
            purchase_price = round(random.uniform(5.0, 200.0), 2)
            selling_price = round(purchase_price * random.uniform(1.5, 3.0), 2)
            product = {
                'user_id': user_id,
                'sku': f"SKU-{i+1:04d}",
                'product_name': fake.ecommerce_name(),
                'category': random.choice(PRODUCT_CATEGORIES),
                'purchase_price': purchase_price,
                'selling_price': selling_price,
            }
            products.append(product)
        
        await conn.execute(text("""
            INSERT INTO products (user_id, sku, product_name, category, purchase_price, selling_price)
            VALUES (:user_id, :sku, :product_name, :category, :purchase_price, :selling_price)
        """), products)
        await conn.commit()

        # Fetch product IDs for linking
        result = await conn.execute(text("SELECT product_id FROM products"))
        product_ids = [row[0] for row in result]

        # --- Generate Inventory ---
        print("--- Generating inventory levels ---")
        inventory_items = []
        for product_id in product_ids:
            inventory_items.append({
                'product_id': product_id,
                'quantity': random.randint(0, 500),
                'location': f"Warehouse-{random.choice(['A', 'B', 'C'])}",
                'storage_cost_per_day': round(random.uniform(0.01, 0.20), 4)
            })
        await conn.execute(text("""
            INSERT INTO inventory_levels (product_id, quantity, location, storage_cost_per_day)
            VALUES (:product_id, :quantity, :location, :storage_cost_per_day)
        """), inventory_items)
        await conn.commit()

        # --- Generate Sales Orders ---
        print("--- Generating sales orders ---")
        orders = []
        archetype_keys = list(PRODUCT_ARCHETYPES.keys())
        product_archetypes = {pid: random.choice(archetype_keys) for pid in product_ids}

        for _ in range(NUM_ORDERS):
            product_id = random.choice(product_ids)
            archetype_info = PRODUCT_ARCHETYPES[product_archetypes[product_id]]

            if random.random() < archetype_info['sales_prob']:
                days_ago = random.randint(1, archetype_info['date_range_days'])
                if product_archetypes[product_id] == 'seasonal':
                    # Force sales into a recent 90-day window or a year-ago window
                    season_start_days_ago = random.choice([30, 365])
                    days_ago = random.randint(season_start_days_ago - 90, season_start_days_ago)

                order_date = datetime.now() - timedelta(days=days_ago)
                quantity_sold = random.randint(1, 5)
                
                # Fetch selling price for total price calculation
                price_result = await conn.execute(text(f"SELECT selling_price FROM products WHERE product_id = {product_id}"))
                selling_price = price_result.scalar_one()

                orders.append({
                    'product_id': product_id,
                    'quantity_sold': quantity_sold,
                    'order_date': order_date,
                    'total_price': float(selling_price) * quantity_sold,
                })

        await conn.execute(text("""
            INSERT INTO sales_orders (product_id, quantity_sold, order_date, total_price)
            VALUES (:product_id, :quantity_sold, :order_date, :total_price)
        """), orders)
        await conn.commit()

        print("--- Data generation complete! ---")

if __name__ == "__main__":
    asyncio.run(generate_data())
