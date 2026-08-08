from app.services.ocr.base import OCRPipelineComponent
from app.services.ocr.context import OCRPipelineContext

class OCREntityExtractorComponent(OCRPipelineComponent):
    async def process(self, context: OCRPipelineContext) -> OCRPipelineContext:
        text_lower = context.raw_text.lower()
        colors = ['đen', 'trắng', 'xanh', 'đỏ', 'vàng', 'hồng', 'xám', 'nâu', 'tím', 'cam']
        types = ['áo', 'quần', 'váy', 'đầm', 'mũ', 'nón', 'giày', 'dép', 'túi', 'balo', 'khoác', 'thun', 'sơ mi', 'jean']
        
        detected_colors = [c for c in colors if c in text_lower]
        detected_types = [t for t in types if t in text_lower]
        
        context.detected_color = detected_colors[0].capitalize() if detected_colors else "Đen"
        context.detected_type = detected_types[0] if detected_types else "áo"
        
        return context
