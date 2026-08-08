from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class OCRPipelineContext(BaseModel):
    image_np: Any
    extracted_words: List[str] = []
    raw_text: str = ""
    detected_color: str = "Đen"
    detected_type: str = "áo"
    similar_products: List[Dict[str, Any]] = []
    confidence_score: float = 0.0
    flag_for_review: bool = True
    status: str = "success"
    error_message: Optional[str] = None
