from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class OCRPipelineContext(BaseModel):
    image_np: Any = None
    image_path: Optional[str] = None
    image_bytes: Optional[bytes] = None
    processed_image_np: Any = None
    extracted_words: List[str] = []
    raw_text: str = ""
    document_type: Optional[str] = None
    entities: Dict[str, Any] = Field(default_factory=dict)
    detected_color: Optional[str] = None
    detected_type: Optional[str] = None
    detected_origin: Optional[str] = None
    detected_name: Optional[str] = None
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






