from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.evaluator import log_request
from app.services.ner.pipeline import ner_pipeline
import time

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

    start_time = time.time()

    # Chạy qua component-based pipeline
    result = ner_pipeline.run(text)

    response = {
        "status": "success",
        "intent": result.intent,
        "slots": {
            "order_id": result.order_id,
            "order_ids": result.order_ids,
            "new_address": result.new_address
        },
        "confidence_score": result.confidence_score,
        "flag_for_review": result.flag_for_review
    }

    execution_time_ms = int((time.time() - start_time) * 1000)
    await log_request("extract-ner", {"text": payload.text}, response, execution_time_ms)
    return response
