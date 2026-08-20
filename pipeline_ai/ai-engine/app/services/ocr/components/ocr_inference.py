import logging
import numpy as np
from typing import List, Tuple, Any
from app.services.ocr.base import OCRPipelineComponent
from app.services.ocr.context import OCRPipelineContext
from app.services.model_loader import model_loader

logger = logging.getLogger(__name__)


class OCRInferenceComponent(OCRPipelineComponent):
    """
    Component performing Optical Character Recognition (OCR) using EasyOCR singleton reader.
    Uses multi-pass scanning (Full image + Top-left tag region crop) with mag_ratio=2.0
    and low text detection thresholds to capture small labels accurately.
    """

    async def process(self, context: OCRPipelineContext) -> OCRPipelineContext:
        reader = model_loader.ocr_reader

        if reader is None:
            logger.warning("[OCRInferenceComponent] EasyOCR Reader is None.")
            context.extracted_words = []
            context.raw_text = ""
            context.confidence_score = 0.0
            context.flag_for_review = True
            context.is_fallback = True
            context.status = "success"
            return context

        input_image: Any = context.processed_image_np if context.processed_image_np is not None else context.image_np

        if input_image is None:
            logger.warning("[OCRInferenceComponent] No valid image input provided.")
            context.extracted_words = []
            context.raw_text = ""
            context.confidence_score = 0.0
            context.flag_for_review = True
            context.is_fallback = True
            context.status = "success"
            return context

        try:
            logger.info("[OCRInferenceComponent] Pass 1: Running EasyOCR on full image with mag_ratio=2.0...")
            results: List[Tuple[Any, str, float]] = reader.readtext(
                input_image,
                detail=1,
                paragraph=False,
                mag_ratio=2.0,
                text_threshold=0.25,
                low_text=0.25,
                link_threshold=0.25,
                canvas_size=2560
            )

            extracted_words: List[str] = []
            confidence_scores: List[float] = []

            for _bbox, text, prob in results:
                cleaned_text = text.strip() if text else ""
                if cleaned_text and cleaned_text not in extracted_words:
                    extracted_words.append(cleaned_text)
                    confidence_scores.append(float(prob))

            # Pass 2: If few words detected, crop top-left quadrant (where product tags/labels reside)
            if len(extracted_words) < 3 and isinstance(input_image, np.ndarray):
                try:
                    logger.info("[OCRInferenceComponent] Pass 2: Scanning top-left label region crop...")
                    h, w = input_image.shape[:2]
                    top_left_crop = input_image[0:int(h * 0.45), 0:int(w * 0.45)]
                    
                    crop_results = reader.readtext(
                        top_left_crop,
                        detail=1,
                        paragraph=False,
                        mag_ratio=2.5,
                        text_threshold=0.20,
                        low_text=0.20
                    )

                    for _bbox, text, prob in crop_results:
                        cleaned_text = text.strip() if text else ""
                        if cleaned_text and cleaned_text not in extracted_words:
                            extracted_words.append(cleaned_text)
                            confidence_scores.append(float(prob))
                except Exception as crop_err:
                    logger.warning(f"[OCRInferenceComponent] Pass 2 crop scan exception: {crop_err}")

            if confidence_scores:
                avg_confidence = round(sum(confidence_scores) / len(confidence_scores), 2)
            else:
                avg_confidence = 0.0

            raw_text = " ".join(extracted_words)

            context.extracted_words = extracted_words
            context.raw_text = raw_text
            context.confidence_score = avg_confidence
            context.flag_for_review = (avg_confidence < 0.65) or (len(extracted_words) == 0)
            context.is_fallback = False
            context.status = "success"

        except Exception as e:
            logger.error(f"[OCRInferenceComponent] EasyOCR execution failed: {e}")
            context.extracted_words = []
            context.raw_text = ""
            context.confidence_score = 0.0
            context.flag_for_review = True
            context.is_fallback = True
            context.status = "success"
            context.error_message = str(e)

        return context
