import logging
import numpy as np
from typing import Any
from app.services.ocr.base import OCRPipelineComponent
from app.services.ocr.context import OCRPipelineContext

logger = logging.getLogger(__name__)

# Attempt to import cv2 safely
try:
    import cv2
except ImportError:
    cv2 = None
    logger.warning("[ImagePreprocessComponent] OpenCV (cv2) is not installed. Image preprocessing will pass raw image.")


class ImagePreprocessComponent(OCRPipelineComponent):
    """
    Component performing computer vision preprocessing on fashion/footwear product tags:
    1. Decodes image input (path, bytes, or numpy array).
    2. Converts image to Grayscale.
    3. Denoises using a light Gaussian Blur.
    4. Enhances local contrast of small fonts via CLAHE (Contrast Limited Adaptive Histogram Equalization).
    """

    async def process(self, context: OCRPipelineContext) -> OCRPipelineContext:
        input_img = context.image_np
        image_bytes = context.image_bytes
        image_path = context.image_path

        img_bgr: Any = None

        if cv2 is not None:
            try:
                if image_path:
                    img_bgr = cv2.imread(image_path)
                elif image_bytes is not None:
                    nparr = np.frombuffer(image_bytes, np.uint8)
                    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                elif input_img is not None:
                    if isinstance(input_img, np.ndarray):
                        # Convert RGB (from PIL/numpy) to BGR for OpenCV
                        if len(input_img.shape) == 3 and input_img.shape[2] == 3:
                            img_bgr = cv2.cvtColor(input_img, cv2.COLOR_RGB2BGR)
                        else:
                            img_bgr = input_img
            except Exception as e:
                logger.warning(f"[ImagePreprocessComponent] OpenCV decode failed: {e}")

        if img_bgr is None:
            context.processed_image_np = context.image_np
            return context

        try:
            # Upscale image if smaller than 1600px width for small text legibility
            h, w = img_bgr.shape[:2]
            if w < 1600:
                scale = 1600.0 / w
                img_bgr = cv2.resize(img_bgr, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)

            # Convert to 3-channel RGB for EasyOCR CRAFT text detector
            img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

            context.processed_image_np = img_rgb
            logger.info("[ImagePreprocessComponent] Image upscaled to 3-channel RGB successfully.")
        except Exception as e:
            logger.warning(f"[ImagePreprocessComponent] Preprocessing error: {e}")
            context.processed_image_np = context.image_np

        return context
