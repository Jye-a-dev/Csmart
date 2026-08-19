import logging
from app.services.ocr.base import OCRPipelineComponent
from app.services.ocr.context import OCRPipelineContext
from app.services.model_loader import model_loader

logger = logging.getLogger(__name__)

_MOCK_WORDS = ["AO", "SO", "MI", "COTTON", "TRANG"]
_MOCK_TEXT = "AO SO MI COTTON TRANG (Mock OCR Result)"

class OCRInferenceComponent(OCRPipelineComponent):
    async def process(self, context: OCRPipelineContext) -> OCRPipelineContext:
        # Graceful Mock Fallback khi OCR model chưa sẵn sàng (thiếu GPU / keras-ocr)
        if model_loader.ocr_pipeline is None:
            logger.warning("[OCR] OCR Pipeline model is not loaded. Activating Graceful Mock Fallback.")
            context.extracted_words = _MOCK_WORDS
            context.raw_text = _MOCK_TEXT
            context.confidence_score = 0.35
            context.flag_for_review = True
            context.is_fallback = True
            context.status = "success"  # Pipeline tiếp tục sang bước entity extraction
            return context

        try:
            # Luồng nhận dạng thực tế qua model pipeline (image_np là numpy array)
            prediction_groups = model_loader.ocr_pipeline.recognize([context.image_np])
            extracted_words = [text for text, _box in prediction_groups[0] if text and text.strip()]

            context.extracted_words = extracted_words
            context.raw_text = " ".join(extracted_words)
            context.confidence_score = 0.88 if len(extracted_words) > 0 else 0.20
            context.flag_for_review = context.confidence_score < 0.70
            context.is_fallback = False
            context.status = "success"
        except Exception as e:
            logger.error(f"[OCR] Inference error: {str(e)}")
            context.extracted_words = []
            context.raw_text = ""
            context.confidence_score = 0.0
            context.flag_for_review = True
            context.is_fallback = True
            context.status = "error"
            context.error_message = str(e)

        return context

