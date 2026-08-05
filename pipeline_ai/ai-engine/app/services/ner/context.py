from pydantic import BaseModel
from typing import List, Optional

class PipelineContext(BaseModel):
    text: str
    order_id: Optional[str] = None
    order_ids: Optional[List[str]] = None
    intent: str = "GENERAL_CHAT"
    new_address: Optional[str] = None
    confidence_score: float = 0.35
    flag_for_review: bool = True
