from app.services.ocr.base import OCRPipelineComponent
from app.services.ocr.context import OCRPipelineContext
from app.services.hybrid_search import hybrid_search_service

class ProductMatcherComponent(OCRPipelineComponent):
    async def process(self, context: OCRPipelineContext) -> OCRPipelineContext:
        det_type = context.detected_type or ""
        det_color = (context.detected_color or "").lower()
        search_query = f"{det_type} {det_color}".strip()

        if not search_query:
            context.similar_products = []
            return context

        try:
            similar_products = await hybrid_search_service.search(search_query, limit=5)
            context.similar_products = similar_products
        except Exception:
            context.similar_products = []
        return context
