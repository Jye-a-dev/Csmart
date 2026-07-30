from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.evaluator import log_request
import re

router = APIRouter()

class NERRequest(BaseModel):
    text: str = Field(
        ...,
        description="Đoạn văn bản chứa thông tin cần nhận diện thực thể.",
        examples=[
            "Hủy đơn hàng số 54321 giúp tôi",
            "Địa chỉ giao hàng bị sai, mã đơn là #99281",
            "Tôi muốn đổi size cho đơn hàng 887216"
        ]
    )

class NERSlots(BaseModel):
    order_id: str | None = Field(None, description="Mã đơn hàng (nếu trích xuất được).")
    new_address: str | None = Field(None, description="Địa chỉ nhận hàng mới (nếu trích xuất được).")

class NERResponse(BaseModel):
    status: str = Field(..., description="Trạng thái thực hiện (success / error).")
    intent: str = Field(..., description="Ý định nhận diện được thông qua các thực thể (CANCEL_ORDER, UPDATE_ADDRESS, TRACK_ORDER, GENERAL_CHAT).")
    slots: NERSlots = Field(..., description="Các thông tin / tham số trích xuất được từ văn bản.")
    confidence_score: float = Field(..., description="Điểm số tin cậy phân tích thực thể (từ 0.0 đến 1.0).")
    flag_for_review: bool = Field(..., description="Cờ đánh dấu cần kiểm duyệt lại thủ công.")

@router.post(
    "/extract-ner",
    response_model=NERResponse,
    summary="Nhận diện thực thể tên riêng (NER) và trích xuất Slots",
    description="""
Nhận diện thực thể và phân tích các slots quan trọng như mã đơn hàng (`order_id`) và địa chỉ mới từ văn bản thô để hỗ trợ tự động hóa luồng nghiệp vụ liên quan đến đơn hàng.
"""
)
async def extract_ner(payload: NERRequest):
    text = payload.text
    if not text:
        raise HTTPException(status_code=400, detail="Text không được để trống.")

    # 1. Trích xuất mã đơn hàng
    order_id = None
    # Thử khớp mẫu ORD-xxxxxx hoặc #ORD-xxxxxx trước
    ord_match = re.search(r'#?(ORD-\d+)', text, re.IGNORECASE)
    if ord_match:
        order_id = ord_match.group(1)
    else:
        # Thử khớp mẫu 4 đến 8 chữ số
        num_match = re.search(r'#?(\d{4,8})', text)
        if num_match:
            order_id = num_match.group(1)

    # 2. Nhận diện Intent
    text_lower = text.lower()
    intent = "GENERAL_CHAT"
    if any(k in text_lower for k in ["hủy", "huy"]):
        intent = "CANCEL_ORDER"
    elif any(k in text_lower for k in ["đổi địa chỉ", "doi dia chi", "địa chỉ mới", "sang số"]):
        intent = "UPDATE_ADDRESS"
    elif any(k in text_lower for k in ["giao tới đâu", "giao den dau", "đang ở đâu", "giao tới", "giao đến", "trạng thái", "track"]):
        intent = "TRACK_ORDER"

    # 3. Trích xuất địa chỉ nhận hàng nếu intent là UPDATE_ADDRESS
    new_address = None
    if intent == "UPDATE_ADDRESS":
        addr_match = re.search(r'(?:sang|đến|về)\s+(?:số\s+)?(.*)$', text, re.IGNORECASE)
        if addr_match:
            new_address = addr_match.group(1).strip()

    # 4. Xác định độ tin cậy và cờ kiểm duyệt
    confidence = 0.35
    if order_id:
        if "ORD-" in order_id:
            confidence = 0.95
        else:
            confidence = 0.92
    
    # Đối với trường hợp cập nhật địa chỉ, yêu cầu có cả mã đơn và địa chỉ để tin cậy cao
    if intent == "UPDATE_ADDRESS" and not new_address:
        confidence = 0.40
        
    flag_for_review = confidence < 0.50

    response = {
        "status": "success",
        "intent": intent,
        "slots": {
            "order_id": order_id,
            "new_address": new_address
        },
        "confidence_score": confidence,
        "flag_for_review": flag_for_review
    }

    log_request("extract-ner", {"text": payload.text}, response)
    return response
