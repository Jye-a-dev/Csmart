from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.ai_core import ai_engine_core
from app.services.evaluator import log_request

router = APIRouter()

class TextToSQLRequest(BaseModel):
    question: str

@router.post("/text-to-sql")
async def text_to_sql(payload: TextToSQLRequest):
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question không được để trống.")
    
    # Gọi trực tiếp bộ não AI chạy Local từ llama-cpp
    result = ai_engine_core.text_to_sql(question)
    
    # Kiểm tra nếu mô hình lỗi hoặc chưa khởi tạo
    if result.get("status") == "error":
        raise HTTPException(
            status_code=503, 
            detail=f"Dịch vụ AI chưa sẵn sàng: {result.get('message', 'Mô hình chưa được nạp hoặc lỗi cấu hình')}"
        )
    
    confidence = result.get("confidence_score", 0.0)
    sql_text = result.get("generated_sql", "-- CANNOT_GENERATE_SQL")
    
    flag_review = True if confidence < 0.70 or "INVALID" in sql_text else False

    response = {
        "status": "success",
        "question": payload.question,
        "generated_sql": sql_text,
        "confidence_score": confidence,
        "flag_for_review": flag_review
    }

    log_request("text-to-sql", {"question": payload.question}, response)
    return response
