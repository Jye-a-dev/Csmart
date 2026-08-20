from typing import List, Any, Optional
from app.services.ocr.context import OCRPipelineContext
from app.services.ocr.base import OCRPipelineComponent
from app.services.ocr.components.preprocess import ImagePreprocessComponent
from app.services.ocr.components.ocr_inference import OCRInferenceComponent
from app.services.ocr.components.entity_parser import EntityParserComponent
from app.services.ocr.components.product_matcher import ProductMatcherComponent
from app.services.ocr.components.scorer import OCRScorerComponent

class OCRPipeline:
    """
    Component-based Optical Character Recognition & Entity Extraction Pipeline.
    Order of execution:
    1. ImagePreprocessComponent (OpenCV CLAHE, Grayscale, Gaussian Blur)
    2. OCRInferenceComponent (EasyOCR readtext inference)
    3. EntityParserComponent (Fashion & Footwear brand, product, size, color, sku parsing)
    4. ProductMatcherComponent (Hybrid search product matching)
    5. OCRScorerComponent (Final confidence evaluation & flag_for_review)
    """

    def __init__(self, components: List[OCRPipelineComponent] = None):
        if components is None:
            self.components = [
                ImagePreprocessComponent(),
                OCRInferenceComponent(),
                EntityParserComponent(),
                ProductMatcherComponent(),
                OCRScorerComponent()
            ]
        else:
            self.components = components

    async def run(self, image_np: Any = None, image_bytes: Optional[bytes] = None, image_path: Optional[str] = None) -> OCRPipelineContext:
        context = OCRPipelineContext(image_np=image_np, image_bytes=image_bytes, image_path=image_path)
        for component in self.components:
            context = await component.process(context)
            if context.status == "error":
                break
        return context

ocr_pipeline = OCRPipeline()

