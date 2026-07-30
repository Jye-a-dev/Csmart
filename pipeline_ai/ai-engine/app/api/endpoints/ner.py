from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.evaluator import log_request
import re

router = APIRouter()

class NERRequest(BaseModel):
    text: str

@router.post("/extract-ner")
async def extract_ner(payload: NERRequest):
    text = payload.text
    if not text:
        raise HTTPException(status_code=400, detail="Text không được để trống.")

    # Trích xuất mã đơn hàng (Ví dụ: #9988 hoặc 9988)
    order_match = re.search(r'#?(\d{4,8})', text)
    order_id = order_match.group(1) if order_match else None

    intent = "GENERAL_CHAT"
    if "hủy" in text.lower() and order_id:
        intent = "CANCEL_ORDER"
    elif "đổi địa chỉ" in text.lower() and order_id:
        intent = "UPDATE_ADDRESS"

    # Set confidence scoring
    confidence = 0.95 if order_id else 0.35
    flag_for_review = confidence < 0.50

    response = {
        "status": "success",
        "intent": intent,
        "slots": {
            "order_id": order_id
        },
        "confidence_score": confidence,
        "flag_for_review": flag_for_review
    }

    log_request("extract-ner", {"text": payload.text}, response)
    return response
