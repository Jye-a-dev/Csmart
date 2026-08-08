from app.services.ocr.base import OCRPipelineComponent
from app.services.ocr.context import OCRPipelineContext

class OCRScorerComponent(OCRPipelineComponent):
    async def process(self, context: OCRPipelineContext) -> OCRPipelineContext:
        context.confidence_score = 0.90 if context.extracted_words else 0.20
        context.flag_for_review = context.confidence_score < 0.50
        return context
