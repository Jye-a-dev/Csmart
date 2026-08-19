from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class OCRPipelineContext(BaseModel):
    image_np: Any
    extracted_words: List[str] = []
    raw_text: str = ""
    document_type: str = "PRODUCT_LABEL"
    detected_color: str = "Đen"
    detected_type: str = "áo"
    detected_origin: str = "Việt Nam"
    detected_name: str = ""
    detected_order_code: Optional[str] = None
    detected_customer_name: Optional[str] = None
    detected_phone_number: Optional[str] = None
    detected_address: Optional[str] = None
    detected_total_amount: Optional[float] = None
    similar_products: List[Dict[str, Any]] = []
    confidence_score: float = 0.0
    flag_for_review: bool = True
    is_fallback: bool = False
    status: str = "success"
    error_message: Optional[str] = None



