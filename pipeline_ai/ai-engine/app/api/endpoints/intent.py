from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.ai_core import ai_engine_core
from app.services.evaluator import log_request
import time

router = APIRouter()

class IntentRequest(BaseModel):
    query: str = Field(
        ...,
        description="Câu lệnh hoặc câu hỏi mua sắm của người dùng cần phân loại.",
        examples=[
            "Tìm áo thun nam màu trắng size L dưới 300k",
            "Hủy đơn hàng số #9910 giúp tôi với",
            "Mấy giờ shop đóng cửa vậy?"
        ]
    )

class IntentResponse(BaseModel):
    success: bool = Field(..., description="Trạng thái thực hiện yêu cầu thành công.")
    status: str = Field(..., description="Trạng thái xử lý kết quả (success / error).")
    query: str = Field(..., description="Câu truy vấn đầu vào.")
    intent: str = Field(..., description="Ý định mua sắm được nhận diện (SEARCH_PRODUCT, CANCEL_ORDER, ASK_FAQ, UNKNOWN).")
    entities: dict = Field(..., description="Các thực thể trích xuất kèm theo (color, max_price, category, v.v.).")
    confidence_score: float = Field(..., description="Độ tin cậy của mô hình phân loại (từ 0.0 đến 1.0).")
    flag_for_review: bool = Field(..., description="Cờ đánh dấu cần kiểm duyệt nếu độ tin cậy thấp hoặc không rõ ý định.")

@router.post(
    "/classify-intent",
    response_model=IntentResponse,
    summary="Phân loại ý định (Intent Classification) mua sắm",
    description="""
Phân tích câu hỏi mua sắm của người dùng để phân loại ý định (Intent) và trích xuất thực thể liên quan (màu sắc, giá cả, loại sản phẩm).
Hỗ trợ các intent: `SEARCH_PRODUCT`, `CANCEL_ORDER`, `ASK_FAQ` và `UNKNOWN`.
"""
)
async def classify_intent(payload: IntentRequest):
    query = payload.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query không được để trống.")

    start_time = time.time()

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

    execution_time_ms = int((time.time() - start_time) * 1000)
    await log_request("classify-intent", {"query": payload.query}, response, execution_time_ms)
    return response
