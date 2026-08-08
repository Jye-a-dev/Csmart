from pydantic import BaseModel
from typing import Dict, Any, Optional

class IntentPipelineContext(BaseModel):
    query: str
    intent: str = "UNKNOWN"
    entities: Dict[str, Any] = {}
    confidence_score: float = 0.0
    flag_for_review: bool = True
    status: str = "success"
    error_message: Optional[str] = None
