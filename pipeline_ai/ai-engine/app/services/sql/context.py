from pydantic import BaseModel
from typing import Optional

class SQLPipelineContext(BaseModel):
    question: str
    generated_sql: Optional[str] = None
    confidence_score: float = 0.0
    flag_for_review: bool = True
    status: str = "success"
    error_message: Optional[str] = None
