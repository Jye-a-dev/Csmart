from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.ai_core import ai_engine_core
from app.services.evaluator import log_request

router = APIRouter()

class IntentRequest(BaseModel):
    query: str

@router.post("/classify-intent")
async def classify_intent(payload: IntentRequest):
    query = payload.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query không được để trống.")

    # Sử dụng Llama LLM để phân loại Intent động
    result = ai_engine_core.classify_intent(query)
    
    # Kiểm tra nếu mô hình lỗi hoặc chưa khởi tạo
    if result.get("status") == "error":
        raise HTTPException(
            status_code=503,
            detail=f"Dịch vụ AI chưa sẵn sàng: {result.get('message', 'Mô hình chưa được nạp hoặc lỗi cấu hình')}"
        )
    
    intent = result.get("intent", "UNKNOWN")
    entities = result.get("entities", {})
    confidence = result.get("confidence_score", 0.0)
    flag_review = True if confidence < 0.70 or intent == "UNKNOWN" else False

    response = {
        "success": True,
        "status": "success",
        "query": payload.query,
        "intent": intent,
        "entities": entities,
        "confidence_score": confidence,
        "flag_for_review": flag_review
    }

    log_request("classify-intent", {"query": payload.query}, response)
    return response
