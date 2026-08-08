from app.services.intent.base import IntentPipelineComponent
from app.services.intent.context import IntentPipelineContext
from app.services.ai_core import ai_engine_core

class LLMClassifierComponent(IntentPipelineComponent):
    def process(self, context: IntentPipelineContext) -> IntentPipelineContext:
        # If already classified with high confidence by KeywordMatcher, skip LLM
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
