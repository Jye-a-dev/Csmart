from abc import ABC, abstractmethod
from app.services.ner.context import PipelineContext

class PipelineComponent(ABC):
    @abstractmethod
    def process(self, context: PipelineContext) -> PipelineContext:
        pass
