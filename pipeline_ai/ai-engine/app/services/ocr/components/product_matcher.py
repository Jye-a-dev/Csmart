from app.services.ocr.base import OCRPipelineComponent
from app.services.ocr.context import OCRPipelineContext
from app.services.hybrid_search import hybrid_search_service

class ProductMatcherComponent(OCRPipelineComponent):
    async def process(self, context: OCRPipelineContext) -> OCRPipelineContext:
        search_query = f"{context.detected_type} {context.detected_color.lower()}"
        try:
            similar_products = await hybrid_search_service.search(search_query, limit=5)
            context.similar_products = similar_products
        except Exception:
            context.similar_products = []
        return context
