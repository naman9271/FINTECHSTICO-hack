from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class Product(BaseModel):
    product_id: int
    sku: str
    product_name: str
    category: str
    purchase_price: float
    selling_price: float

class DeadStockItem(Product):
    quantity: int
    total_value: float
    last_sale_date: Optional[datetime]
    days_since_last_sale: Optional[int]
    estimated_monthly_storage_cost: float

class FinancialSummary(BaseModel):
    total_dead_stock_value: float
    total_items: int
    estimated_total_monthly_storage_cost: float
    potential_profit_loss: float

class DeadStockResponse(BaseModel):
    summary: FinancialSummary
    items: List[DeadStockItem]

class Recommendation(BaseModel):
    strategy: str  # e.g., "Discount", "Bundle", "Liquidate"
    details: str
    expected_outcome: str

class NLQueryRequest(BaseModel):
    question: str

class NLQueryResponse(BaseModel):
    sql_query: str
    results: List[dict]
    error: Optional[str] = None
