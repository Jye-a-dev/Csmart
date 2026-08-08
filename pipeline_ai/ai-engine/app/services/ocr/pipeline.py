from typing import List, Any
from app.services.ocr.context import OCRPipelineContext
from app.services.ocr.base import OCRPipelineComponent
from app.services.ocr.components.ocr_inference import OCRInferenceComponent
from app.services.ocr.components.entity_extractor import OCREntityExtractorComponent
from app.services.ocr.components.product_matcher import ProductMatcherComponent
from app.services.ocr.components.scorer import OCRScorerComponent

class OCRPipeline:
    def __init__(self, components: List[OCRPipelineComponent] = None):
        if components is None:
            self.components = [
                OCRInferenceComponent(),
                OCREntityExtractorComponent(),
                ProductMatcherComponent(),
                OCRScorerComponent()
            ]
        else:
            self.components = components

    async def run(self, image_np: Any) -> OCRPipelineContext:
        context = OCRPipelineContext(image_np=image_np)
        for component in self.components:
            context = await component.process(context)
            if context.status == "error":
                break
        return context

ocr_pipeline = OCRPipeline()
