from app.services.intent.base import IntentPipelineComponent
from app.services.intent.context import IntentPipelineContext

class ScorerComponent(IntentPipelineComponent):
    def process(self, context: IntentPipelineContext) -> IntentPipelineContext:
        context.flag_for_review = (
            context.confidence_score < 0.70 
            or context.intent == "UNKNOWN"
        )
        return context
