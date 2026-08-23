from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.hybrid_search import hybrid_search_service
from app.services.evaluator import log_request
import time

router = APIRouter()

class SearchRequest(BaseModel):
    query: str = Field(..., description="Query tìm kiếm sản phẩm theo ngữ nghĩa + từ khóa.")
    limit: int = Field(10, description="Giới hạn số lượng kết quả trả về.")

class ProductSearchResult(BaseModel):
    id: int
    name: str
    sku: str
    base_price: float
    discount_price: float | None
    stock_quantity: int
    status: str
    description: str | None
    semantic_score: float
    keyword_score: float
    combined_score: float

class SearchResponse(BaseModel):
    success: bool
    status: str
    results: list[ProductSearchResult]
    execution_time_ms: int

@router.post(
    "/hybrid",
    response_model=SearchResponse,
    summary="Tìm kiếm sản phẩm Hybrid (Semantic Vector + Keyword)",
    description="""
Tìm kiếm sản phẩm e-commerce kết hợp giữa Vector Cosine Similarity (độ tương đồng ngữ nghĩa) 
và Keyword Matching (từ khóa chính xác) từ cơ sở dữ liệu.
"""
)
async def hybrid_search(payload: SearchRequest):
    query = payload.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query không được để trống.")
        
    start_time = time.time()
    results = await hybrid_search_service.search(query, limit=payload.limit)
    execution_time_ms = int((time.time() - start_time) * 1000)
    
    response = {
        "success": True,
        "status": "success",
        "results": results,
        "execution_time_ms": execution_time_ms
    }
    
    await log_request("search-hybrid", {"query": query}, {"results_count": len(results)}, execution_time_ms)
    return response
