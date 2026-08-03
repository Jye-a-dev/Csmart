from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.ai_core import ai_engine_core
from app.services.evaluator import log_request
import time

router = APIRouter()

class TextToSQLRequest(BaseModel):
    question: str = Field(
        ...,
        description="Câu hỏi bằng ngôn ngữ tự nhiên của người dùng cần chuyển sang SQL.",
        examples=[
            "Liệt kê danh sách sản phẩm",
            "Thống kê top 3 sản phẩm có số lượng đơn hàng bị hủy nhiều nhất",
            "Lấy thông tin người dùng có email là admin@smartcart.com"
        ]
    )

class TextToSQLResponse(BaseModel):
    status: str = Field(..., description="Trạng thái phản hồi (success / error).")
    question: str = Field(..., description="Câu hỏi gốc từ client.")
    generated_sql: str = Field(..., description="Câu truy vấn PostgreSQL (SELECT) được sinh ra.")
    confidence_score: float = Field(..., description="Điểm tin cậy của kết quả (từ 0.0 đến 1.0).")
    flag_for_review: bool = Field(..., description="Cờ đánh dấu cần kiểm duyệt lại (True nếu độ tin cậy thấp hoặc truy vấn INVALID).")

@router.post(
    "/text-to-sql",
    response_model=TextToSQLResponse,
    summary="Chuyển đổi câu hỏi tự nhiên thành câu lệnh PostgreSQL (SELECT)",
    description="""
Dịch ngôn ngữ tự nhiên thành mã SQL Read-Only dựa trên database schema SmartCart:
* **users** (id, full_name, email, role)
* **products** (id, name, price, stock)
* **orders** (id, user_id, status, created_at)
* **order_items** (id, order_id, product_id, quantity)

Quy tắc:
* Yêu cầu hợp lệ sẽ sinh SQL SELECT kèm độ tin cậy >= 0.85.
* Yêu cầu độc hại, DDL (tạo bảng, xóa bảng) hoặc không liên quan sẽ trả về `-- INVALID_QUERY` kèm độ tin cậy thấp và gắn cờ kiểm duyệt.
"""
)
async def text_to_sql(payload: TextToSQLRequest):
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question không được để trống.")
    
    start_time = time.time()
    
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

    execution_time_ms = int((time.time() - start_time) * 1000)
    await log_request("text-to-sql", {"question": payload.question}, response, execution_time_ms)
    return response
