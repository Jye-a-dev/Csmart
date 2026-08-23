from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.services.ai_core import ai_engine_core

class IntentPipelineContext(BaseModel):
    query: str
    intent: str = "UNKNOWN"
    entities: Dict[str, Any] = {}
    confidence_score: float = 0.0
    flag_for_review: bool = True
    status: str = "success"
    error_message: Optional[str] = None

class IntentPipelineComponent(ABC):
    @abstractmethod
    def process(self, context: IntentPipelineContext) -> IntentPipelineContext:
        pass

class KeywordMatcherComponent(IntentPipelineComponent):
    def process(self, context: IntentPipelineContext) -> IntentPipelineContext:
        query_lower = context.query.lower()
        
        # Fast paths
        if any(k in query_lower for k in ["hủy đơn", "huy don", "hủy đơn hàng", "cancel order"]):
            context.intent = "CANCEL_ORDER"
            context.confidence_score = 0.95
        elif any(k in query_lower for k in ["tìm sản phẩm", "tìm áo", "tìm quần", "mua áo", "mua quần"]):
            context.intent = "SEARCH_PRODUCT"
            context.confidence_score = 0.90
        elif any(k in query_lower for k in ["mấy giờ đóng cửa", "địa chỉ shop", "cửa hàng ở đâu"]):
            context.intent = "ASK_FAQ"
            context.confidence_score = 0.90
            
        return context

class LLMClassifierComponent(IntentPipelineComponent):
    def process(self, context: IntentPipelineContext) -> IntentPipelineContext:
        if context.intent != "UNKNOWN" and context.confidence_score >= 0.90:
            return context

        system_prompt = """
        Phân loại ý định tìm kiếm e-commerce thành 1 trong các intent: [SEARCH_PRODUCT, CANCEL_ORDER, ASK_FAQ, UNKNOWN].
        Trích xuất entities (color, max_price, category).
        Trả về JSON: {"intent": "...", "entities": {...}, "confidence_score": 0.95}
        """

        result = ai_engine_core._call_llm(system_prompt, context.query)
        if result.get("status") == "error":
            context.status = "error"
            context.error_message = result.get("message")
        else:
            context.intent = result.get("intent", "UNKNOWN")
            context.entities = result.get("entities", {})
            context.confidence_score = result.get("confidence_score", 0.0)

        return context

class ScorerComponent(IntentPipelineComponent):
    def process(self, context: IntentPipelineContext) -> IntentPipelineContext:
        context.flag_for_review = (
            context.confidence_score < 0.70 
            or context.intent == "UNKNOWN"
        )
        return context

class IntentPipeline:
    def __init__(self, components: List[IntentPipelineComponent] = None):
        if components is None:
            self.components = [
                KeywordMatcherComponent(),
                LLMClassifierComponent(),
                ScorerComponent()
            ]
        else:
            self.components = components

    def run(self, query: str) -> IntentPipelineContext:
        context = IntentPipelineContext(query=query)
        for component in self.components:
            context = component.process(context)
            if context.status == "error":
                break
        return context

intent_pipeline = IntentPipeline()
