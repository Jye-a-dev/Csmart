from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.evaluator import SelfEvaluationEngine, LOG_FILE
import os
import json

router = APIRouter()
eval_engine = SelfEvaluationEngine()

class EvaluationResponse(BaseModel):
    status: str = Field(..., description="Trạng thái thực hiện yêu cầu (success / error).")
    message: str | None = Field(None, description="Thông điệp kết quả đánh giá (chỉ có khi không có log).")
    current_accuracy: float = Field(..., description="Độ chính xác hiện tại của hệ thống tính từ log.")
    ood_count: int = Field(..., description="Số lượng cuộc gọi Out-of-Distribution (OOD) / ngoài phạm vi.")
    recommended_adjustment: dict = Field(..., description="Các điều chỉnh, tối ưu hóa cấu hình hệ thống được đề xuất.")

@router.post(
    "/evaluate",
    response_model=EvaluationResponse,
    summary="Tự đánh giá và tối ưu hiệu năng hệ thống (Self-Evaluation & Self-Adjustment)",
    description="""
Đọc nhật ký ghi chép yêu cầu (logs) từ các cuộc gọi API trước đó để tính toán độ chính xác hiện tại của hệ thống, thống kê các yêu cầu Out-of-Distribution (OOD), và tự động đề xuất/cập nhật cấu hình tối ưu.
"""
)
async def evaluate_logs():
    if not os.path.exists(LOG_FILE):
        return {
            "status": "success",
            "message": "Không có log dữ liệu để đánh giá.",
            "current_accuracy": 1.0,
            "ood_count": 0,
            "recommended_adjustment": {}
        }
        
    try:
        with open(LOG_FILE, "r", encoding="utf-8") as f:
            logs = json.load(f)
        
        result = eval_engine.evaluate_and_adjust(logs)
        return {
            "status": "success",
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi thực hiện tự đánh giá: {str(e)}")
