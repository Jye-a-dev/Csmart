from fastapi import APIRouter, HTTPException
from app.services.evaluator import SelfEvaluationEngine, LOG_FILE
import os
import json

router = APIRouter()
eval_engine = SelfEvaluationEngine()

@router.post("/evaluate")
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
