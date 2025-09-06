from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime, timezone

async def get_dead_stock_analysis(db: AsyncSession, days_since_last_sale: int, min_quantity: int):
    query = text(f"""
        WITH LastSale AS (
            SELECT
                product_id,
                MAX(order_date) AS last_sale_date
            FROM sales_orders
            GROUP BY product_id
        )
        SELECT
            p.product_id,
            p.sku,
            p.product_name,
            p.category,
            p.purchase_price,
            p.selling_price,
            i.quantity,
            ls.last_sale_date,
            (i.quantity * p.purchase_price) AS total_value,
            (i.storage_cost_per_day * 30) AS estimated_monthly_storage_cost
        FROM products p
        JOIN inventory_levels i ON p.product_id = i.product_id
        LEFT JOIN LastSale ls ON p.product_id = ls.product_id
        WHERE
            i.quantity >= :min_quantity AND
            (ls.last_sale_date IS NULL OR ls.last_sale_date < NOW() - INTERVAL '{days_since_last_sale} days')
        ORDER BY total_value DESC;
    """)

    result = await db.execute(query, {"min_quantity": min_quantity})
    rows = result.fetchall()

    items = []
    summary = {
        "total_dead_stock_value": 0,
        "estimated_total_monthly_storage_cost": 0,
        "potential_profit_loss": 0
    }

    for row in rows:
        last_sale = row.last_sale_date
        days_since = None
        if last_sale:
            days_since = (datetime.now(timezone.utc) - last_sale).days

        item_data = {
            "product_id": row.product_id,
            "sku": row.sku,
            "product_name": row.product_name,
            "category": row.category,
            "purchase_price": float(row.purchase_price),
            "selling_price": float(row.selling_price),
            "quantity": row.quantity,
            "total_value": float(row.total_value),
            "last_sale_date": last_sale,
            "days_since_last_sale": days_since,
            "estimated_monthly_storage_cost": float(row.estimated_monthly_storage_cost)
        }
        items.append(item_data)
        summary["total_dead_stock_value"] += item_data["total_value"]
        summary["estimated_total_monthly_storage_cost"] += item_data["estimated_monthly_storage_cost"]
        summary["potential_profit_loss"] += (item_data["selling_price"] - item_data["purchase_price"]) * item_data["quantity"]

    summary["total_items"] = len(items)
    return {"summary": summary, "items": items}
