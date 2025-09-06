from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

async def generate_recommendation(db: AsyncSession, product_id: int):
    # Step 1: Gather all relevant data for the product
    query = text("""
        SELECT
            p.purchase_price,
            p.selling_price,
            i.quantity,
            i.storage_cost_per_day,
            (SELECT MAX(order_date) FROM sales_orders WHERE product_id = p.product_id) as last_sale_date,
            (SELECT COUNT(*) FROM sales_orders WHERE product_id = p.product_id AND order_date > NOW() - INTERVAL '30 days') as sales_last_30_days
        FROM products p
        JOIN inventory_levels i ON p.product_id = i.product_id
        WHERE p.product_id = :product_id
    """)
    result = await db.execute(query, {"product_id": product_id})
    data = result.first()

    if not data:
        return {"strategy": "Error", "details": "Product not found.", "expected_outcome": ""}

    margin = (data.selling_price - data.purchase_price) / data.selling_price if data.selling_price > 0 else 0
    monthly_storage_cost = data.storage_cost_per_day * 30
    total_value = data.purchase_price * data.quantity

    # Step 2: Apply expert rules (decision tree)
    if total_value < 20 and monthly_storage_cost > (total_value * 0.1):
        return {
            "strategy": "Liquidate",
            "details": f"This low-value item (total value ${total_value:.2f}) has a high relative storage cost (${monthly_storage_cost:.2f}/month). It's more cost-effective to clear the stock quickly.",
            "expected_outcome": "Free up cash flow and eliminate ongoing storage costs."
        }
    
    if data.sales_last_30_days == 0 and margin > 0.40:
        return {
            "strategy": "Aggressive Discount (25%)",
            "details": f"The product has a high profit margin ({margin:.0%}) but has not sold recently. A 25% discount could stimulate demand while remaining profitable.",
            "expected_outcome": "Generate sales and convert stagnant inventory into revenue."
        }

    if data.sales_last_30_days < 5 and margin < 0.20:
        # In a real app, this would query for frequently bought-together items.
        # For the hackathon, we'll simulate this.
        return {
            "strategy": "Bundle with Bestseller",
            "details": f"This is a slow-moving, low-margin item. Bundling it with a popular product like 'Bestselling Gadget' can increase its perceived value and help clear inventory without a direct discount.",
            "expected_outcome": "Increase sales volume of the slow-moving item and potentially boost overall order value."
        }

    return {
        "strategy": "Monitor",
        "details": "This product does not currently meet the criteria for urgent action. Continue to monitor its sales velocity and inventory levels.",
        "expected_outcome": "Maintain current strategy."
    }
