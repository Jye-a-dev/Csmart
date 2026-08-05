from app.services.ner.context import PipelineContext
from app.services.ner.base import PipelineComponent

class ConfidenceScorerComponent(PipelineComponent):
    def process(self, context: PipelineContext) -> PipelineContext:
        confidence = 0.35
        if context.order_ids:
            if any("ORD-" in oid for oid in context.order_ids):
                confidence = 0.95
            else:
                confidence = 0.92
        
        if context.intent == "UPDATE_ADDRESS" and not context.new_address:
            confidence = 0.40
            
        context.confidence_score = confidence
        context.flag_for_review = confidence < 0.50
        return context
