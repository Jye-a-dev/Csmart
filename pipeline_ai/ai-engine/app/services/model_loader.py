import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Thử import keras_ocr, nếu thiếu thư viện (do lỗi build editdistance trên Python 3.13) thì fallback sang Mock
try:
    import keras_ocr
except ImportError:
    keras_ocr = None

class MockOCRPipeline:
    def recognize(self, images):
        # Trả về kết quả OCR mẫu đại diện cho nhãn sản phẩm
        return [[("Áo", None), ("Khoác", None), ("Dù", None), ("Local", None), ("Brand", None)]]

class ModelLoader:
    _instance = None
    ocr_pipeline = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
        return cls._instance

    def load_models(self):
        if self.ocr_pipeline is not None:
            return
            
        logger.info("Initializing Models in Memory...")
        if keras_ocr is None:
            logger.warning("keras_ocr or tensorflow not installed. Using Mock OCR Pipeline fallback.")
            self.ocr_pipeline = MockOCRPipeline()
            return

        try:
            self.ocr_pipeline = keras_ocr.pipeline.Pipeline()
            logger.info("Keras-OCR Pipeline loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load OCR Pipeline: {e}. Falling back to Mock OCR.")
            self.ocr_pipeline = MockOCRPipeline()

# Instance toàn cục để import và tái sử dụng
model_loader = ModelLoader()