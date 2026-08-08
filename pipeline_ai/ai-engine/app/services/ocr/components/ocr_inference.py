from app.services.ocr.base import OCRPipelineComponent
from app.services.ocr.context import OCRPipelineContext
from app.services.model_loader import model_loader

class OCRInferenceComponent(OCRPipelineComponent):
    async def process(self, context: OCRPipelineContext) -> OCRPipelineContext:
        if model_loader.ocr_pipeline is None:
            context.status = "error"
            context.error_message = "OCR Pipeline chưa được khởi tạo."
            return context

        try:
            prediction_groups = model_loader.ocr_pipeline.recognize([context.image_np])
            extracted_text = [text for text, box in prediction_groups[0]]
            context.extracted_words = extracted_text
            context.raw_text = " ".join(extracted_text)
        except Exception as e:
            context.status = "error"
            context.error_message = f"Lỗi khi xử lý OCR Inference: {str(e)}"
            
        return context
