from abc import ABC, abstractmethod
from app.services.ocr.context import OCRPipelineContext

class OCRPipelineComponent(ABC):
    @abstractmethod
    async def process(self, context: OCRPipelineContext) -> OCRPipelineContext:
        pass
