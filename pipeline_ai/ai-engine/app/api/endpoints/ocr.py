from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from app.services.ocr.pipeline import ocr_pipeline
from app.services.evaluator import log_request
from PIL import Image
import io
import numpy as np
import time

router = APIRouter()

class UniversalOCREntities(BaseModel):
    name: Optional[str] = Field(None, description="Tên sản phẩm bóc tách.")
    category: Optional[str] = Field(None, description="Danh mục sản phẩm (Electronics, Fashion, Footwear, Cosmetics, Appliances, Grocery, Invoice...).")
    brand: Optional[str] = Field(None, description="Thương hiệu sản phẩm.")
    sku_barcode: Optional[str] = Field(None, description="Mã vạch / SKU / Model code.")
    unit_price: Optional[float] = Field(None, description="Đơn giá sản phẩm (VND, USD...).")
    origin: Optional[str] = Field(None, description="Xuất xứ / Nguồn gốc.")
    size_dimension: Optional[str] = Field(None, description="Kích cỡ / Dung tích / Trọng lượng / Thông số kích thước.")
    color: Optional[str] = Field(None, description="Màu sắc sản phẩm.")
    specifications: Dict[str, Any] = Field(default_factory=dict, description="Bảng thông số kỹ thuật / thành phần động (Dynamic Specs Window).")

class OCRResponse(BaseModel):
    success: bool = Field(True, description="Trạng thái thực hiện yêu cầu.")
    status: str = Field("success", description="Trạng thái xử lý (success / error).")
    raw_text: str = Field(..., description="Toàn bộ văn bản thô ghép nối từ các từ đã nhận diện.")
    extracted_words: List[str] = Field(..., description="Danh sách các từ hoặc cụm từ được nhận diện từ ảnh.")
    confidence_score: float = Field(..., description="Độ tin cậy nhận dạng (từ 0.0 đến 1.0).")
    flag_for_review: bool = Field(..., description="Cờ đánh dấu cần kiểm duyệt thủ công nếu độ tin cậy thấp.")
    is_fallback: bool = Field(False, description="Cờ báo hiệu kết quả OCR có đang dùng fallback mode hay không.")
    entities: UniversalOCREntities = Field(..., description="Cấu trúc thực thể đa ngành hàng phổ quát.")
    data: Dict[str, Any] = Field(default_factory=dict, description="Tương thích ngược dữ liệu tiêu thụ.")
    similar_products: List[Dict[str, Any]] = Field(default_factory=list, description="Danh sách sản phẩm tương tự.")

@router.post(
    "/extract-ocr",
    response_model=OCRResponse,
    summary="Trích xuất văn bản từ hình ảnh (Universal Multi-Category OCR)",
    description="""
Nhận diện ký tự quang học (EasyOCR) đa ngành hàng phổ quát.
Trích xuất các thực thể thương mại (Electronics, Fashion, Footwear, Cosmetics, Appliances, Invoice...) và bảng thông số kỹ thuật động (Dynamic Specification Window Parser).
Không sử dụng bất kỳ dữ liệu mặc định hardcode nào.
"""
)
async def extract_ocr(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File tải lên phải là định dạng hình ảnh.")

    try:
        start_time = time.time()

        # Đọc tệp hình ảnh từ bộ nhớ
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image_np = np.array(image)

        # Chạy qua component-based Universal OCR pipeline
        result = await ocr_pipeline.run(image_np=image_np, image_bytes=contents)

        if result.status == "error":
            raise HTTPException(status_code=500, detail=result.error_message or "Lỗi khi xử lý OCR.")

        entities_dict = result.entities or {
            "name": None,
            "category": None,
            "brand": None,
            "sku_barcode": None,
            "unit_price": None,
            "origin": None,
            "size_dimension": None,
            "color": None,
            "specifications": {}
        }

        similar_products = result.similar_products

        # Micro backward-compatible data object for legacy consumers
        data_object = {
            "name": entities_dict.get("name") or "Không phát hiện chữ trên ảnh",
            "origin": entities_dict.get("origin") or "",
            "type": entities_dict.get("category") or "Chưa xác định",
            "color": entities_dict.get("color") or "",
            "price": entities_dict.get("unit_price") or 0,
            "raw_text": result.raw_text
        }

        response = {
            "success": True,
            "status": "success",
            "raw_text": result.raw_text,
            "extracted_words": result.extracted_words,
            "confidence_score": result.confidence_score,
            "flag_for_review": result.flag_for_review,
            "is_fallback": result.is_fallback,
            "entities": entities_dict,
            "data": data_object,
            "similar_products": similar_products if len(result.extracted_words) > 0 else []
        }

        execution_time_ms = int((time.time() - start_time) * 1000)
        await log_request("extract-ocr", {"filename": file.filename}, response, execution_time_ms)
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi xử lý OCR: {str(e)}")
