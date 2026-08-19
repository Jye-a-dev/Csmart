from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from app.services.ocr.pipeline import ocr_pipeline
from app.services.evaluator import log_request
from PIL import Image
import io
import numpy as np
import time

router = APIRouter()

class OCRProductData(BaseModel):
    name: str = Field(..., description="Tên sản phẩm được trích xuất (nếu có).")
    origin: str = Field(..., description="Nguồn gốc / Xuất xứ sản phẩm.")
    type: str = Field(..., description="Loại sản phẩm.")
    color: str = Field(..., description="Màu sắc sản phẩm.")
    price: int = Field(..., description="Giá sản phẩm được trích xuất (nếu có).")
    raw_text: str = Field(..., description="Văn bản thô tương ứng.")

class OCRResponse(BaseModel):
    success: bool = Field(..., description="Trạng thái thực hiện yêu cầu.")
    status: str = Field(..., description="Trạng thái xử lý (success / error).")
    extracted_words: list[str] = Field(..., description="Danh sách các từ hoặc cụm từ được nhận diện từ ảnh.")
    raw_text: str = Field(..., description="Toàn bộ văn bản thô ghép nối từ các từ đã nhận diện.")
    confidence_score: float = Field(..., description="Độ tin cậy nhận dạng (từ 0.0 đến 1.0).")
    flag_for_review: bool = Field(..., description="Cờ đánh dấu cần kiểm duyệt thủ công nếu độ tin cậy thấp.")
    data: OCRProductData = Field(..., description="Dữ liệu sản phẩm mẫu sau trích xuất thông tin.")
    similar_products: list = Field(default=[], description="Danh sách các sản phẩm tương tự được đối sánh từ ảnh.")

@router.post(
    "/extract-ocr",
    response_model=OCRResponse,
    summary="Trích xuất văn bản từ hình ảnh (OCR) & Tìm sản phẩm tương tự",
    description="""
Nhận diện ký tự quang học (OCR) từ tệp hình ảnh đầu vào.
Trích xuất các thực thể (như tên sản phẩm, nguồn gốc, loại sản phẩm, màu sắc) từ nhãn sản phẩm và sử dụng Hybrid Search đối sánh tìm các sản phẩm tương tự trong database.
"""
)
async def extract_ocr(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File tải lên phải là định dạng hình ảnh.")

    try:
        start_time = time.time()

        # Đọc file ảnh từ memory
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image_np = np.array(image)

        # Chạy qua component-based pipeline
        result = await ocr_pipeline.run(image_np)

        if result.status == "error":
            raise HTTPException(status_code=500, detail=result.error_message or "Lỗi khi xử lý OCR.")

        color_tag = result.detected_color
        type_tag = result.detected_type
        origin_tag = result.detected_origin
        product_name = result.detected_name or f"{type_tag.capitalize()} {color_tag}"
        similar_products = result.similar_products

        response = {
            "success": True,
            "status": "success",
            "extracted_words": result.extracted_words,
            "raw_text": result.raw_text,
            "confidence_score": result.confidence_score,
            "flag_for_review": result.flag_for_review,
            "data": {
                "document_type": result.document_type,
                "order_code": result.detected_order_code,
                "customer_name": result.detected_customer_name or product_name,
                "phone_number": result.detected_phone_number,
                "address": result.detected_address,
                "name": product_name,
                "origin": origin_tag,
                "type": type_tag,
                "color": color_tag,
                "price": int(result.detected_total_amount or (similar_products[0]["base_price"] if similar_products else 350000)),
                "raw_text": result.raw_text
            },
            "similar_products": similar_products
        }

        execution_time_ms = int((time.time() - start_time) * 1000)
        await log_request("extract-ocr", {"filename": file.filename}, response, execution_time_ms)
        return response


    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý OCR: {str(e)}")
