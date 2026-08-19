from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.evaluator import SelfEvaluationEngine
from app.services.database import db_service
import json

router = APIRouter()
eval_engine = SelfEvaluationEngine()

class EvaluationResponse(BaseModel):
    status: str = Field(..., description="Trạng thái thực hiện yêu cầu (success / error).")
    message: str | None = Field(None, description="Thông điệp kết quả đánh giá (chỉ có khi không có log).")
    current_accuracy: float = Field(..., description="Độ chính xác hiện tại của hệ thống tính từ log.")
    ood_count: int = Field(..., description="Số lượng cuộc gọi Out-of-Distribution (OOD) / ngoài phạm vi.")
    total_samples: int = Field(0, description="Tổng số log records được đánh giá.")
    recommended_adjustment: dict = Field(..., description="Các điều chỉnh, tối ưu hóa cấu hình hệ thống được đề xuất.")

@router.post(
    "/evaluate",
    response_model=EvaluationResponse,
    summary="Tự đánh giá và tối ưu hiệu năng hệ thống (Self-Evaluation & Self-Adjustment)",
    description="""
Đọc nhật ký ghi chép yêu cầu (logs) từ cơ sở dữ liệu PostgreSQL để tính toán độ chính xác hiện tại của hệ thống, thống kê các yêu cầu Out-of-Distribution (OOD), và tự động đề xuất/cập nhật cấu hình tối ưu.
"""
)
async def evaluate_logs():
    try:
        # Fetch logs from PostgreSQL database
        rows = await db_service.fetch("""
            SELECT endpoint, input_text, output_json, confidence_score, flag_for_review, execution_time_ms, created_at 
            FROM ai_request_logs 
            ORDER BY created_at DESC 
            LIMIT 1000
        """)
        
        if not rows:
            return {
                "status": "success",
                "message": "Không có log dữ liệu để đánh giá.",
                "current_accuracy": 1.0,
                "ood_count": 0,
                "total_samples": 0,
                "recommended_adjustment": {}
            }
            
        logs = []
        for r in rows:
            output_json = r["output_json"]
            if isinstance(output_json, str):
                output_json = json.loads(output_json)
            logs.append({
                "endpoint": r["endpoint"],
                "input_text": r["input_text"],
                "output_json": output_json,
                "confidence_score": r["confidence_score"] if r["confidence_score"] is not None else 1.0,
                "flag_for_review": r["flag_for_review"],
                "execution_time_ms": r["execution_time_ms"]
            })
            
        result = eval_engine.evaluate_and_adjust(logs)
        return {
            "status": "success",
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi thực hiện tự đánh giá: {str(e)}")
