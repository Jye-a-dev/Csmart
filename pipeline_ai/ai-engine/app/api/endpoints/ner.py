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
    order_id: str | None = Field(None, description="Mã đơn hàng đầu tiên (nếu trích xuất được).")
    order_ids: list[str] | None = Field(None, description="Danh sách các mã đơn hàng trích xuất được.")
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
Nhận diện thực thể và phân tích các slots quan trọng như danh sách mã đơn hàng (`order_ids`) và địa chỉ mới từ văn bản thô để hỗ trợ tự động hóa luồng nghiệp vụ liên quan đến đơn hàng.
"""
)
async def extract_ner(payload: NERRequest):
    text = payload.text
    if not text:
        raise HTTPException(status_code=400, detail="Text không được để trống.")

    # 1. Trích xuất danh sách mã đơn hàng
    order_ids = []
    
    # Tìm tất cả các mã dạng ORD-xxxxxx
    ord_matches = re.findall(r'#?(ORD-\d+)', text, re.IGNORECASE)
    if ord_matches:
        order_ids.extend(ord_matches)
        
    # Tìm cụm danh sách số phân tách bằng dấu phẩy/khoảng trắng sau "đơn hàng", "đơn", "mã", "số"
    list_match = re.search(r'(?:đơn hàng|đơn|mã|số)\s+([\d\s,]+)', text, re.IGNORECASE)
    if list_match:
        candidates = re.findall(r'\b\d+\b', list_match.group(1))
        # Nếu là danh sách thực sự, hoặc số có độ dài lớn (mã đơn hàng thường có giá trị lớn)
        if len(candidates) > 1 or (candidates and int(candidates[0]) > 100):
            for c in candidates:
                if c not in order_ids:
                    order_ids.append(c)
                    
    # Nếu chưa tìm được gì, tìm các số có từ 4 đến 8 chữ số
    if not order_ids:
        num_matches = re.findall(r'#?(\d{4,8})', text)
        for num in num_matches:
            if num not in order_ids:
                order_ids.append(num)
                
    # Dự phòng cho số ngắn có tiền tố #
    if not order_ids:
        short_num_matches = re.findall(r'#(\d+)', text)
        for num in short_num_matches:
            if num not in order_ids:
                order_ids.append(num)

    order_id = order_ids[0] if order_ids else None

    # 2. Nhận diện Intent
    text_lower = text.lower()
    intent = "GENERAL_CHAT"
    if any(k in text_lower for k in ["hủy", "huy", "del", "delete", "xóa", "xoa", "cancel"]):
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
    if order_ids:
        if any("ORD-" in oid for oid in order_ids):
            confidence = 0.95
        else:
            confidence = 0.92
    
    if intent == "UPDATE_ADDRESS" and not new_address:
        confidence = 0.40
        
    flag_for_review = confidence < 0.50

    response = {
        "status": "success",
        "intent": intent,
        "slots": {
            "order_id": order_id,
            "order_ids": order_ids if order_ids else None,
            "new_address": new_address
        },
        "confidence_score": confidence,
        "flag_for_review": flag_for_review
    }

    log_request("extract-ner", {"text": payload.text}, response)
    return response
