from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..core.db import get_db
from ..api.models import DeadStockResponse, NLQueryRequest, NLQueryResponse, Recommendation
from ..services.deadstock import get_dead_stock_analysis
from ..services.recommendations import generate_recommendation
from ..services.nl_to_sql import process_nl_query

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "ok"}

@router.get("/deadstock", response_model=DeadStockResponse)
async def get_deadstock(
    days_since_last_sale: int = 90,
    min_quantity: int = 1,
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await get_dead_stock_analysis(db, days_since_last_sale, min_quantity)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query", response_model=NLQueryResponse)
async def nl_query(request: NLQueryRequest, db: AsyncSession = Depends(get_db)):
    try:
        result = await process_nl_query(db, request.question)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommendations/{product_id}", response_model=Recommendation)
async def get_recommendation(product_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await generate_recommendation(db, product_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
