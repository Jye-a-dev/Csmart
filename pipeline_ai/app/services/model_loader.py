import logging
from typing import Optional, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelLoader:
    """
    Singleton ModelLoader manager for loading and holding shared AI models in memory.
    """
    _instance: Optional["ModelLoader"] = None
    ocr_reader: Optional[Any] = None

    def __new__(cls) -> "ModelLoader":
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
        return cls._instance

    def load_ocr(self) -> None:
        """
        Loads the EasyOCR reader singleton with Vietnamese ('vi') and English ('en') support.
        Detects GPU availability automatically via PyTorch and warms up the pipeline.
        """
        if self.ocr_reader is not None:
            logger.info("[ModelLoader] EasyOCR Reader is already loaded in memory.")
            return

        try:
            import easyocr
            import torch
            import numpy as np

            use_gpu = torch.cuda.is_available()
            device_str = "CUDA" if use_gpu else "CPU"
            
            logger.info(f"[ModelLoader] Loading EasyOCR Reader (languages=['vi', 'en'], gpu={use_gpu})...")
            self.ocr_reader = easyocr.Reader(['vi', 'en'], gpu=use_gpu)

            # Warm-up inference to avoid cold-start latency on the first API request
            try:
                dummy_img = np.zeros((64, 64, 3), dtype=np.uint8)
                if torch is not None:
                    with torch.inference_mode():
                        self.ocr_reader.readtext(dummy_img, detail=0)
                else:
                    self.ocr_reader.readtext(dummy_img, detail=0)
            except Exception as warm_err:
                logger.debug(f"[ModelLoader] Warm-up notice: {warm_err}")

            logger.info(f"[ModelLoader] EasyOCR loaded and warmed up on [{device_str}].")
        except Exception as e:
            logger.warning(f"[ModelLoader] Failed to initialize EasyOCR Reader: {e}. Reader set to None.")
            self.ocr_reader = None

    def load_models(self) -> None:
        """
        Triggers startup initialization of all AI models in memory.
        """
        logger.info("[ModelLoader] Initializing AI Models in Memory...")
        self.load_ocr()


# Global singleton instance
model_loader = ModelLoader()